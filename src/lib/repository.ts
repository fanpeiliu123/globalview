import { admissionCases } from "../data/cases";
import { programSources } from "../data/programSources";
import type {
  AiRetrievalRequest,
  CaseRecord,
  CaseSearchFilters,
  ProgramSource,
} from "./types";
import { buildAiRetrievalContext, getTaxonomy, searchCases } from "./search";

export interface CaseRepository {
  listPrograms(): Promise<ProgramSource[]>;
  searchMasterCases(filters: CaseSearchFilters): Promise<CaseRecord[]>;
  getTaxonomy(): Promise<ReturnType<typeof getTaxonomy>>;
  retrieveForAi(request: AiRetrievalRequest): Promise<
    ReturnType<typeof buildAiRetrievalContext>
  >;
}

export const localCaseRepository: CaseRepository = {
  async listPrograms() {
    return programSources;
  },
  async searchMasterCases(filters) {
    return searchCases(filters).map((result) => result.caseRecord);
  },
  async getTaxonomy() {
    return getTaxonomy();
  },
  async retrieveForAi(request) {
    return buildAiRetrievalContext(request);
  },
};

export const plannedApiRoutes = [
  {
    method: "GET",
    path: "/api/master-cases",
    purpose: "案例检索、分页、排序、筛选",
  },
  {
    method: "GET",
    path: "/api/master-cases/:id",
    purpose: "单个案例详情和相似案例",
  },
  {
    method: "GET",
    path: "/api/taxonomy",
    purpose: "国家、大学、项目三级分类",
  },
  {
    method: "POST",
    path: "/api/import/cases",
    purpose: "用户提供案例文件后的结构化导入",
  },
  {
    method: "POST",
    path: "/api/ai/retrieve-cases",
    purpose: "AI 检索增强生成的案例召回上下文",
  },
];

export { admissionCases, programSources };
