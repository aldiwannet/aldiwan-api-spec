import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = new URL('../', import.meta.url);
const openapiPath = new URL('../spec/openapi.json', import.meta.url);
const postmanPath = new URL('../postman/aldiwan-api.postman_collection.json', import.meta.url);
const failures = [];

async function json(path, label) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    failures.push(`${label} is not valid JSON: ${error.message}`);
    return {};
  }
}

const spec = await json(openapiPath, 'OpenAPI document');
const collection = await json(postmanPath, 'Postman collection');

if (!/^3\.0\./.test(spec.openapi ?? '')) failures.push('OpenAPI must declare version 3.0.x.');
if (spec.servers?.[0]?.url !== 'https://api.aldiwan.net/v1') failures.push('Unexpected public API server URL.');
if (!spec.components?.securitySchemes?.bearerApiKey) failures.push('Bearer API-key security scheme is missing.');
if (!spec.paths || Object.keys(spec.paths).length === 0) failures.push('OpenAPI contains no paths.');
for (const [path, item] of Object.entries(spec.paths ?? {})) {
  if (/recit|audio|internal|admin|member|communit|quotation/i.test(path)) failures.push(`Private or out-of-scope path found: ${path}`);
  for (const [method, operation] of Object.entries(item)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
    if (!operation.operationId) failures.push(`${method.toUpperCase()} ${path} has no operationId.`);
    if (!operation.responses?.['200']) failures.push(`${method.toUpperCase()} ${path} has no 200 response.`);
  }
}

if (collection.info?.schema !== 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json') failures.push('Postman collection must use schema v2.1.0.');
const variables = Object.fromEntries((collection.variable ?? []).map(({ key, value }) => [key, value]));
if (variables.base_url !== 'https://api.aldiwan.net/v1') failures.push('Postman base_url is unexpected.');
if (variables.api_key !== '') failures.push('Postman api_key must be empty.');

function requests(items = []) {
  return items.flatMap((item) => item.item ? requests(item.item) : [item.request]).filter(Boolean);
}
const postmanPaths = new Set(requests(collection.item).map((request) => {
  const raw = typeof request.url === 'string' ? request.url : request.url?.raw ?? '';
  return raw.replace('{{base_url}}', '').split('?')[0].replace(/\/\d+(?=\/|$)/g, '/{id}');
}));
for (const path of Object.keys(spec.paths ?? {})) {
  if (!postmanPaths.has(path)) failures.push(`Postman collection does not cover ${path}.`);
}

async function files(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() && entry.name !== '.git' ? files(child) : [child];
  }))).flat();
}

const suspicious = [
  new RegExp(['-----BEGIN ', '(?:RSA |EC |OPENSSH )?', 'PRIVATE KEY-----'].join('')),
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /(?:api[_-]?key|token|secret)\s*[=:]\s*["'][A-Za-z0-9_\-]{16,}["']/i
];
for (const path of await files(root.pathname)) {
  if (!['.json', '.md', '.yml', '.yaml', '.mjs'].includes(extname(path))) continue;
  const content = await readFile(path, 'utf8');
  for (const pattern of suspicious) {
    if (pattern.test(content)) failures.push(`Possible secret in ${relative(root.pathname, path)} (${pattern}).`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Validated ${Object.keys(spec.paths).length} public paths, Postman schema, JSON syntax, and secret hygiene.`);
