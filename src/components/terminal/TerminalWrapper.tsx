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

import React, { Component } from 'react'
import { Terminal } from 'xterm'
import { get, useThrottledEffect, Scroller } from '@devtron-labs/devtron-fe-common-lib'
import SockJS from 'sockjs-client'
import moment, { duration } from 'moment'
import { AutoSizer } from 'react-virtualized'
import { FitAddon } from 'xterm-addon-fit'
import * as XtermWebfont from 'xterm-webfont'
import ReactGA from 'react-ga4'
import CopyToast, { handleSelectionChange } from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/CopyToast'
import { AppDetails } from '../app/types'
import './terminal.scss'
import { SocketConnectionType } from '../app/details/appDetails/appDetails.type'

interface TerminalViewProps {
    appDetails: AppDetails
    nodeName: string
    shell: any
    containerName: string
    socketConnection: SocketConnectionType
    terminalCleared: boolean
    isReconnection: boolean
    setIsReconnection: (flag: boolean) => void
    setTerminalCleared: (flag: boolean) => void
    setSocketConnection: (flag: SocketConnectionType) => void
}
interface TerminalViewState {
    sessionId: string | undefined
    showReconnectMessage: boolean
    firstMessageReceived: boolean
    popupText?: boolean
}
export class TerminalView extends Component<TerminalViewProps, TerminalViewState> {
    _terminal

    _socket

    _fitAddon

    _ga_session_duration

    constructor(props) {
        super(props)
        this.state = {
            sessionId: undefined,
            showReconnectMessage: false,
            firstMessageReceived: false,
            popupText: false,
        }
        this.scrollToTop = this.scrollToTop.bind(this)
        this.scrollToBottom = this.scrollToBottom.bind(this)
        this.search = this.search.bind(this)
        handleSelectionChange.bind(this)
    }

    componentDidMount() {
        if (!window.location.origin) {
            // Some browsers (mainly IE) do not have this property, so we need to build it manually...
            // @ts-ignore
            window.location.origin = `${window.location.protocol}//${
                window.location.hostname
            }${window.location.port ? `:${window.location.port}` : ''}`
        }
        this.props.setSocketConnection('CONNECTING')
        ReactGA.event({
            category: 'Terminal',
            action: 'Open',
        })
        this._ga_session_duration = moment()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.socketConnection !== this.props.socketConnection) {
            if (this.props.socketConnection === 'DISCONNECTING') {
                if (this._socket) {
                    this._socket.close()
                    this._socket = undefined
                }
            }
            if (this.props.socketConnection === 'CONNECTING') {
                this.getNewSession()
            }
        }
        if (
            prevProps.nodeName !== this.props.nodeName ||
            prevProps.containerName !== this.props.containerName ||
            prevProps.shell.value !== this.props.shell.value
        ) {
            if (prevProps.nodeName !== this.props.nodeName) {
                ReactGA.event({
                    category: 'Terminal',
                    action: `Selected Pod`,
                    label: `${this.props.nodeName}/${this.props.containerName}/${this.props.shell.value}`,
                })
            } else if (prevProps.containerName !== this.props.containerName) {
                ReactGA.event({
                    category: 'Terminal',
                    action: `Selected Container`,
                    label: `${this.props.nodeName}/${this.props.containerName}/${this.props.shell.value}`,
                })
            } else if (prevProps.shell !== this.props.shell) {
                ReactGA.event({
                    category: 'Terminal',
                    action: `Selected Shell`,
                    label: `${this.props.nodeName}/${this.props.containerName}/${this.props.shell.value}`,
                })
            }

            this.props.setSocketConnection('DISCONNECTING')
            this._terminal?.reset()

            setTimeout(() => {
                this.props.setSocketConnection('CONNECTING')
            }, 100)
        }

        if (prevProps.terminalCleared !== this.props.terminalCleared && this.props.terminalCleared) {
            this._terminal?.clear()
            this._terminal?.focus()
            this.props.setTerminalCleared(false)
        }

