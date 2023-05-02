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

export const APPROVAL_MODAL_CTA_TEXT = {
    imageBuilderTippy: 'You triggered the build pipeline for this image. The builder of an image cannot approve it.',
    approvedByYou: 'Approved by you',
    awaiting: 'Awaiting approval',
    requestApproval: {
        heading: 'Request approval',
        infoText:
            'Request approval for deploying this image. All users having ‘Approver’ permission for this application and environment can approve.',
        label: 'Request approval',
    },
    cancelRequest: {
        heading: 'Cancel approval request',
        infoText:
            'Are you sure you want to cancel approval request for this image? A new approval request would need to be raised if you want to deploy this image.',
        label: 'Cancel request',
    },
    approveRequest: {
        heading: 'Approve image',
        infoText: 'Are you sure you want to approve deploying this image to',
        label: 'Approve',
    },
    vulnerability: {
        found: 'Security vulnerability found',
        notFound: 'No vulnerabilities Found',
        notScanned: 'Image was not scanned',
        scanDisabled: 'Scan is Disabled',
        scanned: 'Scanned on',
    },
    sourceInfo: {
        hide: 'Hide Source Info',
        show: 'Show Source Info',
    },
}

export const APPROVAL_CTA_TEXT = {
    submit: 'Submit request',
    approve: 'Approve request',
    cancel: 'Cancel request',
}

export const APPROVAL_INFO_TEXTS = {
    requestedBy: 'Approval requested by',
    approvedBy: 'Approved by',
    cancelRequest: 'Are you sure you want to cancel the request?',
    noApprovals: 'This image has not received any approvals.',
    deploymentBy: 'Deployment initiated by',
}

export const DEPLOYMENT_ENV_TEXT = {
    active: 'Active on',
    failed: 'Last deployment failed on',
    deploying: 'Deploying on',
}
