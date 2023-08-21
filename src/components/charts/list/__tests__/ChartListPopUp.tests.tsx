import React from 'react'
import ChartListPopUp from '../ChartListPopUp'
import { fireEvent, render } from '@testing-library/react'
import { chartLists } from '../__mocks__/ChartListPopUp.mock'
import { BrowserRouter } from 'react-router-dom'
import ChartListPopUpRow from '../ChartListPopUpRow'

describe('renders chart list properly', () => {
    it('renders the component', () => {
        render(
            <ChartListPopUp
                onClose={jest.fn()}
                chartList={chartLists}
                filteredChartList={chartLists}
                setFilteredChartList={jest.fn}
                isLoading={false}
                setShowSourcePopoUp={jest.fn}
            />,
        )
    })

    it('renders the list of charts', () => {
        const { getByText, container } = render(
            <ChartListPopUp
                onClose={jest.fn()}
                chartList={chartLists}
                filteredChartList={chartLists}
                setFilteredChartList={jest.fn}
                isLoading={false}
                setShowSourcePopoUp={jest.fn}
            />,
            {
                wrapper: BrowserRouter,
            },
        )
        expect(container).toBeInTheDocument()
        expect(getByText('ash-exp-test')).toBeInTheDocument()
        expect(getByText('shivani-exp-test')).toBeInTheDocument()
        expect(getByText('test')).toBeInTheDocument()
        expect(getByText('bitnamiOci')).toBeInTheDocument()
    })

    it('add chart source button trigger', () => {
        const { getByTestId } = render(
            <ChartListPopUp
                onClose={jest.fn()}
                chartList={chartLists}
                filteredChartList={chartLists}
                setFilteredChartList={jest.fn}
                isLoading={false}
                setShowSourcePopoUp={jest.fn}
            />,
            {
                wrapper: BrowserRouter,
            },
        )
        const toggleAddPopUp = getByTestId('add-chart-source')
        expect(toggleAddPopUp).toBeInTheDocument()
        fireEvent.click(toggleAddPopUp)
    })

    it('toggle disable button', () => {
        const { getByTestId } = render(
            <ChartListPopUpRow
                list={chartLists[0]}
                index={0}
            />,
            {
                wrapper: BrowserRouter,
            },
        )
        const toggleAddPopUp = getByTestId('toggle-button')
        expect(toggleAddPopUp).toBeInTheDocument()
        fireEvent.click(toggleAddPopUp)
    })

    it('toggle disable button', () => {
        const { getByTestId } = render(
            <ChartListPopUpRow
                list={chartLists[0]}
                index={0}
            />,
            {
                wrapper: BrowserRouter,
            },
        )
        const toggleAddPopUp = getByTestId('toggle-button')
        expect(toggleAddPopUp).toBeInTheDocument()
        fireEvent.click(toggleAddPopUp)
    })

 
})
