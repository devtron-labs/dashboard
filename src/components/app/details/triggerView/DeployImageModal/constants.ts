import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

export const BULK_DEPLOY_LATEST_IMAGE_TAG: SelectPickerOptionType<string> = {
    value: 'Latest',
    label: 'Latest',
}

export const BULK_DEPLOY_ACTIVE_IMAGE_TAG: SelectPickerOptionType<string> = {
    value: 'Active',
    label: 'Active',
}

export const BULK_DEPLOY_MIXED_IMAGE_TAG: SelectPickerOptionType<string> = {
    value: 'Mixed',
    label: 'Mixed',
}
