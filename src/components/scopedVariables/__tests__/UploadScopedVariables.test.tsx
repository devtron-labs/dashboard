import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import UploadScopedVariables from '../UploadScopedVariables'
import { downloadData } from '../utils'
import { SCOPED_VARIABLES_TEMPLATE_DATA, DOWNLOAD_TEMPLATE_NAME, DOWNLOAD_FILES_AS } from '../constants'
import { importComponentFromFELibrary } from '../../common'

jest.mock('../utils', () => ({
    validator: jest.fn(),
    downloadData: jest.fn(),
}))

describe('UploadScopedVariables', () => {
    describe('UploadScopedVariables', () => {
        it('should download template when download template button is clicked', () => {
            const downloadTemplateData = importComponentFromFELibrary(
                'SCOPED_VARIABLES_TEMPLATE_DATA',
                SCOPED_VARIABLES_TEMPLATE_DATA,
                'function',
            )
            const { container } = render(
                <UploadScopedVariables
                    reloadScopedVariables={() => {}}
                    jsonSchema={{}}
                    setScopedVariables={() => {}}
                />,
            )
            fireEvent.click(container.querySelector('button')!)
            expect(downloadData).toHaveBeenCalledWith(downloadTemplateData, DOWNLOAD_TEMPLATE_NAME, DOWNLOAD_FILES_AS)
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
