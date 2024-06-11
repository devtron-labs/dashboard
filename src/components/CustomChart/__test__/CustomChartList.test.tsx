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

//@ts-nocheck
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import { act, fireEvent, render } from '@testing-library/react'
import { mockSuccessResponseWithEmptyChartList, mockSuccessResponseWithChartList, chartListData } from '../__mocks__/CustomChartList.mock'
import CustomChartList from '../CustomChartList'
import ApiMethods from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../../config'

describe('Test CustomChartList Component', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render CustomChartList empty state', async () => {
        let component
        const mockJsonPromise = Promise.resolve(mockSuccessResponseWithEmptyChartList)
        jest.spyOn(ApiMethods, 'get').mockImplementation((url: string) => mockJsonPromise)
        await act(async () => {
            component = render(<CustomChartList/>, { wrapper: BrowserRouter })
        })
        expect(ApiMethods.get).toHaveBeenCalledTimes(1)
        expect(ApiMethods.get).toHaveBeenCalledWith(Routes.CUSTOM_CHART_LIST)
        expect(component.container).toBeInTheDocument()
        expect(component.getByTestId('generic-empty-state')).toBeVisible()
    })

    it('should render CustomChartList with valid data', async () => {
        let component
        const mockJsonPromise = Promise.resolve(mockSuccessResponseWithChartList)
        jest.spyOn(ApiMethods, 'get').mockImplementation((url: string) => mockJsonPromise)
        await act(async () => {
            component = render(<CustomChartList/>, { wrapper: BrowserRouter })
        })
        expect(ApiMethods.get).toHaveBeenCalledTimes(1)
        expect(ApiMethods.get).toHaveBeenCalledWith(Routes.CUSTOM_CHART_LIST)
        expect(component.container).toBeInTheDocument()
        expect(component.getByTestId('custom-charts-list')).toBeVisible()
        const customChartUploadButton = component.getByTestId('upload-custom-chart-button') as HTMLElement
        expect(customChartUploadButton).toBeVisible()
    })

    it('should render Chart Versions on download button click', async () => {
        let component
        const mockJsonPromise = Promise.resolve(mockSuccessResponseWithChartList)
        jest.spyOn(ApiMethods, 'get').mockImplementation((url: string) => mockJsonPromise)
        await act(async () => {
            component = render(<CustomChartList/>, { wrapper: BrowserRouter })
        })
        fireEvent.click(component.getByTestId(`download-${chartListData[0].name}`))
        expect(component.getByTestId('chart-versions-modal')).toBeVisible()
        expect(component.queryAllByTestId('chart-version-row')).toHaveLength(chartListData[0].versions.length)
    })
})
