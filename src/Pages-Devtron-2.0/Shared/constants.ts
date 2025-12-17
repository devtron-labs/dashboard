import { SelectPickerOptionType, SortingOrder } from '@devtron-labs/devtron-fe-common-lib'

import { RelativeTimeWindow, TIME_WINDOW } from './types'

const RELATIVE_TIME_WINDOW_LABEL_MAP: Record<RelativeTimeWindow, string> = {
    [RelativeTimeWindow.LAST_7_DAYS]: 'Last 7 Days',
    [RelativeTimeWindow.LAST_30_DAYS]: 'Last 30 Days',
    [RelativeTimeWindow.LAST_90_DAYS]: 'Last 90 Days',
}

export const RELATIVE_TIME_WINDOW_SELECT_OPTIONS: SelectPickerOptionType<RelativeTimeWindow>[] = (
    Object.keys(RELATIVE_TIME_WINDOW_LABEL_MAP) as RelativeTimeWindow[]
).map((value) => ({
    label: RELATIVE_TIME_WINDOW_LABEL_MAP[value],
    value,
}))

const TIME_WINDOW_LABEL_MAP: Record<TIME_WINDOW, string> = {
    [TIME_WINDOW.TODAY]: 'Today',
    [TIME_WINDOW.THIS_WEEK]: 'This week',
    [TIME_WINDOW.THIS_MONTH]: 'This month',
    [TIME_WINDOW.THIS_QUARTER]: 'This quarter',
    [TIME_WINDOW.LAST_WEEK]: 'Last week',
    [TIME_WINDOW.LAST_MONTH]: 'Last month',
}

export const TIME_WINDOW_SELECT_OPTIONS: SelectPickerOptionType<TIME_WINDOW>[] = (
    Object.keys(TIME_WINDOW_LABEL_MAP) as TIME_WINDOW[]
).map((value) => ({
    label: TIME_WINDOW_LABEL_MAP[value],
    value,
}))

export const SORT_ORDER_OPTIONS: SelectPickerOptionType<SortingOrder>[] = [
    { label: 'Low to high', value: SortingOrder.ASC },
    { label: 'High to low', value: SortingOrder.DESC },
]
