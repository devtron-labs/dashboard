export const APPROVAL_ACTION_TYPE = {
    submit: 0,
    approve: 1,
    cancel: 2,
}

export const APPROVAL_RUNTIME_STATE = {
    init: 0,
    requested: 1,
    approved: 2,
    consumed: 3,
}

export const APPROVAL_REQUEST_TOAST_MSG = {
    submit: 'Image approval request submitted',
    approve: 'Image approved',
    approve_auto_cd: 'Image has been approved and the deployment is initiated.',
    cancel: 'Image approval request cancelled',
}

export const APPROVAL_CTA_TEXT = {
    submit: 'Submit request',
    approve: 'Approve request',
    cancel: 'Cancel request',
}
