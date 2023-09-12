import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FloatingVariablesSuggestions from '../FloatingVariablesSuggestions'

// Mocking suggestions items since its already tested
jest.mock(
    '../Suggestions',
    () =>
        function Suggestions() {
            return <div data-testid="suggestions" />
        },
)

describe('When FloatingVariablesSuggestions mounts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should show collapsed state by default', () => {
        const { getByTestId } = render(
            <FloatingVariablesSuggestions
                zIndex={20}
                loading={false}
                variables={[{ variableName: 'name', shortDescription: 'desc' }]}
                reloadVariables={null}
                error={false}
            />,
        )
        expect(getByTestId('collapsed-state')).toBeTruthy()
    })

    it('should allow dragging collapsed state on drag of handle-drag', () => {
        // get handle-drag class and drag it and then check if the position of collapsed-state is changed
        const { getByTestId, container } = render(
            <FloatingVariablesSuggestions
                zIndex={20}
                loading={false}
                variables={[{ variableName: 'name', shortDescription: 'desc' }]}
                reloadVariables={null}
                error={false}
            />,
        )
        const initialPosition = getByTestId('collapsed-state').getBoundingClientRect()
        const dragButton = container.querySelector('.handle-drag')
        fireEvent.mouseDown(dragButton)
        fireEvent.mouseMove(dragButton, { clientX: 100, clientY: 100 })
        fireEvent.mouseUp(dragButton)
        const finalPosition = getByTestId('collapsed-state').getBoundingClientRect()
        expect(initialPosition).not.toBe(finalPosition)
    })

    it('should show expanded state on click of activate-suggestions', () => {
        const { getByTestId } = render(
            <FloatingVariablesSuggestions
                zIndex={20}
                loading={false}
                variables={[{ variableName: 'name', shortDescription: 'desc' }]}
                reloadVariables={null}
                error={false}
            />,
        )
        fireEvent.click(getByTestId('activate-suggestions'))
        expect(screen.queryByTestId('collapsed-state')).toBeFalsy()
    })
})