        if (this.state.firstMessageReceived !== prevState.firstMessageReceived && this.state.firstMessageReceived) {
            this._fitAddon.fit()
            this._terminal.setOption('cursorBlink', true)
            this.props.setSocketConnection('CONNECTED')
        }
    }

    componentWillUnmount() {
        this._socket?.close()
        this._terminal?.dispose()
        const duration = moment(this._ga_session_duration).fromNow()
        ReactGA.event({
            category: 'Terminal',
            action: `Closed`,
            label: `${duration}`,
        })
    }

    getNewSession(): void {
        if (!this.props.nodeName || !this.props.containerName || !this.props.shell.value || !this.props.appDetails) {
            return
        }
        const url = `api/v1/applications/pod/exec/session/${this.props.appDetails.appId}/${this.props.appDetails.environmentId}/${this.props.appDetails.namespace}/${this.props.nodeName}/${this.props.shell.value}/${this.props.containerName}`
        get(url)
            .then((response: any) => {
                const sessionId = response?.result.SessionID
                this.setState({ sessionId }, () => {
                    this.initialize(sessionId)
                })
            })
            .catch((error) => {})
    }

    handleName = (states) => {
        this.setState({ popupText: states })
        if (!this.state.popupText) {
            return
        }
        setTimeout(() => this.setState({ popupText: false }), 2000)
    }

    scrollToTop(e) {
        this._terminal.scrollToTop()
    }

    scrollToBottom(e) {
        this._terminal.scrollToBottom()
    }

    search(event): void {
        if ((event.metaKey && event.key === 'k') || event.key === 'K') {
            this._terminal?.clear()
        }
    }

    createNewTerminal() {
        if (!this._terminal) {
            this._terminal?.dispose()
            this._terminal = new Terminal({
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

            this._fitAddon = new FitAddon()
            /**
             * Adding default check due to vite build changing the export
             * for production the value will be `webFontAddon.current = new XtermWebfont.default()`
             * for local the value will be `webFontAddon.current = new XtermWebfont()`
             */
            const webFontAddon = XtermWebfont.default ? new XtermWebfont.default() : new XtermWebfont()
            handleSelectionChange(this._terminal, this.handleName)
            this._terminal.loadAddon(this._fitAddon)
            this._terminal.loadAddon(webFontAddon)
            this._terminal.loadWebfontAndOpen(document.getElementById('terminal'))
            this._fitAddon.fit()
            this._terminal.reset()
            this._terminal.attachCustomKeyEventHandler(this.search)

            const self = this
            this._terminal.onResize(function (dim) {
                const startData = { Op: 'resize', Cols: dim.cols, Rows: dim.rows }
                if (self._socket) {
                    if (self._socket.readyState === WebSocket.OPEN) {
                        self._socket.send(JSON.stringify(startData))
                    }
                }
            })
        }
    }

    initialize(sessionId): void {
        this.createNewTerminal()

        const socketURL = `${window.__ORCHESTRATOR_ROOT__}/api/vi/pod/exec/ws/`

        this._socket?.close()
        this.setState({ firstMessageReceived: false })

        this._socket = new SockJS(socketURL)

        const { setSocketConnection } = this.props
        const socket = this._socket
        const terminal = this._terminal
        const fitAddon = this._fitAddon
        const { isReconnection } = this.props
        const { setIsReconnection } = this.props
        const self = this

        terminal.onData(function (data) {
            const inData = { Op: 'stdin', SessionID: '', Data: data }
            if (socket.readyState === WebSocket.OPEN) {
                socket?.send(JSON.stringify(inData))
            }
        })

        socket.onopen = function () {
            const startData = { Op: 'bind', SessionID: sessionId }
            socket.send(JSON.stringify(startData))

            const dim = fitAddon.proposeDimensions()
            const resize = { Op: 'resize', Cols: dim.cols, Rows: dim.rows }
            socket.send(JSON.stringify(resize))

            if (isReconnection) {
                terminal.writeln('')
                terminal.writeln('---------------------------------------------')
                terminal.writeln(`Reconnected at ${moment().format('DD-MMM-YYYY')} at ${moment().format('hh:mm A')}`)
                terminal.writeln('---------------------------------------------')
                setIsReconnection(false)
            }
        }

        socket.onmessage = function (evt) {
            terminal.write(JSON.parse(evt.data).Data)
            terminal?.focus()
            if (!self.state.firstMessageReceived) {
                self.setState({ firstMessageReceived: true })
            }
        }

        socket.onclose = function (evt) {
            setSocketConnection('DISCONNECTED')
        }

        socket.onerror = function (evt) {
            setSocketConnection('DISCONNECTED')
        }
    }

    render() {
        const self = this
        let statusBarClasses = `cn-0 m-0 w-100 pod-readyState pod-readyState--top pl-20`
        if (this.props.socketConnection !== 'CONNECTED') {
            statusBarClasses = `${statusBarClasses} bcr-7 pod-readyState--show`
        }
        return (
            <AutoSizer>
                {({ height, width }) => (
                    <div className="terminal-view pt-24" style={{ overflow: 'auto' }}>
                        <p style={{ zIndex: 11, textTransform: 'capitalize' }} className={statusBarClasses}>
                            <span className={this.props.socketConnection === 'CONNECTING' ? 'dc__loading-dots' : ''}>
                                {this.props.socketConnection.toLowerCase()}
                            </span>
                            {this.props.socketConnection === 'DISCONNECTED' && (
                                <>
                                    <span>.&nbsp;</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            this.props.setSocketConnection('CONNECTING')
                                            this.props.setIsReconnection(true)
                                        }}
                                        className="cursor dc__transparent dc__inline-block dc__underline"
                                    >
                                        Resume
                                    </button>
                                </>
                            )}
                        </p>
                        <TerminalContent height={height} width={width} fitAddon={self._fitAddon} />
                        <Scroller
                            style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: '10' }}
                            scrollToBottom={this.scrollToBottom}
                            scrollToTop={this.scrollToTop}
                        />

                        {this.props.socketConnection === 'CONNECTED' && (
                            <p
                                style={{ position: 'relative', bottom: '10px' }}
                                className="dc__ff-monospace pt-2 fs-13 pb-2 m-0 dc__first-letter-capitalize cg-4"
                            >
                                {this.props.socketConnection}
                            </p>
                        )}
                        <CopyToast showCopyToast={this.state.popupText} />
                    </div>
                )}
            </AutoSizer>
        )
    }
}

const TerminalContent = (props) => {
    useThrottledEffect(
        () => {
            if (props.fitAddon) {
                props.fitAddon.fit()
            }
        },
        100,
        [props.height, props.width],
    )
    // TODO: maybe need to add support for fullscreen here aswell? 
    return <div id="terminal" style={{ width: props.width, height: props.height - 110 }} />
}
