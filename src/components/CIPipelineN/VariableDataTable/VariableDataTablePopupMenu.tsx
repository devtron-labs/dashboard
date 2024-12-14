import { useState } from 'react'

import { TippyCustomized, TippyTheme } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICSlidersVertical } from '@Icons/ic-sliders-vertical.svg'

import { VariableDataTablePopupMenuProps } from './types'

export const VariableDataTablePopupMenu = ({
    showIcon,
    heading,
    children,
    onClose,
    disableClose = false,
}: VariableDataTablePopupMenuProps) => {
    // STATES
    const [visible, setVisible] = useState(false)

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

    return (
        <>
            <TippyCustomized
                theme={TippyTheme.white}
                trigger="click"
                interactive
                {...(disableClose
                    ? {
                          visible,
                      }
                    : {})}
                disableClose={disableClose}
                placement="left"
                appendTo={document.getElementById('visible-modal')}
                showCloseButton
                onClose={handleClose}
                heading={<p className="m-0 fw-6 fs-13 lh-20">{heading}</p>}
                Icon={showIcon ? ICSlidersVertical : null}
                iconSize={16}
                additionalContent={visible ? <div className="flexbox-col w-300 mxh-300">{children}</div> : null}
            >
                <button
                    type="button"
                    aria-label="Close Popup"
                    className="dc__transparent h-100 flex top py-10 px-8 dc__no-border-imp dc__no-border-radius dc__hover-n50"
                    onClick={handleOpen}
                >
                    <ICSlidersVertical className="icon-dim-16" />
                </button>
            </TippyCustomized>
            {visible && <div className="dc__position-fixed dc__top-0 dc__right-0 dc__left-0 dc__bottom-0 dc__zi-20" />}
        </>
    )
}
