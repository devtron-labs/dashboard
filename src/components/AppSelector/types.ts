import { AppHeaderType } from '@Components/app/types'
import { SelectPickerOptionType, SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'
import { GroupBase } from 'react-select'

export interface AppSelectorType
    extends Pick<SelectPickerProps, 'onChange'>,
        Partial<Pick<AppHeaderType, 'recentlyVisitedDevtronApps' | 'setRecentlyVisitedDevtronApps' | 'appName'>> {
    appId: number
    isJobView?: boolean
}

export interface RecentlyVisitedOptions extends SelectPickerOptionType<number> {
    isDisabled?: boolean
}

export interface RecentlyVisitedGroupedOptionsType extends GroupBase<SelectPickerOptionType<number>> {
    label: string
    options: RecentlyVisitedOptions[]
}
