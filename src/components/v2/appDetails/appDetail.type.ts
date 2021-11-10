export enum ENV_TYPE {
   CHART= 'CHART',
   APPLICATION= 'APPLICATION'
}

export interface ENV_DETAILS {
    envType: ENV_TYPE,
    envId: number,
    appId: number
}

