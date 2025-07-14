import { RecentlyVisitedGroupedOptionsType } from '@devtron-labs/devtron-fe-common-lib'

export const getMinCharSearchPlaceholderGroup = (resourceKind): RecentlyVisitedGroupedOptionsType => ({
    label: `All ${resourceKind}`,
    options: [{ value: 0, label: 'Type 3 characters to search', isDisabled: true }],
})

export const appSelectorGAEvents = {
    DA_SWITCH_RECENTLY_VISITED_CLICKED: 'DA_SWITCH_RECENTLY_VISITED_CLICKED',
    DA_SWITCH_SEARCHED_APP_CLICKED: 'DA_SWITCH_SEARCHED_APP_CLICKED',
    JOB_SWITCH_RECENTLY_VISITED_CLICKED: 'JOB_SWITCH_RECENTLY_VISITED_CLICKED',
    JOB_SWITCH_SEARCHED_ITEM_CLICKED: 'JOB_SWITCH_SEARCHED_ITEM_CLICKED',
    CS_CHART_DETAIL_SWITCH_ITEM_CLICKED: 'CS_CHART_DETAIL_SWITCH_ITEM_CLICKED',
}
