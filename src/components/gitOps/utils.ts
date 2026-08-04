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

import { GitOpsAuthModeType } from '@devtron-labs/devtron-fe-common-lib'

import { GitProvider } from '@Components/common/GitTabs/constants'
import { GitProviderType } from '@Components/common/GitTabs/types'

export const getGitOpsLabelText = (providerTab: GitProvider): string => {
    switch (providerTab) {
        case GitProvider.AZURE_DEVOPS:
            return 'Azure DevOps Organization Url'
        case GitProvider.BITBUCKET_CLOUD:
            return 'Bitbucket Host'
        default:
            return 'Git Host'
    }
}

export const getGitAccessPasswordInputLabel = (providerTab: GitProviderType, authMode: GitOpsAuthModeType): string => {
    if (providerTab === GitProvider.AZURE_DEVOPS) {
        return 'Azure DevOps Access Token '
    }
    if (providerTab === GitProvider.BITBUCKET_CLOUD) {
        if (authMode === GitOpsAuthModeType.API_TOKEN) {
            return 'Token'
        }
        if (authMode === GitOpsAuthModeType.PASSWORD) {
            return 'Password'
        }
        if (authMode === GitOpsAuthModeType.ACCESS_TOKEN) {
            return 'Bearer Token'
        }
    }
    return 'Personal Access Token '
}

export const getGitAccessUsernameInputLabel = (
    providerTab: GitProviderType | 'BITBUCKET_DC',
    authMode: GitOpsAuthModeType,
): string => {
    if (providerTab === GitProvider.GITLAB) {
        return 'GitLab Username'
    }
    if (providerTab === GitProvider.AZURE_DEVOPS) {
        return 'Azure DevOps Username'
    }
    if (providerTab === GitProvider.BITBUCKET_CLOUD) {
        if (authMode === GitOpsAuthModeType.API_TOKEN) {
            return 'Email'
        }
        // Using 'Bitbucket Username' for fallback, should be visible only when authMode is PASSWORD
        return 'Bitbucket Username'
    }
    return 'GitHub Username'
}

export const getGitAccessUsernameInputPlaceholder = (
    providerTab: GitProvider | 'BITBUCKET_DC',
    authMode: GitOpsAuthModeType,
): string => {
    if (providerTab === GitProvider.BITBUCKET_CLOUD && authMode === GitOpsAuthModeType.API_TOKEN) {
        return 'Enter email'
    }
    return 'Enter username'
}
