import React, { useRef, useState } from 'react'
import TerminalView from './Terminal.component'
import terminalStripTypeData from './terminal.utils'

export default function TerminalWrapper({ selectionListData, socketConnection, setSocketConnection, className }) {
    const firstStrip = () => {
        return (
            <div className="flex left w-100">
                {selectionListData?.firstRow.map((ele) => {
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
        return (
            <TerminalView
                terminalRef={selectionListData.tabSwitcher.terminalData.terminalRef}
                initializeTerminal={selectionListData.tabSwitcher.terminalData.initializeTerminal}
                socketConnection={selectionListData.tabSwitcher.terminalData.socketConnection}
                setSocketConnection={selectionListData.tabSwitcher.terminalData.setSocketConnection}
                renderConnectionStrip={() => <></>}
                registerLinkMatcher={selectionListData.tabSwitcher.terminalData.registerLinkMatcher}
                terminalMessageData={() => <></>}
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
