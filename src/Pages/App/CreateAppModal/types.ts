/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { SyntheticEvent } from 'react'

import {
    ButtonProps,
    DynamicDataTableCellErrorType,
    DynamicDataTableRowType,
    SelectPickerProps,
    TagsTableColumnsType,
} from '@devtron-labs/devtron-fe-common-lib'

import { CIConfigProps } from '@Components/ciConfig/types'
import { GitMaterialType } from '@Components/material/material.types'

import { getCreateMethodConfig } from './utils'

interface CreateAppWorkflowConfigType {
    cd: {
        pipelineId: number
        environmentId: number
    }[]
}

interface CreateAppGitMaterialType {
    gitMaterialId: GitMaterialType['id']
    gitAccountId: GitMaterialType['gitProvider']['id']
    gitMaterialURL: GitMaterialType['url']
}

export interface CreateAppFormStateType {
    projectId: string
    name: string
    description: string
    tags: DynamicDataTableRowType<TagsTableColumnsType>[]
    cloneAppId: number | null
    templateConfig: {
        id: number
        templateId: string
        name: string
    }
    gitMaterials: CreateAppGitMaterialType[]
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
    // Map of workflow id to error message
    workflowConfig: Record<string, string>
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
              workflowIdToErrorMessageMap: CreateAppFormErrorStateType['workflowConfig']
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
    isTagsAccordionExpanded: boolean
    toggleIsTagsAccordionExpanded: () => void
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
    formErrorState: CreateAppFormErrorStateType
}
