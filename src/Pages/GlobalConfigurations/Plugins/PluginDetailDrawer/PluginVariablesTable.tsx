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

import { Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { PluginVariableKind, PluginVariablesTableProps } from '../types'

const PluginVariablesTable = ({ variables, variableKind }: PluginVariablesTableProps) => {
    const isInput = variableKind === PluginVariableKind.INPUT

    if (!variables.length) {
        return <span className="cn-7 fs-13 lh-20">No {isInput ? 'input' : 'output'} variables</span>
    }

    const renderValue = (variable: PluginVariablesTableProps['variables'][number]) => {
        if (!isInput) {
            return <span className="cn-9 fs-13 lh-20 dc__truncate">{variable.description || '-'}</span>
        }

        const value = variable.referenceVariableName || variable.value || variable.defaultValue

        return (
            <div className="plugin-detail__variable-value flexbox dc__align-items-center dc__gap-6 br-4 dc__border bg__secondary mw-none">
                {variable.referenceVariableName && <span className="fs-10 fw-6 lh-16 cn-7 dc__no-shrink">VAR</span>}
                <span className={`fs-13 lh-20 dc__truncate ${value ? 'cn-9' : 'cn-5'}`}>
                    {value || 'No default value'}
                </span>
            </div>
        )
    }

    return (
        <div className="plugin-detail__variables-table dc__grid dc__column-gap-16 dc__row-gap-8 dc__align-items-center">
            <span className="cn-7 fs-12 fw-6 lh-20 dc__uppercase">Variable</span>
            <span className="cn-7 fs-12 fw-6 lh-20 dc__uppercase">Format</span>
            <span className="cn-7 fs-12 fw-6 lh-20 dc__uppercase">{isInput ? 'Value' : 'Description'}</span>

            {(variables ?? []).map((variable) => (
                <div key={variable.id ?? variable.name} className="dc__contents">
                    <Tooltip content={variable.description} alwaysShowTippyOnHover={!!variable.description}>
                        <span
                            className={`cn-9 fs-13 lh-20 font-ibm-plex-mono dc__truncate ${isInput && variable.description ? 'dc__underline-dotted' : ''}`}
                        >
                            {variable.name}
                            {isInput && !variable.allowEmptyValue && <span className="cr-5">*</span>}
                        </span>
                    </Tooltip>
                    <span className="cn-9 fs-13 lh-20 font-ibm-plex-mono">{variable.format?.toLowerCase()}</span>
                    {renderValue(variable)}
                </div>
            ))}
        </div>
    )
}

export default PluginVariablesTable
