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

export interface AppCheckList {
    gitOps: boolean
    project: boolean
    git: boolean
    environment: boolean
    docker: boolean
    hostUrl: boolean
}

export interface AppCheckListState {}

export interface ChartCheckList {
    gitOps: boolean
    project: boolean
    environment: boolean
}

export interface ChartCheckListState {
    view: string
    statusCode: number
    isChartCollapsed: boolean
    saveLoading: boolean
    form: {
        chartChecklist: ChartCheckList
    }
}

export interface GlobalConfigCheckListProps extends RouteComponentProps<{}> {
    isLoading: boolean
    isAppCreated: boolean
    appChecklist: AppCheckList
    chartChecklist: ChartCheckList
    appStageCompleted: number
    chartStageCompleted: number
}

export interface GlobalConfigCheckListState {
    isChartCollapsed: boolean
    isAppCollapsed: boolean
}
export interface AppCheckListProps {
    showDivider: boolean
    appChecklist: AppCheckList
    appStageCompleted: number
    isAppCollapsed: boolean
    toggleAppChecklist: (event) => void
}

export interface ChartCheckListProps {
    isChartCollapsed: boolean
    chartChecklist: ChartCheckList
    chartStageCompleted: number
    showDivider: boolean
    toggleChartChecklist: (event) => void
}
