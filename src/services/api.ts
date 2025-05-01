import { getEnvConfig } from "../config/env";
import { OktaAuth } from "@okta/okta-auth-js";
import { OKTA_CONFIG } from "../auth/AuthConfig";

const config = getEnvConfig();

export interface Document {
  filename: string;
  metadata: Record<string, any>;
  sourceSystem: string;
  year: number;
  createdAt: number;
  updatedAt: number;
  fileType: string;
  id: string;
  contentType: string;
  clientId: string;
  author: string;
  url: string;
  inlineUrl: string;
}

export interface SourceSystemConfig {
  id: string;
  name: string;
  sourceSystem: string;
  description?: string;
  enabled: boolean;
  lastUpdated: string;
}

export interface Client {
  id: string;
  clientId: string;
  name: string;
  type: string;
  lastUpdated: string;
}

class ApiService {
  private baseUrl: string;
  private isDevelopment: boolean;
  private oktaAuth: OktaAuth;
  private configCache: {
    data: SourceSystemConfig[] | null;
    timestamp: number;
  } = {
    data: null,
    timestamp: 0,
  };

  constructor() {
    this.baseUrl = config.api_url;
    this.isDevelopment = import.meta.env.DEV;
    this.oktaAuth = new OktaAuth({
      issuer: OKTA_CONFIG.issuer,
      clientId: OKTA_CONFIG.clientId,
    });
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (OKTA_CONFIG.isEnabled) {
      try {
        const accessToken = await this.oktaAuth.getAccessToken();
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error("Error getting access token:", error);
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }
    return response.json();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getSourceSystemConfigs(): Promise<SourceSystemConfig[]> {
    const now = Date.now();
    if (
      this.configCache.data &&
      now - this.configCache.timestamp < 5 * 60 * 1000
    ) {
      return this.configCache.data;
    }

    try {
      // if (this.isDevelopment) {
      //   await this.delay(1000);
      //   const mockConfigs: SourceSystemConfig[] = [
      //     {
      //       id: "1",
      //       name: "Dragon System",
      //       sourceSystem: "dragon",
      //       description: "Primary document management system",
      //       enabled: true,
      //       lastUpdated: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       name: "eBao System",
      //       sourceSystem: "ebao",
      //       description: "Insurance policy management",
      //       enabled: true,
      //       lastUpdated: new Date().toISOString(),
      //     },
      //   ];
      //   this.configCache = {
      //     data: mockConfigs,
      //     timestamp: now,
      //   };
      //   return mockConfigs;
      // }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `https://dmsv2-api.alliedworld.dev/v2/docsville/getAllConfig`,
        {
          headers,
        }
      );
      const configs = await this.handleResponse<SourceSystemConfig[]>(response);

      this.configCache = {
        data: configs,
        timestamp: now,
      };

      return configs;
    } catch (error) {
      console.error("Error fetching source system configs:", error);
      throw error;
    }
  }

  async getClientList(sourceSystem: string): Promise<Client[]> {
    try {
      // if (this.isDevelopment) {
      //   await this.delay(1000);
      //   return [
      //     {
      //       id: "1",
      //       clientId: "C001",
      //       name: "Acme Corporation",
      //       type: "Corporate",
      //       lastUpdated: new Date().toISOString(),
      //     },
      //     {
      //       id: "2",
      //       clientId: "C002",
      //       name: "Global Industries",
      //       type: "Corporate",
      //       lastUpdated: new Date().toISOString(),
      //     },
      //     {
      //       id: "3",
      //       clientId: "C003",
      //       name: "Tech Solutions Ltd",
      //       type: "SME",
      //       lastUpdated: new Date().toISOString(),
      //     },
      //   ];
      // }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/${sourceSystem}/client-list`,
        {
          headers,
        }
      );
      return this.handleResponse<Client[]>(response);
    } catch (error) {
      console.error("Error fetching client list:", error);
      throw error;
    }
  }

  async getDocuments(
    sourceSystem: string,
    clientId?: string
  ): Promise<Document[]> {
    try {
      // if (this.isDevelopment) {
      //   await this.delay(1000);
      //   return [
      //     {
      //       filename: "annual_report_2024.pdf",
      //       metadata: {},
      //       sourceSystem: sourceSystem,
      //       year: 2024,
      //       createdAt: Date.now() - 86400000,
      //       updatedAt: Date.now(),
      //       fileType: "document",
      //       id: crypto.randomUUID(),
      //       contentType: "application/pdf",
      //       clientId: clientId || "C001",
      //       author: "system",
      //       url: "https://example.com/files/annual_report_2024.pdf",
      //       inlineUrl: "https://example.com/files/annual_report_2024.pdf",
      //     },
      //   ];
      // }

      const headers = await this.getAuthHeaders();
      console.log("checking...", sourceSystem, clientId);
      const url = clientId
        ? `${this.baseUrl}/${sourceSystem}/${clientId}/documents`
        : `${this.baseUrl}/${sourceSystem}/documents`;

      const response = await fetch(url, {
        headers,
      });
      return this.handleResponse<Document[]>(response);
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  }

  async deleteDocument(
    sourceSystem: string,
    documentId: string
  ): Promise<void> {
    try {
      if (this.isDevelopment) {
        await this.delay(500);
        return;
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${this.baseUrl}/v1/${sourceSystem}/documents/${documentId}`,
        {
          method: "DELETE",
          headers,
        }
      );
      return this.handleResponse<void>(response);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
