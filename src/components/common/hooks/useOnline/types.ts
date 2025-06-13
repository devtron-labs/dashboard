export interface FetchConnectivityParamsType {
    url: string
    options: RequestInit
    controller: AbortController
}

export interface CheckConnectivityParamsType extends Pick<FetchConnectivityParamsType, 'controller'> {}
