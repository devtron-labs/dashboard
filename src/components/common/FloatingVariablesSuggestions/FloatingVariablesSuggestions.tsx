import React, { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import Suggestions from './Suggestions'
import { FloatingVariablesSuggestionsProps } from './types'
import { ReactComponent as ICDrag } from '../../../assets/icons/drag.svg'
import { ReactComponent as ICGridView } from '../../../assets/icons/ic-grid-view.svg'

export default function FloatingVariablesSuggestions({
    zIndex,
    loading,
    variables,
    reloadVariables,
    error,
}: FloatingVariablesSuggestionsProps) {
    const [isActive, setIsActive] = useState<boolean>(false)
    // Do we even need this state since initialPosition is constant?
    const [initialPosition, setInitialPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

    // In case of StrictMode, we get error findDOMNode is deprecated in StrictMode
    // So we use useRef to get the DOM node
    const nodeRef = useRef(null)

    useEffect(() => {
        // Since buttonPosition is relative to initialPosition, we need to find initialPosition with respect to the screen
        const initialPosition = nodeRef.current.getBoundingClientRect()
        setInitialPosition({ x: initialPosition.x, y: initialPosition.y })
    }, [])

    const handleStopPropagation = (e: React.MouseEvent<HTMLOrSVGElement>) => {
        e.stopPropagation()
    }

    const handleActivation = () => {
        const currentPosInScreen = {
            x: initialPosition.x + buttonPosition.x,
            y: initialPosition.y + buttonPosition.y,
        }

        if (currentPosInScreen.y > window.innerHeight - 504) {
            setButtonPosition({ x: buttonPosition.x, y: window.innerHeight - 504 - initialPosition.y })
        }

        if (currentPosInScreen.x > window.innerWidth - 356) {
            setButtonPosition({ x: window.innerWidth - 356 - initialPosition.x, y: buttonPosition.y })
        }

        if (currentPosInScreen.x > window.innerWidth - 356 && currentPosInScreen.y > window.innerHeight - 504) {
            setButtonPosition({
                x: window.innerWidth - 356 - initialPosition.x,
                y: window.innerHeight - 504 - initialPosition.y,
            })
        }

        setIsActive(true)
    }

    const handleDeActivation = (e: React.MouseEvent<HTMLOrSVGElement>) => {
        e.stopPropagation()
        setIsActive(false)
    }

    // e will be unused, but we need to pass it as a parameter since Draggable expects it
    const handleButtonDrag = (e, data: { x: number; y: number }) => {
        setButtonPosition(data)
    }

    if (!isActive)
        return (
            <Draggable bounds="body" handle=".handle-drag" nodeRef={nodeRef} onDrag={handleButtonDrag}>
                <button
                    className="bcn-7 dc__outline-none-imp dc__border-n0 br-48 flex h-40 pt-8 pb-8 pl-12 pr-12 dc__gap-8 dc__no-shrink dc__position-abs"
                    style={{ zIndex, boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.20)' }}
                    onClick={handleActivation}
                    ref={nodeRef}
                    type="button"
                >
                    <ICDrag className="handle-drag dc__grabbable scn-4 icon-dim-20" onClick={handleStopPropagation} />
                    {/* DUMMY ICON */}
                    <ICGridView className="scn-0 icon-dim-20" />
                </button>
            </Draggable>
        )

    return (
        <Draggable
            bounds="body"
            handle=".handle-drag"
            nodeRef={nodeRef}
            position={buttonPosition}
            onDrag={handleButtonDrag}
        >
            <div
                className="flex column dc__no-shrink w-356 dc__content-space dc__border-radius-8-imp dc__border-n7 dc__overflow-hidden dc__position-abs mxh-504"
                style={{
                    zIndex,
                    boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.25)',
                }}
                ref={nodeRef}
            >
                <Suggestions
                    handleDeActivation={handleDeActivation}
                    loading={loading}
                    variables={variables}
                    reloadVariables={reloadVariables}
                    error={error}
                />
            </div>
        </Draggable>
    )
}
