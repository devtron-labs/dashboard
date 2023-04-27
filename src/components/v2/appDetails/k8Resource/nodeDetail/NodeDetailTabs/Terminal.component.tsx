import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouteMatch } from 'react-router'
import { NodeDetailTab } from '../nodeDetail.type'
import IndexStore from '../../../index.store'
import { SocketConnectionType } from './node.type'
import MessageUI from '../../../../common/message.ui'
import { Option } from '../../../../common/ReactSelect.utils'
import {
    getContainersData,
    getContainerSelectStyles,
    getGroupedContainerOptions,
    getShellSelectStyles,
} from '../nodeDetail.util'
import { shellTypes } from '../../../../../../config/constants'
import { OptionType } from '../../../../../app/types'
import { AppType, Options, TerminalComponentProps } from '../../../appDetails.type'
import './nodeDetailTab.scss'
import TerminalWrapper from './terminal/TerminalWrapper.component'
import { TerminalSelectionListDataType } from './terminal/terminal.type'
import { get, showError } from '@devtron-labs/devtron-fe-common-lib'

let clusterTimeOut

function TerminalComponent({
    selectedTab,
    isDeleted,
    isResourceBrowserView,
    selectedResource,
    selectedContainer,
    setSelectedContainer,
}: TerminalComponentProps) {
    const params = useParams<{ actionName: string; podName: string; nodeType: string; node: string }>()
    const { url } = useRouteMatch()
    const terminalRef = useRef(null)
    const podMetaData = !isResourceBrowserView && IndexStore.getMetaDataForPod(params.podName)
    const containers = (
        isResourceBrowserView ? selectedResource.containers : getContainersData(podMetaData)
    ) as Options[]
    const selectedContainerValue = isResourceBrowserView ? selectedResource?.name : podMetaData?.name
    const _selectedContainer = selectedContainer.get(selectedContainerValue) || containers?.[0]?.name || ''
    const [selectedContainerName, setSelectedContainerName] = useState(_selectedContainer)
    const [selectedTerminalType, setSelectedTerminalType] = useState(shellTypes[0])
    const [terminalCleared, setTerminalCleared] = useState(false)
    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>(SocketConnectionType.CONNECTING)
    const defaultContainerOption = { label: selectedContainerName, value: selectedContainerName }
    const [sessionId, setSessionId] = useState<string>()
    const connectTerminal: boolean =
        socketConnection === SocketConnectionType.CONNECTING || socketConnection === SocketConnectionType.CONNECTED
    const appDetails = IndexStore.getAppDetails()
    const nodeName = isResourceBrowserView ? params.node : params.podName

    const generateSessionURL = () => {
        let url
        if (isResourceBrowserView) {
            url = `k8s/pod/exec/session/${selectedResource.clusterId}`
        } else if (appDetails.appType === AppType.EXTERNAL_HELM_CHART) {
            url = `k8s/pod/exec/session/${appDetails.appId}`
        } else {
            url = `api/v1/applications/pod/exec/session/${appDetails.appId}/${appDetails.environmentId}`
        }
        url += `/${isResourceBrowserView ? selectedResource.namespace : appDetails.namespace}/${nodeName}/${
            selectedTerminalType.value
        }/${selectedContainerName}`
        return url
    }

    const handleAbort = () => {
        setTerminalCleared(!terminalCleared)
    }

    const getNewSession = () => {
        if (
            !nodeName ||
            !selectedContainerName ||
            !selectedTerminalType.value ||
            (!isResourceBrowserView && !appDetails)
        ) {
            return
        }

        get(generateSessionURL())
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
            <div>
                <MessageUI
                    msg="This resource no longer exists"
                    size={32}
                    minHeight={isResourceBrowserView ? 'calc(100vh - 126px)' : ''}
                />
            </div>
        )
    }

    const selectionListData: TerminalSelectionListDataType = {
        firstRow: [
            {
                type: 'connectionButton',
                connectTerminal: connectTerminal,
                closeTerminalModal: handleDisconnect,
                reconnectTerminal: handleConnect,
            },
            {
                type: 'clearButton',
                setTerminalCleared: handleAbort,
            },
            {
                type: 'reactSelect',
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
                type: 'reactSelect',
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
            className={isResourceBrowserView ? 'k8s-resource-view-container' : 'terminal-view-container'}
        />
    )
}

export default TerminalComponent
