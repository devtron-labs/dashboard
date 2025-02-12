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
import { OptionType, SourceTypeMap } from '@devtron-labs/devtron-fe-common-lib'

export const CiPipelineSourceTypeBaseOptions = [
    {
        label: 'Branch Fixed',
        value: SourceTypeMap.BranchFixed,
        isDisabled: false,
        isSelected: false,
        isWebhook: false,
    },
    {
        label: 'Branch Regex',
        value: SourceTypeMap.BranchRegex,
        isDisabled: false,
        isSelected: false,
        isWebhook: false,
    },
]

export enum StageTypeEnums {
    PRE_CD = 'PRE_CD',
    POST_CD = 'POST_CD',
}

export const StageTypeMap = {
    PRE_CD: 'Pre-deployment stage',
    POST_CD: 'Post-deployment stage',
}

export const customTagStageTypeOptions = [
    {
        label: StageTypeMap[StageTypeEnums.PRE_CD],
        value: StageTypeEnums.PRE_CD,
    },
    {
        label: StageTypeMap[StageTypeEnums.POST_CD],
        value: StageTypeEnums.POST_CD,
    },
]

export const getCDStageTypeSelectorValue = (customTagStage: string): OptionType => {
    let stageTypeSelectorValue: OptionType
    if (customTagStage === StageTypeEnums.POST_CD) {
        stageTypeSelectorValue = { label: StageTypeMap.POST_CD, value: StageTypeEnums.POST_CD }
    } else {
        stageTypeSelectorValue = { label: StageTypeMap.PRE_CD, value: StageTypeEnums.PRE_CD }
    }
    return stageTypeSelectorValue
}
