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

import { ScopedVariablesFileViewType } from '@devtron-labs/devtron-fe-common-lib'
import { Dispatch, SetStateAction } from 'react'
import { useFileReader } from '../common'
import { FileReaderStatusType, FileDataType } from '../common/hooks/types'
import { parseIntoYAMLString } from './utils'

export enum VariableCategories {
    APPLICATION_ENV = 'ApplicationEnv',
    APPLICATION = 'Application',
    ENVIRONMENT = 'Env',
    CLUSTER = 'Cluster',
    GLOBAL = 'Global',
}

export interface SavedVariablesViewProps {
    scopedVariablesData: ScopedVariablesDataType
    jsonSchema: object
    reloadScopedVariables: () => void
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataType>>
}

export interface LoadScopedVariablesProps {
    status: FileReaderStatusType
    progress: number
    fileData: FileDataType
    abortRead: () => void
}

export interface ScopedVariablesEditorProps {
    variablesData: string
    name: string
    jsonSchema: object
    abortRead: () => void
    setShowEditView?: React.Dispatch<React.SetStateAction<boolean>>
    reloadScopedVariables: () => void
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataType>>
}

export interface UploadScopedVariablesProps {
    reloadScopedVariables: () => void
    jsonSchema: object
    setScopedVariables: React.Dispatch<React.SetStateAction<ScopedVariablesDataType>>
}

export interface DescriptorProps extends Partial<Pick<SearchBarProps, 'searchText' | 'setSearchText' | 'onSearch'>> {
    children?: React.ReactNode
    showUploadButton?: boolean
    readFile?: ReturnType<typeof useFileReader>['readFile']
}

export interface VariableType {
    name: string
    description: string
    isSensitive: boolean
}
export interface ScopedVariablesProps {
    isSuperAdmin: boolean
}

export interface ScopedVariablesDataType {
    apiVersion: 'devtron.ai/v1beta1'
    kind: 'Variable'
    spec: VariableSpecType[]
}

export interface VariableSpecType {
    notes?: string
    shortDescription?: string
    name: string
    isSensitive: boolean
    values: ValueType[]
}

export interface ValueType {
    category: VariableCategories
    value: any
    selectors?: object
}

export interface VariablesListItemProps {
    data: string
    classes: string
    tooltip?: boolean
}

export interface SearchBarProps {
    searchText: string
    setSearchText: Dispatch<SetStateAction<string>>
    onSearch: (query: string) => void
    placeholder?: string
    inputClass?: string
    containerClass?: string
    children?: React.ReactNode
    Icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    iconClass?: string
}

export interface SavedVariablesContentProps
    extends Required<Pick<DescriptorProps, 'searchText' | 'setSearchText' | 'onSearch'>> {
    handleClearFilters: () => void
    readFile: ReturnType<typeof useFileReader>['readFile']
    handleActivateEditView: () => void
    scopedVariablesYAML: ReturnType<typeof parseIntoYAMLString>
    variablesList: VariableType[]
}

export interface YAMLEditorDropdownItemProps extends Pick<SavedVariablesContentProps, 'scopedVariablesYAML'> {
    item: string
}

export interface DescriptorTabProps {
    handleCurrentViewUpdate: (view: ScopedVariablesFileViewType) => void
    currentView: ScopedVariablesFileViewType
    targetView: ScopedVariablesFileViewType
}
