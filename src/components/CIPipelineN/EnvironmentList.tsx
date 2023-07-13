import React from 'react'
import { createClusterEnvGroup } from '../common'
import ReactSelect, { components } from 'react-select'
import { Environment } from '../cdPipeline/cdPipeline.types'
import { DropdownIndicator } from '../cdPipeline/cdpipeline.util'
import { buildStageStyles, groupHeading, triggerStageStyles } from './Constants'

export function EnvironmentList({ isBuildStage, environments, selectedEnv, setSelectedEnv }:
    { isBuildStage?: boolean, environments: any[], selectedEnv: Environment, setSelectedEnv?: (_selectedEnv: Environment) => void | React.Dispatch<React.SetStateAction<Environment>> }) {

    const selectEnvironment = (selection: Environment) => {
        const _selectedEnv = environments.find((env) => env.id == selection.id)
        setSelectedEnv(_selectedEnv)
    }

    const envList = createClusterEnvGroup(environments, 'clusterName')

    const environmentListControl = (props): JSX.Element => {
        return (
            <components.Control {...props}>
                {!isBuildStage && <div className={'dc__environment-icon ml-10'}></div>}
                {props.children}
            </components.Control>
        )
    }

    const envOption = (props): JSX.Element => {
        return (
            <components.Option {...props}>
                <div>{props.data.name}</div>
                {props.data.name === "devtron-ci" && <span className="fs-12 cn-7 pt-2">{props.data.description}</span>}
            </components.Option>
        )
    }

    return (
        <div className={`${isBuildStage ? "sidebar-action-container sidebar-action-container-border" : "flex h-36 dc__align-items-center br-4 dc__border"}`}>
            {isBuildStage ? <span>Execute tasks in environment</span> : <div className="flex p-8 dc__align-start dc__border-right">Execute job in</div>}
            <div className={`${!isBuildStage ? "w-200 dc__align-items-center" : ""}`}>
                <ReactSelect
                    menuPlacement="auto"
                    closeMenuOnScroll={true}
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