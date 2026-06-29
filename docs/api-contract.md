# GlobalView API Contract

GlobalView 当前以前端本地数据运行，后续服务端可按以下接口接入数据库、向量检索和 AI 生成。

## `GET /api/programs`

Returns the verified master programme catalogue. The current static build uses
`src/data/realPrograms.json`; a server implementation should keep the same
response shape so the front end can switch data providers without changing the
UI.

Query:

- `keyword`
- `country`
- `universityId`
- `discipline`
- `rankBand`
- `coverage`
- `sort`
- `page`
- `pageSize`

Response:

```json
{
  "items": [],
  "total": 6715,
  "page": 1,
  "pageSize": 96,
  "stats": {
    "universities": 80,
    "countries": 20,
    "avgCompleteness": 36
  }
}
```

## `GET /api/programs/:id`

Returns one programme record, including official URL, source URLs, enrichment
fields, and data-completeness metadata.

## `GET /api/program-catalogue/stats`

Returns catalogue coverage such as programme count, university count, country
count, discipline count, and verified-field counts for tuition, deadline,
language requirements, GRE/GMAT, and entry requirements.

## `GET /api/master-cases`

Query:

- `keyword`
- `country`
- `university`
- `programId`
- `discipline`
- `result`
- `tier`
- `minGpa`
- `minLanguage`
- `withGreGmat`
- `page`
- `pageSize`

Response:

```json
{
  "items": [],
  "total": 24,
  "page": 1,
  "pageSize": 20
}
```

## `GET /api/master-cases/:id`

Returns one anonymized case, its program source, and similar cases.

## `GET /api/taxonomy`

Returns country, university, and program hierarchy.

## `POST /api/import/cases`

Accepts normalized JSON from `scripts/import-cases.mjs`.

## `POST /api/import/programs`

Accepts normalized JSON from `scripts/import-programs.mjs` or the verified
QS Top80 workbook conversion produced by `scripts/import-qs-verified.mjs`.

## `POST /api/ai/retrieve-cases`

Request:

```json
{
  "query": "双非一本想申请英国管理",
  "targetCountries": ["UK"],
  "targetDisciplines": ["管理与市场"],
  "topK": 5
}
```

Response:

```json
{
  "matchedCaseIds": ["GV-MS-2026-017"],
  "contextBlocks": [],
  "recommendedFilters": {}
}
```
