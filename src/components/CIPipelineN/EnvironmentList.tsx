import React from 'react'
import { createClusterEnvGroup, importComponentFromFELibrary, sortObjectArrayAlphabetically } from '../common'
import ReactSelect from 'react-select'
import { Environment } from '../cdPipeline/cdPipeline.types'
import { groupStyle } from '../secrets/secret.utils'
import { GroupHeading } from '../v2/common/ReactSelect.utils'
import { DropdownIndicator } from '../cdPipeline/cdpipeline.util'
const VirtualEnvSelectionInfoText = importComponentFromFELibrary('VirtualEnvSelectionInfoText')


export function EnvironmentList({ environments, selectedEnv, setSelectedEnv }:
    { environments: any[], selectedEnv: Environment, setSelectedEnv?: (_selectedEnv: Environment) => void | React.Dispatch<React.SetStateAction<Environment>> }) {

    const selectEnvironment = (selection: Environment) => {
        const _selectedEnv = environments.find((env) => env.id == selection.id)
        setSelectedEnv(_selectedEnv)
    }


    const envList = createClusterEnvGroup(environments, 'clusterName')

    const groupHeading = (props) => {
        return <GroupHeading {...props} />
    }

    return (
        <div className="sidebar-action-container sidebar-action-container-border">
            <span>Execute tasks in environment</span>
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
                onChange={(selected: any) => selectEnvironment(selected)}
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    GroupHeading: groupHeading,
                }}
                styles={{
                    ...groupStyle(),
                    container: (base) => ({ ...base, paddingRight: '20px' }),
                    control: (base) => ({ ...base, border: '1px solid #d6dbdf', minHeight: '20px', height: '30px', marginTop: '4px' }),
                    valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px' }),
                    indicatorsContainer: (base) => ({ ...base, height: '28px' }),
                }}
            />
        </div>
    )
}