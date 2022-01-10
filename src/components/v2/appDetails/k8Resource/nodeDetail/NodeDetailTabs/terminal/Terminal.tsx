import moment from 'moment';
import React, { useEffect, useState } from 'react';
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

let socket = undefined
let terminal = undefined
let fitAddon = undefined

function TerminalView(terminalViewProps: TerminalViewProps) {
    
    const [ga_session_duration, setGA_session_duration] = useState<moment.Moment>();
    const [isReconnection, setIsReconnection] = useState(false);
    const [firstMessageReceived, setFirstMessageReceived] = useState(false);

    const appDetails = IndexStore.getAppDetails();

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
        });

        fitAddon = new FitAddon();
        const webFontAddon = new XtermWebfont();
        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webFontAddon);
        terminal.open(document.getElementById('terminal-id'));
        fitAddon.fit();
        terminal.reset();
        terminal.attachCustomKeyEventHandler((event) => {
            if ((event.metaKey && event.key === 'k') || event.key === 'K') {
                terminal?.clear();
            }

            return true;
        })
    }

    const postInitialize = (sessionId: string) => {
        let socketURL = `${process.env.REACT_APP_ORCHESTRATOR_ROOT}/api/vi/pod/exec/ws/`;

        socket?.close();

        setFirstMessageReceived(false);

        socket = new SockJS(socketURL);
        const _socket = socket;
        const _terminal = terminal;
        const _fitAddon = fitAddon;

        _terminal.onData(function (data) {
            const inData = { Op: 'stdin', SessionID: '', Data: data };
            if (_socket.readyState === WebSocket.OPEN) {
                _socket?.send(JSON.stringify(inData));
            }
        });

        _socket.onopen = function () {
            const startData = { Op: 'bind', SessionID: sessionId };
            _socket.send(JSON.stringify(startData));

            let dim = _fitAddon.proposeDimensions();
            const resize = { Op: 'resize', Cols: dim.cols, Rows: dim.rows };

            _socket.send(JSON.stringify(resize));

            if (isReconnection) {
                _terminal.writeln('');
                _terminal.writeln('---------------------------------------------');
                _terminal.writeln(`Reconnected at ${moment().format('DD-MMM-YYYY')} at ${moment().format('hh:mm A')}`);
                _terminal.writeln('---------------------------------------------');
                setIsReconnection(false);

                if(firstMessageReceived){
                    terminalViewProps.setSocketConnection('CONNECTED');
                }
            }
        };

        _socket.onmessage = function (evt) {
            _terminal.write(JSON.parse(evt.data).Data);
            _terminal.focus();

            if (!firstMessageReceived) {
                setFirstMessageReceived(true);
            }
        };

        _socket.onclose = function (evt) {
            terminalViewProps.setSocketConnection('DISCONNECTED');
        };

        _socket.onerror = function (evt) {
            terminalViewProps.setSocketConnection('DISCONNECTED');
        };
    };

    const reconnect = () => {
        terminalViewProps.setSocketConnection("DISCONNECTING");
        terminal?.reset();

        setTimeout(() => {
            terminalViewProps.setSocketConnection("CONNECTING");
        }, 100)
    }

    useEffect(() => {
        if (terminalViewProps.socketConnection === 'DISCONNECTING') {
            if (socket) {
                socket.close();
                socket = undefined;
            }
        }
        if (terminalViewProps.socketConnection === 'CONNECTING') {
            getNewSession();
        }

    }, [terminalViewProps.socketConnection])

    useEffect(() => {
        ReactGA.event({
            category: 'Terminal',
            action: `Selected Pod`,
            label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
        });

        reconnect()

    }, [terminalViewProps.nodeName])

    useEffect(() => {
        ReactGA.event({
            category: 'Terminal',
            action: `Selected Container`,
            label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
        });

        reconnect()

    }, [terminalViewProps.containerName])

    useEffect(() => {
        ReactGA.event({
            category: 'Terminal',
            action: `Selected Shell`,
            label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
        });

        reconnect()

    }, [terminalViewProps.shell])

    useEffect(() => {
        if (terminalViewProps.terminalCleared) {
            terminal?.clear();
            terminal?.focus();
            terminalViewProps.setTerminalCleared(false);
        }
    }, [terminalViewProps.terminalCleared])

    useEffect(() => {
        if (firstMessageReceived) {
            fitAddon.fit();
            terminal.setOption('cursorBlink', true);
            terminalViewProps.setSocketConnection('CONNECTED');
        }
    }, [firstMessageReceived])

    useEffect(() => {
        if (!window.location.origin) { // Some browsers (mainly IE) do not have this property, so we need to build it manually...
            // @ts-ignore
            window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : '');
        }

        terminalViewProps.setSocketConnection("CONNECTING");

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

            let duration = moment(ga_session_duration).fromNow();

            ReactGA.event({
                category: 'Terminal',
                action: `Closed`,
                label: `${duration}`,
            });
        };
    }, []);

    useEffect(() => {
        if (terminalViewProps.terminalCleared) {
            terminal?.clear();
            terminal?.focus();
            terminalViewProps.setTerminalCleared(false);
        }
    }, [terminalViewProps.terminalCleared]);

    const getNewSession = () => {
        if (
            !terminalViewProps.nodeName ||
            !terminalViewProps.containerName ||
            !terminalViewProps.shell.value ||
            !appDetails
        )
            return;

        let url = `api/v1/applications/pod/exec/session/${appDetails.appId}/${appDetails.environmentId}/${appDetails.namespace}/${terminalViewProps.nodeName}/${terminalViewProps.shell.value}/${terminalViewProps.containerName}`;

        get(url)
            .then((response: any) => {
                let sessionId = response?.result.SessionID;

                if (!terminal) {
                    createNewTerminal();
                }

                postInitialize(sessionId);
            })
            .catch((error) => {
                console.log('error while getNewSession ', error);
            });
    }

    return (
        <div className="terminal-view" style={{ height: '100vh' }}>
            <div
                style={{ zIndex: 4, textTransform: 'capitalize' }}
                className={`${
                    terminalViewProps.socketConnection !== 'CONNECTED'
                        ? `${
                              terminalViewProps.socketConnection === 'CONNECTING' ? 'bcy-2' : 'bcr-7'
                          } pod-readyState--show`
                        : ''
                } ${
                    terminalViewProps.socketConnection === 'CONNECTING' ? 'cn-9' : 'cn-0'
                } m-0 w-100 pod-readyState pod-readyState--top`}
            >
                <span className={terminalViewProps.socketConnection === 'CONNECTING' ? 'loading-dots' : ''}>
                    {terminalViewProps.socketConnection?.toLowerCase()}
                </span>
                {terminalViewProps.socketConnection === 'DISCONNECTED' && (
                    <React.Fragment>
                        <span>.&nbsp;</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                console.log('Resume clicked');
                                e.stopPropagation();
                                terminalViewProps.setSocketConnection('CONNECTING');
                                setIsReconnection(true);
                            }}
                            className="cursor transparent inline-block"
                            style={{ textDecoration: 'underline' }}
                        >
                            Resume
                        </button>
                    </React.Fragment>
                )}
            </div>

            <div>
                <div id="terminal-id"></div>
            </div>

            {terminalViewProps.socketConnection === 'CONNECTED' && (
                <p
                    style={{ position: 'relative', bottom: '10px' }}
                    className={`ff-monospace pt-2 fs-13 pb-2 m-0 capitalize cg-4`}
                >
                    {terminalViewProps.socketConnection}
                </p>
            )}
        </div>
    );
}

export default TerminalView;
