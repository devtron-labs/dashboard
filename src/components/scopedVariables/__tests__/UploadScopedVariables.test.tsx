import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import UploadScopedVariables, { LoadScopedVariables } from '../UploadScopedVariables'
import { downloadData } from '../utils/helpers'
import { SCOPED_VARIABLES_TEMPLATE_DATA, DOWNLOAD_TEMPLATE_NAME, DOWNLOAD_FILES_AS } from '../constants'

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
            const { container } = render(
                <UploadScopedVariables
                    reloadScopedVariables={() => {}}
                    jsonSchema={{}}
                    setScopedVariables={() => {}}
                />,
            )
            fireEvent.click(container.querySelector('button')!)
            expect(downloadData).toHaveBeenCalledWith(
                SCOPED_VARIABLES_TEMPLATE_DATA,
                DOWNLOAD_TEMPLATE_NAME,
                DOWNLOAD_FILES_AS,
            )
        })

        it('should read file when file is uploaded', () => {
            const reloadScopedVariables = jest.fn()
            const { container } = render(
                <UploadScopedVariables
                    reloadScopedVariables={reloadScopedVariables}
                    jsonSchema={{}}
                    setScopedVariables={() => {}}
                />,
            )
            fireEvent.change(container.querySelector('input')!, {
                target: {
                    files: [
                        {
                            name: 'test.yaml',
                            type: 'application/x-yaml',
                        },
                    ],
                },
            })
            expect(container.querySelector('.dc__ellipsis-right')!.textContent).toBe('test.yaml')
        })
    })
})
