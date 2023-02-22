export interface ConfigAppList {
    id: number
    name: string
}

export interface EnvApp {
    envCount: number
    envList: EnvAppList[]
}

export interface EnvDeploymentStatus {
    appId: number
    pipelineId: number
    deployStatus: string
    wfrId: number
}
export interface EnvAppList {
    id: number
    environment_name: string
    cluster_name: string
    active: boolean
    default: boolean
    namespace: string
    isClusterCdActive: boolean
    environmentIdentifier: string
    appCount: number
}

export interface EmptyEnvState {
    title?: string
    subTitle?: string
    actionHandler?: () => void
}

export interface AppInfoListType {
    application: string
    appStatus: string
    deploymentStatus: string
    lastDeployed: string
    appId: number
    envId: number
}

export interface AppListDataType {
    environment: string
    namespace: string
    cluster: string
    appInfoList: AppInfoListType[]
}

export interface EnvSelectorType {
    onChange: (e) => void
    envId: number
    envName: string
}

export interface ApplicationRouteType {
    envListData: ConfigAppList
}

export interface EnvironmentsListViewType {
    removeAllFilters: () => void
}

export interface AppOverridesType {
    appList?: ConfigAppList[]
    environments: any
    setEnvironments: any
}

export interface EnvHeaderType {
    envName: string
    setEnvName: (label: string) => void
    setShowEmpty: (empty: boolean) => void
    showEmpty: boolean
}
