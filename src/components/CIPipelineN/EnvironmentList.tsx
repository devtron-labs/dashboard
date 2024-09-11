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
import ReactSelect, { components } from 'react-select'
import { Environment } from '@devtron-labs/devtron-fe-common-lib'
import { createClusterEnvGroup } from '../common'
import { DropdownIndicator } from '../cdPipeline/cdpipeline.util'
import { buildStageStyles, groupHeading, triggerStageStyles } from './Constants'
import { DEFAULT_ENV } from '../app/details/triggerView/Constants'

export const EnvironmentList = ({
    isBuildStage,
    environments,
    selectedEnv,
    setSelectedEnv,
}: {
    isBuildStage?: boolean
    environments: any[]
    selectedEnv: Environment
    setSelectedEnv?: (_selectedEnv: Environment) => void | React.Dispatch<React.SetStateAction<Environment>>
}) => {
    const selectEnvironment = (selection: Environment) => {
        const _selectedEnv = environments.find((env) => env.id == selection.id)
        setSelectedEnv(_selectedEnv)
    }

    const envList = createClusterEnvGroup(environments, 'clusterName')

    const environmentListControl = (props): JSX.Element => {
        return (
            <components.Control {...props}>
                {!isBuildStage && <div className="dc__environment-icon ml-10" />}
                {props.children}
            </components.Control>
        )
    }

    const envOption = (props): JSX.Element => {
        return (
            <components.Option {...props}>
                <div>{props.data.name}</div>
                {props.data.name === DEFAULT_ENV && <span className="fs-12 cn-7 pt-2">{props.data.description}</span>}
            </components.Option>
        )
    }

    return (
        <div
            className={`${isBuildStage ? 'sidebar-action-container sidebar-action-container-border' : 'flex h-36 dc__align-items-center br-4 dc__border'}`}
        >
            {isBuildStage ? (
                <span>Execute tasks in environment</span>
            ) : (
                <div className="flex p-8 dc__align-start dc__border-right">Execute job in</div>
            )}
            <div className={`${!isBuildStage ? 'w-200 dc__align-items-center' : ''}`}>
                <ReactSelect
                    menuPlacement="auto"
                    closeMenuOnScroll
                    classNamePrefix="job-pipeline-environment-dropdown"
                    placeholder="Select Environment"
                    options={envList}
                    value={selectedEnv}
                    getOptionLabel={(option) => `${option.name}`}
                    getOptionValue={(option) => `${option.id}`}
                    isMulti={false}
                    onChange={selectEnvironment}
                    components={{
                        IndicatorSeparator: null,
                        DropdownIndicator,
                        GroupHeading: groupHeading,
                        Control: environmentListControl,
                        Option: envOption,
                    }}
                    styles={isBuildStage ? buildStageStyles : triggerStageStyles}
                />
            </div>
        </div>
    )
}
