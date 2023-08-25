import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import UploadScopedVariables, { LoadScopedVariables } from '../UploadScopedVariables'
import { useFileReader } from '../utils/hooks'
import { validator, downloadData } from '../utils/helpers'
import { ReadFileAs } from '../types'
import { VARIABLES_TEMPLATE, DOWNLOAD_TEMPLATE_NAME } from '../constants'

jest.mock('../utils/helpers', () => ({
    validator: jest.fn(),
    downloadData: jest.fn(),
}))

describe('UploadScopedVariables', () => {
    describe('LoadScopedVariables', () => {
        it('should show Upload Failed when status is false', () => {
            const { container } = render(
                <LoadScopedVariables
                    status={{
                        status: false,
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

    describe('UploadScopedVariables', () => {
        it('should download template when download template button is clicked', () => {
            const { container } = render(<UploadScopedVariables reloadScopedVariables={() => {}} jsonSchema={{}} />)
            fireEvent.click(container.querySelector('.default-download-template-typography')!)
            expect(downloadData).toHaveBeenCalledWith(VARIABLES_TEMPLATE, DOWNLOAD_TEMPLATE_NAME, 'application/x-yaml')
        })

        it('should read file when file is uploaded', () => {
            const reloadScopedVariables = jest.fn()
            const { container } = render(
                <UploadScopedVariables reloadScopedVariables={reloadScopedVariables} jsonSchema={{}} />,
            )
            fireEvent.change(container.querySelector('input')!, {
                target: {
                    files: [
                        {
                            name: 'test',
                            type: 'application/x-yaml',
                        },
                    ],
                },
            })
            expect(container.querySelector('.load-scoped-variables-container')).toBeTruthy()
        })
    })
})
