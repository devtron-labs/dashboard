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

export const CI_MATERIAL_EMPTY_STATE_MESSAGING = {
    Loading: 'Fetching... This might take few minutes',
    NoCommitAltText: 'no commits found',
    NoMaterialFound: 'No material found',
    NoMaterialFoundSubtitle: 'We could not find any matching data for provided configurations',
    NoSearchResults: 'Please check the commit hash and try again. Make sure you enter the complete commit hash.',
    FailedToFetch: 'Failed to fetch',
    FailedToFetchSubtitle: 'Sorry! We could not fetch available materials. Please try again.',
    ClearSearch: 'Clear search',
    Retry: 'Retry',
    WebhookModalCTA: 'View All Received webhooks',
    NoCommitEligibleCommit: 'No recent eligible commit found',
    NoCommitEligibleCommitSubtitle:
        'Commits that contain changes only in excluded files or folders are not eligible for build.',
    NoCommitEligibleCommitButtonText: 'Show excluded commits',
}
export const IGNORE_CACHE_INFO = {
    FirstTrigger: {
        title: 'First pipeline run may take longer than usual',
        infoText: 'Future runs will have shorter build time if caching is enabled.',
    },
    BlobStorageNotConfigured: {
        title: 'Cache not available as storage is not setup',
        infoText: 'Want to reduce build time?',
        configure: 'Configure blob storage',
    },
    CacheNotAvailable: {
        title: 'Cache will be generated for this pipeline run',
        infoText: 'Cache will be used in future runs to reduce build time.',
    },
    IgnoreCache: {
        title: 'Ignore Cache',
        infoText: 'Ignoring cache will lead to longer build time.',
    },
}
export const BRANCH_REGEX_MODAL_MESSAGING = {
    SetPrimaryHeading: 'Set a primary branch',
    SetPrimaryInfoText:
        'Primary branch will be used to trigger automatic builds on every commit. This can be changed later.',
    SubTitle: 'Use branch name matching',
    MatchingBranchNameRegex: 'Enter branch name matching regex',
    NoMatchingBranchName: 'Branch name does not match the regex.',
}

export const TIME_STAMP_ORDER = {
    DESCENDING: 'DESC',
    ASCENDING: 'ASC',
}

export const HOST_ERROR_MESSAGE = {
    NotConfigured: 'Host url is not configured or is incorrect. Reach out to your DevOps team (super-admin) to',
    Review: 'Review and update',
}

export const TRIGGER_VIEW_GA_EVENTS = {
    MaterialClicked: {
        category: 'Trigger View',
        action: 'Select Material Clicked',
    },
    ImageClicked: {
        category: 'Trigger View',
        action: 'Select Image Clicked',
    },
    RollbackClicked: {
        category: 'Trigger View',
        action: 'Select Rollback Material Clicked',
    },
    CITriggered: {
        category: 'Trigger View',
        action: 'CI Triggered',
    },
    CDTriggered: (nodeType: string) => ({
        category: 'Trigger View',
        action: `${nodeType} Triggered`,
    }),
    ApprovalNodeClicked: {
        category: 'Trigger View',
        action: 'Approval Node Clicked',
    },
}

export const CD_MATERIAL_GA_EVENT = {
    FetchMoreImagesClicked: {
        category: 'CD Material',
        action: 'Fetch More Images Clicked',
    },
}

/**
 * @deprecated Use DEFAULT_ENV form common lib instead
 */
export const DEFAULT_ENV = 'devtron-ci'

export const DO_NOT_DEPLOY = 'DO NOT DEPLOY'

export const TRIGGER_VIEW_PARAMS = {
    APPROVAL: 'approval',
    PENDING: 'pending',
    APPROVAL_STATE: 'approval-state',
    APPROVAL_NODE: 'approval-node',
    CD_NODE: 'cd-node',
    NODE_TYPE: 'node-type',
}
