import { getEmptyTagTableRow, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'
import { CreateAppFormErrorStateType, CreateAppFormStateType, CreationMethodType } from './types'

export const createAppInitialFormState: CreateAppFormStateType = {
    name: '',
    projectId: null,
    description: '',
    tags: [getEmptyTagTableRow()],
    cloneAppId: null,
}

export const createAppInitialFormErrorState: CreateAppFormErrorStateType = {
    name: '',
    projectId: '',
    description: '',
    tags: {},
    cloneAppId: null,
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
