import { AxiosRequestConfig, ResponseType, Method, AxiosInstance, AxiosProxyConfig, AxiosResponse } from 'axios';
import { TOKENS } from 'src/di';
import { inject, injectable } from 'tsyringe';
import { RequestModule, RequestOptions } from './types';

@injectable()
export class AxiosRequestModule implements RequestModule {
    constructor(
        @inject(TOKENS.values.axiosClient) private _client: AxiosInstance
    ){ }

    public async request<R>(options: RequestOptions): Promise<R> {
        return await this._client.request(this.convertToAxiosOpts(options));;
    }

    private convertToAxiosOpts(options: RequestOptions): AxiosRequestConfig {
        const axiosClientOpts: AxiosRequestConfig = {
            url: options.url,
            method: options.method as Method,
            baseURL: options.baseURL,
            headers: options.headers,
            params: options.params,
            data: options.body,
            withCredentials: options.CORS,
            maxRedirects: options.maxRedirects,
            httpAgent: options.httpAgent,
            httpsAgent: options.httpsAgent,
            responseType: options.responseType && options.responseType as ResponseType || undefined,
            proxy: options.proxy as unknown as AxiosProxyConfig
        }

        return axiosClientOpts;
    }
}