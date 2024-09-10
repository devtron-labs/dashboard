export interface ClusterNamespacesLabel {
    key: string
    value: string
}

export interface ClusterNamespacesDTO {
    name: string
    labels: ClusterNamespacesLabel[]
    resourceVersion: string
}
