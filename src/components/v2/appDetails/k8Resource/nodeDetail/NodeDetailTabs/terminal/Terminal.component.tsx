import React, { useEffect, useState } from "react";
import { elementDidMount } from "../../../../../../common";
import CopyToast, { handleSelectionChange } from "../CopyToast";
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import * as XtermWebfont from 'xterm-webfont'
import SockJS from 'sockjs-client'
import { POD_LINKS, SocketConnectionType } from "../node.type";
import IndexStore from '../../../../index.store'
import { AppType } from "../../../../appDetails.type";
import moment from "moment";
import { CLUSTER_STATUS } from "../../../../../../ClusterNodes/constants";
import { TERMINAL_STATUS } from "./constants";

let socket = undefined
let terminal = undefined
let fitAddon = undefined
let clusterTimeOut = undefined

export default function TerminalView({
    terminalRef,
    initializeTerminal,
    socketConnection,
    setSocketConnection,
    isTerminalTab = true,
    renderConnectionStrip,
    registerLinkMatcher,
    terminalMessageData
}){
    const [firstMessageReceived, setFirstMessageReceived] = useState(false)
    const [isReconnection, setIsReconnection] = useState(false)
    const appDetails = IndexStore.getAppDetails()


    const [popupText, setPopupText] = useState<boolean>(false)

    const resizeSocket = () => {
        if (terminal && fitAddon && isTerminalTab) {
            const dim = fitAddon.proposeDimensions()
            if (dim && socket?.readyState === WebSocket.OPEN) {
                socket?.send(JSON.stringify({ Op: 'resize', Cols: dim.cols, Rows: dim.rows }))
            }
            fitAddon.fit()
        }
    }

    useEffect(() => {
        if(initializeTerminal.createNewTerminal && !terminal){
            elementDidMount('#terminal-id').then(() => {
                createNewTerminal()
            })
        }
        if(initializeTerminal.sessionId && terminal){
            postInitialize(initializeTerminal.sessionId)
        }
    },[initializeTerminal])

    useEffect(() => {
        if (!popupText) return
        setTimeout(() => setPopupText(false), 2000)
    }, [popupText])

    useEffect(() => {
        if (socketConnection === SocketConnectionType.DISCONNECTING) {
            if (clusterTimeOut) {
                clearTimeout(clusterTimeOut)
            }
            if (socket) {
                socket.close()
                socket = undefined
            }
        }
    }, [socketConnection])

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
        terminalRef.current = terminal
        handleSelectionChange(terminal, setPopupText)
        fitAddon = new FitAddon()
        const webFontAddon = new XtermWebfont()
        terminal.loadAddon(fitAddon)
        terminal.loadAddon(webFontAddon)
        const linkMatcherRegex = new RegExp(`${POD_LINKS.POD_MANIFEST}|${POD_LINKS.POD_EVENTS}`)
        terminal.registerLinkMatcher(linkMatcherRegex, registerLinkMatcher)
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

    const generateSocketURL = () => {
        let socketURL = process.env.REACT_APP_ORCHESTRATOR_ROOT
        if (appDetails.appType !== AppType.EXTERNAL_HELM_CHART) {
            socketURL += '/api/vi/pod/exec/ws/'
        } else {
            socketURL += '/k8s/pod/exec/sockjs/ws/'
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
            if (typeof terminalMessageData === 'function') {
                terminalMessageData(CLUSTER_STATUS.RUNNING, TERMINAL_STATUS.SUCCEDED)
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
            // if () {
            //     _terminal.writeln('')
            //     _terminal.writeln('---------------------------------------------')
            //     _terminal.writeln(`Disconnected at ${moment().format('DD-MMM-YYYY')} at ${moment().format('hh:mm A')}`)
            //     _terminal.writeln('---------------------------------------------')
            // }
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
                fitAddon.fit()
            }
            terminal.setOption('cursorBlink', true)
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
            socket?.close()
            terminal?.dispose()
            socket = undefined
            terminalRef.current = undefined
            terminal = undefined
            fitAddon = undefined
            clearTimeout(clusterTimeOut)

        }
    }, [])


    return (
        <div className="terminal-view h-100 w-100">
            {renderConnectionStrip()}
            <div
                id="terminal-id"
                className="w-100"
            >
                <CopyToast showCopyToast={popupText} />
            </div>
        </div>
    )
    
}
