import React from 'react'
import { ConfirmationDialog } from '@devtron-labs/devtron-fe-common-lib'
import warningIconSrc from '../../assets/icons/ic-warning-y6.svg'
import { DEPRECATED_EXTERNAL_CI_MESSAGE, DOCUMENTATION } from '../../config'
import { DeprecatedWarningModalType } from './types'

export default function DeprecatedWarningModal({ closePopup }: DeprecatedWarningModalType) {
    const close = (): void => {
        closePopup()
    }
    return (
        <ConfirmationDialog className="confirmation-dialog__body--w-400">
            <ConfirmationDialog.Icon src={warningIconSrc} />
            <ConfirmationDialog.Body title="Pipeline is deprecated">
                <div className="fs-14 cn-7 w-100">{DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_ONE}</div>
                <div className="fs-14 cn-7 mt-20 w-100">{DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_TWO}</div>
                <div className="fs-14 cn-7 mt-20 w-100">
                    {DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_THREE}&nbsp;
                    <a className="dc__link" href={DOCUMENTATION.WEBHOOK_CI} rel="noreferrer noopener" target="_blank">
                        {DEPRECATED_EXTERNAL_CI_MESSAGE.DOC_LINK_TEXT}
                    </a>
                </div>
            </ConfirmationDialog.Body>
            <ConfirmationDialog.ButtonGroup>
                <div data-testid="delete_popup_box" className="flex right">
                    <button data-testid="okay_button_popup_box" type="button" className="cta cancel" onClick={close}>
                        Okay
                    </button>
                </div>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}
