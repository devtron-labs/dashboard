import React, { useRef } from 'react'
import { nodeSelect } from '../../../../../../../ClusterNodes/constants'
import { SocketConnectionType } from '../../node.type'
import { TERMINAL_TEXT } from '../constants'
import { TerminalSelectionListDataType } from '../terminal.type'

export const selectionListData: TerminalSelectionListDataType = {
    firstRow: [
        {
            type: 'titleName',
            hideTerminalStripComponent: false,
            title: 'Cluster',
            value: 'default_cluster',
        },
        {
            type: 'connectionButton',
            hideTerminalStripComponent: true,
            connectTerminal: false,
        },
        {
            type: 'reactSelect',
            title: 'Node',
            placeholder: 'Select node',
            options: [
                {
                    label: '',
                    options: [
                        {
                            label: 'Auto select',
                            value: 'autoSelectNode',
                        },
                    ],
                },
                {
                    label: '',
                    options: [
                        {
                            label: 'demo-new2',
                            value: 'demo-new2',
                        },
                    ],
                },
            ],
            defaultValue: {
                label: 'Auto select',
                value: 'autoSelectNode',
            },
            value: {
                label: 'Auto select',
                value: 'autoSelectNode',
            },
            styles: nodeSelect,
            components: {
                IndicatorSeparator: null,
            },
        },
    ],
    tabSwitcher: {
        terminalData: {
            terminalRef: null,
            clearTerminal: true,
            terminalMessageData: jest.fn(),
            renderConnectionStrip: jest.fn(),
            setSocketConnection: jest.fn(),
            socketConnection: SocketConnectionType.CONNECTING,
            isTerminalTab: true,
            sessionId: '',
        },
    },
}

export const selectionListDataWithSecondStrip = {
    ...selectionListData,
    secondRow: [
        {
            type: 'titleName',
            hideTerminalStripComponent: false,
            title: 'Cluster',
            value: 'default_cluster',
        },
        {
            type: 'connectionButton',
            hideTerminalStripComponent: true,
            connectTerminal: false,
        },
        {
            type: 'reactSelect',
            title: 'Node',
            placeholder: 'Select node',
            options: [
                {
                    label: '',
                    options: [
                        {
                            label: 'Auto select',
                            value: 'autoSelectNode',
                        },
                    ],
                },
                {
                    label: '',
                    options: [
                        {
                            label: 'demo-new2',
                            value: 'demo-new2',
                        },
                    ],
                },
            ],
            defaultValue: {
                label: 'Auto select',
                value: 'autoSelectNode',
            },
            value: {
                label: 'Auto select',
                value: 'autoSelectNode',
            },
            styles: nodeSelect,
            components: {
                IndicatorSeparator: null,
            },
        },
    ],
}

const renderTerminalTabWrapper = (terminalView: () => JSX.Element) => {
    return <div className="cluster-terminal__wrapper">{terminalView}</div>
}

export const selectionListDataWithTerminalWrapper = {
    ...selectionListDataWithSecondStrip,
    tabSwitcher: {
        terminalTabWrapper: renderTerminalTabWrapper,
        terminalData: {
            terminalRef: {current: null},
            clearTerminal: true,
            terminalMessageData: jest.fn(),
            renderConnectionStrip: jest.fn(),
            setSocketConnection: jest.fn(),
            socketConnection: SocketConnectionType.CONNECTING,
            isTerminalTab: true,
            sessionId: '',
        },
    },
}

export const mockUseHeightObserver = jest.fn().mockImplementation(() => {
    const ref = useRef({ clientHeight: 100 })
    return [ref]
})

export const renderStrip = jest.fn(() => {
    return (
        <div className="terminal-strip pl-20 pr-20 w-100 bcr-7 cn-0 connection-status-strip">
            {TERMINAL_TEXT.OFFLINE_CHECK_CONNECTION}
        </div>
    )
})
