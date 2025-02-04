export interface CreateAppFormStateType {
    projectId: string
    name: string
    description: string
}

export enum CreateAppFormStateActionType {
    updateProjectId = 'updateProjectId',
    updateName = 'updateName',
    updateDescription = 'updateDescription',
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
