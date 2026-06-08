export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  roleId: number;
  providerId?: number | null;
}

export interface ProviderListItem {
  id: number;
  name: string;
  specialty: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
  providerId: number | null;
  expiration: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export interface Provider {
  id: number;
  name: string;
  specialty: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  status: string;
  averageScore: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ProviderDetail extends Provider {
  createdBy: string | null;
  updatedBy: string | null;
  scores: ProviderScore[];
}

export interface CreateProvider {
  name: string;
  specialty: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface UpdateProvider {
  name: string;
  specialty: string;
  email?: string;
  phone?: string;
  location?: string;
  status: string;
}

export interface ProviderScore {
  id: number;
  providerId: number;
  providerName: string | null;
  score: number;
  category: string | null;
  notes: string | null;
  evaluationDate: string;
  evaluatedBy: string | null;
}

export interface CreateProviderScore {
  providerId: number;
  score: number;
  category?: string;
  notes?: string;
  evaluationDate?: string;
}

export interface UpdateProviderScore {
  score: number;
  category?: string;
  notes?: string;
}

export interface DashboardKpi {
  averageScore: number;
  totalProviders: number;
  atRiskProviders: number;
  monthlyImprovement: number;
}

export interface MonthlyTrend {
  month: string;
  averageScore: number;
}

export interface RiskDistribution {
  status: string;
  count: number;
}

export interface ProviderPerformance {
  providerName: string;
  averageScore: number;
  status: string;
}

export interface DashboardAnalytics {
  kpis: DashboardKpi;
  monthlyTrends: MonthlyTrend[];
  riskDistribution: RiskDistribution[];
  topProviders: ProviderPerformance[];
  bottomProviders: ProviderPerformance[];
}

export interface AuditLogEntry {
  id: number;
  entityName: string;
  actionType: string;
  entityId: number;
  modifiedBy: string | null;
  timestamp: string;
}

export interface AdminSummary {
  totalUsers: number;
  activeUsers: number;
  totalAuditLogs: number;
  recentActivity: AuditLogEntry[];
}

export interface CategoryScore {
  category: string;
  averageScore: number;
}

export interface ProviderDashboard {
  providerName: string;
  specialty: string;
  status: string;
  location: string | null;
  overallScore: number;
  totalEvaluations: number;
  monthlyChange: number;
  scoreTrends: MonthlyTrend[];
  categoryScores: CategoryScore[];
  recentScores: ProviderScore[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: string[];
}

export interface ProviderQueryParams {
  search?: string;
  specialty?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export interface ErrorLogQueryParams {
  search?: string;
  method?: string;
  statusCode?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogQueryParams {
  search?: string;
  actionType?: string;
  entityName?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export interface AuthState {
  token: string | null;
  username: string | null;
  fullName: string | null;
  role: string | null;
  providerId: number | null;
  isAuthenticated: boolean;
}

export interface ErrorLog {
  id: number;
  message: string;
  stackTrace: string | null;
  source: string | null;
  path: string | null;
  method: string | null;
  statusCode: number | null;
  timestamp: string;
}

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface CreateUser {
  username: string;
  email: string;
  fullName: string;
  password: string;
  roleId: number;
}

export interface UpdateUser {
  fullName: string;
  email: string;
  roleId: number;
  isActive: boolean;
}

export interface Profile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
}

export interface UpdateProfile {
  fullName: string;
  email: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// AI Types
export interface RiskPrediction {
  providerId: number;
  providerName: string;
  riskLevel: string;
  riskProbability: number;
  recommendation: string;
  riskFactors: string[];
  predictedAt: string;
}

export interface PerformanceSummary {
  providerId: number;
  providerName: string;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  trendDirection: string;
  generatedAt: string;
}

export interface DashboardInsight {
  insightType: string;
  title: string;
  description: string;
  severity: string;
  generatedAt: string;
}

export interface ErrorLogAnalysis {
  pattern: string;
  occurrences: number;
  rootCause: string;
  suggestion: string;
  severity: string;
  affectedErrorIds: number[];
}

export interface AiAssistantRequest {
  question: string;
}

export interface AiAssistantResponse {
  answer: string;
  questionType: string;
  data: unknown;
  respondedAt: string;
}

export interface AiRecommendation {
  providerId: number;
  providerName: string;
  action: string;
  reason: string;
  priority: string;
  generatedAt: string;
}

export interface ReportProvider {
  id: number;
  name: string;
  specialty: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  status: string;
  averageScore: number;
  totalEvaluations: number;
  lastEvaluationDate: string | null;
  createdAt: string;
}

export interface ReportData {
  generatedAt: string;
  kpis: DashboardKpi;
  monthlyTrends: MonthlyTrend[];
  riskDistribution: RiskDistribution[];
  topProviders: ProviderPerformance[];
  bottomProviders: ProviderPerformance[];
  allProviders: ReportProvider[];
}
