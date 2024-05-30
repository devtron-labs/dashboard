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

//@ts-nocheck
import React from 'react'
import ResourceTreeNodes, {
    GenericInfo,
    NestedTable,
    GenericRow,
    Name,
    NodeGroup,
    StatusFilterButton,
    AllPods,
} from '../../../ResourceTreeNodes'
import { BrowserRouter, Route, Router } from 'react-router-dom'
import { nodes, podMetadata } from '../__mocks__/appDetails.mock'
import { Nodes, AggregationKeys } from '../../../types'
import { createMemoryHistory } from 'history'
import '@testing-library/jest-dom'
import { render, fireEvent, screen } from '@testing-library/react'
import { aggregateNodes } from '@devtron-labs/devtron-fe-common-lib'

describe('generic info testsuite', () => {
    let div, aggregatedNodes

    beforeAll(() => {
        div = document.createElement('div')
        aggregatedNodes = aggregateNodes(nodes, podMetadata)
    })
    it('genericinfo renders without crashing', () => {
        const Data = new Map()
        Data.set(
            'colorful-pod-logs-amit-dev-698bcdb789',
            aggregatedNodes.nodes.ReplicaSet.get('colorful-pod-logs-amit-dev-698bcdb789'),
        )
        render(
            <GenericInfo
                nodes={aggregatedNodes}
                Data={Data}
                type={Nodes.ReplicaSet}
                describeNode={jest.fn}
                appId={1}
            />,
            { wrapper: BrowserRouter },
        )
    })

    it('nested table renders without crashing', () => {
        const Data = new Map()
        Data.set(
            'colorful-pod-logs-amit-dev-698bcdb789',
            aggregatedNodes.nodes.ReplicaSet.get('colorful-pod-logs-amit-dev-698bcdb789'),
        )
        render(
            <NestedTable
                nodes={aggregatedNodes}
                Data={Data}
                type={Nodes.ReplicaSet}
                level={1}
                describeNode={jest.fn}
                appId={1}
            />,
            { wrapper: BrowserRouter },
        )
    })

    it('nested table data row changes collpase state after click on collapsed', async () => {
        const Data = new Map()
        Data.set(
            'colorful-pod-logs-amit-dev-698bcdb789',
            aggregatedNodes.nodes.ReplicaSet.get('colorful-pod-logs-amit-dev-698bcdb789'),
        )
        const { getByTestId } = render(
            <NestedTable
                nodes={aggregatedNodes}
                Data={Data}
                type={Nodes.ReplicaSet}
                level={1}
                describeNode={jest.fn}
                appId={1}
                podLevelExternalLinks={[]}
                containerLevelExternalLinks={[]}
            />,
            {
                wrapper: BrowserRouter,
            },
        )
        fireEvent.click(getByTestId('collapse-icon'))
        expect(screen.getByText('colorful-pod-logs-amit-dev-698bcdb789-86ssw')).toBeInTheDocument() // check for pod
    })

    it('clicking on manifest opens manifest tab', async () => {
        let selectedNode = ''
        const table = document.createElement('table')
        const tBody = table.appendChild(document.createElement('tbody'))
        const tRow = tBody.appendChild(document.createElement('tr'))
        const { getByTestId, getAllByTestId } = render(
            <Name
                nodeDetails={aggregatedNodes.nodes.ReplicaSet.get('colorful-pod-logs-amit-dev-698bcdb789')}
                describeNode={(args) => {
                    selectedNode = args
                }}
            />,
            {
                container: document.body.appendChild(tRow),
                wrapper: BrowserRouter,
            },
        )
        fireEvent.mouseEnter(getByTestId('colorful-pod-logs-amit-dev-698bcdb789-hover-trigger'))
        fireEvent.click(getAllByTestId('colorful-pod-logs-amit-dev-698bcdb789-manifest')[0])
        expect(location.search).toEqual('?kind=ReplicaSet')
        expect(selectedNode).toEqual('colorful-pod-logs-amit-dev-698bcdb789')
    })

    it('clicking on workflows uncollpases', async () => {
        const { getByTestId } = render(
            <NodeGroup
                title={'Workloads' as AggregationKeys}
                data={aggregatedNodes.aggregation['Workloads' as AggregationKeys]}
                aggregatedNodes={aggregatedNodes}
            />,
            {
                wrapper: BrowserRouter,
            },
        )

        fireEvent.click(getByTestId('Workloads'))
        expect(screen.getByTestId('Pod-anchor')).toBeInTheDocument()
    })

    it('clicking on status filter sets correct kind in URL and clicking on All resets ', async () => {
        const { getByTestId } = render(
            <>
                <StatusFilterButton status="All" count={3} />
                <StatusFilterButton status="Running" count={3} />
            </>,
            {
                wrapper: BrowserRouter,
            },
        )

        fireEvent.click(getByTestId('Running-filter-button'))
        expect(location.search.includes('status=Running'))
        fireEvent.click(getByTestId('All-filter-button'))
        expect(!location.pathname.includes('status=Running'))
    })
})

