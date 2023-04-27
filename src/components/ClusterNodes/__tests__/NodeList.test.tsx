//@ts-nocheck
import React from 'react'
import { BrowserRouter, Route, Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import '@testing-library/jest-dom'
import { act, render } from '@testing-library/react'
import { clusterId } from '../__mocks__/clusterAbout.mock'
import NodeList from '../NodeList'

// TODO : Breaking Because of Page Header Component
describe('Test randerAboutCluster function', () => {
    const requestPayload = { body: undefined, credentials: 'include', method: 'GET', signal: null as AbortSignal | null }
    beforeAll(() => {
        global.fetch = jest.fn()
        requestPayload.signal = new AbortController().signal
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render with default cluster name screen', async () => {
        let component
        const mockSuccessResponse = {
            code: 200,
            result: {
                cluster_name: 'default_cluster',
                cluster_id: clusterId,
                cluster_created_on: new Date().toISOString(),
                cluster_created_by: "Admin",
            }
        }
        const mockJsonPromise = Promise.resolve(mockSuccessResponse)
        const mockFetchPromise = Promise.resolve({
            json: () => mockJsonPromise,
        })
        jest.spyOn(global, 'fetch').mockImplementation(mockFetchPromise)
        await act(async () => {
            
            component = render(
                <Router history={createMemoryHistory({ initialEntries: [`clusters/${clusterId}`] })}>
                    <Route path="clusters/:clusterId">
                        <NodeList
                            imageList={[]}
                            isSuperAdmin={true}
                            namespaceList={['']}
                        />
                    </Route>
                </Router>,
                { wrapper: BrowserRouter },
            )
        })    
        expect(component.container).toBeInTheDocument()
        expect(global.fetch).toHaveBeenCalledWith(`undefined/cluster/description?id=${clusterId}`, requestPayload)
    });

    it('should render cluster details empty state for invalid cluster id', async () => {
        let component
        const mockFailedResponse = {
            code: 404,
        }
        const mockJsonPromise = Promise.resolve(mockFailedResponse)
        const mockFetchPromise = Promise.resolve({
            json: () => mockJsonPromise,
        })
        jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise)
        await act(async () => {
            component = render(
                <Router history={ createMemoryHistory({ initialEntries: ["clusters/10010101010"] }) }>
                    <Route path="clusters/:clusterId">
                        <NodeList imageList={[]} isSuperAdmin={true} namespaceList={[]} />
                    </Route>
                </Router>,
                { wrapper: BrowserRouter },
            )
        })
        expect(component.container).toBeInTheDocument()
        expect(global.fetch).toHaveBeenCalledWith(`undefined/cluster/description?id=10010101010`, requestPayload)
        expect(component.getByTestId('generic-empty-state')).toBeVisible()
    });
});
