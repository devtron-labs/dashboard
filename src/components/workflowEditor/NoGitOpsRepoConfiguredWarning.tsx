import React from 'react'
import { NavLink } from 'react-router-dom'
import { VisibleModal2 } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../config'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { NoGitOpsRepoConfiguredWarningType, ReloadNoGitOpsRepoConfiguredModalType } from './types'
import { ReactComponent as ArrowRight } from '../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as RetryIcon } from '../../assets/icons/ic-arrow-clockwise.svg'

export default function NoGitOpsRepoConfiguredWarning({ closePopup, appId, text }: NoGitOpsRepoConfiguredWarningType) {
    return (
        <VisibleModal2 className="confirmation-dialog">
            <div className="confirmation-dialog__body ">
                <div className="flexbox dc__content-space mb-20">
                    <WarningIcon className="h-48 mw-48" />
                    <Close className="icon-dim-24 cursor" onClick={closePopup} />
                </div>
                <div className="flex left column ">
                    <h3 className="confirmation-dialog__title lh-1-25 dc__break-word w-100">
                        GitOps repository is not configured
                    </h3>
                    <p className="fs-14 fw-4 cn-9">{text}</p>
                </div>
                <div className="flex right confirmation-dialog__button-group">
                    <button type="button" className="cta cancel sso__warn-button" onClick={closePopup}>
                        Cancel
                    </button>
                    <NavLink
                        className="cta sso__warn-button btn-confirm flex dc__gap-8"
                        to={`/app/${appId}/edit/${URLS.APP_GITOPS_CONFIG}`}
                    >
                        Configure
                        <ArrowRight className="icon-dim-16" />
                    </NavLink>
                </div>
            </div>
        </VisibleModal2>
    )
}

export const ReloadNoGitOpsRepoConfiguredModal = ({ closePopup, reload }: ReloadNoGitOpsRepoConfiguredModalType) => {
    return (
        <VisibleModal2 className="confirmation-dialog">
            <div className="confirmation-dialog__body ">
                <div className="flexbox dc__content-space mb-20">
                    <WarningIcon className="h-48 mw-48" />
                    <Close className="icon-dim-24 cursor" onClick={closePopup} />
                </div>
                <div className="flex left column ">
                    <h3 className="confirmation-dialog__title lh-1-25 dc__break-word w-100">
                        Some global configurations for Gitops has changed.
                    </h3>
                    <p className="fs-14 fw-4 cn-9">
                        You&apos;re making changes based on old GitOps configurations. Please reload the page to
                        continue.
                    </p>
                </div>
                <div className="flex right confirmation-dialog__button-group">
                    <button type="button" className="flex cta h-32 lh-n sso__warn-button cursor" onClick={reload}>
                        <RetryIcon className="icon-dim-16 dc__no-svg-fill scn-0 mr-8" />
                        Reload
                    </button>
                </div>
            </div>
        </VisibleModal2>
    )
}
