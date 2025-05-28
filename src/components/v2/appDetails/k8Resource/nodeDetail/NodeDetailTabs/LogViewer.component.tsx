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
import { AutoSizer } from 'react-virtualized'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { SearchAddon } from 'xterm-addon-search'
import * as XtermWebfont from 'xterm-webfont'

import { Scroller } from '@devtron-labs/devtron-fe-common-lib'

import { Subject } from '../../../../../../util/Subject'
import CopyToast, { handleSelectionChange } from './CopyToast'

import 'xterm/css/xterm.css'
import './nodeDetailTab.scss'

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
    highlightString = '',
    reset = false,
}) => {
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
                return false
            default:
                return false
        }
    }

    const scrollToTop = () => {
        if (terminal.current) {
            terminal.current.scrollToTop()
        }
    }

    const scrollToBottom = () => {
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
        // eslint-disable-next-line new-cap
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
        const [, unsub] = subject.subscribe((log: string) => {
            fitAddon.current.fit()
            terminal.current.writeln(log.toString())
        })
        unsubscribe = unsub
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
                style={{ position: 'absolute', bottom: '5px', right: '20px', zIndex: '5' }}
            />
        </>
    )
}

export default LogViewerComponent
