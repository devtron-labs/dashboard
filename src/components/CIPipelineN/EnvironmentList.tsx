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

import {
    ComponentSizeType,
    Environment,
    SelectPicker,
    SelectPickerVariantType,
    GroupBase,
} from '@devtron-labs/devtron-fe-common-lib'
import { createClusterEnvGroup } from '../common'
import { EnvironmentListType, EnvironmentWithSelectPickerType } from './types'

export const EnvironmentList = ({
    isBuildStage,
    environments,
    selectedEnv,
    setSelectedEnv,
    isBorderLess = false,
}: EnvironmentListType) => {
    const selectEnvironment = (selection) => {
        const _selectedEnv = { ...selection }
        _selectedEnv.label = _selectedEnv.name
        _selectedEnv.value = _selectedEnv.id.toString()
        setSelectedEnv(_selectedEnv)
    }

    const envList = createClusterEnvGroup(environments as Environment[], 'clusterName')

    const getEnvListOptions = (): GroupBase<EnvironmentWithSelectPickerType>[] =>
        envList.reduce((acc, _elm) => {
            if (_elm.label) {
                return [
                    ...acc,
                    {
                        label: `Cluster: ${_elm.label}`,
                        options: _elm.options.map((_option) => ({
                            ..._option,
                            label: _option?.name,
                            value: _option?.id.toString(),
                            description: _option?.description,
                        })),
                    },
                ]
            }

            return [
                ...acc,
                ..._elm?.options?.map((_option) => {
                    return {
                        ..._option,
                        label: _option?.name,
                        value: _option?.id.toString(),
                        description: _option?.description,
                    }
                }),
            ]
        }, [])

    const getSelectedEnvironment = (): EnvironmentWithSelectPickerType => {
        let _selectedEnv: EnvironmentWithSelectPickerType = {
            ...selectedEnv,
            label: selectedEnv?.name,
            value: selectedEnv?.id, // assuming the whole object is set as value
            startIcon: !isBuildStage ? <div className="dc__environment-icon" /> : null,
        }

        return _selectedEnv
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
                <div className="dc__no-shrink">{getEnvironmentSelectLabel()}</div>
                <SelectPicker
                    required
                    inputId="job-pipeline-environment-dropdown"
                    name="job-pipeline-environment-dropdown"
                    classNamePrefix="job-pipeline-environment-dropdown"
                    placeholder="Select Environment"
                    options={getEnvListOptions()}
                    value={getSelectedEnvironment()}
                    onChange={selectEnvironment}
                    size={ComponentSizeType.large}
                    variant={isBorderLess ? SelectPickerVariantType.BORDER_LESS : SelectPickerVariantType.DEFAULT}
                />
            </div>
        </div>
    )
}
