import React from 'react'
import '@testing-library/jest-dom'
import EnvironmentOverview from '../EnvironmentOverview'
import { act, render } from '@testing-library/react'
import { Route, Router } from 'react-router-dom'
import * as data from '../../../AppGroup.service'
import { createMemoryHistory } from 'history'
import { appListResult, filteredData, mockStatusFetch } from '../__mock__/EnvironmentOverview.mock'

function renderWithRouter(ui, { route = '/', history = createMemoryHistory({ initialEntries: [route] }) } = {}) {
    return {
        ...render(<Router history={history}>{ui}</Router>),
        history,
    }
}

describe('EnvironmentOverview', () => {
    it('EnvironmentOverview render without error', () => {
        const { container } = renderWithRouter(
            <Route path="application-group/:envId/overview">
                <EnvironmentOverview filteredApps={[]} />
            </Route>,
            { route: 'application-group/28/overview' },
        )
        expect(container).toBeInTheDocument()
        const loaderState = container.querySelector('.loading-state')
        expect(loaderState).toBeInTheDocument()
    })

    it('EnvironmentOverview render with data', async () => {
        let component
        jest.spyOn(data, 'getDeploymentStatus').mockImplementation(mockStatusFetch)
        await act(async () => {
            component = renderWithRouter(
                <Route path="application-group/:envId/overview">
                    <EnvironmentOverview filteredApps={filteredData} appGroupListData={appListResult} />
                </Route>,
                { route: 'application-group/4/overview' },
            )
        })
        //left side component
        expect(component.container).toBeInTheDocument()
        const leftInfoComponent = component.container.querySelector('.pt-16.pb-16.pl-20.pr-20.dc__border-right')
        expect(leftInfoComponent).toBeInTheDocument()
        const infoLeftRowComponent = leftInfoComponent.querySelector('.fs-13.fw-4.lh-20.cn-9')
        expect(infoLeftRowComponent).toBeInTheDocument()
        expect(component.getByText('prakash-1mar')).toBeInTheDocument()
        expect(component.getByText('devtron-ns')).toBeInTheDocument()
        expect(component.getByText('default_cluster')).toBeInTheDocument()
        //right side component
        const rightInfoComponent = component.container.querySelector('.dc__overflow-scroll')
        expect(rightInfoComponent).toBeInTheDocument()
        const infoRightRowComponent = rightInfoComponent.querySelector('.app-deployments-info-body')
        expect(infoRightRowComponent).toBeInTheDocument()
        expect(component.getAllByText('Succeeded')[0]).toBeInTheDocument()
        expect(component.getAllByText('Healthy')[0]).toBeInTheDocument()
    })
})
