import React, { Component } from 'react';
import { Terminal } from 'xterm';
import { Scroller } from '../app/details/cIDetails/CIDetails'
import { get } from '../../services/api';
import { AppDetails } from '../app/types';
import SockJS from 'sockjs-client';
import CopyToast from '../v2/appDetails/k8Resource/nodeDetail/NodeDetailTabs/CopyToast';
import moment, { duration } from 'moment';
import { AutoSizer } from 'react-virtualized'
import { FitAddon } from 'xterm-addon-fit';
import * as XtermWebfont from 'xterm-webfont';
import { SocketConnectionType } from '../app/details/appDetails/AppDetails';
import { useThrottledEffect ,copyToClipboard } from '../common';
import ReactGA from 'react-ga';
import './terminal.css';

interface TerminalViewProps {
    appDetails: AppDetails;
    nodeName: string;
    shell: any;
    containerName: string;
    socketConnection: SocketConnectionType;
    terminalCleared: boolean;
    isReconnection: boolean;
    setIsReconnection: (flag: boolean) => void;
    setTerminalCleared: (flag: boolean) => void;
    setSocketConnection: (flag: SocketConnectionType) => void;
}
interface TerminalViewState {
    sessionId: string | undefined;
    showReconnectMessage: boolean;
    firstMessageReceived: boolean;
    popupText?: boolean;
}
export class TerminalView extends Component<TerminalViewProps, TerminalViewState>{
    _terminal;
    _socket;
    _fitAddon;
    _ga_session_duration;

    constructor(props) {
        super(props);
        this.state = {
            sessionId: undefined,
            showReconnectMessage: false,
            firstMessageReceived: false,
            popupText:false,
        }
        this.scrollToTop = this.scrollToTop.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.search = this.search.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
    }

