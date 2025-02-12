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

export interface MaterialListProps extends Required<Pick<AppConfigProps, 'isTemplateView'>> {
    appId: string
    respondOnSuccess: () => void
    toggleRepoSelectionTippy: () => void
    setRepo: React.Dispatch<React.SetStateAction<string>>
    isJobView?: boolean
    handleGitMaterialsChange: (updatedGitMaterial: GitMaterialType[], isError: boolean) => void
    isCreateAppView: boolean
}

export interface MaterialServiceProps extends Pick<MaterialListProps, 'isTemplateView'> {
    request: any
}

export interface GitMaterialType {
    id?: number
    name?: string
    gitProvider: { id: number; name: string; url?: string; authMode?: string }
    url: string
    checkoutPath: string
    filterPattern?: []
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

export interface CreateMaterialState {
    material: {
        gitProvider: { id: number; name: string; url?: string }
        url: string
        checkoutPath: string
        active: boolean
        fetchSubmodules: boolean
        includeExcludeFilePath: string
        isExcludeRepoChecked: boolean
    }
    isCollapsed: boolean
    isChecked: boolean
    isLearnHowClicked: boolean
    isLoading: boolean
    isError: MaterialError
}

interface MaterialError {
    gitProvider: undefined | string
    url: undefined | string
    checkoutPath: undefined | string
}

export interface UpdateMaterialState {
    material: GitMaterialType
    isCollapsed: boolean
    isChecked: boolean
    isLearnHowClicked: boolean
    isLoading: boolean
    isError: MaterialError
}

export interface MaterialViewProps extends Pick<MaterialListProps, 'isTemplateView'> {
    isMultiGit: boolean
    isChecked: boolean
    isLearnHowClicked: boolean
    material: GitMaterialType
    isCollapsed: boolean
    isLoading: boolean
    isError: MaterialError
    providers: any[]
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
