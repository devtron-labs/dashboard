import React, { Component } from 'react';
import { Terminal } from 'xterm';
import { Scroller } from '../app/details/cIDetails/CIDetails'
import { get } from '../../services/api';
import { AppDetails } from '../app/types';
import SockJS from 'sockjs-client';
import './terminal.css';

interface TerminalViewProps {
    appDetails: AppDetails;
    nodeName: string;
    shell: any;
    containerName: string;
    terminalConnected: string;
    terminalCleared: boolean;
    setTerminalCleared: (flag: boolean) => void;
    toggleTerminalConnected: (flag: boolean) => void;
}
export class TerminalWrapper extends Component<TerminalViewProps, { sessionId: any; }>{
    _terminal;
    _socket;

    constructor(props) {
        super(props);
        this.state = {
            sessionId: undefined,
        }
        this.init = this.init.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.search = this.search.bind(this);
    }

    componentDidMount() {
        if (!window.location.origin) { // Some browsers (mainly IE) do not have this property, so we need to build it manually...
            // @ts-ignore
            window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : '');
        }
        this.getNewSession(true);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.terminalConnected !== this.props.terminalConnected) {
            if (this.props.terminalConnected) { //connected
                this._socket?.close();
                this.getNewSession(false);
            }
            else {
                //disconnect
                this._socket?.close();
            }
        }
        if (prevProps.nodeName !== this.props.nodeName || prevProps.containerName !== this.props.containerName || prevProps.shell.value !== this.props.shell.value) {
            this._socket?.close();
            this.getNewSession(true);
        }

        if (prevProps.terminalCleared !== this.props.terminalCleared && this.props.terminalCleared) {
            this._terminal?.clear();
            this._terminal.focus();
            this.props.setTerminalCleared(false);
        }
    }

    componentWillUnmount() {
        this._socket?.close();
        this._terminal?.dispose();
    }

    getNewSession(newTerminal = false) {
        if (!this.props.nodeName || !this.props.containerName || !this.props.shell.value || !this.props.appDetails) return;
        let url = `api/v1/applications/pod/exec/session/${this.props.appDetails.appId}/${this.props.appDetails.environmentId}/${this.props.appDetails.namespace}/${this.props.nodeName}/${this.props.shell.value}/${this.props.containerName}`;
        get(url).then((response: any) => {
            let sessionId = response?.result.SessionID;
            this.setState({ sessionId: sessionId }, () => {
                this.init(sessionId, newTerminal);
            });
        }).catch((error) => {

        })
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

    init(sessionId, newTerminal): void {
        if (newTerminal || !this._terminal) {
            this._terminal?.dispose();
            this._terminal = new Terminal({
                cursorBlink: true,
                screenReaderMode: true,
            });
            this._terminal.open(document.getElementById('terminal'));
            this._terminal.attachCustomKeyEventHandler(this.search);
        }

        let socketURL = `${process.env.REACT_APP_ORCHESTRATOR_ROOT}/api/vi/pod/exec/ws/`;
        socketURL = `http://demo.devtron.info:32080/orchestrator/api/vi/pod/exec/ws/`;
        console.log("webosocket init")
        this._socket = new SockJS(socketURL);
        let toggleTerminalConnected = this.props.toggleTerminalConnected;
        let socket = this._socket;
        let terminal = this._terminal;

        terminal.onData(function (data) {
            const inData = { Op: 'stdin', SessionID: "", Data: data };
            socket.send(JSON.stringify(inData));
        })

        socket.onopen = function () {
            const startData = { Op: 'bind', SessionID: sessionId };
            socket.send(JSON.stringify(startData));
            toggleTerminalConnected(true);
            terminal.writeln("");
            terminal.writeln("---------------");
            terminal.writeln("New Connection");
            terminal.writeln("---------------");
        };

        socket.onmessage = function (evt) {
            terminal.write(JSON.parse(evt.data).Data);
        }

        socket.onclose = function (evt) {
        }

        socket.onerror = function (evt) {
            console.error(evt);
            toggleTerminalConnected(false);
        }
        this._terminal.focus();
    }

    render() {
        return <div className="terminal-view">
            <div id="terminal"></div>
            <p style={{ zIndex: 10 }} className={this.props.terminalConnected ? `bcr-7 cn-0 m-0 w-100 pod-readyState` : `bcr-7 cn-0 m-0 w-100 pod-readyState pod-readyState--show`} >
                Disconnected. &nbsp;
                <button type="button" onClick={(e) => { this.props.toggleTerminalConnected(true) }}
                    className="cursor transparent inline-block"
                    style={{ textDecoration: 'underline' }}>Resume
                </button>
            </p>
            <Scroller style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: '10' }}
                scrollToBottom={this.scrollToBottom}
                scrollToTop={this.scrollToTop}
            />
            {/* {this.props.terminalConnected ? <p style={{ position: 'absolute', bottom: 0 }}
                className={`ff-monospace pl-20 cg-4 pt-2 fs-13 pb-2 m-0 w-100 loading-dots`} >
                Connecting
            </p> : null} */}
        </div>
    }
}