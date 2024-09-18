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

import { ComponentSizeType, Environment, SelectPicker, SelectPickerVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { createClusterEnvGroup } from '../common'
import { EnvironmentListType } from './types'

export const EnvironmentList = ({ isBuildStage, environments, selectedEnv, setSelectedEnv, isBorderLess = false }: EnvironmentListType) => {
    const selectEnvironment = (selection: Environment) => {
        const _selectedEnv = environments.find((env) => env.id == selection.id)
        setSelectedEnv(_selectedEnv)
    }

    const envList = createClusterEnvGroup(environments, 'clusterName')

    if (selectedEnv && !selectedEnv.label && !selectedEnv.value) {
        selectedEnv.label = selectedEnv.name
        selectedEnv.value = selectedEnv.id.toString()
        selectedEnv.startIcon = !isBuildStage && <div className="dc__environment-icon" />
    }

    const getEnvironmentSelectLabel = (): JSX.Element => {
        if (isBuildStage) {
            return <span>Execute tasks in environment</span>
        } else {
            return <span className="flex p-8 dc__align-start dc__border-right mr-10">Execute job in</span>
        }
    }

    return (
        <div
            className={`${isBuildStage ? 'sidebar-action-container sidebar-action-container-border' : 'flex h-36 dc__align-items-center br-4 dc__border'}`}
        >
            <div className={`${!isBuildStage ? 'w-250 dc__align-items-center flex left' : ''}`}>
                {getEnvironmentSelectLabel()}
                <SelectPicker
                    required
                    inputId="job-pipeline-environment-dropdown"
                    name="job-pipeline-environment-dropdown"
                    classNamePrefix="job-pipeline-environment-dropdown"
                    placeholder="Select Environment"
                    options={envList}
                    value={selectedEnv}
                    onChange={selectEnvironment}
                    size={ComponentSizeType.large}
                    variant={isBorderLess ? SelectPickerVariantType.BORDER_LESS : SelectPickerVariantType.DEFAULT}
                />
            </div>
        </div>
    )
}
