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
import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import SuggestionsInfo from '../SuggestionsInfo'

const history = createMemoryHistory()

describe('When SuggestionsInfo mounts', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        history.push('/')
    })

    it('should have a button', () => {
        render(
            <Router history={history}>
                <SuggestionsInfo />
            </Router>,
        )
        expect(screen.getByRole('button')).toBeTruthy()
    })

    it('should expand content when button is clicked', () => {
        render(
            <Router history={history}>
                <SuggestionsInfo />
            </Router>,
        )
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText('@{{variablename}}')).toBeTruthy()
    })

    it('should collapse content when button is clicked twice', () => {
        render(
            <Router history={history}>
                <SuggestionsInfo />
            </Router>,
        )
        fireEvent.click(screen.getByRole('button'))
        expect(screen.queryByText('@{{variablename}}')).toBeTruthy()
        fireEvent.click(screen.getByRole('button'))
        expect(screen.queryByText('@{{variablename}}')).toBeFalsy()
    })
})
