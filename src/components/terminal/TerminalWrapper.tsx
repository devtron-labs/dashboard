import React, { Component } from 'react';
import { Terminal } from 'xterm';
import SockJS from 'sockjs-client';
import './terminal.css';

export class TerminalWrapper extends Component<{}, { sessionId: any; }>{

    constructor(props) {
        super(props);
        this.state = {
            sessionId: undefined,
        }
        this.init = this.init.bind(this);
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

    init(sessionId) {
        var term = new Terminal({
            cursorBlink: true,
            screenReaderMode: true,
        });

        term.open(document.getElementById('terminal'));
        var sock = new SockJS('http://localhost:8080/api/sockjs/');

        sock.onopen = function () {
            const startData = { Op: 'bind', SessionID: sessionId };
            sock.send(JSON.stringify(startData));
        };

        term.onData(function (data) {
            console.log(`send data`, data);
            const inData = { Op: 'stdin', SessionID: "", Data: data };
            sock.send(JSON.stringify(inData));
        })

        sock.onmessage = function (evt) {
            term.write(JSON.parse(evt.data).Data);
        }
        sock.onclose = function (evt) {
            term.write("Session terminated");
            //term.dispose()
        }
        sock.onerror = function (evt) {
            console.log(evt)
        }
    }

    render() {
        return <div id="terminal">

        </div>
    }
}