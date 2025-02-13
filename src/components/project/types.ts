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

import { RouteComponentProps } from 'react-router-dom'

export interface ProjectListProps extends RouteComponentProps<{}> {
    isSuperAdmin: boolean
}
export interface ProjectListState {
    code: number
    loadingData: boolean
    view: string
    projects: Array<ProjectType>
    isValid: {
        name: boolean
    }
    errorMessage: {
        name: string
    }
}

export interface ProjectType {
    id: number
    name: string
    active: boolean
    isCollapsed: boolean
}

export interface ProjectProps {
    id: number
    name: string
    active: boolean
    isCollapsed: boolean
    saveProject: (index: number, key: 'name') => void
    onCancel: (index) => void
    handleChange: (Event, index: number, key: 'name') => void
    loadingData: boolean
    index: number
    isValid: { name: boolean }
    errorMessage: { name: string }
    reload: () => void
}

export interface ProjectState {
    confirmation: boolean
}
