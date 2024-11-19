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

import { DeploymentNodeType } from '@devtron-labs/devtron-fe-common-lib'
import { AppEnvLocalStorageKeyType } from './AppGroup.types'

export const ENV_TRIGGER_VIEW_GA_EVENTS = {
    MaterialClicked: {
        category: 'Environment Details Trigger View',
        action: 'Select Material Clicked',
    },
    ImageClicked: {
        category: 'Environment Details Trigger View',
        action: 'Select Image Clicked',
    },
    ApprovalNodeClicked: {
        category: 'Environment Details Trigger View',
        action: 'Approval Node Clicked',
    },
    RollbackClicked: {
        category: 'Environment Details Trigger View',
        action: 'Select Rollback Material Clicked',
    },
    CITriggered: {
        category: 'Environment Details Trigger View',
        action: 'CI Triggered',
    },
    CDTriggered: (nodeType: string) => ({
        category: 'Environment Details Trigger View',
        action: `${nodeType} Triggered`,
    }),
    BulkCITriggered: {
        category: 'Environment Details Trigger View',
        action: 'Bulk CI Triggered',
    },
    BulkCDTriggered: (nodeType: string) => ({
        category: 'Environment Details Trigger View',
        action: `Bulk ${nodeType} Triggered`,
    }),
}

export const BUTTON_TITLE = {
    [DeploymentNodeType.PRECD]: 'Trigger pre-deployment stage',
    [DeploymentNodeType.CD]: 'Deploy',
    [DeploymentNodeType.POSTCD]: 'Trigger post-deployment stage',
}

export enum BulkResponseStatus {
    'PASS' = 'pass',
    'FAIL' = 'fail',
    'UNAUTHORIZE' = 'unauthorized',
    'SKIP' = 'skip',
}

export const BULK_VIRTUAL_RESPONSE_STATUS = {
    [BulkResponseStatus.PASS]: 'Succeeded',
    [BulkResponseStatus.FAIL]: 'Failed',
    [BulkResponseStatus.UNAUTHORIZE]: 'Not authorised',
}

export const BULK_CI_RESPONSE_STATUS_TEXT = {
    [BulkResponseStatus.PASS]: 'Build triggered',
    [BulkResponseStatus.FAIL]: 'Build not triggered',
    [BulkResponseStatus.UNAUTHORIZE]: 'Not authorized',
}

export const BULK_CD_RESPONSE_STATUS_TEXT = {
    [BulkResponseStatus.PASS]: 'Deployment triggered',
    [BulkResponseStatus.FAIL]: 'Deployment not triggered',
    [BulkResponseStatus.UNAUTHORIZE]: 'Not authorized',
}

export const responseListOrder = {
    [BulkResponseStatus.FAIL]: 0,
    [BulkResponseStatus.UNAUTHORIZE]: 1,
    [BulkResponseStatus.PASS]: 2,
}

export const BULK_HIBERNATE_ERROR_MESSAGE = {
    [BulkResponseStatus.FAIL]: 'Hibernation could not be triggered',
    [BulkResponseStatus.UNAUTHORIZE]: 'Not authorized',
}

export const BULK_UNHIBERNATE_ERROR_MESSAGE = {
    [BulkResponseStatus.FAIL]: 'Unhibernation could not be triggered',
    [BulkResponseStatus.UNAUTHORIZE]: 'Not authorized',
}

export const BULK_CI_MESSAGING = {
    emptyLinkedCI: {
        title: 'is using a linked build pipeline',
        subTitle:
            'You can trigger the parent build pipeline. Triggering the parent build pipeline will trigger all build pipelines linked to it.',
        linkText: 'View Source Pipeline',
    },
    webhookCI: {
        title: 'is using a external build pipeline',
        subTitle: 'Images received from the external service will be available for deployment.',
    },
    isFirstTrigger: {
        infoText: 'First pipeline run',
        title: 'First pipeline run may take longer than usual',
        subTitle: 'Future runs will have shorter build time when cache is used.',
    },
    cacheNotAvailable: {
        infoText: 'Cache not available',
        title: 'Cache will be generated for this pipeline run',
        subTitle: 'Cache will be used in future runs to reduce build time.',
    },
    linkedCD: {
        title: (envName: string) => `Syncs images deployed on ${envName}`,
        subTitle: (envName: string) =>
            `Nothing to build. Images deployed on ${envName} will be available for deployment`,
    },
}

