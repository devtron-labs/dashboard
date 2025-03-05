import { getEmptyTagTableRow } from '@devtron-labs/devtron-fe-common-lib'
import { CreateAppFormErrorStateType, CreateAppFormStateType } from './types'

export const createAppInitialFormState: CreateAppFormStateType = {
    name: '',
    projectId: null,
    description: '',
    tags: [getEmptyTagTableRow()],
    cloneAppId: null,
    templateConfig: null,
    gitMaterials: null,
    buildConfiguration: null,
    workflowConfig: null,
}

export const createAppInitialFormErrorState: CreateAppFormErrorStateType = {
    name: '',
    projectId: '',
    description: '',
    tags: {},
    cloneAppId: null,
    gitMaterials: null,
    workflowConfig: null,
}
