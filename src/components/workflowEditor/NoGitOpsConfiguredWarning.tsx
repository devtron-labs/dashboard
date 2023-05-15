import React from 'react'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../config'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { NoGitOpsConfiguredWarningType } from './types'
import { VisibleModal2 } from '@devtron-labs/devtron-fe-common-lib'

export default function NoGitOpsConfiguredWarning({ closePopup }: NoGitOpsConfiguredWarningType) {
    const closePopupContinueWithHelm = (): void => {
        closePopup(true)
    }
    const closePopupDoNothing = (): void => {
        closePopup(false)
    }
    return (
        <VisibleModal2 className="confirmation-dialog">
            <div className="confirmation-dialog__body ">
                <div className="flexbox dc__content-space mb-20">
                    <WarningIcon className="h-48 mw-48" />
                    <Close className="icon-dim-24 cursor" onClick={closePopupDoNothing} />
                </div>
                <div className="flex left column ">
                    <h3 className="confirmation-dialog__title lh-1-25 dc__break-word w-100">GitOps is not configured</h3>
                    <p className="fs-14 fw-4">
                        Since GitOps is not configured, the deployment pipeline will use helm to create deployments.
                    </p>
                    <p className="fs-14 fw-4">Are you sure you want to create this deployment pipeline using helm?</p>
                </div>
                <div className="flex right confirmation-dialog__button-group">
                    <button
                        data-testid="continue-with-helm"
                        type="button"
                        tabIndex={3}
                        className="cta cancel sso__warn-button"
                        onClick={closePopupContinueWithHelm}
                    >
                        Continue with helm
                    </button>
                    <NavLink className="cta sso__warn-button btn-confirm" to={URLS.GLOBAL_CONFIG_GITOPS}>
                        Configure GitOps
                    </NavLink>
                </div>
            </div>
        </VisibleModal2>
    )
}
