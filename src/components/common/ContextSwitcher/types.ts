import { GroupBase } from 'react-select'

import { SelectPickerOptionType, SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

export interface ContextSwitcherTypes
    extends Pick<
        SelectPickerProps,
        | 'placeholder'
        | 'onChange'
        | 'value'
        | 'isLoading'
        | 'onInputChange'
        | 'inputValue'
        | 'inputId'
        | 'formatOptionLabel'
        | 'filterOption'
    > {
    options: GroupBase<SelectPickerOptionType<string | number>>[]
    isAppDataAvailable?: boolean
}
