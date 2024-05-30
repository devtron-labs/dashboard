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
import { render, screen } from '@testing-library/react'
import SuggestionItem from '../SuggestionItem'
import { NO_DEFINED_DESCRIPTION } from '../constants'

// mocking ClipboardButton since its already tested
jest.mock('@devtron-labs/devtron-fe-common-lib', () => ({
    ClipboardButton: function ClipboardButton(triggerCopy) {
        if (triggerCopy) return <div>Copied</div>
        return <div>ClipboardButton</div>
    },
}))

describe('When SuggestionsItem mounts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should show description', () => {
        render(
            <SuggestionItem
                variableName="variableName"
                description="description"
                variableValue="variableValue"
                highlightText=""
                isRedacted
            />,
        )
        expect(screen.getByText('description')).toBeTruthy()
    })

    it('should highlight description if highlightText is present', () => {
        render(
            <SuggestionItem
                variableName="variableName"
                description="description"
                variableValue="variableValue"
                highlightText="desc"
                isRedacted
            />,
        )
        // since desc would be in span and differentiated we only need to check if desc is present
        expect(screen.getByText('desc')).toBeTruthy()
        expect(screen.getByText('desc').tagName).toBe('SPAN')
    })

    it('should show copied on click of suggestion item', () => {
        const { getByTestId } = render(
            <SuggestionItem
                variableName="variableName"
                description="description"
                variableValue="variableValue"
                highlightText="HighlightText"
                isRedacted
            />,
        )
        getByTestId('suggestion-item').click()
        expect(screen.getByText('Copied')).toBeTruthy()
    })

    it('should show NO_DEFINED_DESCRIPTION if description is not present', () => {
        render(
            <SuggestionItem
                variableName="variableName"
                description={NO_DEFINED_DESCRIPTION}
                variableValue="variableValue"
                highlightText="HighlightText"
                isRedacted
            />,
        )
        expect(screen.getByText(NO_DEFINED_DESCRIPTION)).toBeTruthy()
    })
})