export const BULK_CD_MESSAGING = {
    [DeploymentNodeType.PRECD]: {
        title: 'does not have a pre-deployment stage',
        subTitle: 'This app does not have a pre-deployment stage',
    },
    [DeploymentNodeType.POSTCD]: {
        title: 'does not have a post-deployment stage',
        subTitle: 'This app does not have a post-deployment stage',
    },
    unauthorized: {
        title: 'Not authorized',
        subTitle: `You don't have permission to perform this action`,
    },
}

export const EMPTY_LIST_MESSAGING = {
    TITLE: 'No applications available',
    UNAUTHORIZE_TEXT: 'Not authorized',
}

export const NO_ACCESS_TOAST_MESSAGE = {
    SUPER_ADMIN: 'There are no applications in this application group.',
    NON_ADMIN: 'You don’t have access to any application in this app group',
}

export const ENV_APP_GROUP_GA_EVENTS = {
    OverviewClicked: {
        category: 'Environment',
        action: 'Overview Clicked',
    },
    BuildDeployClicked: {
        category: 'Environment',
        action: 'Build & Deploy Clicked',
    },
    ConfigurationClicked: {
        category: 'Configuration',
        action: 'Configuration Clicked',
    },
}

export const GROUP_LIST_HEADER = {
    ENVIRONMENT: 'Environment',
    NAMESPACE: 'Namespace',
    CLUSTER: 'Cluster',
    APPLICATIONS: 'Applications',
    APPLICATION: 'Application',
}

export enum AppFilterTabs {
    'GROUP_FILTER' = 'groupFilter',
    'APP_FILTER' = 'appFilter',
}

export enum CreateGroupTabs {
    'SELECTED_APPS' = 'selectedApps',
    'SELECTED_ENV' = 'selectedEnv',
    'ALL_APPS' = 'allApps',
    'ALL_ENV' = 'allEnv',
}

export const CREATE_GROUP_TABS = {
    selectedApps: 'Selected applications',
    allApps: 'Add/Remove applications',
    selectedEnv: 'Selected environments',
    allEnv: 'Add/Remove environments',
}

export const GetBranchChangeStatus = (statusText: string): BulkResponseStatus => {
    switch (statusText) {
        case BulkResponseStatus.SKIP:
            return BulkResponseStatus.SKIP
        case BULK_VIRTUAL_RESPONSE_STATUS.pass:
            return BulkResponseStatus.PASS
        case BULK_VIRTUAL_RESPONSE_STATUS.fail:
            return BulkResponseStatus.FAIL
        case BULK_VIRTUAL_RESPONSE_STATUS.unauthorized:
            return BulkResponseStatus.UNAUTHORIZE
        default:
    }
}

export const FILTER_NAME_REGEX = /^[a-z][a-z0-9-]{1,}[a-z0-9]$/
export const SKIPPED_RESOURCES_MESSAGE = 'Build action is not applicable'
export const SKIPPED_RESOURCES_STATUS_TEXT = 'Skipped'

export const BULK_CD_MATERIAL_STATUS = (noOfApps) => ({
    title: `Fetching images for ${noOfApps} Applications`,
    subTitle: 'It might take some time depending upon the number of applications',
})

export const BULK_CD_DEPLOYMENT_STATUS = (noOfApps, env) => ({
    title: `Verifying selected images for ${noOfApps} Applications & initiating deployment on '${env}'`,
    subTitle: 'It might take some time depending upon the number of applications',
})

export const BULK_CI_MATERIAL_STATUS = (noOfApps) => ({
    title: `Fetching code sources for ${noOfApps} Applications`,
    subTitle: 'It might take some time depending upon the number of applications',
})
export const BULK_CI_BUILD_STATUS = (noOfApps) => ({
    title: `Verifying selected code sources for ${noOfApps} Applications & initiating build pipelines Applications`,
    subTitle: 'It might take some time depending upon the number of applications',
})

export const ENV_GROUP_LOCAL_STORAGE_KEY: AppEnvLocalStorageKeyType = 'envGroup__filter'
export const APP_GROUP_LOCAL_STORAGE_KEY: AppEnvLocalStorageKeyType = 'appGroup__filter'