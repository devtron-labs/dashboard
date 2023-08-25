import React from 'react'
import { render, screen } from '@testing-library/react'
import ScopedVariables from '../'
import { useAsync } from '../../common'
import { validScopedVariablesData, noScopedVariablesData } from '../mocks'

// TODO: Add Snapshot testing when the component is finalized

jest.mock('../../common', () => ({
    useAsync: jest.fn(),
}))

jest.mock('../../CodeEditor/CodeEditor', () => jest.fn(() => null))

describe('When ScopedVariables is mounted', () => {
    it('should show Not Authorized screen when user is not super admin', () => {
        (useAsync as jest.Mock).mockReturnValue([null, null, null, null])
        render(<ScopedVariables isSuperAdmin={false} />)
        expect(screen.getByText('Not authorized')).toBeTruthy()
    })

    it('should show Progressing page loader when scoped variables are loading', () => {
        (useAsync as jest.Mock).mockReturnValue([true, null, null, null])
        render(<ScopedVariables isSuperAdmin={true} />)
        expect(screen.getByTestId('progressing')).toBeTruthy()
    })

    it('should show Reload screen when scoped variables are not loaded', () => {
        (useAsync as jest.Mock).mockReturnValue([false, null, null, null])
        render(<ScopedVariables isSuperAdmin={true} />)
        expect(screen.getByTestId('reload')).toBeTruthy()
    })

    it('should show UploadScopedVariables when scoped variables are not present', () => {
        (useAsync as jest.Mock).mockReturnValue([false, noScopedVariablesData, null, null])
        const { container } = render(<ScopedVariables isSuperAdmin={true} />)
        expect(container.querySelector('.upload-scoped-variables-card')).toBeTruthy()
    })

    it('should show SavedVariablesView when scoped variables are present', () => {
        (useAsync as jest.Mock).mockReturnValue([false, validScopedVariablesData, null, null])
        const { container } = render(<ScopedVariables isSuperAdmin={true} />)
        expect(container.querySelector('.saved-variables-card')).toBeFalsy()
        expect(container.querySelector('.saved-variables-editor-background')).toBeTruthy()
    })
})
