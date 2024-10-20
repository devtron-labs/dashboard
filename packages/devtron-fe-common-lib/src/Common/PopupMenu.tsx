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

import React, { useEffect } from 'react'
import { Modal } from './Modals/Modal'
import { PopupMenuBodyType, PopupMenuButtonType, PopupMenuType } from './Types'

const PopupContext = React.createContext(null)

function usePopupContext() {
    const context = React.useContext(PopupContext)
    if (!context) {
        throw new Error(`Select compound components cannot be rendered outside popupmenup`)
    }
    return context
}

const PopupMenu = ({
    children = null,
    onToggleCallback = null,
    autoClose = false,
    autoPosition = false,
    shouldPreventDefault = false,
}: PopupMenuType) => {
    const [popupPosition, setPopupPosition] = React.useState(null)
    const [opacity, setOpacity] = React.useState(0)
    const observer = React.useRef<IntersectionObserver | null>(null)
    const buttonRef = React.useRef(null)
    const buttonWidth = React.useRef(null)

    React.useEffect(() => {
        observer.current = window.IntersectionObserver ? new IntersectionObserver(intersectionCallback, options) : null
        return () => {
            if (observer && observer.current && observer.current.disconnect) observer.current.disconnect()
        }
    }, [])

    useEffect(() => {
        if (typeof onToggleCallback === 'function') {
            if (popupPosition) {
                onToggleCallback(true)
            } else {
                onToggleCallback(false)
            }
        }
    }, [popupPosition])

    useEffect(() => {
        if (buttonRef?.current && autoPosition && popupPosition) {
            const { height, x, y } = buttonRef.current.getBoundingClientRect()
            setPopupPosition({ left: x, top: y + height })
        }
    }, [buttonRef?.current?.clientHeight])

    let options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
    }

    if (!children) return children

    function intersectionCallback(entries, observer) {
        entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 1) {
                setOpacity(1)
            } else {
                const { boundingClientRect, rootBounds } = entry
                const { x, y, height, width } = boundingClientRect
                const {
                    x: buttonX,
                    y: buttonY,
                    height: buttonHeight,
                    width: buttonWidth,
                    left: buttonLeft,
                    right: buttonRight,
                    top: buttonTop,
                    bottom: buttonBottom,
                } = buttonRef.current.getBoundingClientRect()
                if (y + height > rootBounds.height) {
                    setPopupPosition({ left: buttonX, bottom: document.documentElement.clientHeight - buttonY })
                    setOpacity(1)
                }
                if (x + width > rootBounds.width) {
                    // setPopupPosition(position => ({ right: document.documentElement.clientWidth - buttonLeft,...position, left:'unset' }))
                    setPopupPosition((position) => ({ ...position, right: '20px', left: 'unset' }))
                    setOpacity(1)
                }
            }
        })
    }

    const handleOpen = (e) => {
        e.stopPropagation()
        if (shouldPreventDefault) {
            e.preventDefault()
        }
        setOpacity(0)
        const { height, x, y } = e.currentTarget.getBoundingClientRect()
        setPopupPosition({ left: x, top: y + height })
    }

    const handleClose = (e, inOrOut) => {
        if (autoClose || inOrOut === 'out') {
            if (observer && observer.current && observer.current.disconnect) observer.current.disconnect()
            setOpacity(0)
            setPopupPosition(null)
        } else {
            e.stopPropagation()
        }
    }

    function callbackRef(element) {
        if (element && observer?.current?.observe) {
            observer.current.observe(element)
        } else observer.current.disconnect()
    }

    function initialiseButtonWidth(buttonEl) {
        if (!buttonEl) return
        buttonRef.current = buttonEl
        const { bottom, height, left, right, top, width, x, y } = buttonEl.getBoundingClientRect()
        buttonWidth.current = width
    }

    return (
        <PopupContext.Provider
            value={{
                handleOpen,
                popupPosition,
                handleClose,
                opacity,
                setPopupPosition,
                callbackRef,
                buttonRef,
                initialiseButtonWidth,
                buttonWidth,
            }}
        >
            {children}
        </PopupContext.Provider>
    )
}

const Button = ({
    children = null,
    disabled = false,
    rootClassName = '',
    tabIndex = 0,
    onHover = false,
    isKebab = false,
    dataTestId = '',
}: PopupMenuButtonType) => {
    const { handleOpen, popupPosition, buttonRef, initialiseButtonWidth } = usePopupContext()
    return (
        <button
            ref={initialiseButtonWidth}
            type="button"
            tabIndex={tabIndex}
            disabled={disabled}
            className={`${rootClassName} ${popupPosition ? 'focused' : ''}  ${
                isKebab ? 'popup-button-kebab' : 'popup-button'
            }`}
            onMouseEnter={onHover ? (disabled ? null : handleOpen) : () => {}}
            onClick={disabled ? null : handleOpen}
            data-testid={dataTestId}
        >
            {children}
        </button>
    )
}

const Body = ({
    children = null,
    rootClassName = '',
    style = {},
    autoWidth = false,
    preventWheelDisable = false,
    noBackDrop,
}: PopupMenuBodyType) => {
    const { handleClose, popupPosition, opacity, callbackRef, buttonWidth } = usePopupContext()
    return popupPosition ? (
        <Modal
            callbackRef={callbackRef}
            onClick={handleClose}
            rootClassName={`${rootClassName} popup-body ${!children ? 'popup-body--empty' : ''} ${Object.keys(
                popupPosition,
            ).join(' ')}`}
            style={{
                ...popupPosition,
                ...style,
                ...(autoWidth ? { width: buttonWidth.current } : {}),
                opacity,
            }}
            preventWheelDisable={preventWheelDisable}
            noBackDrop={noBackDrop}
        >
            {children}
        </Modal>
    ) : null
}

PopupMenu.Button = Button
PopupMenu.Body = Body

export default PopupMenu
