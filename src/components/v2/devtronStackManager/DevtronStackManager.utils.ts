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

import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ModuleStatus } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as DiscoverIcon } from '../../../assets/icons/ic-compass.svg'
import { ReactComponent as DevtronIcon } from '../../../assets/icons/ic-devtron.svg'
import { ReactComponent as InstalledIcon } from '../../../assets/icons/ic-check.svg'
import MoreIntegrationsIcon from '../../../assets/img/ic-more-extensions.png'
import { CLAIR_TOOL_VERSION_V4, ModuleNameMap, TRIVY_TOOL_VERSION, URLS } from '../../../config'
import { handleError } from './DevtronStackManager.component'
import { executeModuleAction, executeModuleEnableAction, executeServerAction } from './DevtronStackManager.service'
import {
    InstallationType,
    ModuleActionRequest,
    ModuleActions,
    ModuleDetails,
    ModuleResourceStatus,
    StackManagerNavLinkType,
} from './DevtronStackManager.type'
import { AppDetails } from '../appDetails/appDetails.type'

export const MORE_MODULE_DETAILS: ModuleDetails = {
    id: 'moreIntegrations',
    name: 'moreIntegrations',
    title: 'More integrations coming soon',
    info: 'You can submit a ticket to request an integration',
    icon: MoreIntegrationsIcon,
    installationStatus: ModuleStatus.NONE,
}

export const ModulesSection: StackManagerNavLinkType[] = [
    {
        name: 'Discover',
        href: URLS.STACK_MANAGER_DISCOVER_MODULES,
        icon: DiscoverIcon,
        className: 'discover-modules__nav-link',
    },
    {
        name: 'Installed',
        href: URLS.STACK_MANAGER_INSTALLED_MODULES,
        icon: InstalledIcon,
        className: 'installed-modules__nav-link',
    },
]
export const AboutSection: StackManagerNavLinkType = {
    name: 'About Devtron',
    href: URLS.STACK_MANAGER_ABOUT,
    icon: DevtronIcon,
    className: 'about-devtron__nav-link',
}

const actionTriggered = (history: RouteComponentProps['history'], location: RouteComponentProps['location']) => {
    const queryParams = new URLSearchParams(location.search)
    queryParams.set('actionTriggered', 'true')
    history.push(`${location.pathname}?${queryParams.toString()}`)
}

export const handleAction = async (
    moduleName: string,
    isUpgradeView: boolean,
    upgradeVersion: string,
    updateActionTrigger: (isActionTriggered: boolean) => void,
    history: RouteComponentProps['history'],
    location: RouteComponentProps['location'],
    moduleType?: string,
) => {
    try {
        const actionRequest: ModuleActionRequest = {
            action: isUpgradeView ? ModuleActions.UPGRADE : ModuleActions.INSTALL,
            version: upgradeVersion,
            moduleType,
        }

        const { result } = isUpgradeView
            ? await executeServerAction(actionRequest)
            : await executeModuleAction(moduleName, actionRequest)

        if (result?.success) {
            actionTriggered(history, location)
        }
    } catch (e) {
        handleError(e, isUpgradeView)
    } finally {
        updateActionTrigger(false)
    }
}
export const handleEnableAction = async (
    moduleName: string,
    setRetryFlag: React.Dispatch<React.SetStateAction<boolean>>,
    setSuccessState: React.Dispatch<React.SetStateAction<boolean>>,
    setDialog: React.Dispatch<React.SetStateAction<boolean>>,
    moduleNotEnabledState: React.Dispatch<React.SetStateAction<boolean>>,
    setProgressing: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    try {
        const toolVersion =
            moduleName === ModuleNameMap.SECURITY_TRIVY
                ? TRIVY_TOOL_VERSION
                : window._env_.CLAIR_TOOL_VERSION || CLAIR_TOOL_VERSION_V4
        const { result } = await executeModuleEnableAction(moduleName, toolVersion)
        if (result?.success) {
            setSuccessState(true)
            setDialog(false)
            moduleNotEnabledState(false)
        }
    } catch (e) {
        setRetryFlag(true)
    }
    setProgressing(false)
}

const getVersionLevels = (version: string): number[] => {
    return version
        .replace(/[vV]/, '')
        .split('.')
        .map((level) => parseInt(level, 10))
}

export const isLatestVersionAvailable = (currentVersion: string, newVersion: string): boolean => {
    if (!currentVersion || !newVersion) {
        return false
    }

    const currentVersionLevels = getVersionLevels(currentVersion)
    const newVersionLevels = getVersionLevels(newVersion)
    const minLevels = currentVersionLevels.length > newVersionLevels.length ? newVersionLevels : currentVersionLevels

    for (const [idx, level] of minLevels.entries()) {
        if (level === newVersionLevels[idx]) {
            continue
        } else if (level > newVersionLevels[idx]) {
            return false
        } else if (level < newVersionLevels[idx]) {
            return true
        }
    }

    return !(currentVersionLevels.length >= newVersionLevels.length)
}

export const DEVTRON_UPGRADE_MESSAGE =
    'Devtron needs to be updated to the latest version before you can install integrations.'

export const PENDING_DEPENDENCY_MESSAGE =
    'Some pre-requisite integrations need to be installed before you can install this integration. Please intall the pre-requisite integration and come back.'

export const OTHER_INSTALLATION_IN_PROGRESS_MESSAGE =
    'Another integration is being installed. Please try after the installation is complete.'

export const MODULE_CONFIGURATION_DETAIL_MAP = {
    [ModuleNameMap.ARGO_CD]: {
        title: 'GitOps is not configured',
        linkText: 'Configure GitOps',
        link: URLS.GLOBAL_CONFIG_GITOPS,
    },
}

export const AppStatusClass = {
    [ModuleStatus.INSTALLING]: 'progressing',
    [ModuleStatus.TIMEOUT]: 'degraded',
    [ModuleStatus.INSTALL_FAILED]: 'degraded',
    [ModuleStatus.INSTALLED]: 'healthy',
}

export const getAppDetailsFromResourceStatusData = (
    moduleResourcesStatus: ModuleResourceStatus[],
    installationStatus: ModuleStatus,
): AppDetails => {
    const _nodes = []
    const _resources = []
    const resourceStatusDetails = {}
    moduleResourcesStatus?.forEach((moduleResourceStatus) => {
        const _resource = {
            group: moduleResourceStatus.group,
            version: moduleResourceStatus.version,
            kind: moduleResourceStatus.kind,
            name: moduleResourceStatus.name,
            health: {
                status: moduleResourceStatus.healthStatus,
                message: moduleResourceStatus.healthMessage,
            },
        }
        _nodes.push(_resource)
        _resources.push(_resource)
        resourceStatusDetails[`${moduleResourceStatus.kind}/${moduleResourceStatus.name}`] =
            moduleResourceStatus.healthMessage
    })
    // Ask if index store does some special processing on the data
    return JSON.parse(
        JSON.stringify({
            resourceTree: {
                nodes: _nodes,
                // Need to confirm if can show this text itself instead of status
                status: AppStatusClass[installationStatus] || installationStatus,
                resourcesSyncResult: resourceStatusDetails,
            },
        }),
    )
}

export const INSTALLATION_TYPE_TO_REPO_MAP = {
    [InstallationType.ENTERPRISE]: 'devtron-enterprise',
    [InstallationType.OSS_HELM]: 'devtron',
    [InstallationType.OSS_KUBECTL]: 'devtron',
}
