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
import { act, render } from '@testing-library/react'
import ClusterManifest from '../ClusterManifest'
import { ClusterManifestType } from '../types'
import { clusterManifestResponse } from '../__mocks__/ClusterManifest.mock'
import { BrowserRouter } from 'react-router-dom'
import * as data from '../clusterNodes.service'
import { EditModeType } from '../../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/constants'

describe('ClusterManifest', () => {
    const mockClusterManifest: ClusterManifestType = {
        terminalAccessId: 123,
        manifestMode: EditModeType.NON_EDIT,
        setManifestMode: jest.fn(),
        setManifestData: jest.fn(),
        errorMessage: [],
        setManifestAvailable: jest.fn(),
    }

    it('renders loading message while fetching manifest', async () => {
        const { getByText } = render(<ClusterManifest {...mockClusterManifest} />)
        expect(getByText('Fetching manifest')).toBeInTheDocument()
    })

    it('renders default manifest when in non-edit mode', async () => {
        let component
        jest.spyOn(data, 'getClusterManifest').mockImplementation(clusterManifestResponse)
        await act(async () => {
            component = render(<ClusterManifest {...mockClusterManifest} />, {
                wrapper: BrowserRouter,
            })
        })
        const manifestComponent = component.container.querySelector('.h-100.flexbox-col')
    })
})
