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
