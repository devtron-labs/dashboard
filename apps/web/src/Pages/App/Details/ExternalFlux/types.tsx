export interface ExternalFluxAppDetailParams {
    clusterId: string
    appName: string
    namespace: string
    templateType: string
}

export enum EXTERNAL_FLUX_APP_STATUS {
    READY = 'Ready',
    NOT_READY = 'Not Ready',
}
