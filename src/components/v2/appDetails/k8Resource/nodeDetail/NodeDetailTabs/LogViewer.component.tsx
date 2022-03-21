import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import CopyToast, { handleSelectionChange } from './CopyToast';
import * as XtermWebfont from 'xterm-webfont';
import { SearchAddon } from 'xterm-addon-search';
import '../../../../../../../node_modules/xterm/css/xterm.css';
import './nodeDetailTab.scss';
import { Subject } from '../../../../../../util/Subject';
import { Scroller } from '../../../../../app/details/cIDetails/CIDetails';

interface logViewerInterface {
    rootClassName?: string;
    style?: object;
    indexHidden?: boolean;
    highlightString?: string;
    subject: Subject<string>;
    reset?: boolean
}

const LogViewerComponent: React.FunctionComponent<logViewerInterface> = ({
    subject,
    rootClassName = '',
    indexHidden = true,
    highlightString = '',
    reset = false,
}) => {
    let subscribed: boolean = false,
        unsubscribe: () => boolean = null;
    const terminal = useRef<Terminal>(null);
    const fitAddon = useRef<FitAddon>(null);
    const searchAddon = useRef<SearchAddon>(null);
    const webFontAddon = useRef(null);

    const [popupText, setPopupText] = useState<boolean>(false);

    useEffect(() => {
        if (!popupText) return;
        setTimeout(() => setPopupText(false), 2000);
    }, [popupText]);

    function handleKeyPress(e): boolean {
        switch (e.key) {
            case 'n':
                e.stopPropagation();
                e.preventDefault();
                if (e.type === 'keydown' && highlightString && searchAddon.current)
                    searchAddon.current.findNext(highlightString);
                return false;
            case 'N':
                e.stopPropagation();
                e.preventDefault();
                if (e.type === 'keydown' && highlightString && searchAddon.current) {
                    if (e.shiftKey) searchAddon.current.findPrevious(highlightString);
                    else searchAddon.current.findNext(highlightString);
                }
                return false;
            case 'Enter':
                terminal.current.writeln('');
                break;
            default:
                return false;
        }
    }

    function scrollToTop(e) {
        if (terminal.current) terminal.current.scrollToTop();
    }

    function scrollToBottom(e) {
        if (terminal.current) terminal.current.scrollToBottom();
    }

    useEffect(() => {
        terminal.current = new Terminal({
            scrollback: 99999,
            fontSize: 14,
            lineHeight: 1.4,
            fontFamily: 'Inconsolata',
            // disableStdin: true,
            cursorStyle: 'bar',
            cursorWidth: 1,
            theme: {
                background: '#0b0f22',
                foreground: '#FFFFFF',
                // selection: '#0066cc4d',
            },
        });
        terminal.current.attachCustomKeyEventHandler(handleKeyPress);
        handleSelectionChange(terminal.current,setPopupText);
        fitAddon.current = new FitAddon();
        webFontAddon.current = new XtermWebfont();

        terminal.current.loadAddon(fitAddon.current);
        fitAddon.current.fit();
        terminal.current.loadAddon(webFontAddon.current);
        searchAddon.current = new SearchAddon();
        terminal.current.loadAddon(searchAddon.current);
        searchAddon.current.activate(terminal.current);
        (terminal.current as any).loadWebfontAndOpen(document.getElementById('xterm-logs'));
        fitAddon.current.fit();
        terminal.current.reset();
        if (unsubscribe !== null) {
            unsubscribe();
        }
        [subscribed, unsubscribe] = subject.subscribe(function (log: string) {
            fitAddon.current.fit();
            terminal.current.writeln(log.toString());
        });
        return () => {
            if (unsubscribe !== null) {
                unsubscribe();
            }
            terminal.current.dispose();
            fitAddon.current = null;
            searchAddon.current = null;
            terminal.current = null;
            webFontAddon.current = null;
        };
    }, []);

    useEffect(() => {
        if (reset) {
            terminal.current.reset()
        }
    }, [reset])

    return (
        <>
            <CopyToast showCopyToast={popupText} />
            <Scroller
                scrollToBottom={scrollToBottom}
                scrollToTop={scrollToTop}
                style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: '3' }}
            />
        </>
    );
};

export default LogViewerComponent;
