import { Agent } from "https";

export type RequestOptions = {
    url?: string,
    method?: string,
    baseURL?: string,
    headers?: {},
    params?: { name: string, value: any },
    body?: { name: string, value: any },
    CORS?: boolean,
    maxRedirects?: number,
    httpAgent?: Agent,
    httpsAgent?: Agent,
    responseType?: string,
    proxy?: { host: string, port: number, auth: object}
}

export interface RequestModule {
    request<R>(options: RequestOptions): Promise<R>;
}