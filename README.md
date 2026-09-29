# AlDiwan API Specification

[العربية](#العربية) · [English](#english)

The canonical, machine-readable contract for AlDiwan's public poetry API. It contains the OpenAPI 3.0 specification and an import-ready Postman collection. The API exposes published classical poets and poems only; accounts, community content, quotations, and private/internal services are intentionally excluded.

## English

### Quick start

1. Create an API key in the [AlDiwan developer platform](https://developers.aldiwan.net/).
2. Set `ALDIWAN_API_KEY` locally. Never commit it.
3. Use the base URL `https://api.aldiwan.net/v1` and send `Authorization: Bearer <key>`.

```bash
curl --fail --silent \
  --header "Accept: application/json" \
  --header "Authorization: Bearer $ALDIWAN_API_KEY" \
  "https://api.aldiwan.net/v1/poems?per_page=10&poem_style=vertical"
```

- OpenAPI: [`spec/openapi.json`](spec/openapi.json)
- Postman: [`postman/aldiwan-api.postman_collection.json`](postman/aldiwan-api.postman_collection.json)
- Authentication: bearer API key
- Pagination: `page` and `per_page` (maximum 50)
- Attribution: honor the `attribution` object returned with poetry content.

Validate locally with `npm test` (Node.js 20+, no dependencies).

## العربية

هذا هو العقد الرسمي القابل للقراءة آليًا لواجهة برمجة الديوان العامة. يضم مواصفة OpenAPI ومجموعة Postman جاهزة للاستيراد، ويقتصر على الشعراء والقصائد المنشورة. لا يشمل حسابات الأعضاء أو المحتوى المجتمعي أو الاقتباسات أو الخدمات الداخلية.

### بداية سريعة

1. أنشئ مفتاح API من [منصة مطوري الديوان](https://developers.aldiwan.net/).
2. خزّن المفتاح محليًا في `ALDIWAN_API_KEY` ولا تضفه إلى Git.
3. استخدم العنوان الأساسي `https://api.aldiwan.net/v1` وأرسل المفتاح بصيغة Bearer.

يمكن التحقق محليًا عبر `npm test` باستخدام Node.js 20 أو أحدث، دون تثبيت حزم خارجية. يُرجى الالتزام ببيانات النسب الموجودة في كائن `attribution` عند عرض المحتوى.

## Versioning

This repository follows [Semantic Versioning](https://semver.org/). Breaking contract changes require a major version. Additive endpoints and optional fields are minor changes; corrections that do not change behavior are patches.

## License

Specification and repository materials are released under the [MIT License](LICENSE). API content remains subject to AlDiwan's platform terms.

