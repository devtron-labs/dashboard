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
import { OptionType, PipelineFormType } from '@devtron-labs/devtron-fe-common-lib'
import { PipelineFormDataErrorType } from '../workflowEditor/types'

export interface CustomTagType {
    tagPattern: string
    counterX: string
}

export interface CustomImageTagsType {
    savedTagPattern?: string
    formData: PipelineFormType
    setFormData: React.Dispatch<React.SetStateAction<PipelineFormType>>
    formDataErrorObj: PipelineFormDataErrorType
    setFormDataErrorObj: React.Dispatch<React.SetStateAction<PipelineFormDataErrorType>>
    isCDBuild?: boolean
    selectedCDStageTypeValue?: OptionType
    setSelectedCDStageTypeValue?: React.Dispatch<React.SetStateAction<OptionType>>
}
