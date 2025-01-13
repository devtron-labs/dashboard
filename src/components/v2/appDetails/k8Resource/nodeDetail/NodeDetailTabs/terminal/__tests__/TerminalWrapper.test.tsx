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

import React, { useRef } from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import TerminalWrapper from '../TerminalWrapper.component'
import { BrowserRouter } from 'react-router-dom'
import {
    mockUseHeightObserver,
    selectionListData,
    selectionListDataWithSecondStrip,
    selectionListDataWithTerminalWrapper,
    terminalContextWrapper,
} from '../__mocks__/terminalWrapper.mock'
import * as data from '../../../../../../../../components/common/helpers/Helpers'
import { SocketConnectionType } from '../../../../../../../ClusterNodes/constants'

describe('TerminalWrapper', () => {
    it('renders without crashing', () => {
        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)

        const { container } = render(
            terminalContextWrapper(
                <TerminalWrapper
                    selectionListData={selectionListData}
                    socketConnection={SocketConnectionType.CONNECTING}
                    setSocketConnection={jest.fn()}
                />,
            ),
        )

        expect(container).toBeInTheDocument()

        useHeightObserverMock.mockRestore()
    })

    it('renders one strip and terminal without terminal wrapper', () => {
        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)

        const { container } = render(
            terminalContextWrapper(
                <TerminalWrapper
                    selectionListData={selectionListData}
                    socketConnection={SocketConnectionType.CONNECTING}
                    setSocketConnection={jest.fn()}
                />,
            ),
        )

        expect(container).toBeInTheDocument()
        const firstStrip = container.querySelector('.flex.bg__primary.pl-20.dc__border-top.h-32')
        expect(firstStrip).toBeInTheDocument()
        const secondStrip = container.querySelector('.flex.left.bg__primary.pl-20.dc__border-top.h-28')
        expect(secondStrip).not.toBeInTheDocument()
        const terminal = container.querySelector('.terminal-wrapper')
        expect(terminal).toBeInTheDocument()

        useHeightObserverMock.mockRestore()
    })

    it('renders both strip and terminal without terminal wrapper', () => {
        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)

        const { container } = render(
            terminalContextWrapper(
                <TerminalWrapper
                    selectionListData={selectionListDataWithSecondStrip}
                    socketConnection={SocketConnectionType.CONNECTING}
                    setSocketConnection={jest.fn()}
                />,
            ),
        )

        expect(container).toBeInTheDocument()
        const firstStrip = container.querySelector('.flex.bg__primary.pl-20.dc__border-top.h-32')
        expect(firstStrip).toBeInTheDocument()
        const secondStrip = container.querySelector('.flex.left.bg__primary.pl-20.dc__border-top.h-28')
        expect(secondStrip).toBeInTheDocument()
        const terminal = container.querySelector('.terminal-wrapper')
        expect(terminal).toBeInTheDocument()

        useHeightObserverMock.mockRestore()
    })

    it('renders both strip and terminal with terminal wrapper', () => {
        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)

        const { container } = render(
            terminalContextWrapper(
                <TerminalWrapper
                    selectionListData={selectionListDataWithTerminalWrapper}
                    socketConnection={SocketConnectionType.CONNECTING}
                    setSocketConnection={jest.fn()}
                />,
            ),
        )

        expect(container).toBeInTheDocument()
        const firstStrip = container.querySelector('.flex.bg__primary.pl-20.dc__border-top.h-32')
        expect(firstStrip).toBeInTheDocument()
        const secondStrip = container.querySelector('.flex.left.bg__primary.pl-20.dc__border-top.h-28')
        expect(secondStrip).toBeInTheDocument()
        const terminalWrapper = container.querySelector('.cluster-terminal__wrapper')
        expect(terminalWrapper).toBeInTheDocument()
        const terminal = container.querySelector('.terminal-wrapper')
        expect(terminal).toBeInTheDocument()

        useHeightObserverMock.mockRestore()
    })
})
