import React, { useState, useRef } from 'react'
import Draggable from 'react-draggable'
import { FloatingVariablesSuggestionsInterface } from './types'
import { ReactComponent as ICDrag } from '../../../assets/icons/drag.svg'
import { ReactComponent as ICGridView } from '../../../assets/icons/ic-grid-view.svg'

export default function FloatingVariablesSuggestions({ zIndex }: FloatingVariablesSuggestionsInterface) {
    const [isActive, setIsActive] = useState(false)
    // In case of StrictMode, we get error findDOMNode is deprecated in StrictMode
    // So we use useRef to get the DOM node
    const nodeRef = useRef(null)

    const handleActivation = () => {
        setIsActive(true)
    }

    return (
        <Draggable bounds="parent" handle=".handle-drag" nodeRef={nodeRef}>
            {isActive ? (
                <div ref={nodeRef}></div>
            ) : (
                <button
                    className="bcn-7 dc__outline-none-imp dc__border-n0 br-48 flex h-40 pt-8 pb-8 pl-12 pr-12 dc__gap-8 dc__no-shrink"
                    style={{ zIndex: zIndex, boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.20)' }}
                    ref={nodeRef}
                    onClick={handleActivation}
                >
                    <ICDrag className="handle-drag scn-4 icon-dim-20" onClick={(e) => e.stopPropagation()} />

                    {/* DUMMY ICON */}
                    <ICGridView className="scn-0 icon-dim-20" />
                </button>
            )}
        </Draggable>
    )
}
