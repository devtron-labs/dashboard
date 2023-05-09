import moment from 'moment'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import CopyToast, { handleSelectionChange } from '../CopyToast'
import * as XtermWebfont from 'xterm-webfont'
import SockJS from 'sockjs-client'
import { ErrorMessageType, ERROR_MESSAGE, POD_LINKS, SocketConnectionType, TerminalViewProps } from '../node.type'
import ReactGA from 'react-ga4'
import IndexStore from '../../../../index.store'
import { AppType, DeploymentAppType } from '../../../../appDetails.type'
import { elementDidMount, useOnline } from '../../../../../../common'
import { get, ServerErrors, showError } from '@devtron-labs/devtron-fe-common-lib'
import { SERVER_MODE } from '../../../../../../../config'
import { mainContext } from '../../../../../../common/navigation/NavigationRoutes'
import { CLUSTER_STATUS } from '../../../../../../ClusterNodes/constants'
import './terminal.css'
import { TERMINAL_RESOURCE_GA, termialGAEvents, TERMINAL_STATUS, TERMINAL_TEXT } from './constants'
import { getAppId, getDevtronAppId } from '../../nodeDetail.api'

let socket = undefined
let terminal = undefined
let fitAddon = undefined
let clusterTimeOut = undefined

function TerminalView(terminalViewProps: TerminalViewProps) {
    const [ga_session_duration, setGA_session_duration] = useState<moment.Moment>()
    const [isReconnection, setIsReconnection] = useState(false)
    const [firstMessageReceived, setFirstMessageReceived] = useState(false)
    const [popupText, setPopupText] = useState<boolean>(false)
    const isOnline = useOnline()
    const [errorMessage, setErrorMessage] = useState<ErrorMessageType>({message: '', reason: ''})
    const socketConnectionRef = useRef<SocketConnectionType>(terminalViewProps.socketConnection)
    const { serverMode } = useContext(mainContext)
    const autoSelectNodeRef = useRef('')
    const prevNodeRef = useRef('')
    const currNodeRef = useRef('')

    const resizeSocket = () => {
        if (terminal && fitAddon && terminalViewProps.isTerminalTab) {
            const dim = fitAddon.proposeDimensions()
            if (dim && socket?.readyState === WebSocket.OPEN) {
                socket?.send(JSON.stringify({ Op: 'resize', Cols: dim.cols, Rows: dim.rows }))
            }
            fitAddon.fit()
        }
    }
    useEffect(() => {
        if (!popupText) return
        setTimeout(() => setPopupText(false), 2000)
    }, [popupText])

    useEffect(() => {
        resizeSocket()
    }, [terminalViewProps.isFullScreen])

    const appDetails = IndexStore.getAppDetails()

    const createNewTerminal = () => {
        terminal = new Terminal({
            scrollback: 99999,
            fontSize: 14,
            lineHeight: 1.4,
            cursorBlink: false,
            fontFamily: 'Inconsolata',
            screenReaderMode: true,
            theme: {
                background: '#0B0F22',
                foreground: '#FFFFFF',
            },
        })
        handleSelectionChange(terminal, setPopupText)
        fitAddon = new FitAddon()
        const webFontAddon = new XtermWebfont()
        terminal.loadAddon(fitAddon)
        terminal.loadAddon(webFontAddon)
        const linkMatcherRegex = new RegExp(`${POD_LINKS.POD_MANIFEST}|${POD_LINKS.POD_EVENTS}`)
        terminal.registerLinkMatcher(linkMatcherRegex, (_event, text) => {
            if (text === POD_LINKS.POD_EVENTS) {
                terminalViewProps.setTerminalTab(1)
            } else if (text === POD_LINKS.POD_MANIFEST) {
                terminalViewProps.setTerminalTab(2)
            }
        })
        terminal.loadWebfontAndOpen(document.getElementById('terminal-id'))
        fitAddon.fit()
        terminal.reset()
        terminal.attachCustomKeyEventHandler((event) => {
            if ((event.metaKey && event.key === 'k') || event.key === 'K') {
                terminal?.clear()
            }

            return true
        })
    }
    // TODO: Verify
    const generateSocketURL = () => {
        let socketURL = process.env.REACT_APP_ORCHESTRATOR_ROOT
        if (
            terminalViewProps.isResourceBrowserView ||
            appDetails.appType === AppType.EXTERNAL_HELM_CHART ||
            (terminalViewProps.isClusterTerminal && serverMode === SERVER_MODE.EA_ONLY)
        ) {
            socketURL += '/k8s/pod/exec/sockjs/ws/'
        } else {
            socketURL += '/api/vi/pod/exec/ws/'
        }

        return socketURL
    }

    const postInitialize = (sessionId: string) => {
        const socketURL = generateSocketURL()

        socket?.close()
        setFirstMessageReceived(false)

        socket = new SockJS(socketURL)
        const _socket = socket
        const _terminal = terminal
        const _fitAddon = fitAddon

        const disableInput = (): void => {
            _terminal.setOption('cursorBlink', false)
            _terminal.setOption('disableStdin', true)
            setFirstMessageReceived(false)
        }

        const enableInput = (): void => {
            _terminal.setOption('cursorBlink', true)
            _terminal.setOption('disableStdin', false)
        }

        _terminal.onData(function (data) {
            resizeSocket()
            const inData = { Op: 'stdin', SessionID: '', Data: data }
            if (_socket.readyState === WebSocket.OPEN) {
                _socket?.send(JSON.stringify(inData))
            }
        })

        _socket.onopen = function () {
            if (terminalViewProps.isClusterTerminal) {
                preFetchData(CLUSTER_STATUS.RUNNING, TERMINAL_STATUS.SUCCEDED)
            }
            const startData = { Op: 'bind', SessionID: sessionId }
            _socket.send(JSON.stringify(startData))

            let dim = _fitAddon.proposeDimensions()
            if (dim) {
                _socket.send(JSON.stringify({ Op: 'resize', Cols: dim.cols, Rows: dim.rows }))
            }
            _terminal.focus()
            if (isReconnection) {
                _terminal.writeln('')
                _terminal.writeln('---------------------------------------------')
                _terminal.writeln(`Reconnected at ${moment().format('DD-MMM-YYYY')} at ${moment().format('hh:mm A')}`)
                _terminal.writeln('---------------------------------------------')
                setIsReconnection(false)
            }
        }

        _socket.onmessage = function (evt) {
            _terminal.write(JSON.parse(evt.data).Data)
            enableInput()

            if (!firstMessageReceived) {
                setFirstMessageReceived(true)
            }
        }

        _socket.onclose = function (evt) {
            disableInput()
            if (terminalViewProps.isClusterTerminal) {
                _terminal.writeln('')
                _terminal.writeln('---------------------------------------------')
                _terminal.writeln(`Disconnected at ${moment().format('DD-MMM-YYYY')} at ${moment().format('hh:mm A')}`)
                _terminal.writeln('---------------------------------------------')
            }
            terminalViewProps.setSocketConnection(SocketConnectionType.DISCONNECTED)
        }

        _socket.onerror = function (evt) {
            disableInput()
            terminalViewProps.setSocketConnection(SocketConnectionType.DISCONNECTED)
        }
    }

    const reconnect = () => {
        terminalViewProps.setSocketConnection(SocketConnectionType.DISCONNECTING)

        terminal?.reset()

        if (terminalViewProps.isClusterTerminal) {
            terminalViewProps.setSocketConnection(SocketConnectionType.CONNECTING)
        } else {
            setTimeout(() => {
                terminalViewProps.setSocketConnection(SocketConnectionType.CONNECTING)
            }, 100)
        }
    }

    const preFetchData = (podState = '', status = '') => {
        const _terminal = terminal
        let startingText = TERMINAL_STATUS.CREATE
        if (!_terminal) return

        _terminal?.reset()

        if(prevNodeRef.current === TERMINAL_STATUS.AUTO_SELECT_NODE){
            _terminal.write('Selecting a node')
            if(currNodeRef.current){
                _terminal.write(` > ${currNodeRef.current} selected`)
                _terminal.writeln('')
            }else {
                _terminal.write('...')
            }
        }

        if(prevNodeRef.current !== TERMINAL_STATUS.AUTO_SELECT_NODE || currNodeRef.current){
            if(terminalViewProps.isShellSwitched){
                startingText = TERMINAL_STATUS.SHELL
            }

            if(startingText){
                if(startingText === TERMINAL_STATUS.CREATE){
                    _terminal.write('Creating pod.')
                } else if(startingText === TERMINAL_STATUS.SHELL){
                    _terminal.write(`Switching shell to ${terminalViewProps.shell.value}.`)
                }
            }
            if(startingText !== TERMINAL_STATUS.SHELL && podState){
                if (podState === CLUSTER_STATUS.RUNNING) {
                    _terminal.write(' \u001b[38;5;35mSucceeded\u001b[0m')
                    _terminal.writeln('')
                    _terminal.write('Connecting to pod terminal.')
                }
            }

            if(status){
                if (status === TERMINAL_STATUS.TIMEDOUT) {
                    _terminal.write(' \u001b[38;5;196mTimed out\u001b[0m')
                } else if (status === TERMINAL_STATUS.FAILED){
                    _terminal.write(' \u001b[38;5;196mFailed\u001b[0m')
                } else if (status === TERMINAL_STATUS.SUCCEDED) {
                    _terminal.write(' \u001b[38;5;35mSucceeded\u001b[0m')
                }
                _terminal.write(' | \u001b[38;5;110m\u001b[4mCheck Pod Events\u001b[0m')
                _terminal.write(' | ')
                _terminal.write('\u001b[38;5;110m\u001b[4mCheck Pod Manifest\u001b[0m')
                _terminal.writeln('')
            } else {
                _terminal.write('..')
            }
        }
    }

    useEffect(() => {
        // Maintaining value in ref for setTimeout context
        socketConnectionRef.current = terminalViewProps.socketConnection
        if (terminalViewProps.socketConnection === SocketConnectionType.DISCONNECTING) {
            if (clusterTimeOut) {
                clearTimeout(clusterTimeOut)
            }
            if (socket) {
                socket.close()
                socket = undefined
            }
        }
        if (terminalViewProps.socketConnection === SocketConnectionType.CONNECTING) {
            setErrorMessage({message: '', reason: ''})
            autoSelectNodeRef.current = terminalViewProps.terminalId
            prevNodeRef.current = terminalViewProps.nodeName
            currNodeRef.current = ''
            getNewSession()
        }
    }, [terminalViewProps.socketConnection, terminalViewProps.terminalId])

    useEffect(() => {
        ReactGA.event(termialGAEvents(TERMINAL_RESOURCE_GA.POD,terminalViewProps))
        reconnect()
    }, [terminalViewProps.nodeName])

    useEffect(() => {
        ReactGA.event(termialGAEvents(TERMINAL_RESOURCE_GA.CONTAINER,terminalViewProps))
        reconnect()
    }, [terminalViewProps.containerName])

    useEffect(() => {
        ReactGA.event(termialGAEvents(TERMINAL_RESOURCE_GA.SHELL,terminalViewProps))
        reconnect()
    }, [terminalViewProps.shell])

    useEffect(() => {
        terminal?.reset()
    }, [terminalViewProps.isToggleOption])

    useEffect(() => {
        if (terminalViewProps.isTerminalCleared) {
            terminal?.clear()
            terminal?.focus()
            terminalViewProps.setTerminalCleared(false)
        }
    }, [terminalViewProps.isTerminalCleared])

    useEffect(() => {
        if (firstMessageReceived) {
            if (terminalViewProps.isClusterTerminal) {
                if (terminalViewProps.isTerminalTab) {
                    fitAddon.fit()
                }
            } else {
                fitAddon.fit()
            }
            terminal.setOption('cursorBlink', true)
            terminalViewProps.setSocketConnection(SocketConnectionType.CONNECTED)
        }
    }, [firstMessageReceived, terminalViewProps.isTerminalTab])

    useEffect(() => {
        if (!window.location.origin) {
            // Some browsers (mainly IE) do not have this property, so we need to build it manually...
            // @ts-ignore
            window.location.origin =
                window.location.protocol +
                '//' +
                window.location.hostname +
                (window.location.port ? ':' + window.location.port : '')
        }

        terminalViewProps.setSocketConnection(SocketConnectionType.CONNECTING)

        ReactGA.event({
            category: 'Terminal',
            action: 'Open',
        })

        setGA_session_duration(moment())

        return () => {
            socket?.close()
            terminal?.dispose()

            socket = undefined
            terminal = undefined
            fitAddon = undefined
            clearTimeout(clusterTimeOut)

            let duration = moment(ga_session_duration).fromNow()

            ReactGA.event({
                category: 'Terminal',
                action: `Closed`,
                label: `${duration}`,
            })
        }
    }, [])

    useEffect(() => {
        if (terminalViewProps.isTerminalCleared) {
            terminal?.clear()
            terminal?.focus()
            terminalViewProps.setTerminalCleared(false)
        }
    }, [terminalViewProps.isTerminalCleared])

    const getClusterData = (url, count) => {
        if(autoSelectNodeRef.current !== terminalViewProps.terminalId) return
        if (
            clusterTimeOut &&
            (socketConnectionRef.current === SocketConnectionType.DISCONNECTED ||
                socketConnectionRef.current === SocketConnectionType.DISCONNECTING)
        ) {
            clearTimeout(clusterTimeOut)
            return
        }
        if (!terminal) {
            elementDidMount('#terminal-id').then(() => {
                createNewTerminal()
                preFetchData()
            })
        }
        get(url)
            .then((response: any) => {
                let sessionId = response.result.userTerminalSessionId
                let status = response.result.status
                if(status === TERMINAL_STATUS.RUNNING && !response.result?.isValidShell){
                    preFetchData(status, TERMINAL_STATUS.FAILED)
                    setErrorMessage({message: response.result?.errorReason, reason: ''})
                } else if (status === TERMINAL_STATUS.TERMINATED){
                    setErrorMessage({message: status, reason: response.result?.errorReason })
                } else if (!sessionId && count) {
                    preFetchData(status)
                    clusterTimeOut = setTimeout(() => {
                        getClusterData(url, count - 1)
                    }, window?._env_?.CLUSTER_TERMINAL_CONNECTION_POLLING_INTERVAL || 7000)
                } else if (sessionId) {
                    const _nodeName = response.result?.nodeName
                    if(terminalViewProps.nodeName === TERMINAL_STATUS.AUTO_SELECT_NODE){
                        terminalViewProps.setSelectedNodeName({value: _nodeName,label: _nodeName})
                    }
                    if (socketConnectionRef.current === SocketConnectionType.CONNECTING) {
                        postInitialize(sessionId)
                        currNodeRef.current = _nodeName
                        preFetchData(status)
                    }
                } else {
                    preFetchData(CLUSTER_STATUS.FAILED, TERMINAL_STATUS.TIMEDOUT)
                    terminalViewProps.setSocketConnection(SocketConnectionType.DISCONNECTED)
                    setErrorMessage({message: TERMINAL_STATUS.TIMEDOUT, reason: ''})
                }
            })
            .catch((err) => {
                clearTimeout(clusterTimeOut)
                terminalViewProps.sessionError(err)
                terminal?.reset()
            })
    }

    const generateSessionURL = () => {
        const appId =
            appDetails.appType == AppType.DEVTRON_APP
                ? getDevtronAppId(appDetails.clusterId, appDetails.appId, appDetails.environmentId)
                : getAppId(
                      appDetails.clusterId,
                      appDetails.namespace,
                      appDetails.deploymentAppType == DeploymentAppType.argo_cd
                          ? `${appDetails.appName}`
                          : appDetails.appName,
                  )
        
        let url: string = 'k8s/pod/exec/session/'
        if (terminalViewProps.isResourceBrowserView) {
            url += `${terminalViewProps.selectedResource.clusterId}`
        } else {
            url += `${appId}`
        }
        url += `/${
            terminalViewProps.isResourceBrowserView
                ? terminalViewProps.selectedResource.namespace
                : appDetails.namespace
            }/${terminalViewProps.nodeName}/${terminalViewProps.shell.value}/${terminalViewProps.containerName}`
        
        if (!terminalViewProps.isResourceBrowserView) { 
            return url+`?appType=${appDetails.appType === AppType.DEVTRON_APP ? '0' : '1'}`
        }
        return url
    }

    const getNewSession = () => {
        if (terminalViewProps.isClusterTerminal) {
            if (!terminalViewProps.terminalId) return
            terminalViewProps.setSocketConnection(SocketConnectionType.CONNECTING)
            getClusterData(
                `user/terminal/get?namespace=${terminalViewProps.selectedNamespace}&shellName=${terminalViewProps.shell.value}&terminalAccessId=${terminalViewProps.terminalId}`,
                window?._env_?.CLUSTER_TERMINAL_CONNECTION_RETRY_COUNT || 7,
            )
        } else {
            if (
                !terminalViewProps.nodeName ||
                !terminalViewProps.containerName ||
                !terminalViewProps.shell.value ||
                (!terminalViewProps.isResourceBrowserView && !appDetails)
            ) {
                return
            }

            get(generateSessionURL())
                .then((response: any) => {
                    const sessionId = response?.result.SessionID
                    if (!terminal) {
                        elementDidMount('#terminal-id').then(() => {
                            createNewTerminal()
                            postInitialize(sessionId)
                        })
                    } else {
                        postInitialize(sessionId)
                    }
                })
                .catch((err) => {
                    showError(err)
                    if (err instanceof ServerErrors && Array.isArray(err.errors)) {
                        const _invalidNameErr = err.errors[0].userMessage
                        if (_invalidNameErr?.includes('Unauthorized')) {
                            setErrorMessage({message: ERROR_MESSAGE.UNAUTHORIZED, reason: ''})
                        }
                    }
                })
        }
    }

    const onClickResume = (e): void => {
        e.stopPropagation()
        terminalViewProps.setSocketConnection(SocketConnectionType.CONNECTING)
        setIsReconnection(true)
    }

    const switchTOPodEventTab = () => {
        terminalViewProps.setTerminalTab(1)
    }

    const renderErrorMessageStrip = (errorMessage) => {
        if (errorMessage.message === TERMINAL_STATUS.TIMEDOUT) {
            return (
                <div className="pl-20 flex left h-24 pr-20 w-100 bcr-7 cn-0">
                    {TERMINAL_TEXT.CONNECTION_TIMEOUT}&nbsp;
                    <u className="cursor" onClick={switchTOPodEventTab}>
                        {TERMINAL_TEXT.CHECK_POD_EVENTS}
                    </u>&nbsp;
                    {TERMINAL_TEXT.FOR_ERRORS}&nbsp;
                    <u
                        className="cursor"
                        onClick={onClickResume}
                    >
                        {TERMINAL_TEXT.RETRY_CONNECTION}
                    </u>&nbsp;
                    {TERMINAL_TEXT.CASE_OF_ERROR}
                </div>
            )
        } else if (errorMessage.message === TERMINAL_STATUS.TERMINATED) {
            return (
                <div className="pl-20 pr-20 w-100 bcr-7 cn-0">
                    {TERMINAL_TEXT.POD_TERMINATED} {errorMessage.reason}&nbsp;
                    <u className="cursor" onClick={terminalViewProps.reconnectTerminal}>
                        {TERMINAL_TEXT.INITIATE_CONNECTION}
                    </u>
                </div>
            )
        }
        return <div className="pl-20 pr-20 w-100 bcr-7 cn-0">{errorMessage.message} </div>
    }

    const clusterSocketConnecting: boolean =
        terminalViewProps.isClusterTerminal && terminalViewProps.socketConnection === SocketConnectionType.CONNECTING

    const renderConnectionStrip = () => {
        if (!isOnline) {
            return (
                <div className="terminal-strip pl-20 pr-20 w-100 bcr-7 cn-0">
                    {TERMINAL_TEXT.OFFLINE_CHECK_CONNECTION}
                </div>
            )
        } else if (terminalViewProps.isClusterTerminal && !terminalViewProps.isPodConnected) {
            return
        } else if (terminalViewProps.isFetchRetry) {
            return (
                <div className="bcr-7 pl-20 cn-0">
                    {TERMINAL_TEXT.CONCURRENT_LIMIT_REACH}&nbsp;
                    <button
                        type="button"
                        onClick={terminalViewProps.disconnectRetry}
                        className="cursor dc_transparent dc__inline-block dc__underline dc__no-background dc__no-border"
                    >
                        {TERMINAL_TEXT.TERMINATE_RETRY}
                    </button>
                </div>
            )
        } else {
            return (
                <div className="terminal-strip">
                    {errorMessage.message && errorMessage.message.length > 0 ? (
                        renderErrorMessageStrip(errorMessage)
                    ) : (
                        <div
                            data-testid="terminal-strip-message"
                            className={`dc__first-letter-capitalize ${
                                terminalViewProps.socketConnection !== SocketConnectionType.CONNECTED &&
                                !clusterSocketConnecting
                                    ? `${
                                          terminalViewProps.socketConnection === SocketConnectionType.CONNECTING
                                              ? 'bcy-2'
                                              : 'bcr-7'
                                      }  pl-20`
                                    : 'pb-10'
                            } ${
                                terminalViewProps.socketConnection === SocketConnectionType.CONNECTING ? 'cn-9' : 'cn-0'
                            } m-0 pl-20 w-100`}
                        >
                            {terminalViewProps.socketConnection !== SocketConnectionType.CONNECTED &&
                                !clusterSocketConnecting && (
                                    <span
                                        className={
                                            terminalViewProps.socketConnection === SocketConnectionType.CONNECTING
                                                ? 'dc__loading-dots'
                                                : ''
                                        }
                                    >
                                        {terminalViewProps.socketConnection?.toLowerCase()}
                                    </span>
                                )}
                            {terminalViewProps.socketConnection === SocketConnectionType.DISCONNECTED && (
                                <React.Fragment>
                                    <span>.&nbsp;</span>
                                    <button
                                        data-testid="reconnect-button"
                                        type="button"
                                        onClick={onClickResume}
                                        className="cursor dc_transparent dc__inline-block dc__underline dc__no-background dc__no-border"
                                    >
                                        {terminalViewProps.isClusterTerminal ? 'Reconnect' : 'Resume'}
                                    </button>
                                </React.Fragment>
                            )}
                        </div>
                    )}
                </div>
            )
        }
    }

    return (
        <div data-testid={terminalViewProps.dataTestId} className="terminal-view h-100 w-100">
            {renderConnectionStrip()}
            <div
                id="terminal-id"
                data-testid="terminal-editor-container"
                className={`terminal-container ml-20 ${
                    terminalViewProps.isResourceBrowserView &&
                    isOnline &&
                    terminalViewProps.socketConnection === SocketConnectionType.CONNECTED
                        ? 'resource-terminal-connected'
                        : ''
                }`}
            >
                <CopyToast showCopyToast={popupText} />
            </div>
        </div>
    )
}

export default TerminalView
