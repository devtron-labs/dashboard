import React from 'react'
import { ConfirmationDialog } from '../common'
import warningIconSrc from '../../assets/icons/ic-warning-y6.svg'
import { DEPRECATED_EXTERNAL_CI_MESSAGE, DOCUMENTATION } from '../../config'

export default function DeprecatedWarningModal({ closePopup }: { closePopup: () => void }) {
    const close = (): void => {
        closePopup()
    }
    return (
        <ConfirmationDialog className="confirmation-dialog__body--w-400">
            <ConfirmationDialog.Icon src={warningIconSrc} />
            <ConfirmationDialog.Body title="Pipeline is deprecated">
                <div className="fs-14 cn-7 w-100">{DEPRECATED_EXTERNAL_CI_MESSAGE}</div>
                <div className="fs-14 cn-7 mt-20 w-100">
                    <a
                        className="dc__link"
                        href={DOCUMENTATION.WEBHOOK_CI}
                        rel="noreferrer noopener"
                        target="_blank"
                    >
                        Refer documentation
                    </a>
                    &nbsp;to learn how to recieve images from authenticated sources.
                </div>
            </ConfirmationDialog.Body>
            <ConfirmationDialog.ButtonGroup>
                <div className="flex right">
                    <button type="button" className="cta cancel" onClick={close}>
                        Ok
                    </button>
                </div>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}
