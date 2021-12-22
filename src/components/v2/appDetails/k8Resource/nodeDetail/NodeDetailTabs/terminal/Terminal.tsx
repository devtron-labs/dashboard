import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import * as XtermWebfont from 'xterm-webfont';
import SockJS from 'sockjs-client';
import { SocketConnectionType } from '../node.type';
import { get } from '../../../../../../../services/api';
import ReactGA from 'react-ga';

import './terminal.css';
import IndexStore from '../../../../index.store';

interface TerminalViewProps {
    nodeName: string;
    shell: any;
    containerName: string;
    socketConnection: SocketConnectionType;
    terminalCleared: boolean;
    setTerminalCleared: (flag: boolean) => void;
    setSocketConnection: (flag: SocketConnectionType) => void;
}

// let socket = undefined
// let terminal = undefined
// let fitAddon = undefined
// let ga_session_duration = undefined

function TerminalView(terminalViewProps: TerminalViewProps) {

    // const terminal =React.useRef(Terminal)
    const [fitAddon, setFitAddon] = useState<FitAddon>()
    const [socket, setSocket] = useState<SockJS>()
    const [terminal, setTerminal] = useState<Terminal>()

    const appDetails = IndexStore.getAppDetails()
    const [ga_session_duration, setGA_session_duration] = useState()
    const [isReconnection, setIsReconnection] = useState(false);

    const [firstMessageReceived, setFirstMessageReceived] = useState(false)
    const [showReconnectMessage, setShowReconnectMessage] = useState(false)

    const createNewTerminal = () => {

        let terminal = new Terminal({
            scrollback: 99999,
            fontSize: 14,
            lineHeight: 1.4,
            cursorBlink: false,
            fontFamily: 'Inconsolata',
            screenReaderMode: true,
            theme: {
                background: '#ffffff',
                foreground: '#000a14',
                selection: '#0066cc4d',
            },
        });

        const fitAddon = new FitAddon();
        const webFontAddon = new XtermWebfont()
        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webFontAddon);
        terminal.open(document.getElementById('terminal'));
        fitAddon.fit();
        terminal.reset();
        terminal.attachCustomKeyEventHandler((event)=>{
            if (event.metaKey && event.key === "k" || event.key === "K") {
                terminal?.clear();
            }
    
            return true
        });

        setTerminal(terminal)
        setFitAddon(fitAddon)

        return {terminal: terminal, fitAddon: fitAddon}

        // let self = this;
        // terminal.onResize(function (dim) {
        //     const startData = { Op: 'resize', Cols: dim.cols, Rows: dim.rows };
        //     if (_socket) {
        //         if (_socket.readyState === WebSocket.OPEN)
        //             _socket.send(JSON.stringify(startData));
        //     }
        // })
    }

    const initialize = (sessionId: string): void => {
        
        const obj = createNewTerminal();

        let terminal = obj.terminal;
        let fitAddon = obj.fitAddon;

        let socketURL = `${process.env.REACT_APP_ORCHESTRATOR_ROOT}/api/vi/pod/exec/ws/`;

        setFirstMessageReceived(false)

        let socket = new SockJS(socketURL)

        terminal.onData(data => {
            console.log("terminal.onData", data)

            const inData = { Op: 'stdin', SessionID: "", Data: data };

            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(inData));
            }
        })

        socket.onopen = (evt) => {
            console.log("socket.onopen", evt)

            const startData = { Op: 'bind', SessionID: sessionId };
            socket.send(JSON.stringify(startData));

            let dim = fitAddon.proposeDimensions();
            const resize = { Op: 'resize', Cols: dim.cols, Rows: dim.rows };
            socket.send(JSON.stringify(resize));

            console.log("isReconnection", isReconnection)

            if (isReconnection) {
                terminal.writeln("");
                terminal.writeln("---------------------------------------------");
                terminal.writeln(`Reconnected at ${moment().format('DD-MMM-YYYY')} at ${moment().format('hh:mm A')}`);
                terminal.writeln("---------------------------------------------");
                setIsReconnection(false);
            }
        };

        socket.onmessage = (evt) => {
            console.log("socket.onmessage", firstMessageReceived)
            terminal.write(JSON.parse(evt.data).Data);
            terminal.focus();


            if (!firstMessageReceived) {
                setFirstMessageReceived(true)
            }

        }

        socket.onclose = (evt) => {
            console.log("socket.onclose", evt)
            terminalViewProps.setSocketConnection('DISCONNECTED');
        }

        socket.onerror = (evt) => {
            console.log("socket.onerror", evt)
            terminalViewProps.setSocketConnection('DISCONNECTED');
        }

        setSocket(socket)
    }

    const clearConnection = () => {
        socket?.close();
        terminal?.dispose();
        setSocket(undefined)
        setTerminal(undefined)
        setFitAddon(undefined)
    }

    useEffect(() => {
        // if (prevProps.socketConnection !== terminalViewProps.socketConnection) {

        console.log("terminalViewProps", terminalViewProps)

        // if (terminalViewProps.socketConnection === 'DISCONNECTED' && !isReconnection ) {
        //     terminalViewProps.setSocketConnection("CONNECTING");
        //     // setIsReconnection(true)
        // }

        if (terminalViewProps.socketConnection === 'DISCONNECTING') {
            clearConnection()
        }

        if (terminalViewProps.socketConnection === 'CONNECTING') {
            getNewSession();
        }


        // }
        // if (prevProps.nodeName !== terminalViewProps.nodeName || prevProps.containerName !== terminalViewProps.containerName || prevProps.shell.value !== terminalViewProps.shell.value) {

        //   if (prevProps.nodeName !== terminalViewProps.nodeName) {
        // ReactGA.event({
        //     category: 'Terminal',
        //     action: `Selected Pod`,
        //     label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
        // });
        // }

        //else if (prevProps.containerName !== terminalViewProps.containerName) {
        // ReactGA.event({
        //     category: 'Terminal',
        //     action: `Selected Container`,
        //     label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
        // });
        //}

        //else if (prevProps.shell !== terminalViewProps.shell) {
        // ReactGA.event({
        //     category: 'Terminal',
        //     action: `Selected Shell`,
        //     label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
        // });
        //}

        //terminalViewProps.setSocketConnection("DISCONNECTING");

        // if (terminal) {
        //     terminal.reset();

        //     setTerminal(undefined)
        // }

        return (() => {
            clearConnection()

            let duration = moment(ga_session_duration).fromNow();

            ReactGA.event({
                category: 'Terminal',
                action: `Closed`,
                label: `${duration}`,
            });
        })
        //terminalViewProps.setSocketConnection("CONNECTING");
    }, [terminalViewProps.socketConnection, terminalViewProps.containerName, terminalViewProps.shell])


    useEffect(() => {
        if (terminalViewProps.terminalCleared) {
            clearConnection()
            terminalViewProps.setTerminalCleared(false);
        }

    }, [terminalViewProps.terminalCleared])

    useEffect(() => {
        if (firstMessageReceived) {
            terminal.setOption('cursorBlink', true);
            terminalViewProps.setSocketConnection('CONNECTED');
            fitAddon.fit();
        }
    }, [firstMessageReceived])

    const getNewSession = () => {

        // console.log("props new", terminalViewProps)

        if (!terminalViewProps.nodeName || !terminalViewProps.containerName || !terminalViewProps.shell.value || !appDetails) return;

        let url = `api/v1/applications/pod/exec/session/${appDetails.appId}/${appDetails.environmentId}/${appDetails.namespace}/${terminalViewProps.nodeName}/${terminalViewProps.shell.value}/${terminalViewProps.containerName}`;

        clearConnection()

        setIsReconnection(true);

        get(url).then((response: any) => {
            let sessionId = response?.result.SessionID;
            initialize(sessionId);
        }).catch((error) => {
            console.log("error in terminal ", error)
        })
    }

    const isConnecting = terminalViewProps.socketConnection === 'CONNECTING';
    const connStatusBarBGClass = isConnecting ? 'bcy-2' : 'bcr-7';
    const connStatusTextClass = isConnecting ? 'cn-9' : 'cn-0';

    return (
        <div className="terminal-view">
            <p
                style={{ zIndex: 4, textTransform: 'capitalize' }}
                className={`${
                    terminalViewProps.socketConnection !== 'CONNECTED'
                        ? `${connStatusBarBGClass} pod-readyState--show`
                        : ''
                } ${connStatusTextClass} m-0 w-100 pod-readyState pod-readyState--top`}
            >
                <span className={terminalViewProps.socketConnection === 'CONNECTING' ? "loading-dots" : ''}>
                    {terminalViewProps.socketConnection?.toLowerCase()}
                </span>
                {terminalViewProps.socketConnection === 'DISCONNECTED' && <>
                    <span>.&nbsp;</span>
                    <button type="button" onClick={(e) => {
                        terminalViewProps.setSocketConnection('CONNECTING');
                        setIsReconnection(true);
                    }}
                        className="cursor transparent inline-block"
                        style={{ textDecoration: 'underline' }}>Resume
                    </button>
                </>}
            </p>

            <div id="terminal"></div>

            {terminalViewProps.socketConnection === 'CONNECTED' && <p style={{ position: 'relative', bottom: '10px' }}
                className={`ff-monospace pt-2 fs-13 pb-2 m-0 capitalize cg-4`} >
                {terminalViewProps.socketConnection}
            </p>}
        </div>

    )
}

export default TerminalView;
