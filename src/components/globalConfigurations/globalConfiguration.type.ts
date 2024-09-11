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

import React from 'react'
import { AppCheckList, ChartCheckList } from '../checkList/checklist.type'

interface CheckList {
    isLoading: boolean
    isAppCreated: boolean
    appChecklist: AppCheckList
    chartChecklist: ChartCheckList
    appStageCompleted: number
    chartStageCompleted: number
}
export interface BodyType {
    getHostURLConfig: () => void
    checkList: CheckList
    serverMode: string
    handleChecklistUpdate: (itemName: string) => void
    isSuperAdmin: boolean
}

export interface ProtectedInputType {
    name: string
    value: string | number
    onChange: (e: any) => void
    error?: React.ReactNode
    label?: React.ReactNode
    tabIndex?: number
    disabled?: boolean
    hidden?: boolean
    labelClassName?: string
    placeholder?: string
    dataTestid: string
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    isRequiredField?: boolean
}
