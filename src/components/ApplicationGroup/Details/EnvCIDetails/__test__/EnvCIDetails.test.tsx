import React from 'react'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { BrowserRouter, Route } from 'react-router-dom'
import EnvCIDetails from '../EnvCIDetails'
import { renderWithRouter } from '../../EnvironmentConfig/__test__/ApplicationRoutes.test'
import { filteredData } from '../../EnvironmentOverview/__mock__/EnvironmentOverview.mock'

describe('EnvCIDetails', () => {
    it('EnvCIDetails render without error', () => {
        const { container } = renderWithRouter(
            <Route path="application-group/:envId/ci-details/:pipelineId/:triggerId">
                <EnvCIDetails filteredApps={filteredData} />
            </Route>,
            { route: 'application-group/4/ci-details/1' },
        )
        expect(container).toBeInTheDocument()
    })

    // it('EnvCIDetails render without error', () => {
    //     let component
    //     jest.spyOn(configData, 'getCIConfigList').mockImplementation(mockCIList)
    //     const { container } = renderWithRouter(
    //         <Route path="application-group/:envId/ci-details/:pipelineId/:triggerId">
    //             <EnvCIDetails filteredApps={filteredData} />
    //         </Route>,
    //         { route: 'application-group/4/ci-details/1' },
    //     )
    //     expect(container).toBeInTheDocument()
    //     const loadState = container.querySelector('.ci-details__history')
    //     expect(loadState).toBeInTheDocument()
    // })
})