    componentDidMount() {
        if (!window.location.origin) { // Some browsers (mainly IE) do not have this property, so we need to build it manually...
            // @ts-ignore
            window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : '');
        }
        this.props.setSocketConnection("CONNECTING");
        ReactGA.event({
            category: 'Terminal',
            action: 'Open',
        });
        this._ga_session_duration = moment();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.socketConnection !== this.props.socketConnection) {
            if (this.props.socketConnection === 'DISCONNECTING') {
                if (this._socket) {
                    this._socket.close();
                    this._socket = undefined;
                }
            }
            if (this.props.socketConnection === 'CONNECTING') {
                this.getNewSession();
            }
        }
        if (prevProps.nodeName !== this.props.nodeName || prevProps.containerName !== this.props.containerName || prevProps.shell.value !== this.props.shell.value) {

            if (prevProps.nodeName !== this.props.nodeName) {
                ReactGA.event({
                    category: 'Terminal',
                    action: `Selected Pod`,
                    label: `${this.props.nodeName}/${this.props.containerName}/${this.props.shell.value}`,
                });
            }

            else if (prevProps.containerName !== this.props.containerName) {
                ReactGA.event({
                    category: 'Terminal',
                    action: `Selected Container`,
                    label: `${this.props.nodeName}/${this.props.containerName}/${this.props.shell.value}`,
                });
            }

            else if (prevProps.shell !== this.props.shell) {
                ReactGA.event({
                    category: 'Terminal',
                    action: `Selected Shell`,
                    label: `${this.props.nodeName}/${this.props.containerName}/${this.props.shell.value}`,
                });
            }

            this.props.setSocketConnection("DISCONNECTING");
            this._terminal?.reset();

            setTimeout(() => {
                this.props.setSocketConnection("CONNECTING");
            }, 100)
        }

        if (prevProps.terminalCleared !== this.props.terminalCleared && this.props.terminalCleared) {
            this._terminal?.clear();
            this._terminal?.focus();
            this.props.setTerminalCleared(false);
        }

        if (this.state.firstMessageReceived !== prevState.firstMessageReceived && this.state.firstMessageReceived) {
            this._fitAddon.fit();
            this._terminal.setOption('cursorBlink', true);
            this.props.setSocketConnection('CONNECTED');
        }
    }

    componentWillUnmount() {
        this._socket?.close();
        this._terminal?.dispose();
        let duration = moment(this._ga_session_duration).fromNow();
        ReactGA.event({
            category: 'Terminal',
            action: `Closed`,
            label: `${duration}`,
        });
    }

    getNewSession(): void {
        if (!this.props.nodeName || !this.props.containerName || !this.props.shell.value || !this.props.appDetails) return;
        let url = `api/v1/applications/pod/exec/session/${this.props.appDetails.appId}/${this.props.appDetails.environmentId}/${this.props.appDetails.namespace}/${this.props.nodeName}/${this.props.shell.value}/${this.props.containerName}`;
        get(url).then((response: any) => {
            let sessionId = response?.result.SessionID;
            this.setState({ sessionId: sessionId }, () => {
                this.initialize(sessionId);
            });
        }).catch((error) => {

        })
    }

    handleSelectionChange(e):void {
            copyToClipboard(this._terminal.getSelection());
            if (this._terminal.getSelection()) {
                this.setState({popupText: true});
                if (!this.state.popupText) return;
                setTimeout(() =>  this.setState({popupText: false}), 2000);
            }
    }

    scrollToTop(e) {
        this._terminal.scrollToTop();
    }

    scrollToBottom(e) {
        this._terminal.scrollToBottom();
    }

    search(event): void {
        if (event.metaKey && event.key === "k" || event.key === "K") {
            this._terminal?.clear();
        }
    }

    createNewTerminal() {
        if (!this._terminal) {
            this._terminal?.dispose();
            this._terminal = new Terminal({
                scrollback: 99999,
                fontSize: 14,
                lineHeight: 1.4,
                cursorBlink: false,
                fontFamily: 'Inconsolata',
                screenReaderMode: true,
                theme: {
                    background: '#0B0F22',
                    foreground: '#FFFFFF'
                }
            });

            this._fitAddon = new FitAddon();
            let webFontAddon = new XtermWebfont()
            this._terminal.onSelectionChange(this.handleSelectionChange);
            this._terminal.loadAddon(this._fitAddon);
            this._terminal.loadAddon(webFontAddon);
            this._terminal.loadWebfontAndOpen(document.getElementById('terminal'));
            this._fitAddon.fit();
            this._terminal.reset();
            this._terminal.attachCustomKeyEventHandler(this.search);

            let self = this;
            this._terminal.onResize(function (dim) {
                const startData = { Op: 'resize', Cols: dim.cols, Rows: dim.rows };
                if (self._socket) {
                    if (self._socket.readyState === WebSocket.OPEN)
                        self._socket.send(JSON.stringify(startData));
                }
            })
        }
    }

    initialize(sessionId): void {
        this.createNewTerminal();

        let socketURL = `${process.env.REACT_APP_ORCHESTRATOR_ROOT}/api/vi/pod/exec/ws/`;

        this._socket?.close();
        this.setState({ firstMessageReceived: false });

        this._socket = new SockJS(socketURL);

        let setSocketConnection = this.props.setSocketConnection;
        let socket = this._socket;
        let terminal = this._terminal;
        let fitAddon = this._fitAddon;
        let isReconnection = this.props.isReconnection;
        let setIsReconnection = this.props.setIsReconnection;
        let self = this;

        terminal.onData(function (data) {
            const inData = { Op: 'stdin', SessionID: "", Data: data };
            if (socket.readyState === WebSocket.OPEN) {
                socket?.send(JSON.stringify(inData));
            }
        })

        socket.onopen = function () {

            const startData = { Op: 'bind', SessionID: sessionId };
            socket.send(JSON.stringify(startData));

            let dim = fitAddon.proposeDimensions();
            const resize = { Op: 'resize', Cols: dim.cols, Rows: dim.rows };
            socket.send(JSON.stringify(resize));

            if (isReconnection) {
                terminal.writeln("");
                terminal.writeln("---------------------------------------------");
                terminal.writeln(`Reconnected at ${moment().format('DD-MMM-YYYY')} at ${moment().format('hh:mm A')}`);
                terminal.writeln("---------------------------------------------");
                setIsReconnection(false);
            }
        };

        socket.onmessage = function (evt) {
            terminal.write(JSON.parse(evt.data).Data);
            terminal?.focus();
            if (!self.state.firstMessageReceived) {
                self.setState({ firstMessageReceived: true });
            }
        }

        socket.onclose = function (evt) {
            setSocketConnection('DISCONNECTED');
        }

        socket.onerror = function (evt) {
            setSocketConnection('DISCONNECTED');
        }
    }

    render() {
        let self = this;
        let statusBarClasses = `cn-0 m-0 w-100 pod-readyState pod-readyState--top pl-20`;
        if (this.props.socketConnection !== "CONNECTED") {
            statusBarClasses = `${statusBarClasses} bcr-7 pod-readyState--show`;
        }
        return <AutoSizer>
            {({ height, width }) => <div className={"terminal-view pt-24"} style={{ overflow: 'auto' }}>
                <p style={{ zIndex: 11, textTransform: 'capitalize' }} className={statusBarClasses} >
                    <span className={this.props.socketConnection === 'CONNECTING' ? "loading-dots" : ''}>
                        {this.props.socketConnection.toLowerCase()}
                    </span>
                    {this.props.socketConnection === 'DISCONNECTED' && <>
                        <span>.&nbsp;</span>
                        <button type="button" onClick={(e) => { this.props.setSocketConnection('CONNECTING'); this.props.setIsReconnection(true); }}
                            className="cursor transparent inline-block"
                            style={{ textDecoration: 'underline' }}>Resume
                    </button>
                    </>}
                </p>
                <TerminalContent height={height} width={width} fitAddon={self._fitAddon} />
                <Scroller style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: '10' }}
                    scrollToBottom={this.scrollToBottom}
                    scrollToTop={this.scrollToTop}
                />

                {this.props.socketConnection === 'CONNECTED' && <p style={{ position: 'relative', bottom: '10px' }}
                    className={`ff-monospace pt-2 fs-13 pb-2 m-0 capitalize cg-4`} >
                    {this.props.socketConnection}
                </p>}
                <CopyToast showCopyToast={this.state.popupText} />
            </div>}        
        </AutoSizer>
    }
}


function TerminalContent(props) {

    useThrottledEffect(() => {
        if (props.fitAddon) {
            props.fitAddon.fit();
        }
    },
        100,
        [props.height, props.width],
    );
    return <div id="terminal" style={{ width: props.width, height: props.height - 110 }}></div>
}