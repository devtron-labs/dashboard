export interface EnvironmentProps {
    environmentName: string
    namespace: string
    id: string
    clusterId: number
    prometheusEndpoint: string
    isProduction: boolean
    description: string
    reload: () => void
    hideClusterDrawer: () => void
    isVirtual: boolean
}

export interface EnvironmentFormProps {
    environmentName: string
    namespace: string
    isProduction: boolean
    description: string
}
