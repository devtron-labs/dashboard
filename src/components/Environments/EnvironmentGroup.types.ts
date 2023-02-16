export interface ConfigAppList {
    id: number,
    name: string
 }

 export interface EnvAppList {
    id: number,
    environment_name: string,
    cluster_name: string,
    active: boolean,
    default: boolean,
    namespace: string,
    isClusterCdActive: boolean,
    environmentIdentifier: string,
    appCount: number
 }


