import { AppDetails, Node, SelectedResourceType } from '../../../appDetails.type'

export const NodeData = {
    name: 'node1',
    kind: 'Deployment',
    version: 'v1',
    containers: [],
    createdAt: new Date('2021-05-18T12:00:00Z'),
    health: { status: 'healty' },
    namespace: 'namespace1',
    networkingInfo: {
        targetLabels: {
            targetLabel: {
                'app.kubernetes.io/instance': '',
                'app.kubernetes.io/name': '',
            },
        },
    },
    resourceVersion: '',
    uid: '',
    parentRefs: [],
    group: '',
    isSelected: false,
    info: [
        { value: 'test1', name: 'name1' },
        { value: 'test2', name: 'name2' },
    ],
    canBeHibernated: false,
    isHibernated: false,
} as Node

export const external_helm_chart_argocd_appDetails = {
    appId: 0,
    appName: 'app1',
    environmentName: 'dev',
    lastDeployedTime: '2021-05-18T12:00:00Z',
    appType: 'external_helm_chart',
    deploymentAppType: 'argo_cd',
    resourceTree: {
        conditions: '',
        newGenerationReplicaSet: '',
        podMetadata: [
            {
                containers: [],
                initContainers: '',
                isNew: false,
                name: 'name1',
                uid: 'uid1',
            },
        ],
        status: 'status1',
        nodes: [NodeData],
    },
    namespace: 'default',
} as AppDetails
export const helm_chart_argocd_appDetails = {
    appId: 0,
    appName: 'app1',
    environmentName: 'dev',
    lastDeployedTime: '2021-05-18T12:00:00Z',
    appType: 'devtron_helm_chart',
    deploymentAppType: 'argo_cd',
    resourceTree: {
        conditions: '',
        newGenerationReplicaSet: '',
        podMetadata: [
            {
                containers: [],
                initContainers: '',
                isNew: false,
                name: 'name1',
                uid: 'uid1',
            },
        ],
        status: 'status1',
        nodes: [NodeData],
    },
    namespace: 'default',
} as AppDetails

export const devtron_app_argocd_appDetails = {
    appId: 0,
    appName: 'app1',
    environmentName: 'dev',
    lastDeployedTime: '2021-05-18T12:00:00Z',
    appType: 'devtron_app',
    deploymentAppType: 'argo_cd',
    resourceTree: {
        conditions: '',
        newGenerationReplicaSet: '',
        podMetadata: [
            {
                containers: [],
                initContainers: '',
                isNew: false,
                name: 'name1',
                uid: 'uid1',
            },
        ],
        status: 'status1',
        nodes: [NodeData],
    },
    namespace: 'default',
} as AppDetails

export const selectedResource = {
    group: '',
    kind: 'Deployment',
    version: 'v1',
    namespace: 'default',
    name: 'node1',
    clusterId: 0,
    containers: [],
} as SelectedResourceType

export const mockResponse = {
    code: 200,
    status: 'OK',
    result: {
        events: {
            metadata: {
                selfLink: '/api/v1/namespaces/nonprod-noti/events',
                resourceVersion: '13248663',
            },
            items: [],
        },
    },
}
