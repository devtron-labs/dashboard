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
    WebhookModalCTA: 'View all incoming webhook payloads',
}
export const IGNORE_CACHE_INFO = {
    FirstTrigger: {
        title: 'First pipeline run may take longer than usual',
        infoText: 'Future runs will have shorter build time if caching is enabled.',
        jobInfoText: 'Future runs will have shorter run time if caching is enabled.',
    },
    BlobStorageNotConfigured: {
        title: 'Cache not available as storage is not setup',
        infoText: 'Want to reduce build time?',
        jobInfoText: 'Want to reduce run time?',
        configure: 'Configure blob storage',
    },
    CacheNotAvailable: {
        title: 'Cache will be generated for this pipeline run',
        infoText: 'Cache will be used in future runs to reduce build time.',
        jobInfoText: 'Cache will be used in future runs to reduce run time.',
    },
    IgnoreCache: {
        title: 'Ignore Cache',
        infoText: 'Ignoring cache will lead to longer build time.',
        jobInfoText: 'Ignoring cache will lead to longer run time.',
    },
}
export const BRANCH_REGEX_MODAL_MESSAGING = {
    SetPrimaryHeading: 'Set a primary branch',
    SetPrimaryInfoText:
        'Primary branch will be used to trigger automatic builds on every commit. This can be changed later.',
    MatchingBranchName: 'Use branch name matching',
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
}
