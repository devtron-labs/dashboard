import {
    ButtonProps,
    DynamicDataTableCellErrorType,
    DynamicDataTableRowType,
    SelectPickerProps,
    TagsTableColumnsType,
} from '@devtron-labs/devtron-fe-common-lib'
import { SyntheticEvent } from 'react'
import { GitMaterialType } from '@Components/material/material.types'
import { CIConfigProps } from '@Components/ciConfig/types'
import { getCreateMethodConfig } from './utils'

interface CreateAppWorkflowConfigType {
    cd: {
        pipelineId: number
        environmentId: number
    }[]
}

export interface CreateAppFormStateType {
    projectId: string
    name: string
    description: string
    tags: DynamicDataTableRowType<TagsTableColumnsType>[]
    cloneAppId: number | null
    templateConfig: {
        templateId: number
        displayName: string
    }
    gitMaterials: Pick<GitMaterialType, 'id' | 'url' | 'gitProvider'>[]
    buildConfiguration: Required<Pick<CIConfigProps['parentState']['ciConfig'], 'dockerRegistry' | 'dockerRepository'>>
    workflowConfig: CreateAppWorkflowConfigType
}

export interface CreateAppFormErrorStateType {
    projectId: string
    name: string
    description: string
    tags: DynamicDataTableCellErrorType<TagsTableColumnsType>
    cloneAppId: string | null
    gitMaterials: boolean
    workflowConfig: boolean
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
    updateGitMaterials = 'updateGitMaterials',
    updateBuildConfiguration = 'updateBuildConfiguration',
    updateWorkflowConfig = 'updateWorkflowConfig',
    updateTemplateConfig = 'updateTemplateConfig',
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
    | BaseHandleFormStateChangeParamsType<
          CreateAppFormStateActionType.updateGitMaterials,
          {
              data: CreateAppFormStateType['gitMaterials']
              isError: boolean
          }
      >
    | BaseHandleFormStateChangeParamsType<
          CreateAppFormStateActionType.updateBuildConfiguration,
          CreateAppFormStateType['buildConfiguration']
      >
    | BaseHandleFormStateChangeParamsType<
          CreateAppFormStateActionType.updateWorkflowConfig,
          {
              data: CreateAppFormStateType['workflowConfig']
              isError: boolean
          }
      >
    | BaseHandleFormStateChangeParamsType<
          CreateAppFormStateActionType.updateTemplateConfig,
          CreateAppFormStateType['templateConfig']
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

export interface SidebarProps extends Pick<CreateAppModalProps, 'isJobView'> {
    selectedCreationMethod: CreationMethodType
    handleCreationMethodChange: (creationMethod: CreationMethodType) => void
    createMethodConfig: ReturnType<typeof getCreateMethodConfig>
}

export interface AppToCloneSelectorProps
    extends Pick<CreateAppModalProps, 'isJobView'>,
        Required<Pick<SelectPickerProps, 'error'>> {
    handleCloneIdChange: (cloneAppId: CreateAppFormStateType['cloneAppId']) => void
}

export interface UpdateTemplateConfigProps
    extends Pick<CreateAppModalProps, 'isJobView'>,
        Pick<ApplicationInfoFormProps, 'handleFormStateChange'> {
    formState: CreateAppFormStateType
}
