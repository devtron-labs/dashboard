import React from 'react'
import { ConfirmationDialog } from '@devtron-labs/devtron-fe-common-lib'
import warningIconSrc from '../../../assets/icons/ic-warning-y5.svg'
import { BUTTON_TEXT, NONCASCADE_DELETE_DIALOG_INTERNAL_MESSAGE } from '../../../config/constantMessaging'

interface ClusrerNotReachableDialogType {
    clusterName: string
    onClickCancel: () => void
    onClickDelete: () => void
}
function ClusrerNotReachableDialog({ clusterName, onClickCancel, onClickDelete }: ClusrerNotReachableDialogType) {
    return (
        <ConfirmationDialog>
            <ConfirmationDialog.Icon src={warningIconSrc} />
            <ConfirmationDialog.Body title={`The cluster${clusterName ? ` '${clusterName}'` : ''} is not reachable`} />
            {NONCASCADE_DELETE_DIALOG_INTERNAL_MESSAGE.map((message, index) => (
                <p key={`dailog-msg-${index}`} className="fs-14 cn-7 lh-20 mt-12">
                    {message}
                </p>
            ))}
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="cta cancel" onClick={onClickCancel}>
                    {BUTTON_TEXT.CANCEL}
                </button>
                <button type="button" className="cta delete" onClick={onClickDelete}>
                    {BUTTON_TEXT.FORCE_DELETE}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

export default ClusrerNotReachableDialog
