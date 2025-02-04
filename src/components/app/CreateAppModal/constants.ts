import { SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'
import { CreateAppFormStateType, CreationMethodType } from './types'

export const createAppInitialFormState: CreateAppFormStateType = {
    name: '',
    projectId: null,
    description: '',
}

export const CREATION_METHOD_CONFIG: SelectPickerOptionType<CreationMethodType>[] = [
    {
        label: 'Blank application',
        value: CreationMethodType.blank,
    },
    {
        label: 'Clone application',
        value: CreationMethodType.clone,
    },
    {
        label: 'From template',
        value: CreationMethodType.template,
    },
]
