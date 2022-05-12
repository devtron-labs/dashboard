import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { ReactComponent as DiscoverIcon } from '../../../assets/icons/ic-compass.svg'
import { ReactComponent as DevtronIcon } from '../../../assets/icons/ic-devtron.svg'
import { ReactComponent as InstalledIcon } from '../../../assets/icons/ic-check.svg'
import MoreIntegrationsIcon from '../../../assets/img/ic-more-extensions.png'
import { URLS } from '../../../config'
import { handleError } from './DevtronStackManager.component'
import { executeModuleAction, executeServerAction } from './DevtronStackManager.service'
import {
    ModuleActionRequest,
    ModuleActions,
    ModuleDetails,
    ModuleStatus,
    StackManagerNavLinkType,
} from './DevtronStackManager.type'

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
) => {
    try {
        const actionRequest: ModuleActionRequest = {
            action: isUpgradeView ? ModuleActions.UPGRADE : ModuleActions.INSTALL,
            version: upgradeVersion,
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

const getVersionLevels = (version: string): number[] => {
    return version
        .replace(/[vV]/, '')
        .split('.')
        .map((level) => parseInt(level, 10))
}

export const isLatestVersionAvailable = (currentVersion: string, newVersion: string): boolean => {
    if (!currentVersion || !newVersion) return false

    const currentVersionLevels = getVersionLevels(currentVersion)
    const newVersionLevels = getVersionLevels(newVersion)
    const minLevels = currentVersionLevels.length > newVersionLevels.length ? newVersionLevels : currentVersionLevels

    for (let [idx, level] of minLevels.entries()) {
        if (level === newVersionLevels[idx]) {
            continue
        } else if (level > newVersionLevels[idx]) {
            return false
        } else if (level < newVersionLevels[idx]) {
            return true
        }
    }

    return currentVersionLevels.length >= newVersionLevels.length ? false : true
}
