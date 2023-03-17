import React from 'react'
import '@testing-library/jest-dom'
import { act, render } from '@testing-library/react'
import { BrowserRouter, Route } from 'react-router-dom'
import EnvCIDetails from '../EnvCIDetails'
import { renderWithRouter } from '../../EnvironmentConfig/__test__/ApplicationRoutes.test'
import { ciResult, filteredData, mockCIList } from '../__mock__/EnvCIDetails.mock'
import * as configData from '../../../AppGroup.service'

describe('EnvCIDetails', () => {
    it('EnvCIDetails render without error', () => {
        const { container } = renderWithRouter(
            <Route path="application-group/:envId/ci-details/:pipelineId/:buildId">
                <EnvCIDetails filteredApps={filteredData} />
            </Route>,
            { route: 'application-group/1/ci-details/1' },
        )
        expect(container).toBeInTheDocument()
    })

    it('EnvCIDetails render without error', async () => {
        let component
        jest.spyOn(configData, 'getCIConfigList').mockImplementation(mockCIList)
        await act(async () => {
            component = renderWithRouter(
            <Route path="application-group/:envId/ci-details/:pipelineId/:buildId">
                <EnvCIDetails filteredApps={filteredData} />
            </Route>,
            { route: 'application-group/1/ci-details/1/1' },
            )
        })
        expect(component.container).toBeInTheDocument()
        const loadState = component.container.querySelector('.ci-details__history')
        expect(loadState).toBeInTheDocument()
    })
})
