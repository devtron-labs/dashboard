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
import { act, render } from '@testing-library/react'
import { BrowserRouter, Route, Router } from 'react-router-dom'
import EnvConfig from '../EnvConfig'
import * as configData from '../../../AppGroup.service'
import { createMemoryHistory } from 'history'
import { filteredData, mockConfigAppList } from '../__mock__/EnvConfig.mock'
import { AppContext } from '../../../../common/Contexts/AppContext'

function renderWithRouter(ui, { route = '/', history = createMemoryHistory({ initialEntries: [route] }) } = {}) {
    return {
        ...render(<Router history={history}>{ui}</Router>),
        history,
    }
}

describe('EnvConfig', () => {
    it('ApplicationRoutes render without error', () => {
        const { container } = render(<EnvConfig filteredApps={[]} />, {
            wrapper: BrowserRouter,
        })
        expect(container).toBeInTheDocument()
        const loadState = container.querySelector('.loading-state')
        expect(loadState).toBeInTheDocument()
    })

    it('Application render with data', async () => {
        let component,
            environmentId = 0
        const setEnvironmentId = jest.fn
        jest.spyOn(configData, 'getConfigAppList').mockImplementation(mockConfigAppList)
        await act(async () => {
            component = renderWithRouter(
                <AppContext.Provider value={{ environmentId, setEnvironmentId }}>
                    <Route path="application-group/:envId/edit/:appId">
                        <EnvConfig filteredApps={filteredData} />
                    </Route>
                </AppContext.Provider>,
                { route: 'application-group/4/edit/19' },
            )
        })
        expect(component.container).toBeInTheDocument()
        expect(component.container.querySelector('.env-compose')).toBeInTheDocument()
        expect(component.getByText('testing-app')).toBeInTheDocument()
        expect(component.container.querySelector('.env-compose__main')).toBeInTheDocument()
    })
})
