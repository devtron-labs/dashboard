import React from 'react'
import { createClusterEnvGroup } from '../common'
import ReactSelect from 'react-select'
import { Environment } from '../cdPipeline/cdPipeline.types'
import { groupStyle } from '../secrets/secret.utils'
import { GroupHeading } from '../v2/common/ReactSelect.utils'
import { DropdownIndicator } from '../cdPipeline/cdpipeline.util'

export function EnvironmentList({ isBuildStage, environments, selectedEnv, setSelectedEnv }:
    { isBuildStage: boolean, environments: any[], selectedEnv: Environment, setSelectedEnv?: (_selectedEnv: Environment) => void | React.Dispatch<React.SetStateAction<Environment>> }) {

    const selectEnvironment = (selection: Environment) => {
        const _selectedEnv = environments.find((env) => env.id == selection.id)
        setSelectedEnv(_selectedEnv)
    }


    const envList = createClusterEnvGroup(environments, 'clusterName')

    const groupHeading = (props) => {
        return <GroupHeading {...props} />
    }

    const buildStageStyles = {
        ...groupStyle(),
        container: (base) => ({ ...base, paddingRight: '20px' }),
        control: (base) => ({ ...base, border: '1px solid #d6dbdf', minHeight: '20px', height: '30px', marginTop: '4px' }),
        valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px' }),
        indicatorsContainer: (base) => ({ ...base, height: '28px' }),
    }

    const triggerStageStyles = {
        ...groupStyle(),
        container: (base) => ({ ...base }),
        control: (base) => ({ ...base, border: 'none', borderRadius: '0px', minHeight: '20px', height: '32px', width: '199px' }),
        valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px' }),
        indicatorsContainer: (base) => ({ ...base, height: '28px' }),
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
                    }}
                    styles={isBuildStage ? buildStageStyles : triggerStageStyles}
                />
            </div>
        </div>
    )
}