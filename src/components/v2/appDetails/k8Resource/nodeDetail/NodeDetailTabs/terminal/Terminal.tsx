import React, { useEffect, useRef, useState} from 'react'
import { elementDidMount, useHeightObserver } from '../../../../../../common/helpers/Helpers'
import CopyToast, { handleSelectionChange } from '../CopyToast'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import * as XtermWebfont from 'xterm-webfont'
import SockJS from 'sockjs-client'
import moment from 'moment'
import { CLUSTER_STATUS, SocketConnectionType } from '../../../../../../ClusterNodes/constants'
import { TERMINAL_STATUS } from './constants'
import './terminal.scss'
import { TerminalViewType } from './terminal.type'

let fitAddon
let clusterTimeOut

export default function TerminalView({
    terminalRef,
    sessionId,
    socketConnection,
    setSocketConnection,
    isTerminalTab = true,
    renderConnectionStrip,
    registerLinkMatcher,
    terminalMessageData,
    clearTerminal,
    dataTestId
}: TerminalViewType) {
    const socket = useRef(null)
    const [firstMessageReceived, setFirstMessageReceived] = useState(false)
    const [isReconnection, setIsReconnection] = useState(false)
    const [popupText, setPopupText] = useState<boolean>(false)

    function resizeSocket() {
        if (terminalRef.current && fitAddon && isTerminalTab) {
            const dim = fitAddon?.proposeDimensions()
            if (dim && socket.current?.readyState === WebSocket.OPEN) {
                socket.current?.send(JSON.stringify({ Op: 'resize', Cols: dim.cols, Rows: dim.rows }))
            }
            fitAddon?.fit()
        }
    }

    const [myDivRef] = useHeightObserver(resizeSocket)

    useEffect(() => {
        if (!terminalRef.current) {
            elementDidMount('#terminal-id').then(() => {
                createNewTerminal()
            })
        }
        if (sessionId && terminalRef.current) {
            setIsReconnection(true)
            postInitialize(sessionId)
        } else {
            setSocketConnection(SocketConnectionType.DISCONNECTED)
        }
    }, [sessionId])

    useEffect(() => {
        if (popupText) {
            setTimeout(() => setPopupText(false), 2000)
        }
    }, [popupText])

    useEffect(() => {
        if (socketConnection === SocketConnectionType.DISCONNECTING) {
            if (clusterTimeOut) {
                clearTimeout(clusterTimeOut)
            }
            if (socket.current) {
                socket.current.close()
                socket.current = undefined
            }
        }
    }, [socketConnection])

    const createNewTerminal = () => {
        terminalRef.current = new Terminal({
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
        handleSelectionChange(terminalRef.current, setPopupText)
        fitAddon = new FitAddon()
        const webFontAddon = new XtermWebfont()
        terminalRef.current.loadAddon(fitAddon)
        terminalRef.current.loadAddon(webFontAddon)
        if (typeof registerLinkMatcher === 'function') {
            registerLinkMatcher(terminalRef.current)
        }
        terminalRef.current.loadWebfontAndOpen(document.getElementById('terminal-id'))
        fitAddon?.fit()
        terminalRef.current.reset()
        terminalRef.current.attachCustomKeyEventHandler((event) => {
            if ((event.metaKey && event.key === 'k') || event.key === 'K') {
                terminalRef.current?.clear()
            }

            return true
        })
    }

    const generateSocketURL = () => {
        let socketURL = process.env.REACT_APP_ORCHESTRATOR_ROOT
        socketURL += '/k8s/pod/exec/sockjs/ws/'
        return socketURL
    }

    const postInitialize = (sessionId: string) => {
        const socketURL = generateSocketURL()

        socket.current?.close()
        setFirstMessageReceived(false)

        socket.current = new SockJS(socketURL)
        const _socket = socket.current
        const _terminal = terminalRef.current
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
            if (_socket?.readyState === WebSocket.OPEN) {
                _socket?.send(JSON.stringify(inData))
            }
        })

        _socket.onopen = function () {
            if (typeof terminalMessageData === 'function') {
                terminalMessageData(CLUSTER_STATUS.RUNNING, TERMINAL_STATUS.SUCCEDED)
            }
            const startData = { Op: 'bind', SessionID: sessionId }
            _socket.send(JSON.stringify(startData))

            let dim = _fitAddon?.proposeDimensions()
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
            _terminal.writeln('')
            _terminal.writeln('---------------------------------------------')
            _terminal.writeln(`Disconnected at ${moment().format('DD-MMM-YYYY')} at ${moment().format('hh:mm A')}`)
            _terminal.writeln('---------------------------------------------')
            setSocketConnection(SocketConnectionType.DISCONNECTED)
        }

        _socket.onerror = function (evt) {
            disableInput()
            setSocketConnection(SocketConnectionType.DISCONNECTED)
        }
    }

    useEffect(() => {
        if (firstMessageReceived) {
            if (isTerminalTab) {
                fitAddon?.fit()
            }
            terminalRef.current.setOption('cursorBlink', true)
            setSocketConnection(SocketConnectionType.CONNECTED)
        }
    }, [firstMessageReceived, isTerminalTab])

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

        setSocketConnection(SocketConnectionType.CONNECTING)

        return () => {
            socket.current?.close()
            terminalRef.current?.dispose()
            socket.current = undefined
            terminalRef.current = undefined
            terminalRef.current = undefined
            fitAddon = undefined
            clearTimeout(clusterTimeOut)
        }
    }, [])

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.clear()
            terminalRef.current.focus()
        }
    }, [clearTerminal])

    return (
        <div className="terminal-wrapper" data-testid={dataTestId}>
            {renderConnectionStrip()}
            <div ref={myDivRef} id="terminal-id" data-testid="terminal-editor-container" className="mt-8 mb-4 terminal-component ml-20">
                <CopyToast showCopyToast={popupText} />
            </div>
        </div>
    )
}
