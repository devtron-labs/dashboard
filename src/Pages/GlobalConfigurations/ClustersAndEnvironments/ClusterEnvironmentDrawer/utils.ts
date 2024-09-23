import { ClusterNamespacesDTO, GetClusterEnvironmentUpdatePayloadType } from './types'

export const getClusterEnvironmentUpdatePayload = ({
    id,
    data,
    prometheusEndpoint,
    clusterId,
    namespaceLabels,
    resourceVersion,
    isVirtual = false,
}: GetClusterEnvironmentUpdatePayloadType) =>
    isVirtual
        ? {
              id,
              environment_name: data.environmentName,
              namespace: data.namespace || '',
              IsVirtualEnvironment: true,
              cluster_id: clusterId,
              description: data.description || '',
          }
        : {
              id,
              environment_name: data.environmentName,
              cluster_id: clusterId,
              prometheus_endpoint: prometheusEndpoint,
              namespace: data.namespace || '',
              active: true,
              default: data.isProduction,
              description: data.description || '',
              updateLabels: !!namespaceLabels,
              ...(namespaceLabels
                  ? {
                        namespaceResourceVersion: resourceVersion,
                        namespaceLabels: namespaceLabels
                            .filter(({ key, value }) => !!key.trim() && !!value.trim())
                            .map(({ key, value }) => ({ key, value })),
                    }
                  : {}),
          }

export const getClusterNamespaceByName = (namespacesList: ClusterNamespacesDTO[], name: string) =>
    namespacesList.find(({ name: _name }) => _name === name)

export const getNamespaceLabels = (clusterNamespace: ClusterNamespacesDTO) =>
    clusterNamespace?.labels.map(({ key, value }, index) => ({
        id: index,
        key,
        value,
        propagate: true,
        isPropagateDisabled: true,
    })) ?? [
        {
            id: 0,
            key: '',
            value: '',
            propagate: true,
            isPropagateDisabled: true,
        },
    ]
