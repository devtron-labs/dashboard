import React from 'react'
import { fireEvent, render, act } from '@testing-library/react'
import ScopedVariablesEditor from '../ScopedVariablesEditor'
import { validScopedVariablesData } from '../mocks'
import { PARSE_ERROR_TOAST_MESSAGE, SAVE_ERROR_TOAST_MESSAGE } from '../constants'
import { toast } from 'react-toastify'

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
        const { container } = render(
            <ScopedVariablesEditor
                variablesData={validScopedVariablesData.result.payload}
                name="test"
                abortRead={() => {}}
                reloadScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                setShowEditView={setShowEditView}
            />,
        )
        const closeButton = container.querySelector('.uploaded-variables-editor-infobar__abort-read-btn')
        expect(closeButton).toBeTruthy()
        expect(setShowEditView).not.toHaveBeenCalled()
        fireEvent.click(closeButton as Element)
        expect(setShowEditView).toHaveBeenCalled()
    })

    it('should abort read when close button is clicked if setShowEditView is not present', () => {
        const abortRead = jest.fn()
        const { container } = render(
            <ScopedVariablesEditor
                variablesData={validScopedVariablesData.result.payload}
                name="test"
                abortRead={abortRead}
                reloadScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
            />,
        )
        const closeButton = container.querySelector('.uploaded-variables-editor-infobar__abort-read-btn')
        expect(closeButton).toBeTruthy()
        expect(abortRead).not.toHaveBeenCalled()
        fireEvent.click(closeButton as Element)
        expect(abortRead).toHaveBeenCalled()
    })

    it('should show error toast when save button is clicked and yaml is not parsable', () => {
        const { container } = render(
            <ScopedVariablesEditor
                variablesData={''}
                name="test"
                abortRead={() => {}}
                reloadScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
            />,
        )
        const saveButton = container.querySelector('.uploaded-variables-editor-footer__save-button')
        expect(saveButton).toBeTruthy()
        fireEvent.click(saveButton as Element)
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
            const { container } = render(
                <ScopedVariablesEditor
                    variablesData={JSON.stringify(validScopedVariablesData.result.payload)}
                    name="test"
                    abortRead={() => {}}
                    reloadScopedVariables={() => {}}
                    jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
                />,
            )
            const saveButton = container.querySelector('.uploaded-variables-editor-footer__save-button')
            expect(saveButton).toBeTruthy()
            fireEvent.click(saveButton as Element)
            await Promise.resolve()
        })
        expect(toast.error).toHaveBeenCalledWith(SAVE_ERROR_TOAST_MESSAGE)
    })
})
