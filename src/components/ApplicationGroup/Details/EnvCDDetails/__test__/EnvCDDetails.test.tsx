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
                <EnvCDDetails filteredAppIds={filteredData} />
            </Route>,
            { route: 'application-group/1/cd-details/1/1' },
        )
        expect(container).toBeInTheDocument()
    })

    it('EnvCDDetails render without error async', async () => {
        let component
        jest.spyOn(apiData, 'getAppsCDConfigMin').mockImplementation(mockCDList)
        jest.spyOn(appdetailsData, 'getModuleConfigured').mockImplementation(mockCDModuleConfig)
        await act(async () => {
            component = renderWithRouter(
                <Route path="application-group/:envId/cd-details/:pipelineId">
                    <EnvCDDetails filteredAppIds={filteredData} />
                </Route>,
                { route: 'application-group/1/cd-details/1' },
            )
        })
        expect(component.container).toBeInTheDocument()
        const leftState = component.container.querySelector('.ci-details__history')
        const rightState = component.container.querySelector('.ci-details__body')
        expect(leftState).toBeInTheDocument()
        expect(rightState).toBeInTheDocument()
    })
})
