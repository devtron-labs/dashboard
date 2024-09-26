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

import React from 'react'
import { SocketConnectionType } from '../../../../../../ClusterNodes/constants'
import { useOnline } from '../../../../../../common'
import { TERMINAL_TEXT } from './constants'
import TerminalView from './Terminal'
import { ConnectionStripMessageType, TerminalWrapperProps } from './terminal.type'
import terminalStripTypeData from './terminal.utils'

export default function TerminalWrapper({
    selectionListData,
    socketConnection,
    setSocketConnection,
    className,
    dataTestId,
    isResourceBrowserView,
}: TerminalWrapperProps) {
    const firstStrip = () => {
        return (
            <div className="flex left w-100">
                {selectionListData.firstRow.map((ele) => {
                    return terminalStripTypeData(ele)
                })}
            </div>
        )
    }

    const secondStrip = () => {
        return selectionListData.secondRow.map((ele) => {
            return terminalStripTypeData(ele)
        })
    }

    const renderTerminalView = () => {
        const { terminalData } = selectionListData.tabSwitcher

        return (
            <TerminalView
                terminalRef={terminalData.terminalRef}
                dataTestId={terminalData.dataTestId}
                sessionId={terminalData.sessionId}
                socketConnection={terminalData.socketConnection}
                setSocketConnection={terminalData.setSocketConnection}
                isTerminalTab={terminalData.isTerminalTab}
                renderConnectionStrip={() => (
                    <RenderConnectionStrip
                        renderStripMessage={terminalData.renderConnectionStrip}
                        socketConnection={socketConnection}
                        setSocketConnection={setSocketConnection}
                    />
                )}
                registerLinkMatcher={terminalData.registerLinkMatcher}
                terminalMessageData={terminalData.terminalMessageData}
                metadata={selectionListData.metadata}
                clearTerminal={terminalData.clearTerminal}
                isResourceBrowserView={isResourceBrowserView}
            />
        )
    }

    return (
        <div className={className} data-testid={dataTestId}>
            <div className="flex bcn-0 pl-20 h-32 terminal-action-strip dc__zi-11">{firstStrip()}</div>
            {selectionListData.secondRow && (
                <div className="flex left bcn-0 pl-20 dc__border-top terminal-action-strip">{secondStrip()}</div>
            )}
            {typeof selectionListData.tabSwitcher.terminalTabWrapper === 'function'
                ? selectionListData.tabSwitcher.terminalTabWrapper(renderTerminalView())
                : renderTerminalView()}
        </div>
    )
}

export const RenderConnectionStrip = ({
    renderStripMessage,
    socketConnection,
    setSocketConnection,
}: ConnectionStripMessageType) => {
    const isOnline = useOnline()

    const reconnect = () => {
        setSocketConnection(SocketConnectionType.CONNECTING)
    }

    if (!isOnline) {
        return (
            <div className="terminal-strip pl-20 pr-20 w-100 bcr-7 cn-0 connection-status-strip">
                {TERMINAL_TEXT.OFFLINE_CHECK_CONNECTION}
            </div>
        )
    }

    const renderStrip = () => {
        if (renderStripMessage) {
            return renderStripMessage
        }
        return (
            <div
                className={`dc__first-letter-capitalize ${
                    socketConnection !== SocketConnectionType.CONNECTED &&
                    `${
                        socketConnection === SocketConnectionType.CONNECTING ? 'bcy-2' : 'bcr-7'
                    } connection-status-strip pl-20`
                } ${socketConnection === SocketConnectionType.CONNECTING ? 'cn-9' : 'cn-0'} m-0 pl-20 w-100`}
            >
                {socketConnection !== SocketConnectionType.CONNECTED && (
                    <span className={socketConnection === SocketConnectionType.CONNECTING ? 'dc__loading-dots' : ''}>
                        {socketConnection?.toLowerCase()}
                    </span>
                )}
                {socketConnection === SocketConnectionType.DISCONNECTED && (
                    <>
                        <span>.&nbsp;</span>
                        <button
                            type="button"
                            onClick={reconnect}
                            className="cursor dc_transparent dc__inline-block dc__underline dc__no-background dc__no-border"
                        >
                            Resume
                        </button>
                    </>
                )}
            </div>
        )
    }

    return <div data-testid="terminal-strip-message">{renderStrip()}</div>
}
