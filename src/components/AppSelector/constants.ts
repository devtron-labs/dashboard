import { RecentlyVisitedGroupedOptionsType } from './AppSelector.types'

export const AllApplicationsMetaData: RecentlyVisitedGroupedOptionsType = {
    label: 'All Applications',
    options: [{ value: 0, label: 'Type 3 characters to search', isDisabled: true }],
}

export const APP_DETAILS_GA_EVENTS = {
    RecentlyVisitedApps: {
        category: 'App Selector',
        action: 'DA_SWITCH_RECENTLY_VISITED_CLICKED',
    },
    SearchesAppClicked: {
        category: 'App Selector',
        action: 'DA_SWITCH_SEARCHED_APP_CLICKED',
    },
}
