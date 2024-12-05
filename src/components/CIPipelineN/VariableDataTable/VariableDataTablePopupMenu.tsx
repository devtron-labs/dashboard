import { useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    PopupMenu,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICSlidersVertical } from '@Icons/ic-sliders-vertical.svg'

import { VariableDataTablePopupMenuProps } from './types'

export const VariableDataTablePopupMenu = ({
    showIcon,
    heading,
    children,
    onClose,
}: VariableDataTablePopupMenuProps) => {
    // STATES
    const [visible, setVisible] = useState(false)

    // METHODS
    const handleClose = () => {
        setVisible(false)
        onClose?.()
    }

    const handleAction = (open: boolean) => {
        if (visible !== open) {
            if (open) {
                setVisible(true)
            } else {
                handleClose()
            }
        }
    }

    return (
        <PopupMenu autoPosition onToggleCallback={handleAction}>
            <PopupMenu.Button rootClassName="dc__transparent h-100 flex top py-10 px-8 dc__no-border-imp dc__no-border-radius dc__hover-n50">
                <ICSlidersVertical className="icon-dim-16" />
            </PopupMenu.Button>
            <PopupMenu.Body rootClassName="mt-4 w-300" preventWheelDisable>
                {visible && (
                    <div className="flexbox-col w-100 mxh-350">
                        <div className="px-12 py-8 flexbox dc__align-items-center dc__content-space dc__gap-8 dc__border-bottom-n1">
                            <div className="flexbox dc__align-items-center dc__gap-8">
                                {showIcon && <ICSlidersVertical className="icon-dim-16" />}
                                <p className="m-0 fw-6 fs-13 lh-20">{heading}</p>
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
                            />
                        </div>
                        {children}
                    </div>
                )}
            </PopupMenu.Body>
            {visible && <div className="dc__position-fixed dc__top-0 dc__right-0 dc__left-0 dc__bottom-0 dc__zi-20" />}
        </PopupMenu>
    )
}
