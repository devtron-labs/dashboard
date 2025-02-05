import {
    ButtonProps,
    DynamicDataTableCellErrorType,
    DynamicDataTableRowType,
    SelectPickerProps,
    TagsTableColumnsType,
} from '@devtron-labs/devtron-fe-common-lib'
import { SyntheticEvent } from 'react'
import { getCreateMethodConfig } from './utils'

export interface CreateAppFormStateType {
    projectId: string
    name: string
    description: string
    tags: DynamicDataTableRowType<TagsTableColumnsType>[]
    cloneAppId: number | null
    templateId: number | null
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

export interface CreateAppModalProps {
    isJobView: boolean
    handleClose: (e: SyntheticEvent) => void
}

export interface HeaderSectionProps extends CreateAppModalProps {
    isCloseDisabled: ButtonProps['disabled']
}

export interface ApplicationInfoFormProps extends Pick<CreateAppModalProps, 'isJobView'> {
    formState: CreateAppFormStateType
    handleFormStateChange: (params: HandleFormStateChangeParamsType) => void
    formErrorState: CreateAppFormErrorStateType
    handleTagErrorChange: (tagsError: CreateAppFormErrorStateType['tags']) => void
    selectedCreationMethod: CreationMethodType
}

export interface ProjectSelectorProps extends Required<Pick<SelectPickerProps, 'error'>> {
    selectedProjectId: CreateAppFormStateType['projectId']
    handleProjectIdChange: (projectId: CreateAppFormStateType['projectId']) => void
}

export interface SidebarProps {
    selectedCreationMethod: CreationMethodType
    handleCreationMethodChange: (creationMethod: CreationMethodType) => void
    createMethodConfig: ReturnType<typeof getCreateMethodConfig>
}

export interface AppToCloneSelectorProps
    extends Pick<CreateAppModalProps, 'isJobView'>,
        Required<Pick<SelectPickerProps, 'error'>> {
    handleCloneIdChange: (cloneAppId: CreateAppFormStateType['cloneAppId']) => void
}

export interface UpdateTemplateConfigProps extends Pick<CreateAppModalProps, 'isJobView'> {
    formState: CreateAppFormStateType
}
