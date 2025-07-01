import { BaseRecentlyVisitedEntitiesTypes, SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

import { AppHeaderType } from '@Components/app/types'

export interface AppSelectorType extends Pick<SelectPickerProps, 'onChange'>, Pick<AppHeaderType, 'appName'> {
    appId: number
    isJobView?: boolean
}

export interface AppListOptionsTypes {
    inputValue: string
    isJobView?: boolean
    signal?: AbortSignal
    recentlyVisitedResources?: BaseRecentlyVisitedEntitiesTypes[] | []
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
