import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Descriptor from '../Descriptor'
import { DEFAULT_TITLE } from '../constants'

describe('Descriptor', () => {
    it('should show the title', () => {
        const { getByText } = render(<Descriptor />)
        expect(getByText(DEFAULT_TITLE)).toBeTruthy()
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
