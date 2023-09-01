import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import SearchBar from '../DescriptorSearchBar'

describe('When SearchBar mounts', () => {
    it('should display valid input component', () => {
        const onSearch = jest.fn()
        const { container } = render(<SearchBar onSearch={onSearch} />)
        const input = container.querySelector('input')
        expect(input).toBeTruthy()
    })

    it('should call onSearch on enter', () => {
        const onSearch = jest.fn()
        const { container } = render(<SearchBar onSearch={onSearch} />)
        const input = container.querySelector('input')
        fireEvent.keyDown(input!, { key: 'Enter', code: 'Enter' })
        expect(onSearch).toHaveBeenCalled()
    })

    it('should show valid text in input', () => {
        const onSearch = jest.fn()
        const { container } = render(<SearchBar onSearch={onSearch} />)
        const input = container.querySelector('input')
        fireEvent.change(input!, { target: { value: 'test' } })
        expect(input!.value).toBe('test')
    })
})
