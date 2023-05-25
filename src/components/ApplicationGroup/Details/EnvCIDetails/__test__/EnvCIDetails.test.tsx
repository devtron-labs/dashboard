import React from 'react'
import '@testing-library/jest-dom'
import { act } from '@testing-library/react'
import { Route } from 'react-router-dom'
import EnvCIDetails from '../EnvCIDetails'
import { renderWithRouter } from '../../EnvironmentConfig/__test__/ApplicationRoutes.test'
import { filteredData, mockCIList, mockTrigger } from '../__mock__/EnvCIDetails.mock'
import * as configData from '../../../AppGroup.service'
import * as serviceData from '../../../../app/service'

describe('EnvCIDetails', () => {
    it('EnvCIDetails render without error', () => {
        const { container } = renderWithRouter(
            <Route path="application-group/:envId/ci-details/:pipelineId">
                <EnvCIDetails filteredAppIds={'29,98'} />
            </Route>,
            { route: 'application-group/3/ci-details/45' },
        )
        expect(container).toBeInTheDocument()
    })

    it('EnvCIDetails render without error async', async () => {
        let component
        jest.spyOn(configData, 'getCIConfigList').mockImplementation(mockCIList)
        jest.spyOn(serviceData, 'getTriggerHistory').mockImplementation(mockTrigger)
        await act(async () => {
            component = renderWithRouter(
            <Route path="application-group/:envId/ci-details/:pipelineId/:buildId">
                <EnvCIDetails filteredAppIds={'29,98'} />
            </Route>,
            { route: 'application-group/3/ci-details/45/363' },
            )
        })

        expect(component.container).toBeInTheDocument()
        const leftState = component.container.querySelector('.ci-details__history')
        const rightState = component.container.querySelector('.ci-details__body')
        expect(leftState).toBeInTheDocument()
        expect(rightState).toBeInTheDocument()
    })
})
