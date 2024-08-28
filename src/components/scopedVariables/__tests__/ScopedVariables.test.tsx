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
import { render, screen } from '@testing-library/react'
import { useAsync } from '@devtron-labs/devtron-fe-common-lib'
import ScopedVariables from '../ScopedVariables'

jest.mock('@devtron-labs/devtron-fe-common-lib', () => ({
    useAsync: jest.fn(),
    ErrorScreenNotAuthorized: jest.fn(),
    Progressing: jest.fn(),
    Reload: jest.fn(),
}))

jest.mock('../../CodeEditor/CodeEditor', () => jest.fn(() => null))

describe('When ScopedVariables is mounted', () => {
    it('should show Not Authorized screen when user is not super admin', () => {
        ;(useAsync as jest.Mock).mockReturnValue([null, null, null, null])
        render(<ScopedVariables isSuperAdmin={false} />)
        expect(screen.getByText('Not authorized')).toBeTruthy()
    })

    it('should show Progressing page loader when scoped variables are loading', () => {
        ;(useAsync as jest.Mock).mockReturnValue([true, null, null, null])
        render(<ScopedVariables isSuperAdmin={true} />)
        expect(screen.getByTestId('progressing')).toBeTruthy()
    })

    it('should show Reload screen when scoped variables are not loaded', () => {
        ;(useAsync as jest.Mock).mockReturnValue([false, null, null, null])
        render(<ScopedVariables isSuperAdmin={true} />)
        expect(screen.getByTestId('reload')).toBeTruthy()
    })
})
