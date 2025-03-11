/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NavLink } from 'react-router-dom'
import { VisibleModal } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../config'
import { ReactComponent as WarningIcon } from '@Icons/ic-warning.svg'
import { ReactComponent as Close } from '@Icons/ic-cross.svg'
import { NoGitOpsConfiguredWarningType } from './types'

export default function NoGitOpsConfiguredWarning({ closePopup }: NoGitOpsConfiguredWarningType) {
    const closePopupContinueWithHelm = (): void => {
        closePopup(true)
    }
    const closePopupDoNothing = (): void => {
        closePopup(false)
    }
    return (
        <VisibleModal className="confirmation-dialog">
            <div className="confirmation-dialog__body ">
                <div className="flexbox dc__content-space mb-20">
                    <WarningIcon className="h-48 mw-48" />
                    <Close className="icon-dim-24 cursor" onClick={closePopupDoNothing} />
                </div>
                <div className="flex left column ">
                    <h3 className="confirmation-dialog__title lh-1-25 dc__break-word w-100">
                        GitOps is not configured
                    </h3>
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
        </VisibleModal>
    )
}
