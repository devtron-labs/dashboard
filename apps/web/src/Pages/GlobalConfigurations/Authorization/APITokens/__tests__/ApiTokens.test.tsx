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
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import APITokenList from '../APITokenList'
import { BrowserRouter } from 'react-router-dom'
import { tokenList } from '../__mocks__/ApiTokens.mock'

describe('APITokenList', () => {
    it('renders the component', () => {
        render(<APITokenList tokenList={[]} renderSearchToken={jest.fn()} reload={jest.fn()} />)
    })

    it('renders the list of tokens', () => {
        const { getByText, container } = render(
            <APITokenList tokenList={tokenList} renderSearchToken={jest.fn()} reload={jest.fn()} />,
            {
                wrapper: BrowserRouter,
            },
        )
        expect(container).toBeInTheDocument()
        expect(getByText('Token 1')).toBeInTheDocument()
        expect(getByText('127.0.0.1')).toBeInTheDocument()
        expect(getByText('190.160.0.0')).toBeInTheDocument()
        expect(getByText('Token 2')).toBeInTheDocument()
    })

    it('create token button trigger', () => {
        const reload = jest.fn()
        const { getByTestId } = render(
            <APITokenList tokenList={tokenList} renderSearchToken={jest.fn()} reload={reload} />,
            {
                wrapper: BrowserRouter,
            },
        )
        const generateTokenButton = getByTestId('api-token-generate-button') as HTMLElement
        expect(generateTokenButton).toBeInTheDocument()
        fireEvent.click(generateTokenButton)
    })
})
