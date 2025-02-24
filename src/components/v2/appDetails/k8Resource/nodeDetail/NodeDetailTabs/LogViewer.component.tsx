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
import { SearchAddon } from 'xterm-addon-search'
import { AutoSizer } from 'react-virtualized'
import CopyToast, { handleSelectionChange } from './CopyToast'
import 'xterm/css/xterm.css'
import './nodeDetailTab.scss'
import { Subject } from '../../../../../../util/Subject'
import { Scroller } from '@devtron-labs/devtron-fe-common-lib'

interface logViewerInterface {
    rootClassName?: string
    style?: object
    indexHidden?: boolean
    highlightString?: string
    subject: Subject<string>
    reset?: boolean
}

const LogViewerComponent: React.FunctionComponent<logViewerInterface> = ({
    subject,
    rootClassName = '',
    indexHidden = true,
    highlightString = '',
    reset = false,
}) => {
    let subscribed: boolean = false
    let unsubscribe: () => boolean = null
    const terminal = useRef<Terminal>(null)
    const fitAddon = useRef<FitAddon>(null)
    const searchAddon = useRef<SearchAddon>(null)
    const webFontAddon = useRef(null)

    const [popupText, setPopupText] = useState<boolean>(false)

    useEffect(() => {
        if (!popupText) {
            return
        }
        setTimeout(() => setPopupText(false), 2000)
    }, [popupText])

    function handleKeyPress(e): boolean {
        switch (e.key) {
            case 'n':
                e.stopPropagation()
                e.preventDefault()
                if (e.type === 'keydown' && highlightString && searchAddon.current) {
                    searchAddon.current.findNext(highlightString)
                }
                return false
            case 'N':
                e.stopPropagation()
                e.preventDefault()
                if (e.type === 'keydown' && highlightString && searchAddon.current) {
                    if (e.shiftKey) {
                        searchAddon.current.findPrevious(highlightString)
                    } else {
                        searchAddon.current.findNext(highlightString)
                    }
                }
                return false
            case 'Enter':
                terminal.current.writeln('')
                break
            default:
                return false
        }
    }

    function scrollToTop(e) {
        if (terminal.current) {
            terminal.current.scrollToTop()
        }
    }

    function scrollToBottom(e) {
        if (terminal.current) {
            terminal.current.scrollToBottom()
        }
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
            // Cannot use variables here
            theme: {
                // Using hex code for --terminal-bg
                background: '#181920',
                foreground: '#FFFFFF',
                // selection: '#0066cc4d',
            },
        })
        terminal.current.attachCustomKeyEventHandler(handleKeyPress)
        handleSelectionChange(terminal.current, setPopupText)
        fitAddon.current = new FitAddon()
        /**
         * Adding default check due to vite build changing the export
         * for production the value will be `webFontAddon.current = new XtermWebfont.default()`
         * for local the value will be `webFontAddon.current = new XtermWebfont()`
         */
        webFontAddon.current = XtermWebfont.default ? new XtermWebfont.default() : new XtermWebfont()

        terminal.current.loadAddon(fitAddon.current)
        terminal.current.loadAddon(webFontAddon.current)
        searchAddon.current = new SearchAddon()
        terminal.current.loadAddon(searchAddon.current)
        searchAddon.current.activate(terminal.current)
        ;(terminal.current as any).loadWebfontAndOpen(document.getElementById('xterm-logs'))
        fitAddon.current.fit()
        terminal.current.reset()
        if (unsubscribe !== null) {
            unsubscribe()
        }
        ;[subscribed, unsubscribe] = subject.subscribe(function (log: string) {
            fitAddon.current.fit()
            terminal.current.writeln(log.toString())
        })
        return () => {
            if (unsubscribe !== null) {
                unsubscribe()
            }
            terminal.current.dispose()
            fitAddon.current = null
            searchAddon.current = null
            terminal.current = null
            webFontAddon.current = null
        }
    }, [])

    useEffect(() => {
        if (reset) {
            terminal.current.reset()
        }
    }, [reset])

    return (
        <>
            <AutoSizer>
                {({ height, width }) => (
                    <div style={{ height, width }} data-testid="xterm-logs" id="xterm-logs">
                        <CopyToast showCopyToast={popupText} />
                    </div>
                )}
            </AutoSizer>
            <Scroller
                scrollToBottom={scrollToBottom}
                scrollToTop={scrollToTop}
                style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: '5' }}
            />
        </>
    )
}

export default LogViewerComponent
