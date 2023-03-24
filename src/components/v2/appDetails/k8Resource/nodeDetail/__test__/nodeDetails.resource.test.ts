import {
    ad, nodeName, nodeType, isResourceBrowserView, selectedResource
} from '../__mocks__/nodeDetails.resource.mock'
import { getEventHelmApps, createBody, createResourceRequestBody } from '../nodeDetail.api'
import { AssertionError } from 'assert'

{ getEventHelmApps } jest.requireActual('../nodeDetail.api'),
jest.mock('../nodeDetail.api', () => ({
    createBody: jest.fn(),
    createResourceRequestBody: jest.fn(),
}))
jest.mock('../../../../../../services/api') // mock the API service

describe('getEventHelmApps', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    // TODO : AssertionError to be fixed in future
    // it('should call createResourceRequestBody if isResourceBrowserView is true', async () => {
    //     const createResourceRequestBodySpy = jest.spyOn(require('../nodeDetail.api'), 'createResourceRequestBody')
    //     await getEventHelmApps(ad, nodeName, nodeType, isResourceBrowserView, selectedResource)

    //     expect(createResourceRequestBodySpy).toHaveBeenCalledTimes(1)
    //     expect(createResourceRequestBodySpy).toHaveBeenCalledWith(selectedResource)
    // })

    // TODO : AssertionError to be fixed in future
    // it('should call createBody if isResourceBrowserView is false', async () => {
    //     const createBodySpy = jest.spyOn(require('../nodeDetail.api'), 'createBody')
    //     await getEventHelmApps(ad, nodeName, nodeType, false, selectedResource)

    //     expect(createBodySpy).toHaveBeenCalledTimes(1)
    //     expect(createBodySpy).toHaveBeenCalledWith(ad, nodeName, nodeType)
    // })

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