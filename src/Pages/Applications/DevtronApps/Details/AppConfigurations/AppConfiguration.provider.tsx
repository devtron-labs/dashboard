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

import React, { useMemo, useState } from 'react'

import { ResourceKindType } from '@devtron-labs/devtron-fe-common-lib'
import { AppConfigurationContextType, AppConfigurationProviderProps } from './AppConfig.types'

export const AppConfigurationContext = React.createContext<AppConfigurationContextType>(null)

export const AppConfigurationProvider = (props: AppConfigurationProviderProps) => {
    const {
        children,
        state,
        appId,
        resourceKind,
        showCannotDeleteTooltip,
        canShowExternalLinks,
        deleteApp,
        toggleRepoSelectionTippy,
        hideConfigHelp,
        getWorkflows,
        reloadEnvironments,
        isGitOpsConfigurationRequired,
        respondOnSuccess,
        reloadAppConfig,
        filteredEnvIds,
        userRole,
        fetchEnvConfig,
    } = props

    const [showRepoOnDelete, setShowRepoOnDelete] = useState('')

    const contextValue = useMemo<AppConfigurationContextType>(
        () => ({
            appId,
            resourceKind,
            navItems: state.navItems,
            deleteApp,
            canShowExternalLinks,
            showCannotDeleteTooltip,
            isWorkflowEditorUnlocked: state.isUnlocked.workflowEditor,
            toggleRepoSelectionTippy,
            getRepo: showRepoOnDelete,
            isJobView: resourceKind === ResourceKindType.job,
            hideConfigHelp,
            workflowsRes: state.workflowsRes,
            getWorkflows,
            // isBaseConfigProtected: state.isBaseConfigProtected,
            reloadEnvironments,
            isGitOpsConfigurationRequired,
            isUnlocked: state.isUnlocked,
            isCiPipeline: state.isCiPipeline,
            isCDPipeline: state.isCDPipeline,
            respondOnSuccess,
            environments: state.environmentList,
            userRole,
            setRepoState: setShowRepoOnDelete,
            envProtectionConfig: state.envProtectionConfig,
            filteredEnvIds,
            reloadAppConfig,
            lastUnlockedStage: state.redirectionUrl,
            envConfig: state.envConfig,
            fetchEnvConfig,
        }),
        [
            appId,
            resourceKind,
            state,
            canShowExternalLinks,
            showCannotDeleteTooltip,
            hideConfigHelp,
            isGitOpsConfigurationRequired,
            userRole,
            filteredEnvIds,
        ],
    )

    return <AppConfigurationContext.Provider value={contextValue}>{children}</AppConfigurationContext.Provider>
}

export const useAppConfigurationContext = () => {
    const context = React.useContext(AppConfigurationContext)
    if (!context) {
        throw new Error(`App Configuration Context cannot be used outside app config scope`)
    }
    return context
}
