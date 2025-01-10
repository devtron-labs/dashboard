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

import React, { useState, useRef, useMemo, useCallback, memo, useEffect } from 'react'
import { useAsync, useWindowSize } from '@devtron-labs/devtron-fe-common-lib'
import Draggable from 'react-draggable'
import Tippy from '@tippyjs/react'
import Suggestions from './Suggestions'
import { getScopedVariables } from './service'
import { FloatingVariablesSuggestionsProps } from './types'
import { ReactComponent as ICDrag } from '../../../assets/icons/drag.svg'
import { ReactComponent as ICVariable } from '../../../assets/icons/ic-variable.svg'
import { SUGGESTIONS_SIZE } from './constants'

/**
 * Component uses react-draggable and handles the re-sizing and positioning of the suggestions on the assumption that the suggestions are going to expand to the right and bottom of the collapsed state
 * @param zIndex - To Set the zIndex of the suggestions
 * @param appId -  To fetch the scoped variables
 * @param envId - (Optional)
 * @param clusterId - (Optional)
 * @param bounds - (Optional) To set the bounds of the suggestions
 * @param hideObjectVariables - (Optional) To hide the object/array variables, default is true
 * @returns
 */
const FloatingVariablesSuggestions = ({
    zIndex,
    appId,
    envId,
    clusterId,
    bounds,
    hideObjectVariables = true,
}: FloatingVariablesSuggestionsProps) => {
    const [isActive, setIsActive] = useState<boolean>(false)
    const [collapsedPosition, setCollapsedPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const [expandedPosition, setExpandedPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

    const [loadingScopedVariables, variablesData, error, reloadScopedVariables] = useAsync(
        () => getScopedVariables(appId, envId, clusterId, hideObjectVariables),
        [appId, envId, clusterId],
    )

    const windowSize = useWindowSize()
    // In case of StrictMode, we get error findDOMNode is deprecated in StrictMode
    // So we use useRef to get the DOM node
    const nodeRef = useRef(null)

    // nodeRef.current is dependency even though its a ref as initially its null and we need to get the
    // first value that it gets and after that is not going to trigger again
    const initialPosition = useMemo(() => {
        const initialPosition = nodeRef.current?.getBoundingClientRect() || {
            x: 0,
            y: 0,
        }
        return { x: initialPosition.x, y: initialPosition.y }
    }, [nodeRef.current])

    // The size of the active state can expand say in case user expands SuggestionsInfo and the widget is at bottom of screen
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries?.length > 0 && isActive) {
                const { height } = entries[0].contentRect
                if (initialPosition.y + expandedPosition.y + height > windowSize.height) {
                    setExpandedPosition({
                        x: expandedPosition.x,
                        y: windowSize.height - height - initialPosition.y,
                    })
                }
            }
        })
        resizeObserver.observe(nodeRef.current)
        return () => {
            resizeObserver.disconnect()
        }
    }, [isActive, expandedPosition, windowSize, initialPosition])

    const handleActivation = () => {
        const currentPosInScreen = {
            x: initialPosition.x + collapsedPosition.x,
            y: initialPosition.y + collapsedPosition.y,
        }

        setExpandedPosition({
            x: collapsedPosition.x,
            y: collapsedPosition.y,
        })

        if (currentPosInScreen.y > windowSize.height - SUGGESTIONS_SIZE.height) {
            setExpandedPosition({
                x: collapsedPosition.x,
                y: windowSize.height - SUGGESTIONS_SIZE.height - initialPosition.y,
            })
        }

        if (currentPosInScreen.x > windowSize.width - SUGGESTIONS_SIZE.width) {
            setExpandedPosition({
                x: windowSize.width - SUGGESTIONS_SIZE.width - initialPosition.x,
                y: collapsedPosition.y,
            })
        }

        if (
            currentPosInScreen.x > windowSize.width - SUGGESTIONS_SIZE.width &&
            currentPosInScreen.y > windowSize.height - SUGGESTIONS_SIZE.height
        ) {
            setExpandedPosition({
                x: windowSize.width - SUGGESTIONS_SIZE.width - initialPosition.x,
                y: windowSize.height - SUGGESTIONS_SIZE.height - initialPosition.y,
            })
        }

        setIsActive(true)
    }

    // Need to memoize this function since it is passed as a prop to Suggestions
    const handleDeActivation = useCallback((e: React.MouseEvent<HTMLOrSVGElement>) => {
        e.stopPropagation()
        setIsActive(false)
    }, [])

    // e will be unused, but we need to pass it as a parameter since Draggable expects it
    const handleCollapsedDrag = (e, data: { x: number; y: number }) => {
        const currentPosInScreen = {
            x: initialPosition.x + data.x,
            y: initialPosition.y + data.y,
        }
        if (
            currentPosInScreen.y < 0 ||
            currentPosInScreen.x < 0 ||
            currentPosInScreen.x + nodeRef.current?.getBoundingClientRect().width > windowSize.width ||
            currentPosInScreen.y + nodeRef.current?.getBoundingClientRect().height > windowSize.height
        ) {
            return
        }

        setCollapsedPosition(data)
    }

    const handleExpandedDrag = (e, data: { x: number; y: number }) => {
        const currentPosInScreen = {
            x: initialPosition.x + data.x,
            y: initialPosition.y + data.y,
        }
        if (
            currentPosInScreen.y < 0 ||
            currentPosInScreen.x < 0 ||
            currentPosInScreen.x + nodeRef.current?.getBoundingClientRect().width > windowSize.width ||
            currentPosInScreen.y + nodeRef.current?.getBoundingClientRect().height > windowSize.height
        ) {
            return
        }
        setExpandedPosition(data)
        // Only Need to retain the collapsed position if the user has not dragged the suggestions, so need to update
        setCollapsedPosition(data)
    }

    if (!isActive) {
        return (
            <Draggable
                bounds={bounds}
                handle=".handle-drag"
                nodeRef={nodeRef}
                position={collapsedPosition}
                onDrag={handleCollapsedDrag}
            >
                <div
                    className="bcn-7 dc__outline-none-imp dc__border-n0 br-48 flex h-40 pt-8 pb-8 pl-12 pr-12 dc__gap-8 dc__no-shrink dc__position-abs"
                    style={{ zIndex, boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.20)' }}
                    ref={nodeRef}
                    data-testid="collapsed-state"
                >
                    <button type="button" className="dc__outline-none-imp dc__no-border p-0 bcn-7 h-24">
                        <ICDrag className="handle-drag dc__grabbable icon-dim-24 fcn-2" />
                    </button>

                    <Tippy content="Scoped variables" placement="top" className="default-tt" arrow={false}>
                        <button
                            className="dc__outline-none-imp dc__no-border p-0 bcn-7 h-20"
                            type="button"
                            onClick={handleActivation}
                            data-testid="activate-suggestions"
                        >
                            <ICVariable className="scn-0 icon-dim-20" />
                        </button>
                    </Tippy>
                </div>
            </Draggable>
        )
    }

    return (
        <Draggable
            bounds={bounds}
            handle=".handle-drag"
            nodeRef={nodeRef}
            position={expandedPosition}
            onDrag={handleExpandedDrag}
        >
            <div
                className="flex column dc__no-shrink w-356 dc__content-space dc__border-radius-8-imp dc__border dc__overflow-hidden dc__position-abs mxh-504 bg__overlay"
                style={{
                    zIndex,
                    boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.25)',
                }}
                ref={nodeRef}
            >
                <Suggestions
                    handleDeActivation={handleDeActivation}
                    loading={loadingScopedVariables}
                    variables={variablesData ?? []}
                    reloadVariables={reloadScopedVariables}
                    error={error}
                />
            </div>
        </Draggable>
    )
}

// This would save API call if the props are same
export default memo(FloatingVariablesSuggestions)
