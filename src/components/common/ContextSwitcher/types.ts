import { GroupBase } from 'react-select'

import { SelectPickerOptionType, SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

export interface ContextSwitcherTypes
    extends Pick<
        SelectPickerProps,
        | 'placeholder'
        | 'onChange'
        | 'value'
        | 'noOptionsMessage'
        | 'isLoading'
        | 'onInputChange'
        | 'inputValue'
        | 'inputId'
    > {
    options: GroupBase<SelectPickerOptionType<string | number>>[]
}
