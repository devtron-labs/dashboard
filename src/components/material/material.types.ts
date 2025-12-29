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

import { AppConfigProps } from '@devtron-labs/devtron-fe-common-lib'

import { GitAccountDTO } from '@Services/service.types'

export interface MaterialListProps extends Pick<AppConfigProps, 'isTemplateView'> {
    appId: string
    isCreateAppView?: boolean
    isJobView?: boolean
    respondOnSuccess: () => void
    toggleRepoSelectionTippy: () => void
    setRepo: React.Dispatch<React.SetStateAction<string>>
    handleGitMaterialsChange?: (updatedGitMaterial: GitMaterialType[], isError: boolean) => void
}

export interface MaterialServiceProps extends Pick<MaterialListProps, 'isTemplateView'> {
    request: any
}

export interface GitMaterialDTO {
    checkoutPath: string
    createBackup: boolean
    fetchSubmodules: boolean
    filterPattern: string[]
    gitProviderId: number
    id: number
    isUsedInCiConfig: boolean
    name: string
    url: string
    active: boolean
}

export interface GitMaterialType {
    id?: number
    name?: string
    gitProvider: GitAccountDTO
    url: string
    checkoutPath: string
    filterPattern?: string[]
    includeExcludeFilePath?: string
    active: boolean
    fetchSubmodules: boolean
    isUsedInCiConfig?: boolean
    isExcludeRepoChecked?: boolean
}

export interface MaterialListState {
    statusCode: number
    view: string
    materials: GitMaterialType[]
    providers: any[]
    configStatus: number
}

interface MaterialError {
    gitProvider: undefined | string
    url: undefined | string
    checkoutPath: undefined | string
}

export interface MaterialViewProps extends Pick<MaterialListProps, 'isTemplateView'> {
    isMultiGit: boolean
    isChecked: boolean
    isLearnHowClicked: boolean
    material: GitMaterialType
    isCollapsed: boolean
    isLoading: boolean
    isError: MaterialError
    providers: GitAccountDTO[]
    handleProviderChange: (selected, url) => void
    handleCheckoutPathCheckbox: (event) => void
    handleExcludeRepoCheckbox: (event) => void
    handleLearnHowClick: (event) => void
    handleUrlChange: (event) => void
    handlePathChange: (event) => void
    handleFileChange: (event) => void
    toggleCollapse: (event) => void
    save: (event) => void
    cancel: (event) => void
    handleSubmoduleCheckbox: (event) => void
    appId?: number
    reload: () => void
    preventRepoDelete?: boolean
    toggleRepoSelectionTippy?: () => void
    setRepo?: React.Dispatch<React.SetStateAction<string>>
    isJobView?: boolean
    isCreateAppView?: boolean
}

export interface MaterialViewState {
    deleting: boolean
    confirmation: boolean
}

export type MaterialFormProps = Required<Pick<AppConfigProps, 'isTemplateView'>> & {
    appId: number
    isMultiGit: boolean
    providers: MaterialViewProps['providers']
    isCheckoutPathValid: (checkoutPath: string) => string | undefined
    refreshMaterials: () => void
    reload: () => void
    isJobView: boolean
} & (
        | {
              material: GitMaterialType
              preventRepoDelete: boolean
              toggleRepoSelectionTippy: () => void
              setRepo: React.Dispatch<React.SetStateAction<string>>
              isCreateAppView: MaterialViewProps['isCreateAppView']
              handleSingleGitMaterialUpdate: (updatedMaterial: GitMaterialType, isError: boolean) => void
          }
        | {
              material?: never
              preventRepoDelete?: never
              toggleRepoSelectionTippy?: never
              setRepo?: never
              isCreateAppView?: never
              handleSingleGitMaterialUpdate?: never
          }
    )

export interface UpsertMaterialItemPayload {
    url: string
    checkoutPath: string
    gitProviderId: number
    fetchSubmodules: boolean
    filterPattern: string[]
}

export interface CreateMaterialPayload {
    appId: number
    material: UpsertMaterialItemPayload[]
}

export interface UpdateMaterialPayload {
    appId: number
    material: UpsertMaterialItemPayload & { id: number }
}
