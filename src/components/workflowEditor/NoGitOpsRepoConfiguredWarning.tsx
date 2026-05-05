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

import { FunctionComponent, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'

import { ConfirmationModal, ConfirmationModalVariantType, Icon, ROUTER_URLS } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '../../config'
import { getGitOpsRepoConfig } from '../../services/service'
import { NoGitOpsRepoConfiguredWarningType, ReloadNoGitOpsRepoConfiguredModalType } from './types'

export const ReloadNoGitOpsRepoConfiguredModal: FunctionComponent<ReloadNoGitOpsRepoConfiguredModalType> = ({
    closePopup,
    reload,
}: ReloadNoGitOpsRepoConfiguredModalType) => (
    <ConfirmationModal
        variant={ConfirmationModalVariantType.warning}
        handleClose={closePopup}
        title="Some global configurations for Gitops has changed."
        subtitle="You're making changes based on old GitOps configurations. Please reload the page to
                        continue."
        buttonConfig={{
            secondaryButtonConfig: {
                text: 'Close',
                onClick: closePopup,
            },
            primaryButtonConfig: {
                text: 'Reload',
                onClick: reload,
                startIcon: <Icon name="ic-arrow-clockwise" color={null} />,
            },
        }}
    />
)

const NoGitOpsRepoConfiguredWarning: FunctionComponent<NoGitOpsRepoConfiguredWarningType> = ({
    closePopup,
    appId,
    text,
    reload,
}: NoGitOpsRepoConfiguredWarningType) => {
    const [gitopsConflictLoading, setGitopsConflictLoading] = useState(false)
    const [reloadNoGitOpsRepoConfiguredModal, setReloadNoGitOpsRepoConfiguredModal] = useState(false)
    const navigate = useNavigate()

    const closeReloadNoGitOpsRepoConfiguredModal = () => {
        setReloadNoGitOpsRepoConfiguredModal(false)
    }

    const checkGitOpsRepoConflict = () => {
        setGitopsConflictLoading(true)
        getGitOpsRepoConfig(appId)
            .then(() => {
                navigate(
                    `${generatePath(ROUTER_URLS.DEVTRON_APP_DETAILS.CONFIGURATIONS, { appId: String(appId) })}/${URLS.APP_GITOPS_CONFIG}`,
                )
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

    return reloadNoGitOpsRepoConfiguredModal ? (
        <ReloadNoGitOpsRepoConfiguredModal closePopup={closeReloadNoGitOpsRepoConfiguredModal} reload={reload} />
    ) : (
        <ConfirmationModal
            variant={ConfirmationModalVariantType.warning}
            handleClose={closePopup}
            title="GitOps repository is not configured"
            subtitle={text}
            buttonConfig={{
                primaryButtonConfig: {
                    text: 'Configure',
                    onClick: checkGitOpsRepoConflict,
                    endIcon: <Icon name="ic-arrow-right" color={null} />,
                    isLoading: gitopsConflictLoading,
                },
                secondaryButtonConfig: {
                    text: 'Cancel',
                    onClick: closePopup,
                },
            }}
        />
    )
}

export default NoGitOpsRepoConfiguredWarning
