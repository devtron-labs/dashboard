import React, { useEffect, useState } from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as Disconnect } from '../../../../assets/icons/ic-disconnect.svg'
import { ReactComponent as Connect } from '../../../../assets/icons/ic-connect.svg'
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg'
import { useParams, useRouteMatch } from 'react-router'
import { NodeDetailTab } from '../nodeDetail.type'
import IndexStore from '../../../index.store'
import Select from 'react-select'
import { SocketConnectionType } from './node.type'
import TerminalView from './terminal/Terminal'
import MessageUI from '../../../../common/message.ui'
import { Option } from '../../../../common/ReactSelect.utils'
import { getContainersData, getContainerSelectStyles, getGroupedContainerOptions, getShellSelectStyles } from '../nodeDetail.util'
import { shellTypes } from '../../../../../../config/constants'
import { OptionType } from '../../../../../app/types'
import { Options, TerminalComponentProps } from '../../../appDetails.type'
import './nodeDetailTab.scss'

function TerminalComponent({
    selectedTab,
    isDeleted,
    isResourceBrowserView,
    selectedResource,
}: TerminalComponentProps) {
    const params = useParams<{ actionName: string; podName: string; nodeType: string; node: string }>()
    const { url } = useRouteMatch()
    const podMetaData = !isResourceBrowserView && IndexStore.getMetaDataForPod(params.podName)
    const containers = (isResourceBrowserView ? selectedResource.containers : getContainersData(podMetaData)) as Options[]
    const [selectedContainerName, setSelectedContainerName] = useState(containers?.[0]?.name || '')
    const [selectedtTerminalType, setSelectedtTerminalType] = useState(shellTypes[0])
    const [terminalCleared, setTerminalCleared] = useState(false)
    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>(SocketConnectionType.CONNECTING)
    const defaultContainerOption = { label: selectedContainerName, value: selectedContainerName }

    useEffect(() => {
        selectedTab(NodeDetailTab.TERMINAL, url)
    }, [params.podName, params.node, selectedResource?.name])

    const handleDisconnect = () => {
        setSocketConnection(SocketConnectionType.DISCONNECTING)
    }

    const handleConnect = () => {
        setSocketConnection(SocketConnectionType.CONNECTING)
    }

    const handleAbort = () => {
        setTerminalCleared(true)
    }

    const handleContainerChange = (selected: OptionType) => {
        setSelectedContainerName(selected.value)
        setTerminalCleared(true)
    }

    const handleShellChange = (selected: OptionType) => {
        setSelectedtTerminalType(selected)
        setTerminalCleared(true)
        setSocketConnection(SocketConnectionType.DISCONNECTING)
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

    return (
        <div className="terminal-view-container">
            <div data-testid="terminal-editor-header" className="flex left bcn-0 pt-4 pb-4 pl-20 dc__border-top">
                <Tippy
                    className="default-tt"
                    arrow={false}
                    placement="bottom"
                    content={
                        socketConnection === SocketConnectionType.CONNECTING ||
                        socketConnection === SocketConnectionType.CONNECTED
                            ? 'Disconnect'
                            : 'Connect'
                    }
                >
                    {socketConnection === SocketConnectionType.CONNECTING ||
                    socketConnection === SocketConnectionType.CONNECTED ? (
                        <span>
                            <Disconnect className="icon-dim-20 mr-5" onClick={handleDisconnect} />
                        </span>
                    ) : (
                        <span>
                            <Connect className="icon-dim-20 mr-5" onClick={handleConnect} />
                        </span>
                    )}
                </Tippy>
                <Tippy className="default-tt" arrow={false} placement="bottom" content="Clear">
                    <div>
                        <Abort data-testid="clear-terminal-editor" className="icon-dim-20" onClick={handleAbort} />
                    </div>
                </Tippy>
                <span className="bcn-2 mr-8 ml-8" style={{ width: '1px', height: '16px' }} />
                <div className="cn-6 ml-8 mr-10">Container </div>
                <div style={{ minWidth: '145px' }}>
                    <Select
                        placeholder="Select Containers"
                        classNamePrefix="containers-select"
                        options={getGroupedContainerOptions(containers)}
                        defaultValue={defaultContainerOption}
                        onChange={handleContainerChange}
                        styles={getContainerSelectStyles()}
                        components={{
                            IndicatorSeparator: null,
                            Option: (props) => <Option {...props} style={{ direction: 'rtl' }} />,
                        }}
                    />
                </div>
                <span className="bcn-2 ml-8 mr-8" style={{ width: '1px', height: '16px' }} />
                <div style={{ minWidth: '145px' }}>
                    <Select
                        placeholder="Select Shell"
                        options={shellTypes}
                        defaultValue={shellTypes[0]}
                        onChange={handleShellChange}
                        styles={getShellSelectStyles()}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                    />
                </div>
            </div>
            <div
                data-testid="app-terminal-container"
                className="terminal-view-wrapper"
                style={{
                    minHeight: isResourceBrowserView ? '200px' : '',
                }}
            >
                <TerminalView
                    nodeName={isResourceBrowserView ? params.node : params.podName}
                    containerName={selectedContainerName}
                    socketConnection={socketConnection}
                    isTerminalCleared={terminalCleared}
                    shell={selectedtTerminalType}
                    setTerminalCleared={setTerminalCleared}
                    setSocketConnection={setSocketConnection}
                    isResourceBrowserView={isResourceBrowserView}
                    selectedResource={selectedResource}
                />
            </div>
        </div>
    )
}

export default TerminalComponent
