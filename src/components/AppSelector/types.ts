import { BaseAppMetaData } from '@Components/app/types'
import { Dispatch, SetStateAction } from 'react'
import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

export interface AppSelectorType {
    onChange: ({ label, value }) => void
    appId: number
    appName: string
    isJobView?: boolean
    recentlyVisitedDevtronApps?: BaseAppMetaData[]
    setRecentlyVisitedDevtronApps?: Dispatch<SetStateAction<BaseAppMetaData[]>>
}

export interface RecentSelectPickerTypes extends SelectPickerOptionType {
    isDisabled?: boolean
    value: number
}
