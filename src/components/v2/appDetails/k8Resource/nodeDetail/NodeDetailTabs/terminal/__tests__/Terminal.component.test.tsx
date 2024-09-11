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
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as data from '../../../../../../../../components/common/helpers/Helpers'
import { mockUseHeightObserver, renderStrip, terminalContextWrapper } from '../__mocks__/terminalWrapper.mock'
import { WebSocket, Server } from 'mock-socket'
import { BrowserRouter } from 'react-router-dom'
import TerminalView from '../Terminal'
import { SocketConnectionType } from '../../../../../../../ClusterNodes/constants'
import '@testing-library/jest-dom/extend-expect'

describe('TerminalView', () => {
    let mockServer
    let mockSocket

    beforeAll(() => {
        mockServer = new Server('ws://localhost:8080')
        mockSocket = new WebSocket('ws://localhost:8080')
    })

    afterAll(() => {
        mockServer.stop()
        mockSocket.close()
    })

    it('renders without crashing', async () => {
        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)
        const { container } = await render(
            terminalContextWrapper(
                <TerminalView
                    terminalRef={{ current: null }}
                    sessionId={''}
                    socketConnection={SocketConnectionType.CONNECTING}
                    setSocketConnection={jest.fn()}
                    clearTerminal={false}
                    renderConnectionStrip={jest.fn()}
                />,
            ),
        )
        await waitFor(() => {
            expect(container).toBeInTheDocument()
            useHeightObserverMock.mockRestore()
        })
    })

    it('renders with messaging strip', () => {
        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)
        const { container } = render(
            terminalContextWrapper(
                <TerminalView
                    terminalRef={{ current: null }}
                    sessionId={''}
                    socketConnection={SocketConnectionType.CONNECTING}
                    setSocketConnection={jest.fn()}
                    clearTerminal={false}
                    renderConnectionStrip={renderStrip}
                />,
            ),
        )
        expect(container).toBeInTheDocument()
        const messageStrip = container.querySelector(
            '.terminal-strip.pl-20.pr-20.w-100.bcr-7.cn-0.connection-status-strip',
        )
        expect(messageStrip).toBeInTheDocument()
        useHeightObserverMock.mockRestore()
    })

    it('displays data received on socket connection', () => {
        mockSocket.on = jest.fn((event) => {
            const message = event.data
            expect(getByText(message)).toBeInTheDocument()
        })

        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)

        const { getByText } = render(
            terminalContextWrapper(
                <TerminalView
                    terminalRef={{ current: null }}
                    sessionId={'123df5'}
                    socketConnection={SocketConnectionType.CONNECTING}
                    setSocketConnection={jest.fn()}
                    clearTerminal={false}
                    renderConnectionStrip={renderStrip}
                />,
            ),
        )
        mockServer.emit('connection', mockSocket)
        mockSocket.send('Terminal!')
        useHeightObserverMock.mockRestore()
    })

    it('calls renderConnectionStrip with CONNECTED when socket connection is established', () => {
        const mockRenderConnectionStrip = jest.fn()
        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)
        const { rerender } = render(
            terminalContextWrapper(
                <TerminalView
                    terminalRef={{ current: null }}
                    sessionId={'123df5'}
                    socketConnection={SocketConnectionType.CONNECTING}
                    setSocketConnection={jest.fn()}
                    clearTerminal={false}
                    renderConnectionStrip={mockRenderConnectionStrip}
                />,
            ),
        )

        expect(mockRenderConnectionStrip).toHaveBeenCalled()

        const newSocketConnection = SocketConnectionType.CONNECTED
        rerender(
            terminalContextWrapper(
                <TerminalView
                    terminalRef={{ current: null }}
                    sessionId={'123df5'}
                    socketConnection={newSocketConnection}
                    setSocketConnection={jest.fn()}
                    clearTerminal={false}
                    renderConnectionStrip={mockRenderConnectionStrip}
                />,
            ),
        )

        expect(mockRenderConnectionStrip).not.toHaveBeenCalledWith(SocketConnectionType.CONNECTED)
        useHeightObserverMock.mockRestore()
    })
})
