import { BaseAppMetaData } from '@Components/app/types'
import { Dispatch, SetStateAction } from 'react'
import { SelectPickerOptionType, SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

export interface AppSelectorType extends Pick<SelectPickerProps, 'onChange'> {
    appId: number
    appName: string
    isJobView?: boolean
    recentlyVisitedDevtronApps?: BaseAppMetaData[]
    setRecentlyVisitedDevtronApps?: Dispatch<SetStateAction<BaseAppMetaData[]>>
}

export interface RecentlyVisitedSelectPickerTypes extends SelectPickerOptionType<number> {
    isDisabled?: boolean
}
