
import { APIService } from './api';
import { getEnvConfig } from '../config/env';

const config = getEnvConfig()

class OpenSearchAPI extends APIService {

    private searchAPIUrl: string
    private defaultPageItems: number = 20;
    private xClinetId = '20052'

    constructor() {
        super()
        this.searchAPIUrl = config.cdn_url;
    }

    getPaginatedClientList = async (sourceSystem: string, offset: number) => {
        // const url = `${this.searchAPIUrl}/v1/docsville/search`
        const url = `https://pyfcjbg9f5.execute-api.us-east-1.amazonaws.com/Dev/api/v1/docsville/search`
        // const headers = await this.getAuthHeaders();
        const requestObj = {
            query: [
                {
                    "key": "sourceSystem",
                    "type": "matches",
                    "value": sourceSystem
                }
            ],
            unique: [
                "clientId"
            ],
            count: this.defaultPageItems,
            offset: offset,
            projection: [
                'clientId',
                'sourceSystem'
            ]
        }
        const headers = await this.getAuthHeaders()
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestObj),
            headers
            // headers: { ...headers, 'x-clientid': this.xClinetId }
        }).then((resp) => this.handleResponse(resp));
    }

    clientListSearch = async (sourceSystem: string, clientName: string, offset: number) => {
        // const url = `${this.searchAPIUrl}/v1/docsville/search`
        const url = `https://pyfcjbg9f5.execute-api.us-east-1.amazonaws.com/Dev/api/v1/docsville/search`
        // const headers = await this.getAuthHeaders();
        const requestObj = {
            query: [
                {
                    "key": "sourceSystem",
                    "type": "matches",
                    "value": sourceSystem
                },
                {
                    "key": "clientId",
                    "type": "like",
                    "value": clientName
                }
            ],
            unique: [
                "clientId"
            ],
            count: this.defaultPageItems,
            offset: offset || 0,
            projection: [
                'clientId',
                'sourceSystem'
            ]
        }
        const headers = await this.getAuthHeaders()
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(requestObj),
            // headers: { ...headers, 'x-clientid': this.xClinetId }
            headers
        }).then((resp) => this.handleResponse(resp));
    }

    async searchContent(query: string, k: number = 5): Promise<any> {
        try {
          console.log("Content Search API - Request params:", {query, k});
          
          const headers = {
            "Content-Type": "application/json"
          };
     
          // Get the correct API URL from the logs
          const apiUrl = "https://pyfcjbg9f5.execute-api.us-east-1.amazonaws.com/Dev/api/v1/docsville/content/search";
          
          console.log("Content Search API - Making fetch request to:", apiUrl);
          console.log("Content Search API - Headers:", JSON.stringify(headers, null, 2));
          console.log("Content Search API - Request body:", JSON.stringify({query, k}, null, 2));
     
          const response = await fetch(
            apiUrl,
            {
              method: "POST",
              headers: headers,
              body: JSON.stringify({query, k}),
            }
          );
     
          console.log("Content Search API - Response status:", response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Content Search API - Error response:", errorText);
            throw new Error(`Content search request failed: ${errorText}`);
          }
     
          const data = await this.handleResponse(response);
          console.log("Content Search API - Response data:", JSON.stringify(data, null, 2));
          return data;
        } catch (error) {
          console.error("Error searching content:", error);
          throw error;
        }
      }

}


export const openSearchApi = new OpenSearchAPI()