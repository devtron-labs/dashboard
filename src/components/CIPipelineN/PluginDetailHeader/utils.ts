import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

export const getPluginVersionSelectOption = (
    version: string,
    id: number,
    isLatest: boolean,
): SelectPickerOptionType => ({
    label: version,
    value: id,
    description: isLatest ? 'Latest' : '',
})
