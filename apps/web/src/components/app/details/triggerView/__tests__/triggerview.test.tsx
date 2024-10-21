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
import TriggerView from '../TriggerView'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
describe('Trigger View', () => {
    it('Render Trigger View without crashing', () => {
        const { container } = render(<TriggerView />, {
            wrapper: BrowserRouter,
        })
        expect(container).toBeInTheDocument()
    })
    // it('Finish config message appearing without breaking when no workflow is configured',async () => {
    //     expect(screen.findByText('Go To App Configurations')).toBeInTheDocument
    // })
    // it('Select Image button for a cd must appear without breaking',async () => {
    //     expect(screen.findByText('Select Image')).toBeInTheDocument
    // })
})
