import { SelectedResourceType, ResourceTree, Node, AppType, AppDetails, DeploymentAppType } from "../../../appDetails.type"

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
export const ad: AppDetails = {
    appType: AppType.EXTERNAL_HELM_CHART,
    deploymentAppType: DeploymentAppType.argo_cd,
    appId: 0,
    appName: 'my-app',
    environmentName: 'development',
    namespace: 'my-namespace',
    lastDeployedTime: '',
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
    } as ResourceTree,
}
export const selectedResource: SelectedResourceType = {
    group: 'test',
    kind: 'Deployment',
    version: 'v1',
    namespace: 'default',
    name: 'node1',
    clusterId: 0,
    containers: [],
}

export const nodeName = 'testNode'
export const nodeType = 'testNodeType'
export const isResourceBrowserView = true