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

import { Icon, OverrideMergeStrategyType, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

const isFELibAvailable = importComponentFromFELibrary('isFELibAvailable', false, 'function')

const IS_ENV_MERGE_STRATEGY_VALID =
    Object.values(OverrideMergeStrategyType).includes(window._env_.FEATURE_DEFAULT_MERGE_STRATEGY) &&
    !(!isFELibAvailable && window._env_.FEATURE_DEFAULT_MERGE_STRATEGY === OverrideMergeStrategyType.PATCH)

const FALLBACK_MERGE_STRATEGY: OverrideMergeStrategyType = isFELibAvailable
    ? OverrideMergeStrategyType.PATCH
    : OverrideMergeStrategyType.REPLACE

export const DEFAULT_MERGE_STRATEGY: OverrideMergeStrategyType = IS_ENV_MERGE_STRATEGY_VALID
    ? window._env_.FEATURE_DEFAULT_MERGE_STRATEGY
    : FALLBACK_MERGE_STRATEGY

export const MERGE_STRATEGY_OPTIONS: SelectPickerOptionType[] = [
    {
        label: (
            <div className="flexbox dc__gap-8">
                <span>Patch</span>
                {!isFELibAvailable && (
                    <div className="dc__fill-available-space dc__w-fit-content h-20">
                        <Icon name="ic-enterprise-tag" size={null} color={null} />
                    </div>
                )}
            </div>
        ),
        description: 'Override values for specific keys',
        value: OverrideMergeStrategyType.PATCH,
    },
    {
        label: 'Replace',
        description: 'Override complete configuration',
        value: OverrideMergeStrategyType.REPLACE,
    },
]
