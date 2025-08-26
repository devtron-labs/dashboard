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

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Popover,
    Tooltip,
    usePopover,
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
    position,
    disableClose = false,
}: VariableDataTablePopupMenuProps) => {
    const { open, overlayProps, popoverProps, triggerProps, scrollableRef, closePopover } = usePopover({
        id: 'variable-data-table',
        width: 300,
        onOpen: (isOpen) => {
            if (!isOpen) {
                onClose()
            }
        },
        disableClose,
        position,
    })

    const triggerElement = (
        <button
            type="button"
            aria-label="Close Popup"
            className="dc__transparent h-100 flex top py-10 px-8 dc__hover-n50 dc__position-rel"
        >
            <span className={`icon-dot-16 ${showIconDot ? 'visible' : ''}`}>
                <ICSlidersVertical />
                <ICDot />
            </span>
        </button>
    )

    return (
        <Popover
            open={open}
            overlayProps={overlayProps}
            popoverProps={popoverProps}
            triggerProps={triggerProps}
            triggerElement={triggerElement}
            buttonProps={null}
        >
            <div className="flexbox-col w-100 mxh-350 dc__overflow-auto">
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
                        onClick={closePopover}
                        disabled={disableClose}
                    />
                </div>
                {children({ scrollableRef })}
            </div>
        </Popover>
    )
}
