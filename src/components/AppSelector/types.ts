import { AppHeaderType } from '@Components/app/types'
import { SelectPickerOptionType, SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

export interface AppSelectorType
    extends Pick<SelectPickerProps, 'onChange'>,
        Partial<Pick<AppHeaderType, 'recentlyVisitedDevtronApps' | 'setRecentlyVisitedDevtronApps' | 'appName'>> {
    appId: number
    isJobView?: boolean
}

export interface RecentlyVisitedSelectPickerTypes extends SelectPickerOptionType<number> {
    isDisabled?: boolean
}
