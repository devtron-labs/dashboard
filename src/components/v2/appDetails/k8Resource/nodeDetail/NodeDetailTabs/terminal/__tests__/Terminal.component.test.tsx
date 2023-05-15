import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SocketConnectionType } from '../../node.type'
import * as data from '../../../../../../../../components/common/helpers/Helpers'
import { mockUseHeightObserver, renderStrip } from '../__mocks__/terminalWrapper.mock'
import { WebSocket, Server } from 'mock-socket'
import { BrowserRouter } from 'react-router-dom'
import TerminalView from '../Terminal'

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

    it('renders without crashing', () => {
        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)
        const { container } = render(
            <TerminalView
                terminalRef={{current: null}}
                sessionId={''}
                socketConnection={SocketConnectionType.CONNECTING}
                setSocketConnection={jest.fn()}
                clearTerminal={false}
                renderConnectionStrip={jest.fn()}
            />,
            {
                wrapper: BrowserRouter,
            },
        )
        expect(container).toBeInTheDocument()
        useHeightObserverMock.mockRestore()
    })

    it('renders with messaging strip', () => {
        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)
        const { container } = render(
            <TerminalView
                terminalRef={{current: null}}
                sessionId={''}
                socketConnection={SocketConnectionType.CONNECTING}
                setSocketConnection={jest.fn()}
                clearTerminal={false}
                renderConnectionStrip={renderStrip}
            />,
            {
                wrapper: BrowserRouter,
            },
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
            <TerminalView
                terminalRef={{current: null}}
                sessionId={'123df5'}
                socketConnection={SocketConnectionType.CONNECTING}
                setSocketConnection={jest.fn()}
                clearTerminal={false}
                renderConnectionStrip={renderStrip}
            />,
        )
        mockServer.emit('connection', mockSocket)
        mockSocket.send('Terminal!')
        useHeightObserverMock.mockRestore()
    })

    it('calls renderConnectionStrip with CONNECTED when socket connection is established', () => {
        const mockRenderConnectionStrip = jest.fn()
        const useHeightObserverMock = jest.spyOn(data, 'useHeightObserver').mockImplementation(mockUseHeightObserver)
        const { rerender } = render(
            <TerminalView
                terminalRef={{current: null}}
                sessionId={'123df5'}
                socketConnection={SocketConnectionType.CONNECTING}
                setSocketConnection={jest.fn()}
                clearTerminal={false}
                renderConnectionStrip={mockRenderConnectionStrip}
            />,
        )

        expect(mockRenderConnectionStrip).toHaveBeenCalled()

        const newSocketConnection = SocketConnectionType.CONNECTED
        rerender(
            <TerminalView
                terminalRef={{current: null}}
                sessionId={'123df5'}
                socketConnection={newSocketConnection}
                setSocketConnection={jest.fn()}
                clearTerminal={false}
                renderConnectionStrip={mockRenderConnectionStrip}
            />,
        )

        expect(mockRenderConnectionStrip).not.toHaveBeenCalledWith(SocketConnectionType.CONNECTED)
        useHeightObserverMock.mockRestore()
    })
})
