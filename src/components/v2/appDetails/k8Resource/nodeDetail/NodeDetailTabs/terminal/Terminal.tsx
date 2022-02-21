import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import CopyToast,{handleSelectionChange} from '../CopyToast';
import * as XtermWebfont from 'xterm-webfont';
import SockJS from 'sockjs-client';
import { SocketConnectionType } from '../node.type';
import { get } from '../../../../../../../services/api';
import ReactGA from 'react-ga';
import './terminal.css';
import IndexStore from '../../../../index.store';
import { AppType } from '../../../../appDetails.type';

interface TerminalViewProps {
    nodeName: string;
    shell: any;
    containerName: string;
    socketConnection: SocketConnectionType;
    terminalCleared: boolean;
    setTerminalCleared: (flag: boolean) => void;
    setSocketConnection: (flag: SocketConnectionType) => void;
}

let socket = undefined;
let terminal = undefined;
let fitAddon = undefined;

function TerminalView(terminalViewProps: TerminalViewProps) {
    const [ga_session_duration, setGA_session_duration] = useState<moment.Moment>();
    const [isReconnection, setIsReconnection] = useState(false);
    const [firstMessageReceived, setFirstMessageReceived] = useState(false);
    const [popupText, setPopupText] = useState<boolean>(false);

    useEffect(() => {
        if (!popupText) return;
        setTimeout(() => setPopupText(false), 2000);
    }, [popupText]);

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
        handleSelectionChange(terminal,setPopupText);
        fitAddon = new FitAddon();
        const webFontAddon = new XtermWebfont();
        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webFontAddon);
        terminal.loadWebfontAndOpen(document.getElementById('terminal-id'));
        fitAddon.fit();
        terminal.reset();
        terminal.attachCustomKeyEventHandler((event) => {
            if ((event.metaKey && event.key === 'k') || event.key === 'K') {
                terminal?.clear();
            }

            return true;
        });
    };

    const postInitialize = (sessionId: string) => {
        let socketURL = process.env.REACT_APP_ORCHESTRATOR_ROOT;
        if (appDetails.appType === AppType.EXTERNAL_HELM_CHART) {
            socketURL += '/k8s/pod/exec/sockjs/ws/';
        } else {
            socketURL += '/api/vi/pod/exec/ws/';
        }

        socket?.close();

        setFirstMessageReceived(false);

        socket = new SockJS(socketURL);
        const _socket = socket;
        const _terminal = terminal;
        const _fitAddon = fitAddon;

        const disableInput = (): void => {
            _terminal.setOption('cursorBlink', false);
            _terminal.setOption('disableStdin', true);
            setFirstMessageReceived(false);
        };

        const enableInput = (): void => {
            _terminal.setOption('cursorBlink', true);
            _terminal.setOption('disableStdin', false);
        };

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
            }
        };

        _socket.onmessage = function (evt) {
            _terminal.write(JSON.parse(evt.data).Data);
            _terminal.focus();
            enableInput();

            if (!firstMessageReceived) {
                setFirstMessageReceived(true);
            }
        };

        _socket.onclose = function (evt) {
            disableInput();
            terminalViewProps.setSocketConnection('DISCONNECTED');
        };

        _socket.onerror = function (evt) {
            disableInput();
            terminalViewProps.setSocketConnection('DISCONNECTED');
        };
    };

    const reconnect = () => {
        terminalViewProps.setSocketConnection('DISCONNECTING');
        terminal?.reset();

        setTimeout(() => {
            terminalViewProps.setSocketConnection('CONNECTING');
        }, 100);
    };

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
    }, [terminalViewProps.socketConnection]);

    useEffect(() => {
        ReactGA.event({
            category: 'Terminal',
            action: `Selected Pod`,
            label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
        });

        reconnect();
    }, [terminalViewProps.nodeName]);

    useEffect(() => {
        ReactGA.event({
            category: 'Terminal',
            action: `Selected Container`,
            label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
        });

        reconnect();
    }, [terminalViewProps.containerName]);

    useEffect(() => {
        ReactGA.event({
            category: 'Terminal',
            action: `Selected Shell`,
            label: `${terminalViewProps.nodeName}/${terminalViewProps.containerName}/${terminalViewProps.shell.value}`,
        });

        reconnect();
    }, [terminalViewProps.shell]);

    useEffect(() => {
        if (terminalViewProps.terminalCleared) {
            terminal?.clear();
            terminal?.focus();
            terminalViewProps.setTerminalCleared(false);
        }
    }, [terminalViewProps.terminalCleared]);

    useEffect(() => {
        if (firstMessageReceived) {
            fitAddon.fit();
            terminal.setOption('cursorBlink', true);
            terminalViewProps.setSocketConnection('CONNECTED');
        }
    }, [firstMessageReceived]);

    useEffect(() => {
        if (!window.location.origin) {
            // Some browsers (mainly IE) do not have this property, so we need to build it manually...
            // @ts-ignore
            window.location.origin =
                window.location.protocol +
                '//' +
                window.location.hostname +
                (window.location.port ? ':' + window.location.port : '');
        }

        terminalViewProps.setSocketConnection('CONNECTING');

        ReactGA.event({
            category: 'Terminal',
            action: 'Open',
        });

        setGA_session_duration(moment());

        return () => {
            socket?.close();
            terminal?.dispose();

            socket = undefined;
            terminal = undefined;
            fitAddon = undefined;

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
        ) {
            return;
        }

        let url = '';
        if (appDetails.appType === AppType.EXTERNAL_HELM_CHART) {
            url = `k8s/pod/exec/session/${appDetails.appId}`;
        } else {
            url = `api/v1/applications/pod/exec/session/${appDetails.appId}/${appDetails.environmentId}`;
        }
        url += `/${appDetails.namespace}/${terminalViewProps.nodeName}/${terminalViewProps.shell.value}/${terminalViewProps.containerName}`;

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
    };

    return (
        <div className="terminal-view">
            <div
                style={{ zIndex: 4, textTransform: 'capitalize' }}
                className={`${
                    terminalViewProps.socketConnection !== 'CONNECTED'
                        ? `${
                              terminalViewProps.socketConnection === 'CONNECTING' ? 'bcy-2' : 'bcr-7'
                          } pod-readyState--show pl-20`
                        : 'pb-10'
                } ${
                    terminalViewProps.socketConnection === 'CONNECTING' ? 'cn-9' : 'cn-0'
                } m-0 pl-20 w-100 pod-readyState pod-readyState--top`}
            >
                {terminalViewProps.socketConnection !== 'CONNECTED' && (
                    <span className={terminalViewProps.socketConnection === 'CONNECTING' ? 'loading-dots' : ''}>
                        {terminalViewProps.socketConnection?.toLowerCase()}
                    </span>
                )}
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
                <div id="terminal-id" className="pl-20"></div>
            </div>

            {terminalViewProps.socketConnection === 'CONNECTED' && (
                <p className={`connection-status ff-monospace pt-2 pl-20 fs-13 pb-2 m-0 capitalize cg-4`}>
                    {terminalViewProps.socketConnection}
                </p>
            )}
             
            <CopyToast showCopyToast={popupText}/>
        </div>
    );
}

export default TerminalView;
