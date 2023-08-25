import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import ScopedVariablesEditor from '../ScopedVariablesEditor'
import { validScopedVariablesData } from '../mocks'
import { postScopedVariables } from '../utils/helpers'
import { PARSE_ERROR_TOAST_MESSAGE, SAVE_ERROR_TOAST_MESSAGE, SAVE_SUCCESS_TOAST_MESSAGE } from '../constants'
import { toast } from 'react-toastify'

jest.mock('../utils/helpers', () => ({
    postScopedVariables: jest.fn(),
    parseYAMLStringToObj: jest.fn(() => ({ variables: [{ name: 'test', value: 'test' }] })),
    manipulateVariables: jest.fn(() => ({ variables: [{ name: 'test', value: 'test' }] })),
}))

jest.mock('../../CodeEditor/CodeEditor', () => jest.fn(() => null))

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}))

describe('ScopedVariablesEditor', () => {
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

    // TODO: marked as xit since waitFor is not working for this cra version
    xit('should show error toast when save button is clicked and yaml is not parsable', async () => {
        const { container } = render(
            <ScopedVariablesEditor
                variablesData={validScopedVariablesData.result.payload}
                name="test"
                abortRead={() => {}}
                reloadScopedVariables={() => {}}
                jsonSchema={JSON.parse(validScopedVariablesData.result.jsonSchema)}
            />,
        )
        const saveButton = container.querySelector('.uploaded-variables-editor-footer__save-button')
        expect(saveButton).toBeTruthy()
        fireEvent.click(saveButton as Element)
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(PARSE_ERROR_TOAST_MESSAGE)
        })
    })
})
