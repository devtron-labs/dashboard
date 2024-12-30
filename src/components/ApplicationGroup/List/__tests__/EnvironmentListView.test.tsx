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
import { act, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter, Route } from 'react-router-dom'
import EnvironmentsListView from '../EnvironmentListView'
import * as data from '../../AppGroup.service'
import { mockEmptyFetch, mockFetch } from '../__mocks__/EnvironmentList.mock'
import { renderWithRouter } from '../../Details/EnvironmentConfig/__test__/ApplicationRoutes.test'

describe('EnvironmentList', () => {
    it('EnvironmentList renders without crashing', () => {
        const { container } = render(<EnvironmentsListView isSuperAdmin={false} clearFilters={jest.fn()} />, {
            wrapper: BrowserRouter,
        })
        expect(container).toBeInTheDocument()

        const appGroupLoaderContainer = container.querySelector('.flex.dc__border-top-n1')
        expect(appGroupLoaderContainer).toBeInTheDocument()

        const appGroupListContainer = container.querySelector('.dc__overflow-scroll')
        expect(appGroupListContainer).not.toBeInTheDocument()
    })

    it('Environment render with list', async () => {
        let component
        jest.spyOn(data, 'getEnvAppList').mockImplementation(mockFetch)
        await act(async () => {
            component = render(<EnvironmentsListView isSuperAdmin={true} clearFilters={jest.fn()} />, {
                wrapper: BrowserRouter,
            })
        })

        expect(component.container).toBeInTheDocument()
        const appGroupListContainer = component.container.querySelector('.dc__overflow-scroll')
        expect(appGroupListContainer).toBeInTheDocument()
        expect(component.getAllByText('a')[0]).toBeInTheDocument()
        expect(component.getByText('shubham')).toBeInTheDocument()
    })

    it('EnvironmentList renders with empty state', async () => {
        let component
        jest.spyOn(data, 'getEnvAppList').mockImplementation(mockEmptyFetch)
        await act(async () => {
            component = render(<EnvironmentsListView isSuperAdmin={true} clearFilters={jest.fn()} />, {
                wrapper: BrowserRouter,
            })
        })

        expect(component.container).toBeInTheDocument()
        const emptyWrapper = component.container.querySelector('.flex.dc__border-top-n1')
        expect(emptyWrapper).toBeInTheDocument()
        const emptyComponent = emptyWrapper.querySelector('.flex.column.empty-state')
        expect(emptyComponent).toBeInTheDocument()
        expect(component.getByText('No matching env')).toBeInTheDocument()
    })

    it('EnvironmentList renders with empty state when ClusterId is available', async () => {
        let component
        jest.spyOn(data, 'getEnvAppList').mockImplementation(mockEmptyFetch)
        await act(async () => {
            component = renderWithRouter(
                <Route path="application-group/list">
                    <EnvironmentsListView isSuperAdmin={true} clearFilters={jest.fn()} />
                </Route>,
                { route: 'application-group/list?cluster=3&offset=0' },
            )
        })
        expect(component.container).toBeInTheDocument()
        const emptyWrapper = component.container.querySelector('.flex.dc__border-top-n1')
        expect(emptyWrapper).toBeInTheDocument()
        const emptyComponent = emptyWrapper.querySelector('.flex.column.empty-state')
        expect(emptyComponent).toBeInTheDocument()
        expect(component.getByText('No app groups found')).toBeInTheDocument()
    })
})
