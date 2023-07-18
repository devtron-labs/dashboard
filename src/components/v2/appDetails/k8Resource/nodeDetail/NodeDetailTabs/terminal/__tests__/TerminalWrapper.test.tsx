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
            )
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
            )
        )

        expect(container).toBeInTheDocument()
        const firstStrip = container.querySelector('.flex.bcn-0.pl-20.dc__border-top.h-32')
        expect(firstStrip).toBeInTheDocument()
        const secondStrip = container.querySelector('.flex.left.bcn-0.pl-20.dc__border-top.h-28')
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
            )
        )

        expect(container).toBeInTheDocument()
        const firstStrip = container.querySelector('.flex.bcn-0.pl-20.dc__border-top.h-32')
        expect(firstStrip).toBeInTheDocument()
        const secondStrip = container.querySelector('.flex.left.bcn-0.pl-20.dc__border-top.h-28')
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
            )
        )

        expect(container).toBeInTheDocument()
        const firstStrip = container.querySelector('.flex.bcn-0.pl-20.dc__border-top.h-32')
        expect(firstStrip).toBeInTheDocument()
        const secondStrip = container.querySelector('.flex.left.bcn-0.pl-20.dc__border-top.h-28')
        expect(secondStrip).toBeInTheDocument()
        const terminalWrapper = container.querySelector('.cluster-terminal__wrapper')
        expect(terminalWrapper).toBeInTheDocument()
        const terminal = container.querySelector('.terminal-wrapper')
        expect(terminal).toBeInTheDocument()

        useHeightObserverMock.mockRestore()
    })
})
