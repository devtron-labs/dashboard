import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import Suggestions from '../Suggestions'
import { mockVariable } from '../mocks'

// Mocking suggestions items since its already tested
jest.mock(
    '../SuggestionItem',
    () =>
        function SuggestionItem() {
            return <div data-testid="suggestion-item" />
        },
)

// mocking SuggestionsInfo since its already tested
jest.mock(
    '../SuggestionsInfo',
    () =>
        function SuggestionsInfo() {
            return <div data-testid="suggestions-info" />
        },
)

describe('When Suggestions mounts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should show all the variables', () => {
        const { getByTestId } = render(
            <Suggestions
                handleDeActivation={null}
                loading={false}
                variables={mockVariable}
                reloadVariables={null}
                error={false}
            />,
        )
        expect(getByTestId('suggestion-item')).toBeTruthy()
    })

    it('should call handleDeActivation on click of deactivate-suggestions', () => {
        const handleDeActivation = jest.fn()
        const { getByTestId } = render(
            <Suggestions
                handleDeActivation={handleDeActivation}
                loading={false}
                variables={mockVariable}
                reloadVariables={null}
                error={false}
            />,
        )
        getByTestId('deactivate-suggestions').click()
        expect(handleDeActivation).toBeCalled()
    })

    it('should show loader if loading is true', () => {
        const { getByTestId } = render(
            <Suggestions
                handleDeActivation={null}
                loading
                variables={mockVariable}
                reloadVariables={null}
                error={false}
            />,
        )

        expect(getByTestId('progressing')).toBeTruthy()
    })

    it('should show No variables found if there are no variables', () => {
        render(
            <Suggestions
                handleDeActivation={null}
                loading={false}
                variables={[]}
                reloadVariables={null}
                error={false}
            />,
        )
        expect(screen.getByText('No variables found')).toBeTruthy()
    })

    it('should show no matching variable found if there are no matching variables', async () => {
        render(
            <Suggestions
                handleDeActivation={null}
                loading={false}
                variables={mockVariable}
                reloadVariables={null}
                error={false}
            />,
        )
        fireEvent.change(screen.getByTestId('debounced-search'), { target: { value: 'test' } })
        await act(async () => {
            await new Promise((res) => setTimeout(res, 500))
        })
        expect(screen.getByText('No matching variable found')).toBeTruthy()
    })
})
