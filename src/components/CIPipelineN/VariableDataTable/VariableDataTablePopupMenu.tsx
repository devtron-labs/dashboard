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

import { useEffect, useRef, useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    stopPropagation,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICDot } from '@Icons/ic-dot.svg'
import { ReactComponent as ICSlidersVertical } from '@Icons/ic-sliders-vertical.svg'

import { VariableDataTablePopupMenuProps } from './types'

export const VariableDataTablePopupMenu = ({
    showHeaderIcon,
    showIconDot,
    heading,
    children,
    onClose,
    disableClose = false,
    placement,
}: VariableDataTablePopupMenuProps) => {
    // STATES
    const [visible, setVisible] = useState(false)
    const [popupPositionStyle, setPopupPositionStyle] = useState({ top: 0, left: 0, transform: null })

    // REFS
    const popupButtonRef = useRef<HTMLButtonElement>()

    // METHODS
    const handleClose = () => {
        if (!disableClose) {
            setVisible(false)
            onClose?.()
        }
    }

    const handleOpen = () => {
        setVisible(true)
    }

    useEffect(() => {
        if (popupButtonRef.current && visible) {
            const rect = popupButtonRef.current.getBoundingClientRect()
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const scrollLeft = window.scrollX || document.documentElement.scrollLeft
            const offset = placement === 'left' ? -10 : rect.width + 10

            setPopupPositionStyle({
                top: rect.top + scrollTop,
                left: rect.left + scrollLeft + offset,
                transform: `translate(${placement === 'left' ? '-100%' : '0%'}, -50%)`,
            })
        } else if (!visible) {
            setPopupPositionStyle({ top: 0, left: 0, transform: null })
        }
    }, [visible])

    return (
        <>
            <button
                type="button"
                ref={popupButtonRef}
                aria-label="Close Popup"
                className="dc__transparent h-100 flex top py-10 px-8 dc__hover-n50 dc__position-rel"
                onClick={handleOpen}
            >
                <span className={`icon-dot-16 ${showIconDot ? 'visible' : ''}`}>
                    <ICSlidersVertical />
                    <ICDot />
                </span>
            </button>
            {visible && (
                <div
                    className="dc__position-fixed dc__top-0 dc__right-0 dc__left-0 dc__bottom-0 dc__zi-20 "
                    onClick={handleClose}
                >
                    <div
                        className="tippy-box default-white tippy-shadow w-300 dc__position-abs"
                        onClick={stopPropagation}
                        style={popupPositionStyle}
                    >
                        <div className="flexbox-col w-100 mxh-350">
                            <div className="px-12 py-8 flexbox dc__align-items-center dc__content-space dc__gap-8 dc__border-bottom-n1">
                                <div className="flexbox dc__align-items-center dc__gap-8">
                                    {showHeaderIcon && <ICSlidersVertical className="icon-dim-16" />}
                                    <Tooltip content={heading}>
                                        <p className="m-0 fw-6 fs-13 lh-20 dc__truncate">{heading}</p>
                                    </Tooltip>
                                </div>
                                <Button
                                    size={ComponentSizeType.small}
                                    style={ButtonStyleType.negativeGrey}
                                    variant={ButtonVariantType.borderLess}
                                    icon={<ICClose />}
                                    dataTestId="popup-close-button"
                                    ariaLabel="Close Popup"
                                    showAriaLabelInTippy={false}
                                    onClick={handleClose}
                                    disabled={disableClose}
                                />
                            </div>
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
