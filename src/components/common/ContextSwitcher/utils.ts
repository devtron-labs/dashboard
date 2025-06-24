import { SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

import { RecentlyVisitedOptions } from '@Components/AppSelector/AppSelector.types'

export const getDisabledOptions = (option: RecentlyVisitedOptions): SelectPickerProps['isDisabled'] => option.isDisabled

export const customSelect: SelectPickerProps['filterOption'] = (option, searchText: string) => {
    const label = option.data.label as string
    return option.data.value === 0 || label.toLowerCase().includes(searchText.toLowerCase())
}
