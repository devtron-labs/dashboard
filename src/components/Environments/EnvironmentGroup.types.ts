export interface ConfigAppList {
    id: number,
    name: string
 }

 export interface EnvApp {
   totalCount: number
   envList: EnvAppList[]
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


