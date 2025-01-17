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
import Select, { components } from 'react-select'
import { multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'
import { useParams, useHistory, useRouteMatch, generatePath, Route, useLocation } from 'react-router-dom'
import { Option } from '../../../v2/common/ReactSelect.utils'
import AppDetails from './AppDetails'

export default function Index() {
    return (
        <div>
            <AppDetails />
        </div>
    )
}

export const EnvSelector = ({ environments, disabled }) => {
    const { push } = useHistory()
    const { path } = useRouteMatch()
    const { appId, envId } = useParams<{ appId: string; envId?: string }>()

    function selectEnvironment(newEnvId) {
        const newUrl = generatePath(path, { appId, envId: newEnvId })
        push(newUrl)
    }

    const environmentsMap = Array.isArray(environments)
        ? environments.reduce((agg, curr) => {
              agg[curr.environmentId] = curr.environmentName
              return agg
          }, {})
        : {}
    const environmentName = environmentsMap[+envId]

    return (
        <>
            <div style={{ width: 'clamp( 100px, 30%, 200px )', height: '100%', position: 'relative' }}>
                <svg
                    viewBox="0 0 200 40"
                    preserveAspectRatio="none"
                    style={{ width: '100%', height: '100%', display: 'flex' }}
                >
                    <path d="M0 20 L200 20 Z" strokeWidth="1" stroke="var(--B500)" />
                    <path d="M0 10 L0, 30" strokeWidth="2" stroke="var(--B500)" />
                </svg>
                <div
                    className="bcb-5 br-10 cn-0 pl-8 pr-8"
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                    ENV
                </div>
            </div>
            <div className="w-200">
                <Select
                    options={
                        Array.isArray(environments)
                            ? environments.map((env) => ({ label: env.environmentName, value: env.environmentId }))
                            : []
                    }
                    placeholder="Select Environment"
                    value={envId ? { value: +envId, label: environmentName } : null}
                    onChange={(selected, meta) => selectEnvironment((selected as any).value)}
                    closeMenuOnSelect
                    components={{
                        IndicatorSeparator: null,
                        Option,
                        DropdownIndicator: disabled ? null : components.DropdownIndicator,
                    }}
                    styles={{
                        ...multiSelectStyles,
                        control: (base, state) => ({
                            ...base,
                            border: '1px solid var(--B500)',
                            backgroundColor: 'transparent',
                        }),
                        singleValue: (base, state) => ({ ...base, fontWeight: 600, color: 'var(--B500)' }),
                    }}
                    isDisabled={disabled}
                    isSearchable={false}
                />
            </div>
        </>
    )
}
