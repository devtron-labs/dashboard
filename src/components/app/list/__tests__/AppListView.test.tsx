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

import AppListView from '../AppListView'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import React from 'react'
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: jest.fn(),
    }),
    useLocation: () => ({
        push: jest.fn(),
    }),
    useRouteMatch: () => ({
        push: jest.fn(),
    }),
}))

describe('AppListView tests', () => {
    test('testing for applist headers', () => {
        const { getByTestId, container } = render(
            <AppListView
                expandRow={jest.fn()}
                closeExpandedRow={jest.fn()}
                sort={jest.fn()}
                handleEditApp={jest.fn()}
                redirectToAppDetails={jest.fn()}
                clearAll={jest.fn()}
                changePage={jest.fn()}
                changePageSize={jest.fn()}
                openDevtronAppCreateModel={jest.fn()}
                updateDataSyncing={jest.fn()}
                toggleExpandAllRow={jest.fn()}
                isSuperAdmin={false}
                isArgoInstalled={true}
                appListCount={0}
                code={0}
                view={''}
                errors={[]}
                apps={[{ id: 0, name: '', defaultEnv: null, environments: [] }]}
                showCommandBar={false}
                size={0}
                offset={0}
                pageSize={0}
                isAllExpanded={true}
                isAllExpandable={true}
                sortRule={{ key: '', order: '' }}
                history={useHistory()}
                location={useLocation()}
                match={useRouteMatch()}
                expandedRow={{ 0: true }}
            />,
            { wrapper: BrowserRouter },
        )
        expect(container).toBeInTheDocument()
        expect(getByTestId('appname')).toHaveTextContent('App name')
        expect(getByTestId('appstatus')).toHaveTextContent('App status')
        expect(getByTestId('environment')).toHaveTextContent('Environment')
        expect(getByTestId('cluster')).toHaveTextContent('Cluster')
        expect(getByTestId('lastdeployedate')).toHaveTextContent('Last deployed at')
        expect(getByTestId('namespace')).toHaveTextContent('Namespace')
    })
    test('app-name,lastdeployedate button functionality', () => {
        const { getByTestId, container } = render(
            <AppListView
                expandRow={jest.fn()}
                closeExpandedRow={jest.fn()}
                sort={jest.fn()}
                handleEditApp={jest.fn()}
                redirectToAppDetails={jest.fn()}
                clearAll={jest.fn()}
                changePage={jest.fn()}
                changePageSize={jest.fn()}
                openDevtronAppCreateModel={jest.fn()}
                updateDataSyncing={jest.fn()}
                toggleExpandAllRow={jest.fn()}
                isSuperAdmin={false}
                isArgoInstalled={true}
                appListCount={0}
                code={0}
                view={''}
                errors={[]}
                apps={[{ id: 0, name: '', defaultEnv: null, environments: [] }]}
                showCommandBar={false}
                size={0}
                offset={0}
                pageSize={0}
                isAllExpanded={true}
                isAllExpandable={true}
                sortRule={{ key: '', order: '' }}
                history={useHistory()}
                location={useLocation()}
                match={useRouteMatch()}
                expandedRow={{ 0: true }}
            />,
            { wrapper: BrowserRouter },
        )
        expect(container).toBeInTheDocument()
        const generateTokenButton = container.querySelector('.dc__visible-hover--parent') as HTMLElement
        expect(generateTokenButton).toBeInTheDocument()
        fireEvent.click(generateTokenButton)
    })
})
