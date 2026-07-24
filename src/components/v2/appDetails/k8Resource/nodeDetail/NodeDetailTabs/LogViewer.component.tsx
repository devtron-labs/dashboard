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
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'

import { Scroller } from '@devtron-labs/devtron-fe-common-lib'

import { Subject } from '../../../../../../util/Subject'
import CopyToast, { handleSelectionChange } from './CopyToast'

import '@xterm/xterm/css/xterm.css'
import './nodeDetailTab.scss'

interface logViewerInterface {
    subject: Subject<string>
    reset?: boolean
}

const LogViewerComponent: React.FunctionComponent<logViewerInterface> = ({ subject, reset = false }) => {
    let unsubscribe: () => boolean = null

    const xtermContainerRef = useRef<HTMLDivElement>(null)
    const terminal = useRef<Terminal>(null)
    const fitAddon = useRef<FitAddon>(null)

    const [popupText, setPopupText] = useState<boolean>(false)

    useEffect(() => {
        if (!popupText) {
            return
        }
        setTimeout(() => setPopupText(false), 2000)
    }, [popupText])

    const scrollToTop = () => {
        terminal.current?.scrollToTop()
    }

    const scrollToBottom = () => {
        terminal.current?.scrollToBottom()
    }

    useEffect(() => {
        terminal.current = new Terminal({
            scrollback: 99999,
            fontSize: 14,
            lineHeight: 1.4,
            fontFamily: 'Inconsolata, monospace',
            cursorStyle: 'bar',
            cursorWidth: 1,
            // Cannot use variables here
            theme: {
                background: '#181920',
                foreground: '#FFFFFF',
            },
        })

        handleSelectionChange(terminal.current, setPopupText)

        terminal.current.attachCustomKeyEventHandler((event: KeyboardEvent) => {
            if (event.type === 'keydown' && event.key === 'Enter') {
                terminal.current.writeln('')
                return false
            }
            return true
        })

        fitAddon.current = new FitAddon()
        terminal.current.loadAddon(fitAddon.current)

        const container = xtermContainerRef.current
        terminal.current.open(container)
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
            terminal.current = null
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
                    <div ref={xtermContainerRef} style={{ height, width }} data-testid="xterm-logs" id="xterm-logs">
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
