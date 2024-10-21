/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import { act, render } from '@testing-library/react'
import {
    clusterId,
    mockFailedResponse,
    mockSuccessResponseWithOutNote,
    mockSuccessResponseWithNote,
    mockMarkDownEditorComponent,
} from '../__mocks__/clusterAbout.mock'
import ClusterAbout from '../ClusterAbout'
import ApiMethods from '@devtron-labs/devtron-fe-common-lib'

jest.mock('../../charts/discoverChartDetail/DiscoverChartDetails', () => ({
    MarkDown: jest.fn(() => mockMarkDownEditorComponent),
}))

describe('Test randerAboutCluster function', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render with default cluster without notes', async () => {
        let component
        const mockJsonPromise = Promise.resolve(mockSuccessResponseWithNote)
        jest.spyOn(ApiMethods, 'get').mockImplementation((url: string) => mockJsonPromise)
        await act(async () => {
            component = render(<ClusterAbout clusterId={clusterId} isSuperAdmin={true} />, { wrapper: BrowserRouter })
        })
        expect(ApiMethods.get).toHaveBeenCalledTimes(1)
        expect(ApiMethods.get).toHaveBeenCalledWith(`cluster/description?id=${clusterId}`)
        expect(component.container).toBeInTheDocument()
        expect(component.getByTestId('mark-down-test-response')).toBeVisible()
        expect(component.getByTestId('cluster-name')).toBeVisible()
        expect(component.getByTestId('cluster-name')).toHaveTextContent(mockSuccessResponseWithNote.result.clusterName)
    })

    it('should render with default cluster with notes', async () => {
        let component
        const mockJsonPromise = Promise.resolve(mockSuccessResponseWithOutNote)
        jest.spyOn(ApiMethods, 'get').mockImplementation((url: string) => mockJsonPromise)
        await act(async () => {
            component = render(<ClusterAbout clusterId={clusterId} isSuperAdmin={true} />, { wrapper: BrowserRouter })
        })
        expect(ApiMethods.get).toHaveBeenCalledTimes(1)
        expect(ApiMethods.get).toHaveBeenCalledWith(`cluster/description?id=${clusterId}`)
        expect(component.container).toBeInTheDocument()
        expect(component.getByTestId('mark-down-test-response')).toBeVisible()
        expect(component.getByTestId('cluster-name')).toBeVisible()
        expect(component.getByTestId('cluster-name')).toHaveTextContent(
            mockSuccessResponseWithOutNote.result.clusterName,
        )
    })

    it('should render cluster details empty state for invalid cluster id', async () => {
        let component
        const mockJsonPromise = Promise.reject(mockFailedResponse)
        jest.spyOn(ApiMethods, 'get').mockImplementation((url: string) => mockJsonPromise)
        await act(async () => {
            component = render(<ClusterAbout clusterId="10010101010" isSuperAdmin={true} />, { wrapper: BrowserRouter })
        })
        expect(ApiMethods.get).toHaveBeenCalledTimes(1)
        expect(ApiMethods.get).toHaveBeenCalledWith('cluster/description?id=10010101010')
        expect(component.container).toBeInTheDocument()
        expect(component.getByTestId('generic-empty-state')).toBeVisible()
    })
})
