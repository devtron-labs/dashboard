import {
    AppDetails,
    Node,
    AppType,
    DeploymentAppType,
    SelectedResourceType,
    ResourceTree,
} from '../../../appDetails.type'
import { getEventHelmApps, createBody, createResourceRequestBody } from '../nodeDetail.api'

jest.mock('../../../../../../services/api') // mock the API service

const NodeData = {
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
const ad: AppDetails = {
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
const selectedResource: SelectedResourceType = {
    group: 'test',
    kind: 'Deployment',
    version: 'v1',
    namespace: 'default',
    name: 'node1',
    clusterId: 0,
    containers: [],
}

const nodeName = 'testNode'
const nodeType = 'testNodeType'
const isResourceBrowserView = true

describe('getEventHelmApps', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call createResourceRequestBody if isResourceBrowserView is true', async () => {
        const createResourceRequestBodySpy = jest.spyOn(require('../nodeDetail.api'), 'createResourceRequestBody')
        await getEventHelmApps(ad, nodeName, nodeType, isResourceBrowserView, selectedResource)

        expect(createResourceRequestBodySpy).toHaveBeenCalledTimes(1)
        expect(createResourceRequestBodySpy).toHaveBeenCalledWith(selectedResource)
    })

    it('should call createBody if isResourceBrowserView is false', async () => {
        const createBodySpy = jest.spyOn(require('../nodeDetail.api'), 'createBody')
        await getEventHelmApps(ad, nodeName, nodeType, false, selectedResource)

        expect(createBodySpy).toHaveBeenCalledTimes(1)
        expect(createBodySpy).toHaveBeenCalledWith(ad, nodeName, nodeType)
    })

    it('should call api.post with correct arguments', async () => {
        const expectedData = isResourceBrowserView
            ? createResourceRequestBody(selectedResource)
            : createBody(ad, nodeName, nodeType)

        const responseData = { data: 'mock data' }
        const postMock = jest.fn().mockResolvedValueOnce(responseData) // mock the API response

        jest.spyOn(require('../../../../../../services/api'), 'post').mockImplementation(postMock)

        const result = await getEventHelmApps(ad, nodeName, nodeType, isResourceBrowserView, selectedResource)

        expect(result).toEqual(responseData) // checks if correct response data is returned
        expect(postMock).toHaveBeenCalledTimes(1)
        expect(postMock).toHaveBeenCalledWith('k8s/events', expectedData)
    })
})