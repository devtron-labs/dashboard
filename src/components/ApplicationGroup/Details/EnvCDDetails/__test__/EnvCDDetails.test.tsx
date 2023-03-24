import React from 'react'
import '@testing-library/jest-dom'
import { act } from '@testing-library/react'
import { Route } from 'react-router-dom'
import { renderWithRouter } from '../../EnvironmentConfig/__test__/ApplicationRoutes.test'
import EnvCDDetails from '../EnvCDDetails'
import * as apiData from '../../../AppGroup.service'
import * as appdetailsData from '../../../../app/details/appDetails/appDetails.service'
import { mockCDList, mockCDModuleConfig } from '../__mock__/EnvCDDetails.mock'
import { filteredData } from '../../EnvCIDetails/__mock__/EnvCIDetails.mock'

describe('EnvCDDetails', () => {
    it('EnvCDDetails render without error', () => {
        const { container } = renderWithRouter(
            <Route path="application-group/:envId/cd-details/:pipelineId">
                <EnvCDDetails filteredApps={filteredData} />
            </Route>,
            { route: 'application-group/1/cd-details/1/1' },
        )
        expect(container).toBeInTheDocument()
    })

    it('EnvCIDetails render without error', async () => {
        let component
        jest.spyOn(apiData, 'getCDConfig').mockImplementation(mockCDList)
        jest.spyOn(appdetailsData, 'getModuleConfigured').mockImplementation(mockCDModuleConfig)
        await act(async () => {
            component = renderWithRouter(
                <Route path="application-group/:envId/cd-details/:pipelineId/:triggerId">
                   <EnvCDDetails filteredApps={filteredData} />
                </Route>,
                { route: 'application-group/1/cd-details/1/1' },
            )
        })
        expect(component.container).toBeInTheDocument()
        const leftState = component.container.querySelector('.ci-details__history')
        const rightState = component.container.querySelector('.ci-details__body')
        expect(leftState).toBeInTheDocument()
        expect(rightState).toBeInTheDocument()
    })
})