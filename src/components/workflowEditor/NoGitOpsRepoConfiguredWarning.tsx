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

import React, { FunctionComponent, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { VisibleModal2, ButtonWithLoader } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../config'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-cross.svg'
import { NoGitOpsRepoConfiguredWarningType, ReloadNoGitOpsRepoConfiguredModalType } from './types'
import { ReactComponent as ArrowRight } from '../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as RetryIcon } from '../../assets/icons/ic-arrow-clockwise.svg'
import { getGitOpsRepoConfig } from '../../services/service'

export const ReloadNoGitOpsRepoConfiguredModal: FunctionComponent<ReloadNoGitOpsRepoConfiguredModalType> = ({
    closePopup,
    reload,
}: ReloadNoGitOpsRepoConfiguredModalType) => {
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

const NoGitOpsRepoConfiguredWarning: FunctionComponent<NoGitOpsRepoConfiguredWarningType> = ({
    closePopup,
    appId,
    text,
    reload,
}: NoGitOpsRepoConfiguredWarningType) => {
    const [gitopsConflictLoading, setGitopsConflictLoading] = useState(false)
    const [reloadNoGitOpsRepoConfiguredModal, setReloadNoGitOpsRepoConfiguredModal] = useState(false)
    const history = useHistory()

    const closeReloadNoGitOpsRepoConfiguredModal = () => {
        setReloadNoGitOpsRepoConfiguredModal(false)
    }

    const checkGitOpsRepoConflict = () => {
        setGitopsConflictLoading(true)
        getGitOpsRepoConfig(appId)
            .then(() => {
                history.push(`/app/${appId}/edit/${URLS.APP_GITOPS_CONFIG}`)
            })
            .catch((err) => {
                if (err.code === 409) {
                    setReloadNoGitOpsRepoConfiguredModal(true)
                }
            })
            .finally(() => {
                setGitopsConflictLoading(false)
            })
    }
    return (
        <>
            {reloadNoGitOpsRepoConfiguredModal ? (
                <ReloadNoGitOpsRepoConfiguredModal
                    closePopup={closeReloadNoGitOpsRepoConfiguredModal}
                    reload={reload}
                />
            ) : (
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
                            <ButtonWithLoader
                                dataTestId="configure-gitops-repo"
                                rootClassName="cta sso__warn-button btn-confirm flex dc__gap-8"
                                onClick={checkGitOpsRepoConflict}
                                isLoading={gitopsConflictLoading}
                            >
                                <span> Configure</span>
                                <ArrowRight className="icon-dim-16" />
                            </ButtonWithLoader>
                        </div>
                    </div>
                </VisibleModal2>
            )}
        </>
    )
}

export default NoGitOpsRepoConfiguredWarning
