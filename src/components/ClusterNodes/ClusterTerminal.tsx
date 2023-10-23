import React, { useState, useEffect, useRef } from 'react'
import { BUSYBOX_LINK, NETSHOOT_LINK, shellTypes } from '../../config/constants'
import {
    clusterDisconnectAndRetry,
    clusterManifestEdit,
    clusterTerminalDisconnect,
    clusterTerminalStart,
    clusterTerminalStop,
    clusterTerminalTypeUpdate,
    clusterTerminalUpdate,
} from './clusterNodes.service'
import { GroupHeading, menuComponentForImage, Option } from '../../components/v2/common/ReactSelect.utils'
import { clusterImageDescription, convertToOptionsList } from '../common'
import { get, ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import ClusterManifest, { ManifestPopupMenu } from './ClusterManifest'
import ClusterEvents from './ClusterEvents'
import { ClusterTerminalType, NodeTaintType } from './types'
import {
    AUTO_SELECT,
    clusterImageSelect,
    clusterSelectStyle,
    CLUSTER_STATUS,
    CLUSTER_TERMINAL_MESSAGING,
    ErrorMessageType,
    IMAGE_LIST,
    nodeSelect,
    POD_LINKS,
    PRE_FETCH_DATA_MESSAGING,
    SELECT_TITLE,
    SocketConnectionType,
} from './constants'
import { OptionType } from '../userGroups/userGroups.types'
import { getClusterTerminalParamsData } from '../cluster/cluster.util'
import { useHistory, useLocation } from 'react-router-dom'
import TerminalWrapper from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/TerminalWrapper.component'
import {
    TERMINAL_STATUS,
    TERMINAL_TEXT,
    EditModeType,
    TerminalWrapperType,
} from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/constants'
import { TerminalSelectionListDataType } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/terminal/terminal.type'

let clusterTimeOut

export default function ClusterTerminal({
    clusterId,
    clusterName,
    nodeGroups,
    closeTerminal,
    clusterImageList,
    isClusterDetailsPage,
    isNodeDetailsPage,
    namespaceList=[],
    node,
    taints,
    setSelectedNode,
    showTerminal
}: ClusterTerminalType) {
    const location = useLocation()
    const history = useHistory()
    const queryParams = new URLSearchParams(location.search)
    const terminalAccessIdRef = useRef()
    const clusterShellTypes = shellTypes.filter((types) => types.label === 'sh' || types.label === 'bash')
    const imageList = convertToOptionsList(clusterImageList, IMAGE_LIST.NAME, IMAGE_LIST.IMAGE)
    const defaultNamespaceList = convertToOptionsList(namespaceList)
    const defaultNameSpace = defaultNamespaceList.find((item) => item.label === 'default') || defaultNamespaceList[0]
    const queryParamsData = getClusterTerminalParamsData(
        queryParams,
        imageList,
        defaultNamespaceList,
        nodeGroups,
        clusterShellTypes,
        node,
    )
    const [selectedNodeName, setSelectedNodeName] = useState<OptionType>(queryParamsData.selectedNode)
    const [selectedTerminalType, setSelectedTerminalType] = useState<OptionType>(
        queryParamsData.selectedShell || shellTypes[1],
    )
    const [terminalCleared, setTerminalCleared] = useState<boolean>(false)
    const [isPodCreated, setPodCreated] = useState<boolean>(true)
    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>(SocketConnectionType.CONNECTING)
    const [selectedImage, setImage] = useState<OptionType>(queryParamsData.selectedImage || imageList[0])
    const [selectedNamespace, setNamespace] = useState(queryParamsData.selectedNamespace || defaultNameSpace)
    const [resourceData, setResourceData] = useState(null)
    const [update, setUpdate] = useState<boolean>(false)
    const [isFullScreen, setFullScreen] = useState<boolean>(false)
    const [isFetchRetry, setRetry] = useState<boolean>(false)
    const [connectTerminal, setConnectTerminal] = useState<boolean>(false)
    const [isReconnect, setReconnect] = useState<boolean>(false)
    const [toggleOption, settoggleOption] = useState<boolean>(false)
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
    const [sessionId, setSessionId] = useState<string>()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>({ message: '', reason: '' })
    const [manifestButtonState, setManifestButtonState] = useState<EditModeType>(EditModeType.NON_EDIT)
    const [manifestData, setManifestData] = useState<string>('')
    const [showPodExistPopup, setShowPodExistPopup] = useState<boolean>()
    const [forceDelete, setForceDelete] = useState<boolean>()
    const [manifestErrors, setManifestErrors] = useState<string[]>()
    const [debugMode, setDebugMode] = useState<boolean>(false)
    const [isManifestAvailable, setManifestAvailable] = useState<boolean>()
    const isShellSwitched = useRef<boolean>(false)
    const autoSelectNodeRef = useRef(null)
    const terminalRef = useRef(null)
    const prevNodeRef = useRef('')
    const currNodeRef = useRef('')
    const containerRef = useRef(null)
    const isManifestUpdated = useRef(false)
    const preventUpdateCall: boolean =
        (autoSelectNodeRef.current === AUTO_SELECT.value && selectedNodeName.value !== AUTO_SELECT.value) ||
        isManifestUpdated.current
    const containerName = resourceData?.containers?.[0].containerName

    const payload = {
        clusterId: clusterId,
        baseImage: selectedImage.value,
        shellName: selectedTerminalType.value,
        nodeName: selectedNodeName.value,
        namespace: selectedNamespace.value,
        manifest: manifestData,
        debugNode: debugMode,
        podName: resourceData?.podName || '',
        taints: (taints as Map<string, NodeTaintType[]>).get(selectedNodeName.value) || [],
        containerName: containerName,
    }

    useEffect(() => {
        if (update) {
            updateSelectedContainerName()
        }
    }, [clusterId, node])

    useEffect(() => {
        if (!location.search && !isNodeDetailsPage) {
            closeTerminal(false)
        }
    }, [location.search])

    useEffect(() => {
        handleUrlChanges()
    }, [selectedNodeName.value, selectedNamespace.value, selectedImage.value, selectedTerminalType.value])

    useEffect(() => {
        if (resourceData && update && manifestData) {
            try {
                socketDisconnecting()
                const abortController = new AbortController()
                clusterManifestEdit(
                    { ...payload, id: terminalAccessIdRef.current, forceDelete: forceDelete },
                    { signal: abortController.signal },
                )
                    .then((response) => {
                        if (abortController.signal.aborted) {
                            return
                        } else if (response.result?.podExists) {
                            setResourceData(response.result)
                            setShowPodExistPopup(response.result.podExists)
                        } else if (response.result?.errors) {
                            const errors = response.result.errors
                            setManifestErrors(errors)
                            setManifestButtonState(EditModeType.EDIT)
                            setManifestData('')
                        } else {
                            const result = response.result
                            setResourceData(result)
                            if (result.containers?.length > 1) {
                                containerRef.current = true
                            }
                            isManifestUpdated.current = true
                            setSelectedTabIndex(0)
                            setManifestAvailable(false)
                            setDebugMode(result.debugNode)
                            const nodeName = result.nodeName
                            setSelectedNodeName(nodeName ? { label: nodeName, value: nodeName } : AUTO_SELECT)
                            const containers = result.containers
                            const image = containers[0].image
                            if (image) {
                                setImage({ label: image, value: image })
                            }
                            const namespace = result.namespace
                            setNamespace(namespace ? { label: namespace, value: namespace } : defaultNameSpace)
                            setManifestButtonState(EditModeType.NON_EDIT)
                            terminalAccessIdRef.current = result.terminalAccessId
                            socketConnecting()
                            setShowPodExistPopup(false)
                            setManifestErrors([])
                        }
                    })
                    .catch((error) => {
                        showError(error)
                        setManifestButtonState(EditModeType.EDIT)
                        setManifestData('')
                    })
                    .finally(() => {
                        isManifestUpdated.current = false
                    })

                return () => {
                    abortController.abort()
                }
            } catch (error) {
                showError(error)
            }
        }
    }, [manifestData, forceDelete])

    useEffect(() => {
        if (preventUpdateCall) {
            autoSelectNodeRef.current = selectedNodeName.value
            return
        }
        try {
            const abortController = new AbortController()
            isShellSwitched.current = false
            containerRef.current = false
            autoSelectNodeRef.current = selectedNodeName.value
            setSelectedTabIndex(0)
            setManifestAvailable(false)
            setManifestButtonState(EditModeType.NON_EDIT)
            if (update) {
                socketDisconnecting()
                clusterTerminalUpdate(
                    { ...payload, id: terminalAccessIdRef.current },
                    { signal: abortController.signal },
                )
                    .then((response) => {
                        setResourceData(response.result)
                        terminalAccessIdRef.current = response.result.terminalAccessId
                        if (abortController.signal.aborted) {
                            return
                        }
                        setTerminalCleared(!terminalCleared)
                        socketConnecting()
                        setPodCreated(true)
                        setRetry(false)
                    })
                    .catch((error) => {
                        sessionError(error)
                        setPodCreated(false)
                        setTerminalCleared(!terminalCleared)
                        setSocketConnection(SocketConnectionType.DISCONNECTED)
                    })
            } else {
                clusterTerminalStart(payload, { signal: abortController.signal })
                    .then((response) => {
                        setResourceData(response.result)
                        terminalAccessIdRef.current = response.result.terminalAccessId
                        if (abortController.signal.aborted) {
                            return
                        }
                        setUpdate(true)
                        socketConnecting()
                        setConnectTerminal(true)
                        setPodCreated(true)
                        setRetry(false)
                    })
                    .catch((error) => {
                        showError(error)
                        setPodCreated(false)
                        setTerminalCleared(!terminalCleared)
                        if (error instanceof ServerErrors && Array.isArray(error.errors)) {
                            error.errors.map(({ userMessage }) => {
                                if (userMessage === CLUSTER_STATUS.SESSION_LIMIT_REACHED) {
                                    setRetry(true)
                                    setConnectTerminal(true)
                                } else if (userMessage === CLUSTER_STATUS.POD_TERMINATED) {
                                    setUpdate(false)
                                    setManifestData('')
                                    setConnectTerminal(false)
                                }
                            })
                        } else {
                            setConnectTerminal(false)
                        }
                        setSocketConnection(SocketConnectionType.DISCONNECTED)
                    })
            }

            return () => {
                abortController.abort()
            }
        } catch (error) {
            showError(error)
            setUpdate(false)
            setSocketConnection(SocketConnectionType.DISCONNECTED)
        }
    }, [selectedNodeName.value, selectedImage.value, isReconnect, selectedNamespace.value, debugMode])

    useEffect(() => {
        try {
            if (update) {
                isShellSwitched.current = true
                containerRef.current = false
                socketDisconnecting()
                clusterTerminalTypeUpdate({ ...payload, terminalAccessId: terminalAccessIdRef.current })
                    .then((response) => {
                        terminalAccessIdRef.current = response.result.terminalAccessId
                        socketConnecting()
                    })
                    .catch((error) => {
                        showError(error)
                        setRetry(true)
                        setManifestData('')
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
    }, [selectedTerminalType.value])

    // Disconnect terminal on unmount of the component
    useEffect(() => {
        return (): void => {
            closeTerminalModal(null, true)
        }
    }, [])

    useEffect(() => {
        // Maintaining value in ref for setTimeout context
        if (socketConnection === SocketConnectionType.DISCONNECTING) {
            if (clusterTimeOut) {
                clearTimeout(clusterTimeOut)
            }
        } else if (socketConnection === SocketConnectionType.CONNECTING && terminalAccessIdRef.current) {
            setErrorMessage({ message: '', reason: '' })
            prevNodeRef.current = selectedNodeName.value
            currNodeRef.current = ''
            getNewSession()
        }
    }, [socketConnection, terminalAccessIdRef.current])

    function getNewSession() {
        if (!terminalAccessIdRef.current) return
        setSocketConnection(SocketConnectionType.CONNECTING)
        getClusterData(
            `user/terminal/get?namespace=${selectedNamespace.value}&shellName=${
                selectedTerminalType.value
            }&terminalAccessId=${terminalAccessIdRef.current}&containerName=${
                resourceData.containers?.[0].containerName || ''
            }`,
            terminalAccessIdRef.current,
            window?._env_?.CLUSTER_TERMINAL_CONNECTION_RETRY_COUNT || 7,
        )
    }

    const getClusterData = (url: string, terminalId: number, count: number) => {
        if (terminalId !== terminalAccessIdRef.current) return
        else if (
            clusterTimeOut &&
            (socketConnection === SocketConnectionType.DISCONNECTED ||
                socketConnection === SocketConnectionType.DISCONNECTING)
        ) {
            clearTimeout(clusterTimeOut)
            return
        }
        get(url)
            .then((response: any) => {
                const sessionId = response.result.userTerminalSessionId
                const status = response.result.status
                if (status === TERMINAL_STATUS.RUNNING && !response.result?.isValidShell) {
                    preFetchData(status, TERMINAL_STATUS.FAILED)
                    setErrorMessage({ message: response.result?.errorReason, reason: '' })
                } else if (status === TERMINAL_STATUS.TERMINATED) {
                    setErrorMessage({ message: status, reason: response.result?.errorReason })
                } else if (!sessionId && count > 0) {
                    preFetchData(status)
                    clusterTimeOut = setTimeout(() => {
                        getClusterData(url, terminalId, count - 1)
                    }, window?._env_?.CLUSTER_TERMINAL_CONNECTION_POLLING_INTERVAL || 7000)
                } else if (sessionId) {
                    const _nodeName = response.result?.nodeName
                    if (selectedNodeName.value === TERMINAL_STATUS.AUTO_SELECT_NODE) {
                        setSelectedNodeName({ value: _nodeName, label: _nodeName })
                    }
                    if (socketConnection === SocketConnectionType.CONNECTING) {
                        setSessionId(sessionId)
                        currNodeRef.current = _nodeName
                        preFetchData(status)
                    }
                } else {
                    preFetchData(CLUSTER_STATUS.FAILED, TERMINAL_STATUS.TIMEDOUT)
                    setSocketConnection(SocketConnectionType.DISCONNECTED)
                    setErrorMessage({ message: TERMINAL_STATUS.TIMEDOUT, reason: '' })
                }
            })
            .catch((err) => {
                clearTimeout(clusterTimeOut)
                sessionError(err)
                clearTerminal()
            })
    }

    const preFetchData = (podState = '', status = '') => {
        const _terminal = terminalRef.current
        let startingText = TERMINAL_STATUS.CREATE
        if (!_terminal) return

        _terminal.reset()

        if (prevNodeRef.current === TERMINAL_STATUS.AUTO_SELECT_NODE) {
            _terminal.write(PRE_FETCH_DATA_MESSAGING.SELECTING_NODE)
            if (currNodeRef.current) {
                _terminal.write(` > ${currNodeRef.current} ${PRE_FETCH_DATA_MESSAGING.SELECTED}`)
                _terminal.writeln('')
            } else {
                _terminal.write('...')
            }
        }

        if (prevNodeRef.current !== TERMINAL_STATUS.AUTO_SELECT_NODE || currNodeRef.current) {
            if (isShellSwitched.current) {
                startingText = TERMINAL_STATUS.SHELL
            }

            if (startingText) {
                if (startingText === TERMINAL_STATUS.CREATE) {
                    _terminal.write(PRE_FETCH_DATA_MESSAGING.CREATING_PODS)
                } else if (startingText === TERMINAL_STATUS.SHELL) {
                    _terminal.write(`${PRE_FETCH_DATA_MESSAGING.SWITCHING_SHELL} ${selectedTerminalType.value}.`)
                }
            }
            if (startingText !== TERMINAL_STATUS.SHELL && podState) {
                if (podState === CLUSTER_STATUS.RUNNING) {
                    _terminal.write(PRE_FETCH_DATA_MESSAGING.SUCCEEDED_LINK)
                    _terminal.writeln('')
                    if (containerRef.current && containerName) {
                        _terminal.writeln(`${PRE_FETCH_DATA_MESSAGING.MULTIPLE_CONTAINER} ${containerName}`)
                    }
                    _terminal.write(PRE_FETCH_DATA_MESSAGING.CONNECTING_TO_POD)
                }
            }

            if (status) {
                if (status === TERMINAL_STATUS.TIMEDOUT) {
                    _terminal.write(PRE_FETCH_DATA_MESSAGING.TIMED_OUT_LINK)
                } else if (status === TERMINAL_STATUS.FAILED) {
                    _terminal.write(PRE_FETCH_DATA_MESSAGING.FAILED_TEXT)
                } else if (status === TERMINAL_STATUS.SUCCEDED) {
                    _terminal.write(PRE_FETCH_DATA_MESSAGING.SUCCEEDED_LINK)
                }
                _terminal.write(PRE_FETCH_DATA_MESSAGING.CHECK_POD_EVENTS)
                _terminal.write(' | ')
                _terminal.write(PRE_FETCH_DATA_MESSAGING.CHECK_POD_MANIFEST)
                _terminal.writeln('')
            } else {
                _terminal.write('..')
            }
        }
    }

    function updateSelectedContainerName() {
        autoSelectNodeRef.current = null
        if (node) {
            if (node !== selectedNodeName.value) {
                setSocketConnection(SocketConnectionType.DISCONNECTED)
                setSelectedNodeName({ label: node, value: node })
            }
        } else {
            setSocketConnection(SocketConnectionType.DISCONNECTED)
            setManifestData('')
            setReconnect(!isReconnect)
            setNamespace(defaultNameSpace)
            setImage(imageList[0])
            setResourceData(null)
            setSelectedNodeName(nodeGroups[0].options[0])
        }
        setDebugMode(false)
    }

    function closeTerminalModal(e: any, skipRedirection?: boolean): void {
        try {
            if (typeof closeTerminal === 'function') {
                closeTerminal(skipRedirection)
            }
            setConnectTerminal(false)
            if (isPodCreated && terminalAccessIdRef.current) {
                clusterTerminalDisconnect(terminalAccessIdRef.current)
                    .then(() => {
                        socketDisconnecting()
                        terminalAccessIdRef.current = null
                        toggleOptionChange()
                        setUpdate(false)
                    })
                    .catch((error) => {
                        setConnectTerminal(true)
                        showError(error)
                    })
            }
        } catch (error) {
            setConnectTerminal(true)
            showError(error)
        }
    }

    async function stopTerminalConnection(): Promise<void> {
        try {
            setSocketConnection(SocketConnectionType.DISCONNECTING)
            await clusterTerminalStop(terminalAccessIdRef.current)
        } catch (error) {
            showError(error)
        }
    }

    async function disconnectRetry(): Promise<void> {
        try {
            setPodCreated(true)
            containerRef.current = false
            const response = await clusterDisconnectAndRetry(payload)
            terminalAccessIdRef.current = response.result.terminalAccessId
            setSocketConnection(SocketConnectionType.DISCONNECTED)
            setUpdate(true)
            socketConnecting()
            setRetry(false)
            setConnectTerminal(true)
            toggleOptionChange()
        } catch (error) {
            setPodCreated(false)
            showError(error)
        }
    }

    function sessionError(error): void {
        showError(error)
        if (error instanceof ServerErrors && Array.isArray(error.errors)) {
            error.errors.map(({ userMessage }) => {
                if (userMessage === CLUSTER_STATUS.SESSION_LIMIT_REACHED) {
                    setRetry(true)
                } else if (userMessage === CLUSTER_STATUS.POD_TERMINATED) {
                    setUpdate(false)
                    setPodCreated(false)
                    setManifestData('')
                    setConnectTerminal(false)
                }
            })
        }
    }

    function handleUrlChanges() {
        const queryParams = new URLSearchParams(location.search)
        queryParams.set('image', selectedImage.value)
        queryParams.set('namespace', selectedNamespace.value)
        queryParams.set('shell', selectedTerminalType.value)
        queryParams.set('node', selectedNodeName.value)
        history.replace({
            search: queryParams.toString(),
        })
    }

    const reconnectTerminal = (): void => {
        terminalAccessIdRef.current = null
        socketConnecting()
        setConnectTerminal(true)
        setReconnect(!isReconnect)
        setUpdate(false)
        setManifestData('')
    }

    const reconnectStart = () => {
        reconnectTerminal()
        selectTerminalTab()
    }

    const socketConnecting = (): void => {
        setSocketConnection(SocketConnectionType.CONNECTING)
    }

    const socketDisconnecting = (): void => {
        setSocketConnection(SocketConnectionType.DISCONNECTING)
    }

    const resumePodConnection = (): void => {
        setRetry(false)
        socketConnecting()
    }

    const onChangeNodes = (selected): void => {
        setSelectedNodeName(selected)
        autoSelectNodeRef.current = null
        if (selected.value === AUTO_SELECT.value) {
            setDebugMode(false)
        }
        if (setSelectedNode) {
            setSelectedNode(selected.value)
        }
    }

    const onChangeTerminalType = (selected): void => {
        setSelectedTerminalType(selected)
    }

    const onChangeImages = (selected): void => {
        setImage(selected)
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
        setManifestAvailable(false)
    }

    const selectEventsTab = (): void => {
        setSelectedTabIndex(1)
        setManifestAvailable(false)
    }

    const selectManifestTab = (): void => {
        setSelectedTabIndex(2)
    }

    const clearTerminal = () => {
        setTerminalCleared(!terminalCleared)
    }



    const renderRegisterLinkMatcher = (terminal) => {
        const linkMatcherRegex = new RegExp(`${POD_LINKS.POD_MANIFEST}|${POD_LINKS.POD_EVENTS}`)
        terminal.registerLinkMatcher(linkMatcherRegex, (_event, text) => {
            if (text === POD_LINKS.POD_EVENTS) {
                selectEventsTab()
            } else if (text === POD_LINKS.POD_MANIFEST) {
                selectManifestTab()
            }
        })
    }

    const imageTippyInfo = () => {
        return (
            <div className="p-12 fs-13">
                {CLUSTER_TERMINAL_MESSAGING.SELECT_UTILITY}&nbsp;
                <a href={NETSHOOT_LINK} target="_blank">
                    {CLUSTER_TERMINAL_MESSAGING.NETSHOOT}
                </a>
                ,&nbsp;
                <a href={BUSYBOX_LINK} target="_blank">
                    {CLUSTER_TERMINAL_MESSAGING.BUSYBOX}
                </a>
                {CLUSTER_TERMINAL_MESSAGING.DEBUG_CLUSTER}
                <br />
                <br />
                {CLUSTER_TERMINAL_MESSAGING.PUBLIC_IMAGE}
            </div>
        )
    }

    const imageOptionComponent = (props) => {
        const tippyText = clusterImageDescription(clusterImageList, props.data.value)

        return (
            <Option
                {...props}
                tippyClass="default-tt w-200"
                showTippy={!!tippyText}
                placement="left"
                tippyContent={tippyText}
            />
        )
    }

    const groupHeading = (props) => {
        return <GroupHeading {...props} hideClusterName={true} />
    }

    const terminalClusterDetailsPageClassWrapper = isFullScreen
        ? 'cluster-details-full-screen'
        : 'cluster-details-node-details'

    const terminalTabWrapper = (terminalView: () => JSX.Element) => {
        return (
            <div
                className={`cluster-terminal__wrapper ${isFullScreen ? 'full-screen-terminal' : ''} ${
                    isNodeDetailsPage ? 'node-details-full-screen' : ''
                } ${isClusterDetailsPage ? terminalClusterDetailsPageClassWrapper : ''}`}
            >
                <div className={`${selectedTabIndex === 0 ? 'h-100 flexbox-col' : 'dc__hide-section'}`}>
                    {(!isNodeDetailsPage || connectTerminal) && terminalView}
                </div>
                {selectedTabIndex === 1 && (
                    <div className="h-100 dc__overflow-scroll">
                        <ClusterEvents terminalAccessId={terminalAccessIdRef.current} reconnectStart={reconnectStart} />
                    </div>
                )}
                {selectedTabIndex === 2 && (
                    <div className="h-100">
                        <ClusterManifest
                            terminalAccessId={terminalAccessIdRef.current}
                            manifestMode={manifestButtonState}
                            setManifestMode={setManifestButtonState}
                            setManifestData={setManifestData}
                            errorMessage={manifestErrors}
                            setManifestAvailable={setManifestAvailable}
                            selectTerminalTab={selectTerminalTab}
                        />
                    </div>
                )}
            </div>
        )
    }

    const renderTabs = () => {
        return (
            <ul role="tablist" className="tab-list">
                <li
                    className="tab-list__tab pointer fs-12"
                    data-testid="cluster-terminal-button"
                    onClick={selectTerminalTab}
                >
                    <div className={`tab-hover mb-4 mt-5 cursor ${selectedTabIndex == 0 ? 'active' : ''}`}>
                        {SELECT_TITLE.TERMINAL}
                    </div>
                    {selectedTabIndex == 0 && <div className="node-details__active-tab" />}
                </li>
                {connectTerminal && terminalAccessIdRef.current && (
                    <>
                        <li className="tab-list__tab fs-12" data-testid="pod-events-button" onClick={selectEventsTab}>
                            <div className={`tab-hover mb-4 mt-5 cursor ${selectedTabIndex == 1 ? 'active' : ''}`}>
                                {SELECT_TITLE.POD_EVENTS}
                            </div>
                            {selectedTabIndex == 1 && <div className="node-details__active-tab" />}
                        </li>
                        <li
                            className="tab-list__tab fs-12"
                            data-testid="pod-manifests-button"
                            onClick={selectManifestTab}
                        >
                            <div className={`tab-hover mb-4 mt-5 cursor ${selectedTabIndex == 2 ? 'active' : ''}`}>
                                {SELECT_TITLE.POD_MANIFEST}
                            </div>
                            {selectedTabIndex == 2 && <div className="node-details__active-tab" />}
                        </li>
                    </>
                )}
            </ul>
        )
    }

    const renderErrorMessageStrip = () => {
        if (errorMessage.message === TERMINAL_STATUS.TIMEDOUT) {
            return (
                <div className="pl-20 flex left h-24 pr-20 w-100 bcr-7 cn-0 connection-status-strip">
                    {TERMINAL_TEXT.CONNECTION_TIMEOUT}&nbsp;
                    <span className="cursor dc__underline" onClick={selectEventsTab}>
                        {TERMINAL_TEXT.CHECK_POD_EVENTS}
                    </span>
                    &nbsp;
                    {TERMINAL_TEXT.FOR_ERRORS}&nbsp;
                    <span className="cursor dc__underline" onClick={socketConnecting}>
                        {TERMINAL_TEXT.RETRY_CONNECTION}
                    </span>
                    &nbsp;
                    {TERMINAL_TEXT.CASE_OF_ERROR}
                </div>
            )
        } else if (errorMessage.message === TERMINAL_STATUS.TERMINATED) {
            return (
                <div className="pl-20 pr-20 w-100 bcr-7 cn-0 connection-status-strip">
                    {TERMINAL_TEXT.POD_TERMINATED} {errorMessage.reason}&nbsp;
                    <span className="cursor dc__underline" onClick={reconnectTerminal}>
                        {TERMINAL_TEXT.INITIATE_CONNECTION}
                    </span>
                </div>
            )
        }
        return <div className="pl-20 pr-20 w-100 bcr-7 cn-0 connection-status-strip">{errorMessage.message} </div>
    }

    const renderStripMessage = (): JSX.Element => {
        if (isFetchRetry) {
            return (
                <div className="bcr-7 pl-20 cn-0 connection-status-strip">
                    {TERMINAL_TEXT.CONCURRENT_LIMIT_REACH}&nbsp;
                    <button
                        data-testid="concurrent-limit-reach-link"
                        type="button"
                        onClick={disconnectRetry}
                        className="cursor dc_transparent dc__inline-block dc__underline dc__no-background dc__no-border"
                    >
                        {TERMINAL_TEXT.TERMINATE_RETRY}
                    </button>
                </div>
            )
        } else if (errorMessage.message && errorMessage.message.length > 0) {
            return renderErrorMessageStrip()
        } else if (socketConnection === SocketConnectionType.DISCONNECTED) {
            return (
                <div className="bcr-7 cn-0 pl-20 connection-status-strip">
                    Disconnected
                    <span>.&nbsp;</span>
                    <button
                        data-testid="reconnect-button"
                        type="button"
                        onClick={socketConnecting}
                        className="cursor dc_transparent dc__inline-block dc__underline dc__no-background dc__no-border"
                    >
                        Reconnect
                    </button>
                </div>
            )
        } else if (socketConnection === SocketConnectionType.CONNECTING) {
            return <></>
        }
    }

    const closeManifetsPopup = (isClose: boolean): void => {
        setManifestButtonState(EditModeType.REVIEW)
        setManifestData('')
        setShowPodExistPopup(isClose)
    }

    const hideShell: boolean = !(connectTerminal && isPodCreated && !selectedTabIndex)

    const fullScreenClassWrapper = isFullScreen ? 'cluster-full_screen' : 'cluster-terminal-view-container'
    const nodeDetailsPageClassWrapper = isNodeDetailsPage || isClusterDetailsPage ? '' : 'node-terminal'
    const clusterDetailsPageClassWrapper = isClusterDetailsPage ? 'cluster-details-terminal' : ''

    const selectionListData: TerminalSelectionListDataType = {
        firstRow: [
            {
                type: TerminalWrapperType.TITLE_NAME,
                hideTerminalStripComponent: !clusterName,
                title: SELECT_TITLE.CLUSTER,
                value: clusterName,
                dataTestId: 'cluster-terminal-cluster-name',
            },
            {
                type: TerminalWrapperType.CONNECTION_BUTTON,
                hideTerminalStripComponent: true,
                connectTerminal: connectTerminal,
                closeTerminalModal: closeTerminalModal,
                reconnectTerminal: reconnectTerminal,
            },
            {
                type: TerminalWrapperType.REACT_SELECT,
                classNamePrefix: 'cluster-terminal-node',
                title: SELECT_TITLE.NODE,
                placeholder: 'Select node',
                options: nodeGroups,
                defaultValue: selectedNodeName,
                value: selectedNodeName,
                onChange: onChangeNodes,
                styles: nodeSelect,
                components: {
                    IndicatorSeparator: null,
                    GroupHeading: groupHeading,
                    Option,
                },
            },
            {
                type: TerminalWrapperType.CREATABLE_SELECT,
                showInfoTippy: false,
                classNamePrefix: 'cluster-terminal-name-space',
                title: SELECT_TITLE.NAMESPACE,
                placeholder: 'Select Namespace',
                options: defaultNamespaceList,
                defaultValue: selectedNamespace,
                value: selectedNamespace,
                onChange: onChangeNamespace,
                styles: clusterSelectStyle,
                components: {
                    IndicatorSeparator: null,
                    Option,
                },
            },
            {
                type: TerminalWrapperType.CREATABLE_SELECT,
                title: SELECT_TITLE.IMAGE,
                classNamePrefix: 'cluster-terminal-select-image',
                placeholder: 'Select Image',
                options: imageList,
                showInfoTippy: true,
                defaultValue: selectedImage,
                value: selectedImage,
                onChange: onChangeImages,
                infoContent: imageTippyInfo(),
                styles: clusterImageSelect,
                components: {
                    IndicatorSeparator: null,
                    Option: imageOptionComponent,
                    MenuList: menuComponentForImage,
                },
            },
            {
                type: TerminalWrapperType.CLOSE_EXPAND_VIEW,
                hideTerminalStripComponent: isNodeDetailsPage,
                showExpand: true,
                isFullScreen: isFullScreen,
                toggleScreenView: toggleScreenView,
                closeTerminalModal: closeTerminalModal,
            },
        ],
        secondRow: [
            {
                type: TerminalWrapperType.CUSTOM_COMPONENT,
                customComponent: renderTabs,
            },
            {
                type: TerminalWrapperType.CONNCTION_SWITCH,
                hideTerminalStripComponent: hideShell,
                classNamePrefix: 'cluster-terminal-select-shell',
                stopTerminalConnection,
                resumePodConnection,
                toggleButton:
                    socketConnection === SocketConnectionType.CONNECTING ||
                    socketConnection === SocketConnectionType.CONNECTED,
            },
            {
                type: TerminalWrapperType.CLEAR_BUTTON,
                hideTerminalStripComponent: hideShell,
                setTerminalCleared: clearTerminal,
                dataTestId: 'clear-logs-button',
            },
            {
                type: TerminalWrapperType.CREATABLE_SELECT,
                classNamePrefix: 'cluster-terminal-select-shell',
                hideTerminalStripComponent: hideShell,
                title: SELECT_TITLE.SHELL,
                placeholder: 'Select Shell',
                options: clusterShellTypes,
                defaultValue: selectedTerminalType,
                onChange: onChangeTerminalType,
                styles: clusterSelectStyle,
                components: {
                    IndicatorSeparator: null,
                    Option,
                },
            },
            {
                type: TerminalWrapperType.DEBUG_MODE_TOGGLE_BUTTON,
                hideTerminalStripComponent: hideShell || selectedNodeName.value === AUTO_SELECT.value,
                showInfoTippy: true,
                onToggle: setDebugMode,
                isEnabled: debugMode,
            },
            {
                type: TerminalWrapperType.MANIFEST_EDIT_BUTTONS,
                hideTerminalStripComponent: !(selectedTabIndex === 2 && isManifestAvailable),
                buttonSelectionState: manifestButtonState,
                setManifestButtonState: setManifestButtonState,
            },
        ],
        tabSwitcher: {
            terminalTabWrapper: terminalTabWrapper,
            terminalData: {
                terminalRef: terminalRef,
                dataTestId: 'cluster-terminal-view',
                clearTerminal: terminalCleared,
                terminalMessageData: preFetchData,
                renderConnectionStrip: renderStripMessage(),
                setSocketConnection: setSocketConnection,
                socketConnection: socketConnection,
                isTerminalTab: !selectedTabIndex,
                sessionId: sessionId,
                registerLinkMatcher: renderRegisterLinkMatcher,
            },
        },
    }

    return (
        <div className={`${showTerminal ? '' : 'cluster-terminal-hidden'}`}>
            <TerminalWrapper
                selectionListData={selectionListData}
                socketConnection={socketConnection}
                setSocketConnection={setSocketConnection}
                className={`${fullScreenClassWrapper} ${nodeDetailsPageClassWrapper} ${clusterDetailsPageClassWrapper} ${
                    isNodeDetailsPage ? '' : 'dc__border-top'
                }`}
            />
            {showPodExistPopup && (
                <ManifestPopupMenu
                    closePopup={closeManifetsPopup}
                    podName={resourceData?.podName}
                    namespace={resourceData?.namespace}
                    forceDeletePod={setForceDelete}
                />
            )}
        </div>
    )
}
