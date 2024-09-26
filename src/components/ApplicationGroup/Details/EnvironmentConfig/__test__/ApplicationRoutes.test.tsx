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
import { render } from '@testing-library/react'
import { BrowserRouter, Router } from 'react-router-dom'
import ApplicationRoutes from '../ApplicationRoutes'
import { createMemoryHistory } from 'history'

export function renderWithRouter(
    ui: any,
    { route = '/', history = createMemoryHistory({ initialEntries: [route] }) }: { route: string; history?: any },
) {
    return {
        ...render(<Router history={history}>{ui}</Router>),
        history,
    }
}

describe('ApplicationRoutes', () => {
    it('ApplicationRoutes render without error', () => {
        const { container } = render(<ApplicationRoutes envListData={{ id: 129, name: 'ajay-test-10feb' }} />, {
            wrapper: BrowserRouter,
        })
        expect(container).toBeInTheDocument()
    })

    it('ApplicationRoutes render all the contents', () => {
        const { container } = renderWithRouter(
            <ApplicationRoutes envListData={{ id: 129, name: 'ajay-test-10feb' }} />,
            { route: 'application-group/28/edit/129/deployment-template' },
        )
        expect(container).toBeInTheDocument()
        const routeWrapper = container.querySelector('.env-compose__nav-item.cursor')
        expect(routeWrapper).toBeInTheDocument()
    })
})
