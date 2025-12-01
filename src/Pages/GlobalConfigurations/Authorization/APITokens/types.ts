import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

export type ExpirationDateSelectOptionType = SelectPickerOptionType<number | Date>

export interface ExpirationDateProps {
    selectedExpirationDate: ExpirationDateSelectOptionType
    onChangeSelectFormData: (value: ExpirationDateSelectOptionType) => void
    handleDatesChange: (date: Date) => void
    customDate: Date
}
