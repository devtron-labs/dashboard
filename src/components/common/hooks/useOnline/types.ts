export interface FetchConnectivityParamsType {
    url: string
    options: RequestInit
    controller: AbortController
    setTimeoutRef: (ref: NodeJS.Timeout) => void
    checkConnectivity: () => void
}

export interface CheckConnectivityParamsType
    extends Pick<FetchConnectivityParamsType, 'controller' | 'setTimeoutRef' | 'checkConnectivity'> {}
