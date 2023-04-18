import React, { useRef, useState } from 'react'
import { useOnline } from '../../../../../../common'
import { SocketConnectionType } from '../node.type'
import { TERMINAL_TEXT } from './constants'
import TerminalView from './Terminal.component'
import terminalStripTypeData from './terminal.utils'

export default function TerminalWrapper({ selectionListData, socketConnection, setSocketConnection, className }) {
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
        const terminalData = selectionListData.tabSwitcher.terminalData

        return (
            <TerminalView
                terminalRef={terminalData.terminalRef}
                sessionId={terminalData.sessionId}
                socketConnection={terminalData.socketConnection}
                setSocketConnection={terminalData.setSocketConnection}
                isTerminalTab={terminalData.isTerminalTab}
                renderConnectionStrip={() => (
                    <RenderConnectionStrip
                        renderStripMessage={terminalData.stripMessage}
                        socketConnection={socketConnection}
                        setSocketConnection={setSocketConnection}
                    />
                )}
                registerLinkMatcher={terminalData.registerLinkMatcher}
                terminalMessageData={terminalData.terminalMessageData}
                isTerminalCleared={terminalData.terminalCleared}
            />
        )
    }

    return (
        <div className={className}>
            <div className="flex bcn-0 pl-20 dc__border-top h-32">{firstStrip()}</div>
            <div className="flex left bcn-0 pl-20 dc__border-top h-28">{secondStrip()}</div>
            {typeof selectionListData.tabSwitcher.terminalTabWrapper === 'function'
                ? selectionListData.tabSwitcher.terminalTabWrapper(renderTerminalView())
                : renderTerminalView()}
        </div>
    )
}

export function RenderConnectionStrip({
    renderStripMessage,
    socketConnection,
    setSocketConnection,
}: {
    renderStripMessage?: any
    socketConnection: SocketConnectionType
    setSocketConnection: (type: SocketConnectionType) => void
}) {
    const isOnline = useOnline()

    const reconnect = () => {
        setSocketConnection(SocketConnectionType.CONNECTING)
    }

    if (!isOnline) {
        return (
            <div className="terminal-strip pl-20 pr-20 w-100 bcr-7 cn-0">{TERMINAL_TEXT.OFFLINE_CHECK_CONNECTION}</div>
        )
    }

    const renderStrip = () => {
        if (!isOnline) {
            return (
                <div className="terminal-strip pl-20 pr-20 w-100 bcr-7 cn-0">
                    {TERMINAL_TEXT.OFFLINE_CHECK_CONNECTION}
                </div>
            )
        } else if (renderStripMessage) {
            return renderStripMessage
        } else {
            return (
                <div
                    className={`dc__first-letter-capitalize ${
                        socketConnection !== SocketConnectionType.CONNECTED &&
                        `${socketConnection === SocketConnectionType.CONNECTING ? 'bcy-2' : 'bcr-7'}  pl-20`
                    } ${socketConnection === SocketConnectionType.CONNECTING ? 'cn-9' : 'cn-0'} m-0 pl-20 w-100`}
                >
                    {socketConnection !== SocketConnectionType.CONNECTED && (
                        <span
                            className={socketConnection === SocketConnectionType.CONNECTING ? 'dc__loading-dots' : ''}
                        >
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
    }

    return <div className=''>{renderStrip()}</div>
}
