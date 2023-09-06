import React from 'react'
import { render } from '@testing-library/react'
import ScopedVariablesLoader from '../ScopedVariablesLoader'
import { FileReaderStatus } from '../../common/hooks/types'

jest.mock('../../common', () => ({
    importComponentFromFELibrary: jest.fn(),
}))

jest.mock('../utils', () => ({
    validator: jest.fn(),
    downloadData: jest.fn(),
}))

describe('LoadScopedVariables', () => {
    it('should show Upload Failed when status is false', () => {
        const { container } = render(
            <ScopedVariablesLoader
                status={{
                    status: FileReaderStatus.FAILED,
                    message: {
                        data: 'test',
                        description: 'test',
                    },
                }}
                progress={0}
                fileData={{
                    data: 'test',
                    type: 'test',
                    name: 'test',
                }}
                abortRead={() => {}}
            />,
        )
        expect(container.querySelector('.styled-progress-bar-error')).toBeTruthy()
    })
})
