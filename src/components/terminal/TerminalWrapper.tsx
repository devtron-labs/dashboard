import React, { Component } from 'react';
import { Terminal } from 'xterm';
import { Scroller } from '../app/details/cIDetails/CIDetails'
import SockJS from 'sockjs-client';
import './terminal.css';

interface TerminalViewProps {
    appName: string;
    environmentName: string;
    nodeName: string;
    containerName: string;
    terminalConnected: string;
    nodes;
    terminalCleared: boolean;
    setTerminalCleared: (flag: boolean) => void;
    toggleTerminalConnected: (flag: boolean) => void;
}
export class TerminalWrapper extends Component<TerminalViewProps, { sessionId: any; }>{
    _terminalRef;
    _terminal;
    _socket;

    constructor(props) {
        super(props);
        this._terminalRef = React.createRef();
        this._terminal = new Terminal({
            cursorBlink: true,
            screenReaderMode: true,
        });
        this._socket = new SockJS('http://localhost:8080/api/sockjs/');
        this.state = {
            sessionId: undefined,
        }
        this.init = this.init.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    componentDidMount() {
        if (!window.location.origin) { // Some browsers (mainly IE) do not have this property, so we need to build it manually...
            //@ts-ignore
            window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : '');
        }
        ///api/v1/pod/{namespaceName}/{podname}/{shell}/{container}     appNmae/appId, envId
        let url = "http://localhost:8080/api/v1/pod/namespace/pod/shell/container"
        // var xhttp = new XMLHttpRequest();
        // xhttp.open("GET",url, false);
        // xhttp.send();
        // var response = JSON.parse(xhttp.responseText);
        // var sessionId = response.SessionID;
        let options = {
            method: 'GET',
            body: undefined,
        };
        fetch(url, options).then((response) => {
            return response.json();
        }).then((response) => {
            let sessionId = response?.SessionID;
            this.setState({ sessionId: sessionId }, () => {
                this.init(sessionId);
            });
        })
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.terminalConnected !== this.props.terminalConnected) {
            if (this.props.terminalConnected) { //was connected
                this.disconnect();
                this.props.toggleTerminalConnected(!this.props.terminalConnected);
            }
        }
        if (prevProps.nodeName !== this.props.nodeName || prevProps.containerName !== this.props.containerName) {

        }

        if (prevProps.terminalCleared !== this.props.terminalCleared && this.props.terminalCleared) {
            this._terminal.clear();
            this.props.setTerminalCleared(false);
        }

    }

    componentWillUnmount() {
        this._socket.close();
    }

    scrollToTop(e) {
        this._terminal.scrollToTop();
    }

    scrollToBottom(e) {
        this._terminal.scrollToBottom();
    }

    init(sessionId) {
        let sock = this._socket;
        let terminal = this._terminal;

        terminal.open(document.getElementById('terminal'));

        terminal.onData(function (data) {
            const inData = { Op: 'stdin', SessionID: "", Data: data };
            sock.send(JSON.stringify(inData));
        })

        sock.onopen = function () {
            const startData = { Op: 'bind', SessionID: sessionId };
            sock.send(JSON.stringify(startData));
        };

        sock.onmessage = function (evt) {
            terminal.write(JSON.parse(evt.data).Data);
        }

        sock.onclose = function (evt) {
            terminal.write("Session terminated");
            terminal.dispose()
        }

        sock.onerror = function (evt) {
            console.log(evt)
        }
    }

    disconnect() {
        this._socket.close();
    }

    connect() {
        this.init(this.state.sessionId);
    }

    render() {
        return <div className="terminal-view">

            <div ref={this._terminalRef} id="terminal"></div>
            <p className={this.props.terminalConnected ? `bcr-7 cn-0 m-0 w-100 pod-readyState` : `bcr-7 cn-0 m-0 w-100 pod-readyState pod-readyState--show`} >
                Disconnected. &nbsp;
                <span onClick={(e) => this.props.toggleTerminalConnected(false)}
                    className="pointer"
                    style={{ textDecoration: 'underline' }}>Resume
                </span>
            </p>

            <Scroller style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: '3' }}
                scrollToBottom={this.scrollToBottom}
                scrollToTop={this.scrollToTop}
            />
        </div>
    }
}