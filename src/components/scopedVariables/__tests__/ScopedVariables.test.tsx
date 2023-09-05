import React from 'react'
import { render, screen } from '@testing-library/react'
import ScopedVariables from '../ScopedVariables'
import { useAsync } from '../../common'

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
})
