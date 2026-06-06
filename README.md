# GlobalView

面向中国内地留学生的硕士研究生申请案例检索系统。当前版本已经完成可运行网站、硕士案例库、国家/大学/项目分类、案例详情、对比栏、AI 检索上下文预留和案例导入脚本。

## 运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 导入案例

```bash
npm run import:cases -- docs/case-import-template.csv data/generated-cases.json
```

导入脚本支持 `.csv` 和 `.json`。真实案例进入系统前应先完成匿名化：姓名、邮箱、手机号、微信号、申请账号、精确住址和可反查身份的奖项编号不要进入前端库。

## 数据说明

当前案例均为匿名合成种子数据，用于搭建产品形态和检索逻辑；项目名称和分类来自少量官方项目页面。后续你提供真实案例文件后，可以使用 `scripts/import-cases.mjs` 转换，再接入 `src/lib/repository.ts` 或服务端数据库。

## 关键文件

- `src/App.tsx`: 主界面、筛选、分类图谱、接口视图
- `src/data/programSources.ts`: 官方项目源
- `src/data/cases.ts`: 匿名种子案例
- `src/lib/types.ts`: 数据模型
- `src/lib/search.ts`: 检索、匹配评分、相似案例、AI 上下文
- `src/lib/repository.ts`: 后续替换为 API/数据库的仓库层
- `docs/api-contract.md`: 预留 API 合约
- `docs/architecture.md`: 架构说明
