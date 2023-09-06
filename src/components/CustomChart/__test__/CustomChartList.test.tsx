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
