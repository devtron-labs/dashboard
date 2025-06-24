import { GroupBase } from 'react-select'

import { BaseAppMetaData, SelectPickerOptionType, SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

import { AppHeaderType } from '@Components/app/types'

export interface AppSelectorType extends Pick<SelectPickerProps, 'onChange'>, Pick<AppHeaderType, 'appName'> {
    appId: number
    isJobView?: boolean
}

export interface RecentlyVisitedOptions extends SelectPickerOptionType<number> {
    isDisabled?: boolean
    isRecentlyVisited?: boolean
}

export interface RecentlyVisitedGroupedOptionsType extends GroupBase<SelectPickerOptionType<number>> {
    label: string
    options: RecentlyVisitedOptions[]
}

export interface AppListOptionsTypes {
    inputValue: string
    isJobView?: boolean
    signal?: AbortSignal
    recentlyVisitedDevtronApps?: BaseAppMetaData[] | []
}

export interface ChartSelectorType {
    primaryKey: string // url match
    primaryValue: string
    matchedKeys: string[]
    api: (queryString?: string) => Promise<any>
    apiPrimaryKey?: string // primary key to generate map
    onChange?: ({ label, value }) => void
    formatOptionLabel?: ({ label, value, ...rest }) => React.ReactNode
    filterOption?: (option: any, searchString: string) => boolean
}
