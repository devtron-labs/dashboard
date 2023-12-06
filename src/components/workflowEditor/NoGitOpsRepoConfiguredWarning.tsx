import React from 'react'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../config'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { NoGitOpsRepoConfiguredWarningType } from './types'
import { VisibleModal2 } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ArrowRight } from '../../assets/icons/ic-arrow-right.svg'

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
                    <button type="button" tabIndex={3} className="cta cancel sso__warn-button" onClick={closePopup}>
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
