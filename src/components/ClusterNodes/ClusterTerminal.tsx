import React, { useState, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import Select, { components } from 'react-select'
import { shellTypes } from '../../config/constants'
import { SocketConnectionType } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/node.type'
import Terminal from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/Terminal'
import {
    clusterDisconnectAndRetry,
    clusterTerminalDisconnect,
    clusterTerminalStart,
    clusterTerminalStop,
    clusterTerminalTypeUpdate,
    clusterTerminalUpdate,
} from './clusterNodes.service'
import { ReactComponent as Disconnect } from '../../assets/icons/ic-disconnected.svg'
import { ReactComponent as Abort } from '../../assets/icons/ic-abort.svg'
import { Option } from '../../components/v2/common/ReactSelect.utils'
import { ReactComponent as Connect } from '../../assets/icons/ic-connected.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as FullScreen } from '../../assets/icons/ic-fullscreen-2.svg'
import { ReactComponent as ExitScreen } from '../../assets/icons/ic-exit-fullscreen-2.svg'
import { ReactComponent as Play } from '../../assets/icons/ic-play.svg'
import CreatableSelect from 'react-select/creatable'
import { showError } from '../common'
import { ServerErrors } from '../../modals/commonTypes'
import ClusterManifest from './ClusterManifest'
import ClusterEvents from './ClusterEvents'
import TippyWhite from '../common/TippyWhite'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help-outline.svg'
import { clusterSelectStyle, ClusterTerminalType, CLUSTER_STATUS } from './types'

export default function ClusterTerminal({
    clusterId,
    clusterName,
    nodeList,
    closeTerminal,
    clusterImageList,
    isNodeDetailsPage,
    namespaceList,
    node,
}: ClusterTerminalType) {
    const clusterShellTypes = shellTypes.filter((types) => types.label === 'sh' ||  types.label === 'bash' )
    const clusterNodeList = nodeList.map((node) => {
        return { label: node, value: node }
    })
    const imageList = clusterImageList.map((image) => {
        return { value: image, label: image }
    })

    const defaultNamespaceList = namespaceList.map((item) => {
        return { value: item, label: item }
    })

    const selectedNode = {
        label: node,
        value: node,
    }
    const defaultNameSpace = defaultNamespaceList.find((item) => item.label === 'default') || defaultNamespaceList[0]
    const [selectedContainerName, setSelectedContainerName] = useState(node ? selectedNode : clusterNodeList[0])
    const [selectedtTerminalType, setSelectedtTerminalType] = useState(shellTypes[0])
    const [terminalCleared, setTerminalCleared] = useState<boolean>(false)
    const [isPodCreated, setPodCreated] = useState<boolean>(true)
    const [terminalAccessId, setTerminalId] = useState()
    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>(SocketConnectionType.CONNECTING)
    const [selectedImage, setImage] = useState<string>(clusterImageList[0])
    const [selectedNamespace, setNamespace] = useState(defaultNameSpace)
    const [update, setUpdate] = useState<boolean>(false)
    const [isFullScreen, setFullScreen] = useState<boolean>(false)
    const [isFetchRetry, setRetry] = useState<boolean>(false)
    const [connectTerminal, setConnectTerminal] = useState<boolean>(false)
    const [isReconnect, setReconnect] = useState<boolean>(false)
    const [toggleOption, settoggleOption] = useState<boolean>(false)
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)

    const payload = {
        clusterId: clusterId,
        baseImage: selectedImage,
        shellName: selectedtTerminalType.value,
        nodeName: selectedContainerName.value,
        namespace: selectedNamespace.value,
    }

    useEffect(() => {
        if (update) {
            setSelectedContainerName(node ? selectedNode : clusterNodeList[0])
            setNamespace(defaultNameSpace)
        }
    }, [clusterId, nodeList, node])

    useEffect(() => {
        try {
            setSelectedTabIndex(0)
            if (update) {
                socketDiconnecting()
                clusterTerminalUpdate({ ...payload, id: terminalAccessId })
                    .then((response) => {
                        setTerminalId(response.result.terminalAccessId)
                        setTerminalCleared(true)
                        setSocketConnection(SocketConnectionType.CONNECTING)
                        setPodCreated(true)
                        setRetry(false)
                    })
                    .catch((error) => {
                        sessionError(error)
                        setPodCreated(false)
                        setSocketConnection(SocketConnectionType.DISCONNECTED)
                    })
            } else {
                clusterTerminalStart(payload)
                    .then((response) => {
                        setTerminalId(response.result.terminalAccessId)
                        setUpdate(true)
                        socketConnecting()
                        setConnectTerminal(true)
                        setPodCreated(true)
                        setRetry(false)
                    })
                    .catch((error) => {
                        showError(error)
                        setPodCreated(false)
                        if (error instanceof ServerErrors && Array.isArray(error.errors)) {
                            error.errors.map(({ userMessage }) => {
                                if (userMessage === CLUSTER_STATUS.SESSION_LIMIT_REACHED) {
                                    setRetry(true)
                                    setConnectTerminal(true)
                                }
                            })
                        } else {
                        setConnectTerminal(false)
                        }
                        setSocketConnection(SocketConnectionType.DISCONNECTED)
                    })
            }
            toggleOptionChange()
        } catch (error) {
            showError(error)
            setUpdate(false)
            setSocketConnection(SocketConnectionType.DISCONNECTED)
        }
    }, [selectedContainerName.value, selectedImage, isReconnect, selectedNamespace.value])

    useEffect(() => {
        try {
            if (update) {
                socketDiconnecting()
                clusterTerminalTypeUpdate({ ...payload, terminalAccessId: terminalAccessId })
                    .then((response) => {
                        setTerminalId(response.result.terminalAccessId)
                        socketConnecting()
                    })
                    .catch((error) => {
                        showError(error)
                        setRetry(true)
                        setPodCreated(false)
                        setSocketConnection(SocketConnectionType.DISCONNECTED)
                    })
            }
            toggleOptionChange()
        } catch (error) {
            showError(error)
            setUpdate(false)
            setSocketConnection(SocketConnectionType.DISCONNECTED)
        }
    }, [selectedtTerminalType.value])

    async function closeTerminalModal(): Promise<void> {
        try {
            if (!isNodeDetailsPage && typeof closeTerminal === 'function') {
                closeTerminal()
            }
            setConnectTerminal(false)
            if(isPodCreated){
                await clusterTerminalDisconnect(terminalAccessId)
            }
            socketDiconnecting()
            toggleOptionChange()
            setUpdate(false)
        } catch (error) {
            setConnectTerminal(true)
            showError(error)
        }
    }

    async function stopterminalConnection(): Promise<void> {
        setSocketConnection(SocketConnectionType.DISCONNECTED)
        try {
            await clusterTerminalStop(terminalAccessId)
        } catch (error) {
            showError(error)
        }
    }

    async function disconnectRetry(): Promise<void> {
        try {
            setPodCreated(true)
            clusterDisconnectAndRetry(payload).then((response) => {
                setTerminalId(response.result.terminalAccessId)
                setSocketConnection(SocketConnectionType.DISCONNECTED)
                setUpdate(true)
                socketConnecting()
                setRetry(false)
                setConnectTerminal(true)
            })
            toggleOptionChange()
        } catch (error) {
            setPodCreated(false)
            showError(error)
        }
    }

    const sessionError = (error): void => {
        showError(error)
        if (error instanceof ServerErrors && Array.isArray(error.errors)) {
            error.errors.map(({ userMessage }) => {
                if (userMessage === CLUSTER_STATUS.SESSION_LIMIT_REACHED) {
                    setRetry(true)
                }
            })
        }
    }

    const reconnectTerminal = (): void => {
        setConnectTerminal(true)
        setTerminalId(null)
        setReconnect(!isReconnect)
    }

    const socketConnecting = (): void => {
        setSocketConnection(SocketConnectionType.CONNECTING)
    }

    const socketDiconnecting = (): void => {
        setSocketConnection(SocketConnectionType.DISCONNECTING)
    }

    const resumePodConnection = (): void => {
        setRetry(false)
        socketConnecting()
    }

    const onChangeNodes = (selected): void => {
        setSelectedContainerName(selected)
    }

    const onChangeTerminalType = (selected): void => {
        setSelectedtTerminalType(selected)
    }

    const onChangeImages = (selected): void => {
        setImage(selected.value)
    }

    const onChangeNamespace = (selected): void => {
        setNamespace(selected)
    }

    const toggleScreenView = (): void => {
        setFullScreen(!isFullScreen)
    }

    const toggleOptionChange = (): void => {
        settoggleOption(!toggleOption)
    }

    const selectTerminalTab = (): void => {
        setSelectedTabIndex(0)
    }

    const selectEventsTab = (): void => {
        setSelectedTabIndex(1)
    }

    const selectManifestTab = (): void => {
        setSelectedTabIndex(2)
    }

    const menuComponent = (props) => {
        return (
            <components.MenuList {...props}>
                <div className="fw-4 lh-20 pl-8 pr-8 pt-6 pb-6 cn-7 fs-13 dc__italic-font-style">
                    Use custom image: Enter path for publicly available image
                </div>
                {props.children}
            </components.MenuList>
        )
    }

    const terminalContainer = () => {
        return (
            <Terminal
                nodeName={selectedContainerName.label}
                containerName={selectedContainerName.label}
                socketConnection={socketConnection}
                isTerminalCleared={terminalCleared}
                shell={selectedtTerminalType}
                setTerminalCleared={setTerminalCleared}
                setSocketConnection={setSocketConnection}
                isClusterTerminal={true}
                terminalId={terminalAccessId}
                disconnectRetry={disconnectRetry}
                isFetchRetry={isFetchRetry}
                isToggleOption={toggleOption}
                isFullScreen={isFullScreen}
                isterminalTab={selectedTabIndex === 0}
                setTerminalTab={setSelectedTabIndex}
                isPodConnected={connectTerminal}
                sessionError={sessionError}
            />
        )
    }

    return (
        <div
            className={`${
                isFullScreen || isNodeDetailsPage ? 'cluster-full_screen' : 'cluster-terminal-view-container'
            } ${isNodeDetailsPage ? '' : 'node-terminal'}`}
        >
            <div className="flex dc__content-space bcn-0 pl-20 dc__border-top h-32">
                <div className="flex left">
                    {clusterName && (
                        <>
                            <div className="cn-6 mr-16">Cluster</div>
                            <div className="flex fw-6 fs-13 mr-20">{clusterName}</div>
                            <span className="bcn-2 mr-8 h-32" style={{ width: '1px' }} />
                        </>
                    )}
                    {isNodeDetailsPage && (
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={connectTerminal ? 'Disconnect and terminate pod' : 'Connect to terminal'}
                        >
                            {connectTerminal ? (
                                <span className="flex mr-8">
                                    <Disconnect className="icon-dim-16 mr-4 cursor" onClick={closeTerminalModal} />
                                </span>
                            ) : (
                                <span className="flex mr-8">
                                    <Connect className="icon-dim-16 mr-4 cursor" onClick={reconnectTerminal} />
                                </span>
                            )}
                        </Tippy>
                    )}

                    {!isNodeDetailsPage && (
                        <>
                            <div className="cn-6 ml-8 mr-10">Node</div>
                            <div style={{ minWidth: '145px' }}>
                                <Select
                                    placeholder="Select Containers"
                                    options={clusterNodeList}
                                    defaultValue={selectedContainerName}
                                    value={selectedContainerName}
                                    onChange={onChangeNodes}
                                    styles={clusterSelectStyle}
                                    components={{
                                        IndicatorSeparator: null,
                                        Option: (props) => <Option {...props} style={{ direction: 'rtl' }} />,
                                    }}
                                />
                            </div>
                        </>
                    )}

                    <span className="bcn-2 ml-8 mr-8" style={{ width: '1px', height: '16px' }} />
                    <div className="cn-6 ml-8 mr-10">Namespace</div>
                    <div>
                        <CreatableSelect
                            placeholder="Select Namespace"
                            options={defaultNamespaceList}
                            defaultValue={selectedNamespace}
                            value={selectedNamespace}
                            onChange={onChangeNamespace}
                            styles={clusterSelectStyle}
                            components={{
                                IndicatorSeparator: null,
                                Option,
                            }}
                        />
                    </div>

                    <span className="bcn-2 ml-8 mr-8" style={{ width: '1px', height: '16px' }} />
                    <div className="cn-6 ml-8 mr-4">Image</div>
                    <TippyWhite
                        heading={'Image'}
                        placement={'top'}
                        children={<HelpIcon className="icon-dim-16 mr-8" />}
                        interactive={true}
                        trigger="click"
                        className="w-300"
                        Icon={Help}
                        showCloseButton={true}
                        iconClass="icon-dim-20 fcv-5"
                        infoText="Select image you want to run inside the pod. 
                        You can use publicly available custom images as well."
                    />
                    <div>
                        <CreatableSelect
                            placeholder="Select Image"
                            options={imageList}
                            defaultValue={imageList[0]}
                            onChange={onChangeImages}
                            styles={{
                                ...clusterSelectStyle,
                                menu: (base, state) => ({
                                    ...base,
                                    zIndex: 9999,
                                    textAlign: 'left',
                                    maxWidth: '380px',
                                    minWidth: '350px',
                                }),
                            }}
                            components={{
                                IndicatorSeparator: null,
                                Option,
                                MenuList: menuComponent,
                            }}
                        />
                    </div>
                </div>
                {!isNodeDetailsPage && (
                    <span className="flex">
                        {isFullScreen ? (
                            <ExitScreen className="mr-12 cursor fcn-6" onClick={toggleScreenView} />
                        ) : (
                            <FullScreen className="mr-12 cursor fcn-6" onClick={toggleScreenView} />
                        )}
                        <Close className="icon-dim-20 cursor fcn-6 mr-20" onClick={closeTerminalModal} />
                    </span>
                )}
            </div>

            <div className="flex left bcn-0 pl-20 dc__border-top h-28">
                <ul role="tablist" className="tab-list">
                    <li className="tab-list__tab pointer fs-12" onClick={selectTerminalTab}>
                        <div className={`tab-hover mb-4 mt-5 cursor ${selectedTabIndex == 0 ? 'active' : ''}`}>
                            Terminal
                        </div>
                        {selectedTabIndex == 0 && <div className="node-details__active-tab" />}
                    </li>
                    {terminalAccessId && connectTerminal && (
                        <li className="tab-list__tab fs-12" onClick={() => selectEventsTab()}>
                            <div className={`tab-hover mb-4 mt-5 cursor ${selectedTabIndex == 1 ? 'active' : ''}`}>
                                Pod Events
                            </div>
                            {selectedTabIndex == 1 && <div className="node-details__active-tab" />}
                        </li>
                    )}
                    {terminalAccessId && connectTerminal && (
                        <li className="tab-list__tab fs-12" onClick={selectManifestTab}>
                            <div className={`tab-hover mb-4 mt-5 cursor ${selectedTabIndex == 2 ? 'active' : ''}`}>
                                Pod Manifest
                            </div>
                            {selectedTabIndex == 2 && <div className="node-details__active-tab" />}
                        </li>
                    )}
                </ul>
                <div className={`${selectedTabIndex !== 0 ? 'dc__hide-section' : 'flex'}`}>
                    {connectTerminal && isPodCreated && (
                        <>
                            <span className="bcn-2 mr-8 h-28" style={{ width: '1px' }} />
                            <Tippy
                                className="default-tt cursor"
                                arrow={false}
                                placement="bottom"
                                content={
                                    socketConnection === SocketConnectionType.CONNECTING ||
                                    socketConnection === SocketConnectionType.CONNECTED
                                        ? 'Disconnect from pod'
                                        : 'Reconnect to pod'
                                }
                            >
                                {socketConnection === SocketConnectionType.CONNECTING ||
                                socketConnection === SocketConnectionType.CONNECTED ? (
                                    <span className="mr-8 cursor">
                                        <div
                                            className="icon-dim-12 mt-4 mr-4 mb-4 br-2 bcr-5"
                                            onClick={stopterminalConnection}
                                        />
                                    </span>
                                ) : (
                                    <span className="mr-8 flex">
                                        <Play className="icon-dim-16 mr-4 cursor" onClick={resumePodConnection} />
                                    </span>
                                )}
                            </Tippy>
                            <Tippy className="default-tt" arrow={false} placement="bottom" content="Clear">
                                <div className="flex">
                                    <Abort
                                        className="icon-dim-16 mr-4 fcn-6 cursor"
                                        onClick={(e) => {
                                            setTerminalCleared(true)
                                        }}
                                    />
                                </div>
                            </Tippy>
                            <span className="bcn-2 ml-8 mr-8" style={{ width: '1px', height: '16px' }} />
                            <div className="cn-6 ml-8 mr-10">Shell </div>
                            <div>
                                <Select
                                    placeholder="Select Shell"
                                    options={clusterShellTypes}
                                    defaultValue={clusterShellTypes[0]}
                                    onChange={onChangeTerminalType}
                                    styles={clusterSelectStyle}
                                    components={{
                                        IndicatorSeparator: null,
                                        Option,
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div
                className={`cluster-terminal__wrapper ${isFullScreen ? 'full-screen-terminal' : ''} ${
                    isNodeDetailsPage ? 'node-details-full-screen' : ''
                }`}
            >
                <div className={`${selectedTabIndex === 0 ? 'h-100' : 'dc__hide-section'}`}>{terminalContainer()}</div>
                {selectedTabIndex === 1 && (
                    <div className="h-100 dc__overflow-scroll">
                        <ClusterEvents clusterId={terminalAccessId} />
                    </div>
                )}
                {selectedTabIndex === 2 && (
                    <div className="h-100">
                        <ClusterManifest clusterId={terminalAccessId} />
                    </div>
                )}
            </div>
        </div>
    )
}
