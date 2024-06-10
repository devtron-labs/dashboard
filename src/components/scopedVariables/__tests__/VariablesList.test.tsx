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
import { render } from '@testing-library/react'
import VariablesList from '../VariablesList'
import { validVariablesList } from '../mocks'

describe('when VariablesList is mounted', () => {
    it('should display all the names and description', () => {
        const { container, getByText } = render(<VariablesList variablesList={validVariablesList} />)
        expect(container.querySelector('.dc__hover-n50')).toBeTruthy()
        validVariablesList.forEach((variable) => {
            expect(getByText(variable.name)).toBeTruthy()
            expect(getByText(variable.description)).toBeTruthy()
        })
    })
})
