import {
    DynamicDataTableCellErrorType,
    DynamicDataTableRowType,
    TagsTableColumnsType,
} from '@devtron-labs/devtron-fe-common-lib'

export interface CreateAppFormStateType {
    projectId: string
    name: string
    description: string
    tags: DynamicDataTableRowType<TagsTableColumnsType>[]
    cloneAppId: number | null
}

export interface CreateAppFormErrorStateType {
    projectId: string
    name: string
    description: string
    tags: DynamicDataTableCellErrorType<TagsTableColumnsType>
    cloneAppId: string | null
}

export enum CreationMethodType {
    blank = 'blank',
    clone = 'clone',
    template = 'template',
}

export enum CreateAppFormStateActionType {
    updateProjectId = 'updateProjectId',
    updateName = 'updateName',
    updateDescription = 'updateDescription',
    updateTags = 'updateTags',
    updateCloneAppId = 'updateCloneAppId',
}

type BaseHandleFormStateChangeParamsType<Action extends CreateAppFormStateActionType, Value> = {
    action: Action
    value: Value
}

export type HandleFormStateChangeParamsType =
    | BaseHandleFormStateChangeParamsType<
          CreateAppFormStateActionType.updateProjectId,
          CreateAppFormStateType['projectId']
      >
    | BaseHandleFormStateChangeParamsType<CreateAppFormStateActionType.updateName, CreateAppFormStateType['name']>
    | BaseHandleFormStateChangeParamsType<
          CreateAppFormStateActionType.updateDescription,
          CreateAppFormStateType['description']
      >
    | BaseHandleFormStateChangeParamsType<CreateAppFormStateActionType.updateTags, CreateAppFormStateType['tags']>
    | BaseHandleFormStateChangeParamsType<
          CreateAppFormStateActionType.updateCloneAppId,
          CreateAppFormStateType['cloneAppId']
      >
