import api from './api';
import type {
  RiskPrediction,
  PerformanceSummary,
  DashboardInsight,
  ErrorLogAnalysis,
  AiAssistantResponse,
  AiRecommendation,
  ApiResponse,
} from '../types';

export const aiService = {
  getRiskPredictions: async (): Promise<RiskPrediction[]> => {
    const response = await api.get<ApiResponse<RiskPrediction[]>>('/ai/risk-predictions');
    return response.data.data;
  },

  getProviderRiskPrediction: async (providerId: number): Promise<RiskPrediction> => {
    const response = await api.get<ApiResponse<RiskPrediction>>(`/ai/risk-predictions/${providerId}`);
    return response.data.data;
  },

  getPerformanceSummary: async (providerId: number): Promise<PerformanceSummary> => {
    const response = await api.get<ApiResponse<PerformanceSummary>>(`/ai/performance-summary/${providerId}`);
    return response.data.data;
  },

  getDashboardInsights: async (): Promise<DashboardInsight[]> => {
    const response = await api.get<ApiResponse<DashboardInsight[]>>('/ai/dashboard-insights');
    return response.data.data;
  },

  getErrorLogAnalysis: async (): Promise<ErrorLogAnalysis[]> => {
    const response = await api.get<ApiResponse<ErrorLogAnalysis[]>>('/ai/error-analysis');
    return response.data.data;
  },

  askAssistant: async (question: string): Promise<AiAssistantResponse> => {
    const response = await api.post<ApiResponse<AiAssistantResponse>>('/ai/assistant', { question });
    return response.data.data;
  },

  getRecommendations: async (providerId: number): Promise<AiRecommendation[]> => {
    const response = await api.get<ApiResponse<AiRecommendation[]>>(`/ai/recommendations/${providerId}`);
    return response.data.data;
  },
};
