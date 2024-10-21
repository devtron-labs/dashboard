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
import { render, screen, fireEvent } from '@testing-library/react'
import { useAsync } from '@devtron-labs/devtron-fe-common-lib'
import FloatingVariablesSuggestions from '../FloatingVariablesSuggestions'

// Mocking suggestions items since its already tested
jest.mock(
    '../Suggestions',
    () =>
        function Suggestions() {
            return <div data-testid="suggestions" />
        },
)

jest.mock('@devtron-labs/devtron-fe-common-lib', () => ({
    useAsync: jest.fn(),
}))

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }))

describe('When FloatingVariablesSuggestions mounts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should show collapsed state by default', () => {
        ;(useAsync as jest.Mock).mockReturnValue([true, null, null, null])
        const { getByTestId } = render(<FloatingVariablesSuggestions zIndex={20} appId="1" />)
        expect(getByTestId('collapsed-state')).toBeTruthy()
    })

    it('should allow dragging collapsed state on drag of handle-drag', () => {
        ;(useAsync as jest.Mock).mockReturnValue([true, null, null, null])
        const { getByTestId, container } = render(<FloatingVariablesSuggestions zIndex={20} appId="1" />)
        const initialPosition = getByTestId('collapsed-state').getBoundingClientRect()
        const dragButton = container.querySelector('.handle-drag')
        fireEvent.mouseDown(dragButton)
        fireEvent.mouseMove(dragButton, { clientX: 100, clientY: 100 })
        fireEvent.mouseUp(dragButton)
        const finalPosition = getByTestId('collapsed-state').getBoundingClientRect()
        expect(initialPosition).not.toBe(finalPosition)
    })

    it('should show expanded state on click of activate-suggestions', () => {
        ;(useAsync as jest.Mock).mockReturnValue([true, null, null, null])
        const { getByTestId } = render(<FloatingVariablesSuggestions zIndex={20} appId="1" />)
        fireEvent.click(getByTestId('activate-suggestions'))
        expect(screen.queryByTestId('collapsed-state')).toBeFalsy()
    })
})
