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
