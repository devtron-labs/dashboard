import { CustomInputProps, SelectPickerProps } from '@devtron-labs/devtron-fe-common-lib'

export interface SourceMaterialsSelectorProps {
    repoName?: string
    sourceTypePickerProps: Omit<
        SelectPickerProps<string | number, false>,
        'required' | 'isSearchable' | 'isClearable' | 'closeMenuOnSelect' | 'size'
    >
    branchInputProps: Omit<CustomInputProps, 'required' | 'type'> & {
        hideInput?: boolean
    }
}
