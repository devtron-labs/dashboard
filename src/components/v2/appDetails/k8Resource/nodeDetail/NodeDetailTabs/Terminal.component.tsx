import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouteMatch } from 'react-router'
import { NodeDetailTab } from '../nodeDetail.type'
import { SocketConnectionType } from './node.type'
import MessageUI from '../../../../common/message.ui'
import { Option } from '../../../../common/ReactSelect.utils'
import { getContainerSelectStyles, getGroupedContainerOptions, getShellSelectStyles } from '../nodeDetail.util'
import { shellTypes } from '../../../../../../config/constants'
import { OptionType } from '../../../../../app/types'
import { TerminalComponentProps } from '../../../appDetails.type'
import './nodeDetailTab.scss'
import TerminalWrapper from './terminal/TerminalWrapper.component'
import { TerminalSelectionListDataType } from './terminal/terminal.type'
import { get, showError } from '@devtron-labs/devtron-fe-common-lib'
import { TERMINAL_WRAPPER_COMPONENT_TYPE } from './terminal/constants'

let clusterTimeOut

function TerminalComponent({
    selectedTab,
    isDeleted,
    selectedContainerValue,
    containers,
    selectedContainer,
    setSelectedContainer,
    className,
    sessionURL,
    nodeName,
}: TerminalComponentProps) {
    const params = useParams<{ actionName: string; podName: string; nodeType: string; node: string }>()
    const { url } = useRouteMatch()
    const terminalRef = useRef(null)
    const _selectedContainer = selectedContainer.get(selectedContainerValue) || containers?.[0]?.name || ''
    const [selectedContainerName, setSelectedContainerName] = useState(_selectedContainer)
    const [selectedTerminalType, setSelectedTerminalType] = useState(shellTypes[0])
    const [terminalCleared, setTerminalCleared] = useState(false)
    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>(SocketConnectionType.CONNECTING)
    const defaultContainerOption = { label: selectedContainerName, value: selectedContainerName }
    const [sessionId, setSessionId] = useState<string>()
    const connectTerminal: boolean =
        socketConnection === SocketConnectionType.CONNECTING || socketConnection === SocketConnectionType.CONNECTED

    const handleAbort = () => {
        setTerminalCleared(!terminalCleared)
    }

    const getNewSession = () => {
        if (!nodeName || !selectedContainerName || !selectedTerminalType.value) {
            return
        }
        get(`${sessionURL}/${nodeName}/${selectedTerminalType.value}/${selectedContainerName}`)
            .then((response: any) => {
                handleAbort()
                const sessionId = response?.result.SessionID
                if (terminalRef.current) {
                    setSessionId(sessionId)
                }
            })
            .catch((err) => {
                showError(err)
            })
    }

    useEffect(() => {
        if (socketConnection === SocketConnectionType.CONNECTING) {
            getNewSession()
        }
    }, [socketConnection])

    useEffect(() => {
        clearTimeout(clusterTimeOut)
        if (terminalRef.current) {
            setSocketConnection(SocketConnectionType.DISCONNECTING)
            handleAbort()
            // Wait a short amount of time before attempting to reconnect
            clusterTimeOut = setTimeout(() => {
                setSocketConnection(SocketConnectionType.CONNECTING)
            }, 300)
        }
    }, [selectedTerminalType, selectedContainerName])

    useEffect(() => {
        selectedTab(NodeDetailTab.TERMINAL, url)
        setSelectedContainerName(_selectedContainer)
        handleAbort()
    }, [params.podName, params.node, _selectedContainer])

    const handleDisconnect = () => {
        setSocketConnection(SocketConnectionType.DISCONNECTING)
    }

    const handleConnect = () => {
        setSocketConnection(SocketConnectionType.CONNECTING)
    }

    const handleContainerChange = (selected: OptionType) => {
        setSelectedContainerName(selected.value)
        setSelectedContainer(selectedContainer.set(selectedContainerValue, selected.value))
    }

    const handleShellChange = (selected: OptionType) => {
        setSelectedTerminalType(selected)
    }

    if (isDeleted || !selectedContainerName.length) {
        return (
            <div className={className}>
                <MessageUI msg="This resource no longer exists" size={32} minHeight="100%" />
            </div>
        )
    }

    const selectionListData: TerminalSelectionListDataType = {
        firstRow: [
            {
                type: TERMINAL_WRAPPER_COMPONENT_TYPE.CONNECTION_BUTTON,
                connectTerminal: connectTerminal,
                closeTerminalModal: handleDisconnect,
                reconnectTerminal: handleConnect,
            },
            {
                type: TERMINAL_WRAPPER_COMPONENT_TYPE.CLEAR_BUTTON,
                setTerminalCleared: handleAbort,
            },
            {
                type: TERMINAL_WRAPPER_COMPONENT_TYPE.REACT_SELECT,
                showDivider: true,
                title: 'Container ',
                placeholder: 'Select container',
                options: getGroupedContainerOptions(containers),
                value: defaultContainerOption,
                onChange: handleContainerChange,
                styles: getContainerSelectStyles(),
                components: {
                    IndicatorSeparator: null,
                    Option: (props) => <Option {...props} style={{ direction: 'rtl' }} />,
                },
            },
            {
                type: TERMINAL_WRAPPER_COMPONENT_TYPE.REACT_SELECT,
                showDivider: true,
                placeholder: 'Select Shell',
                options: shellTypes,
                defaultValue: shellTypes[0],
                onChange: handleShellChange,
                styles: getShellSelectStyles(),
                components: {
                    IndicatorSeparator: null,
                    Option,
                },
            },
        ],
        tabSwitcher: {
            terminalData: {
                terminalRef: terminalRef,
                clearTerminal: terminalCleared,
                setSocketConnection: setSocketConnection,
                socketConnection: socketConnection,
                sessionId: sessionId,
            },
        },
    }

    return (
        <TerminalWrapper
            selectionListData={selectionListData}
            socketConnection={socketConnection}
            setSocketConnection={setSocketConnection}
            className={className}
        />
    )
}

export default TerminalComponent
