import React from 'react';
import { toast } from 'react-toastify'
import CICDIcon from '../../../assets/img/ic-build-deploy.png'
import MoreExtentionsIcon from '../../../assets/img/ic-more-extensions.png'
import { handleError } from './DevtronStackManager.component';
import { executeModuleAction, executeServerAction } from './DevtronStackManager.service';
import { ModuleActionRequest, ModuleActions, ModuleDetails, ModuleDetailsInfo, ModuleStatus, ServerActionRequest } from './DevtronStackManager.type'

export const MODULE_ICON_MAP = {
    ciCd: CICDIcon,
    moreExtensions: MoreExtentionsIcon,
}

export const MODULE_DETAILS_MAP: Record<string, ModuleDetails> = {
    ciCd: {
        id: 'ciCd',
        name: 'Build and Deploy (CI/CD)',
        info: 'Enables continous code integration and deployment.',
        icon: 'ciCd',
        installationStatus: ModuleStatus.NONE,
    },
    moreExtensions: {
        id: 'moreExtensions',
        name: 'More extensions coming soon',
        info: "We're building a suite of extensions to serve your software delivery lifecycle.",
        icon: 'moreExtensions',
        installationStatus: ModuleStatus.NONE,
    },
}

export const MODULE_DETAILS_INFO: Record<string, ModuleDetailsInfo> = {
    ciCd: {
        name: 'Build and Deploy (CI/CD)',
        infoList: [
            'Continuous integration (CI) and continuous delivery (CD) embody a culture, set of operating principles, and collection of practices that enable application development teams to deliver code changes more frequently and reliably. The implementation is also known as the CI/CD pipeline.',
            'CI/CD is one of the best practices for devops teams to implement. It is also an agile methodology best practice, as it enables software development teams to focus on meeting business requirements, code quality, and security because deployment steps are automated.',
        ],
        featuresList: [
            "Discovery: What would the users be searching for when they're looking for a CI/CD offering?",
            'Detail: The CI/CD offering should be given sufficient importance (on Website, Readme). (Eg. Expand capability with CI/CD module [Discover more modules])',
            'Installation: Ability to install CI/CD module with the basic installation.',
            'In-Product discovery: How easy it is to discover the CI/CD offering primarily once the user is in the product. (Should we talk about modules on the login page?)',
        ],
    },
}


export const handleAction = async (moduleName: string, isUpgradeView: boolean, upgradeVersion: string) => {
    try {
        if (isUpgradeView) {
            const serverActionRequest: ServerActionRequest = {
                action: ModuleActions.UPGRADE,
                version: upgradeVersion,
            }
            const { result } = await executeServerAction(serverActionRequest)

            if (result?.success) {
                toast.success(isUpgradeView ? 'Upgraded successfully!' : 'Installed successfully!')
            } else {
                toast.error(isUpgradeView ? 'Unable to upgrade!' : 'Unable to install!')
            }
        } else {
            const moduleActionRequest: ModuleActionRequest = {
                action: ModuleActions.INSTALL,
                // version: upgradeVersion,
            }
            const { result } = await executeModuleAction(moduleName, moduleActionRequest)

            if (result?.success) {
                toast.success(isUpgradeView ? 'Upgraded successfully!' : 'Installed successfully!')
            } else {
                toast.error(isUpgradeView ? 'Unable to upgrade!' : 'Unable to install!')
            }
        }
    } catch (e) {
        handleError(e)
    }
}