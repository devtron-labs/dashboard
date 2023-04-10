import React from 'react'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { BrowserRouter, Router } from 'react-router-dom'
import ApplicationRoutes from '../ApplicationRoutes'
import { createMemoryHistory } from 'history'

export function renderWithRouter(ui: any, { route = '/', history = createMemoryHistory({ initialEntries: [route] }) }: {route: string, history?: any }) {
    return {
        ...render(<Router history={history}>{ui}</Router>),
        history,
    }
}

describe('ApplicationRoutes',() => {
    it('ApplicationRoutes render without error', () => {
        const { container } = render(<ApplicationRoutes envListData={{id: 129, name: 'ajay-test-10feb'}} />, {
            wrapper: BrowserRouter,
        })
        expect(container).toBeInTheDocument()
    })

    it('ApplicationRoutes render all the contents', () => {
        const { container } = renderWithRouter(<ApplicationRoutes envListData={{id: 129, name: 'ajay-test-10feb'}} />, { route: 'application-group/28/edit/129/deployment-template' },)
        expect(container).toBeInTheDocument()
        const routeWrapper = container.querySelector('.env-compose__nav-item.cursor')
        expect(routeWrapper).toBeInTheDocument()
    })
})

