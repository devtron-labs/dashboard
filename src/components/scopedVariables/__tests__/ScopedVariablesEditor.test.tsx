import React from 'react'
import { fireEvent, render, act } from '@testing-library/react'
import { toast } from 'react-toastify'
import ScopedVariablesEditor from '../ScopedVariablesEditor'
import { validScopedVariablesData } from '../mocks'
import { GET_SCOPED_VARIABLES_ERROR, PARSE_ERROR_TOAST_MESSAGE } from '../constants'
import { parseIntoYAMLString } from '../utils'

jest.mock('../../CodeEditor/CodeEditor', () => jest.fn(() => null))

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}))

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
        expect(toast.error).toHaveBeenCalledWith(PARSE_ERROR_TOAST_MESSAGE)
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
        expect(toast.error).toHaveBeenCalledWith(GET_SCOPED_VARIABLES_ERROR)
    })
})
