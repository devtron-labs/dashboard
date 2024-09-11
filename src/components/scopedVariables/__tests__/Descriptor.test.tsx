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
import { render, fireEvent } from '@testing-library/react'
import Descriptor from '../Descriptor'
import { HEADER_TEXT } from '../../../config'

describe('Descriptor', () => {
    it('should show the title', () => {
        const { getByText } = render(<Descriptor />)
        expect(getByText(HEADER_TEXT.SCOPED_VARIABLES.title)).toBeTruthy()
    })

    it('should show customized tippy showing the description', () => {
        const { container } = render(<Descriptor />)
        // only one button is present in the component since showUploadButton is false
        const button = container.querySelector('button')
        fireEvent.click(button!)
        expect(container.querySelector('.tippy-box')).toBeTruthy()
        expect(container.querySelector('.tippy-box .tippy-content')).toBeTruthy()
    })

    it('show show upload button when showUploadButton is true', () => {
        const { container } = render(<Descriptor showUploadButton={true} />)
        expect(container.querySelector('.descriptor-container__upload-button')).toBeTruthy()
    })

    it('should be able to upload a file', () => {
        const readFile = jest.fn()
        const { container } = render(<Descriptor showUploadButton={true} readFile={readFile} />)
        const uploadButton = container.querySelector('.descriptor-container__upload-button')
        fireEvent.click(uploadButton!)
        const input = container.querySelector('input')
        fireEvent.change(input!, { target: { files: [new File([''], 'filename.txt', { type: 'text/plain' })] } })
        expect(readFile).toHaveBeenCalled()
    })
})
