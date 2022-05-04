import React from 'react'
import { ReactComponent as DiscoverIcon } from '../../../assets/icons/ic-compass.svg'
import { ReactComponent as DevtronIcon } from '../../../assets/icons/ic-devtron.svg'
import { ReactComponent as InstalledIcon } from '../../../assets/icons/ic-check.svg'
import CICDIcon from '../../../assets/img/ic-build-deploy.png'
import MoreExtentionsIcon from '../../../assets/img/ic-more-extensions.png'
import { URLS } from '../../../config'
import { handleError } from './DevtronStackManager.component'
import { executeModuleAction, executeServerAction } from './DevtronStackManager.service'
import {
    ModuleActionRequest,
    ModuleActions,
    ModuleDetails,
    ModuleDetailsInfo,
    ModuleStatus,
    StackManagerNavLinkType,
} from './DevtronStackManager.type'

export const MODULE_ICON_MAP = {
    cicd: CICDIcon,
    moreModules: MoreExtentionsIcon,
    unknown: CICDIcon,
}

export const MODULE_DETAILS_MAP: Record<string, ModuleDetails> = {
    moreModules: {
        id: 'moreModules',
        name: 'More modules coming soon',
        title: 'More modules coming soon',
        info: 'You can also raise a request for a module that will improve your workflow.',
        icon: MoreExtentionsIcon,
        installationStatus: ModuleStatus.NONE,
    },
    unknown: {
        id: 'unknown',
        name: 'New module coming soon',
        info: "We're building a suite of modules to serve your software delivery lifecycle.",
        icon: 'unknown',
        installationStatus: ModuleStatus.NONE,
    },
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

const actionTriggered = (location: any, history: any) => {
    const queryParams = new URLSearchParams(location.search)
    queryParams.set('actionTriggered', 'true')
    history.push(`${location.pathname}?${queryParams.toString()}`)
}

export const handleAction = async (
    moduleName: string,
    isUpgradeView: boolean,
    upgradeVersion: string,
    canUpdateServer: boolean,
    setShowManagedByDialog: React.Dispatch<React.SetStateAction<boolean>>,
    location: any,
    history: any,
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
        handleError(e, isUpgradeView, canUpdateServer, setShowManagedByDialog)
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

    if (currentVersionLevels.length === newVersionLevels.length) {
        return false
    }

    return currentVersionLevels.length > newVersionLevels.length ? false : true
}
