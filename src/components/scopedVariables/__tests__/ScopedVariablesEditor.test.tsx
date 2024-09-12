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
import { fireEvent, render, act } from '@testing-library/react'
import ScopedVariablesEditor from '../ScopedVariablesEditor'
import { validScopedVariablesData } from '../mocks'
import { GET_SCOPED_VARIABLES_ERROR, UPLOAD_FAILED_STANDARD_MESSAGE } from '../constants'
import { parseIntoYAMLString } from '../utils'

jest.mock('../../CodeEditor/CodeEditor', () => jest.fn(() => null))

describe('ScopedVariablesEditor', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should redirect back to SavedVariablesView when close button is clicked if setShowEditView is present', () => {
        const setShowEditView = jest.fn()
        const { getByTestId } = render(
            <ScopedVariablesEditor
                variablesData={parseIntoYAMLString(validScopedVariablesData.result.manifest)}
                setScopedVariables={() => {}}
                name="test"
                abortRead={() => {}}
                reloadScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                setShowEditView={setShowEditView}
            />,
        )
        const closeButton = getByTestId('close-btn')
        expect(closeButton).toBeTruthy()
        expect(setShowEditView).not.toHaveBeenCalled()
        fireEvent.click(closeButton as Element)
        expect(setShowEditView).toHaveBeenCalled()
    })

    it('should abort read when close button is clicked if setShowEditView is not present', () => {
        const abortRead = jest.fn()
        const { getByTestId } = render(
            <ScopedVariablesEditor
                variablesData={parseIntoYAMLString(validScopedVariablesData.result.manifest)}
                setScopedVariables={() => {}}
                name="test"
                abortRead={abortRead}
                reloadScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
            />,
        )
        const closeButton = getByTestId('close-btn')
        expect(closeButton).toBeTruthy()
        expect(abortRead).not.toHaveBeenCalled()
        fireEvent.click(closeButton as Element)
        expect(abortRead).toHaveBeenCalled()
    })

    it('should show error toast when review button is clicked and yaml is not parsable', () => {
        const { getByText } = render(
            <ScopedVariablesEditor
                variablesData={''}
                setScopedVariables={() => {}}
                name="test"
                abortRead={() => {}}
                reloadScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
            />,
        )
        const reviewButton = getByText('Review Changes')
        expect(reviewButton).toBeTruthy()
        fireEvent.click(reviewButton as Element)
    })

    it('should show error toast when save button is clicked and save fails', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(
            () =>
                Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            result: {
                                code: 500,
                                status: 'Internal Server Error',
                            },
                        }),
                }) as Promise<Response>,
        )

        await act(async () => {
            const { getByText } = render(
                <ScopedVariablesEditor
                    variablesData={parseIntoYAMLString(validScopedVariablesData.result.manifest)}
                    setScopedVariables={() => {}}
                    name="test"
                    abortRead={() => {}}
                    reloadScopedVariables={() => {}}
                    jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                />,
            )
            const reviewButton = getByText('Review Changes')
            expect(reviewButton).toBeTruthy()
            fireEvent.click(reviewButton as Element)
            await Promise.resolve()
        })
    })
})
