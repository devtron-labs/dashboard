/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import * as XtermWebfont from 'xterm-webfont'
import SockJS from 'sockjs-client'
import moment from 'moment'
import CopyToast, { handleSelectionChange } from '../CopyToast'
import { elementDidMount } from '../../../../../../common/helpers/Helpers'
import { CLUSTER_STATUS, SocketConnectionType } from '../../../../../../ClusterNodes/constants'
import { TERMINAL_STATUS } from './constants'
import './terminal.scss'
import { TerminalViewType } from './terminal.type'
import { restrictXtermAccessibilityWidth } from './terminal.utils'
import { useMainContext, LogResizeButton } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICDevtronLogo } from '@Icons/ic-devtron.svg'

export default function TerminalView({
    terminalRef,
    sessionId,
    socketConnection,
    setSocketConnection,
    isTerminalTab = true,
    renderConnectionStrip,
    metadata,
    registerLinkMatcher,
    terminalMessageData,
    clearTerminal,
    dataTestId,
    isResourceBrowserView,
}: TerminalViewType) {
    const socket = useRef(null)
    const termDivRef = useRef(null)
    const [firstMessageReceived, setFirstMessageReceived] = useState(false)
    const [isReconnection, setIsReconnection] = useState(false)
    const [fullScreenView, setFullScreenView] = useState(false)
    const [popupText, setPopupText] = useState<boolean>(false)
    const fitAddon = useRef(null)
    const { isSuperAdmin } = useMainContext()

    function resizeSocket() {
        if (terminalRef.current && fitAddon.current && isTerminalTab) {
            const dim = fitAddon.current?.proposeDimensions()
            if (!dim || isNaN(dim.cols) || isNaN(dim.rows)) {
                return
            }
            if (socket.current?.readyState === WebSocket.OPEN) {
                socket.current.send(JSON.stringify({ Op: 'resize', Cols: dim.cols, Rows: dim.rows }))
            }
            fitAddon.current?.fit()
        }
    }

    useEffect(() => {
        /* requestAnimationFrame: will defer the resizeSocket callback to the next repaint;
         * sparing us from - ResizeObserver loop completed with undelivered notifications */
        if (!termDivRef.current) {
            return
        }
        const observer = new ResizeObserver(() => window.requestAnimationFrame(resizeSocket))
        observer.observe(termDivRef.current)
        return () => observer.disconnect()
    }, [termDivRef.current])

    useEffect(() => {
        if (!terminalRef.current) {
            elementDidMount('#terminal-id').then(() => {
                createNewTerminal()
            })
        }
        if (sessionId && terminalRef.current) {
            setIsReconnection(true)
            restrictXtermAccessibilityWidth()
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
        fitAddon.current = new FitAddon()
        /**
         * Adding default check due to vite build changing the export
         * for production the value will be `webFontAddon.current = new XtermWebfont.default()`
         * for local the value will be `webFontAddon.current = new XtermWebfont()`
         */
        const webFontAddon = XtermWebfont.default ? new XtermWebfont.default() : new XtermWebfont()
        terminalRef.current.loadAddon(fitAddon.current)
        terminalRef.current.loadAddon(webFontAddon)
        if (typeof registerLinkMatcher === 'function') {
            registerLinkMatcher(terminalRef.current)
        }
        terminalRef.current.loadWebfontAndOpen(document.getElementById('terminal-id'))
        // terminalRef.current.open(document.getElementById('terminal-id'))
        fitAddon.current?.fit()
        terminalRef.current.reset()
        terminalRef.current.attachCustomKeyEventHandler((event) => {
            if ((event.metaKey && event.key === 'k') || event.key === 'K') {
                terminalRef.current?.clear()
            }

            return true
        })
    }

    const generateSocketURL = () => {
        let socketURL = window.__ORCHESTRATOR_ROOT__
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
        const _fitAddon = fitAddon.current

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

            const dim = _fitAddon?.proposeDimensions()
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
                fitAddon.current?.fit()
            }
            terminalRef.current.setOption('cursorBlink', true)
            setSocketConnection(SocketConnectionType.CONNECTED)
        }
    }, [firstMessageReceived, isTerminalTab])

    const handleToggleFullscreen = () => {
        setFullScreenView((prev) => !prev)
        terminalRef.current?.focus()
    }

    useEffect(() => {
        if (!window.location.origin) {
            // Some browsers (mainly IE) do not have this property, so we need to build it manually...
            // @ts-ignore
            window.location.origin = `${window.location.protocol}//${
                window.location.hostname
            }${window.location.port ? `:${window.location.port}` : ''}`
        }

        setSocketConnection(SocketConnectionType.CONNECTING)

        const log = {
            cmdKey: false, // NOTE: can be either MetaKey or Cmd (in mac) or Ctrl (in linux/windows)
            shiftKey: false,
            KeyF: false,
        }
        const handleFullscreenShortcutPress = (event: KeyboardEvent) => {
            if (event.type === 'keydown') {
                if (event.ctrlKey || event.metaKey) {
                    log.cmdKey = true
                }
                if (event.code === 'KeyF') {
                    log.KeyF = true
                }
                if (event.shiftKey) {
                    log.shiftKey = true
                }
                if (Object.values(log).every((val) => !!val)) {
                    handleToggleFullscreen()
                }
            }
            if (event.type === 'keyup') {
                Object.keys(log).forEach((key) => {
                    log[key] = false
                })
            }
        }
        document.getElementById('terminal-id').addEventListener('keydown', handleFullscreenShortcutPress)
        document.getElementById('terminal-id').addEventListener('keyup', handleFullscreenShortcutPress)

        return () => {
            socket.current?.close()
            terminalRef.current?.dispose()
            socket.current = undefined
            terminalRef.current = undefined
            terminalRef.current = undefined
            fitAddon.current = null
            document.getElementById('terminal-id').removeEventListener('keydown', handleFullscreenShortcutPress)
            document.getElementById('terminal-id').removeEventListener('keyup', handleFullscreenShortcutPress)
        }
    }, [])

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.clear()
            terminalRef.current.focus()
        }
    }, [clearTerminal])

    return (
        <div
            className={`${isSuperAdmin && !isResourceBrowserView ? 'pb-28' : ''} terminal-wrapper`}
            data-testid={dataTestId}
        >
            {renderConnectionStrip()}
            {fullScreenView && (
                // TODO: solve why react-keybind is not working after this in k8s resource tab component
                <div className="w-100 flexbox dc__gap-6 dc__align-items-center px-12 py-4 terminal-wrapper__metadata">
                    <ICDevtronLogo className="fcn-0 icon-dim-16" />
                    {Object.entries(metadata).map(([key, value], index, arr) => (
                        <>
                            <span className="dc__first-letter-capitalize fs-12 cn-0 lh-20">
                                {key}:&nbsp;{value || '-'}
                            </span>
                            {index < arr.length - 1 && <div className="dc__divider h12" />}
                        </>
                    ))}
                </div>
            )}
            <div
                ref={termDivRef}
                id="terminal-id"
                data-testid="terminal-editor-container"
                className={`mt-8 mb-4 terminal-component ${
                    fullScreenView ? 'terminal-component--fullscreen' : ''
                } ml-20 ${!isResourceBrowserView && !fullScreenView ? 'terminal-component__zoom--bottom-41' : ''}`}
            >
                <CopyToast showCopyToast={popupText} />
                <LogResizeButton
                    shortcutCombo={['⌘', '⇧', 'F']}
                    disableKeybindings={true}
                    onlyOnLogs={false}
                    fullScreenView={fullScreenView}
                    setFullScreenView={handleToggleFullscreen}
                />
            </div>
        </div>
    )
}