describe('genericrow test', () => {
    let div, aggregatedNodes

    beforeAll(() => {
        div = document.createElement('div')
        aggregatedNodes = aggregateNodes(nodes, podMetadata)
    })

    it('Clicking on Events, Manifest and Logs causes correct URL change and correct callback to parent for set state', async () => {
        let nodeName, containerName
        const table = document.createElement('table')
        const tBody = table.appendChild(document.createElement('tbody'))

        const { getByTestId } = render(
            <GenericRow
                appName="testAppName"
                environmentName="testEnvironmentName"
                nodes={aggregatedNodes}
                nodeName="colorful-pod-logs-amit-dev-698bcdb789-86ssw"
                nodeDetails={aggregatedNodes.nodes.Pod.get('colorful-pod-logs-amit-dev-698bcdb789-86ssw')}
                describeNode={(node: string, container?: string) => {
                    nodeName = node
                    containerName = container
                }}
                level={1}
                podLevelExternalLinks={[]}
                containerLevelExternalLinks={[]}
            />,
            {
                container: document.body.appendChild(tBody),
                wrapper: BrowserRouter,
            },
        )

        fireEvent.mouseEnter(getByTestId('colorful-pod-logs-amit-dev-698bcdb789-86ssw-hover-trigger'))

        fireEvent.click(getByTestId('colorful-pod-logs-amit-dev-698bcdb789-86ssw-manifest'))
        expect(location.search.includes('kind=Pod'))
        expect(nodeName).toEqual('colorful-pod-logs-amit-dev-698bcdb789-86ssw')

        nodeName = ''
        fireEvent.click(getByTestId('colorful-pod-logs-amit-dev-698bcdb789-86ssw-events'))
        expect(nodeName).toEqual('colorful-pod-logs-amit-dev-698bcdb789-86ssw')

        nodeName = ''
        fireEvent.click(getByTestId('colorful-pod-logs-amit-dev-698bcdb789-86ssw-logs'))
        expect(nodeName).toEqual('colorful-pod-logs-amit-dev-698bcdb789-86ssw')

        nodeName = ''
        fireEvent.click(getByTestId('collapse-icon'))
        fireEvent.click(getByTestId('colorful-pod-logs-logs'))
        expect(nodeName).toEqual('colorful-pod-logs-amit-dev-698bcdb789-86ssw')
        expect(containerName).toEqual('colorful-pod-logs')
    })
})

function renderWithRouter(ui, { route = '/', history = createMemoryHistory({ initialEntries: [route] }) } = {}) {
    return {
        ...render(<Router history={history}>{ui}</Router>),
        history,
    }
}

describe('resource tree nodes', () => {
    let div, aggregatedNodes

    beforeAll(() => {
        div = document.createElement('div')
        aggregatedNodes = aggregateNodes(nodes, podMetadata)
    })

    it('automatically redirects to Pod when kind is not defined and pod is present', async () => {
        const { history } = renderWithRouter(
            <Route path="app/:appId/details/:envId/:kind?">
                <ResourceTreeNodes
                    appName="testAppName"
                    environmentName="testEnvironmentName"
                    nodes={aggregatedNodes}
                    describeNode={jest.fn}
                    isAppDeployment={true}
                    appId={1}
                    externalLinks={[]}
                    monitoringTools={[]}
                />
            </Route>,
            { route: '/', history: createMemoryHistory({ initialEntries: ['app/3/details/3'] }) },
        )
        expect(history.location.pathname).toContain('Pod')
    })
})

describe('all pods renders', () => {
    let div, aggregatedNodes

    beforeAll(() => {
        div = document.createElement('div')
        aggregatedNodes = aggregateNodes(nodes, podMetadata)
    })

    it('all pods renders without breaking', async () => {
        const { getByTestId } = render(
            <AllPods
                appName={''}
                nodes={aggregatedNodes}
                environmentName={''}
                isAppDeployment={true}
                pods={aggregatedNodes.nodes[Nodes.Pod]}
                describeNode={jest.fn}
                appId={1}
                podLevelExternalLinks={[]}
                containerLevelExternalLinks={[]}
            />,
            {
                wrapper: BrowserRouter,
            },
        )
        expect(getByTestId('new-pod-status-running')).toHaveTextContent('1 running')
    })

    it('No pods is rendered when pods not available', async () => {
        const { getByTestId } = render(
            <AllPods
                appName={''}
                nodes={aggregatedNodes}
                environmentName={''}
                isAppDeployment={true}
                pods={aggregatedNodes.nodes[Nodes.Pod]}
                describeNode={jest.fn}
                appId={1}
                podLevelExternalLinks={[]}
                containerLevelExternalLinks={[]}
            />,
            {
                wrapper: BrowserRouter,
            },
        )
        fireEvent.click(getByTestId('all-pods-old'))
        expect(getByTestId('no-pod')).toBeInTheDocument()
    })
})
