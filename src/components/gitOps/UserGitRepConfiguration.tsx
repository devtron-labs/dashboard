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

import { FunctionComponent, useEffect, useState } from 'react'
import {
    GitOpsAuthModeType,
    InfoBlock,
    Progressing,
    showError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { gitOpsConfigDevtron, getGitOpsRepoConfig } from '../../services/service'
import UserGitRepo from './UserGitRepo'
import { UserGitRepoConfigurationProps } from './gitops.type'
import { repoType } from '../../config'
import { ReloadNoGitOpsRepoConfiguredModal } from '../workflowEditor/NoGitOpsRepoConfiguredWarning'

const UserGitRepConfiguration: FunctionComponent<UserGitRepoConfigurationProps> = ({
    respondOnSuccess,
    appId,
    reloadAppConfig,
}: UserGitRepoConfigurationProps) => {
    const [gitOpsRepoURL, setGitOpsRepoURL] = useState('')
    const [selectedRepoType, setSelectedRepoType] = useState(null)
    const [authMode, setAuthMode] = useState<GitOpsAuthModeType>(null)
    const [isEditable, setIsEditable] = useState(false)
    const [showReloadModal, setShowReloadModal] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        getGitOpsRepoConfig(appId)
            .then((response) => {
                if (response.result) {
                    setGitOpsRepoURL(response.result.gitRepoURL)
                    setIsEditable(response.result.isEditable)
                    setAuthMode(response.result.authMode)
                    if (response.result.authMode === GitOpsAuthModeType.SSH) {
                        setSelectedRepoType(repoType.CONFIGURE)
                    }
                }
            })
            .catch((err) => {
                showError(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const renderInfoColorBar = () => (
        <InfoBlock description="GitOps repository for this application is immutable once saved." variant="warning" />
    )

    const renderSavedGitOpsRepoState = (repoURL) => (
        <>
            {loading ? (
                <div className="w-100 h-100">
                    <Progressing pageLoader />
                </div>
            ) : (
                <div className="pt-16 pl-20">
                    <div>
                        <div className="fw-4 fs-13 fcn-9">
                            Application Deployment states are saved as manifest in a Git repository. ArgoCD uses these
                            manifests to sync with your live Kubernetes cluster.
                        </div>
                        <div className="fs-13 fw-4 flexbox-col mt-16 mb-16">
                            <div>Configurations for this application will be committed to:</div>
                            <a
                                className="mono dc__link dc_max-width__max-content"
                                href={repoURL}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                {repoURL}
                            </a>
                        </div>
                    </div>
                    {renderInfoColorBar()}
                </div>
            )}
        </>
    )

    const closePopup = () => {
        setShowReloadModal(false)
    }

    function handleSaveButton() {
        if (selectedRepoType === null) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Please select a configuration before saving',
            })
            return
        }

        const payload = {
            appId,
            gitRepoURL: selectedRepoType === repoType.DEFAULT ? 'Default' : gitOpsRepoURL,
        }
        setLoading(true)
        gitOpsConfigDevtron(payload)
            .then(() => {
                respondOnSuccess(true)
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Successfully saved',
                })
            })
            .catch((err) => {
                // Comes when in global config, we have changed the status of directory management
                if (err['code'] === 409) {
                    setShowReloadModal(true)
                } else {
                    showError(err)
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return (
        <div className="w-100 h-100 bg__primary pt-16 flexbox-col flex-grow-1 dc__overflow-auto dc__content-space">
            <div className="flex-grow-1 dc__overflow-auto">
                <div className="w-960">
                    <div className="fs-16 fcn-9 fw-6 ml-20 mb-8" data-testid="gitops-config-heading">
                        GitOps Configuration
                    </div>
                    {isEditable ? (
                        <UserGitRepo
                            setSelectedRepoType={setSelectedRepoType}
                            selectedRepoType={selectedRepoType}
                            repoURL={gitOpsRepoURL}
                            setRepoURL={setGitOpsRepoURL}
                            authMode={authMode}
                        />
                    ) : (
                        renderSavedGitOpsRepoState(gitOpsRepoURL)
                    )}
                </div>
            </div>
            {isEditable && (
                <div className="flex left w-100 px-20 py-16 dc__border-top-n1">
                    <button
                        data-testid="save_cluster_list_button_after_selection"
                        className="cta h-36 lh-36 "
                        type="button"
                        disabled={!gitOpsRepoURL && selectedRepoType === repoType.CONFIGURE}
                        onClick={handleSaveButton}
                    >
                        {loading ? <Progressing /> : 'Save'}
                    </button>
                </div>
            )}
            {showReloadModal && <ReloadNoGitOpsRepoConfiguredModal closePopup={closePopup} reload={reloadAppConfig} />}
        </div>
    )
}

export default UserGitRepConfiguration
