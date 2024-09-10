/* eslint-disable camelcase */
import { TagType } from '@devtron-labs/devtron-fe-common-lib'
import { EnvironmentFormProps, EnvironmentProps } from './types'
import { ClusterNamespacesDTO } from '../clustersAndEnvironments.types'

export const getEnvironmentPayload = (
    {
        id,
        data,
        prometheusEndpoint,
        clusterId,
        namespaceLabels,
        resourceVersion,
    }: { data: EnvironmentFormProps; namespaceLabels: TagType[] } & Pick<
        EnvironmentProps,
        'clusterId' | 'id' | 'prometheusEndpoint'
    > &
        Pick<ClusterNamespacesDTO, 'resourceVersion'>,
    isVirtual = false,
) =>
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
                            .filter(({ key, value }) => !!key && !!value)
                            .map(({ key, value }) => ({ key, value })),
                    }
                  : {}),
          }

export const getClusterNamespaceByName = (namespacesList: ClusterNamespacesDTO[], name: string) =>
    namespacesList.filter(({ name: _name }) => _name === name)[0]

export const getNamespaceLabels = (clusterNamespace: ClusterNamespacesDTO) =>
    clusterNamespace?.labels.map(({ key, value }, index) => ({
        id: index,
        key,
        value,
        propagate: true,
        isPropagateDisabled: true,
    })) ?? [
        {
            id: Date.now() * Math.random(),
            key: '',
            value: '',
            propagate: true,
            isPropagateDisabled: true,
        },
    ]
