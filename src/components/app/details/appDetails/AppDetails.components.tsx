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

import { generatePath, useNavigate, useParams } from 'react-router-dom'
import { GroupBase } from 'react-select'

import {
    AppEnvironment,
    BaseURLParams,
    EnvAppsMetaDTO,
    ROUTER_URLS,
    SelectPicker,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'

import { AppEnvDropdownProps, AppEnvSelectorProps } from './appDetails.type'
import { getEnvOptions } from './utils'

const AppEnvDropdown = ({ isAppView = false, options, value }: AppEnvDropdownProps) => {
    const navigate = useNavigate()
    const { appId, envId } = useParams<Pick<BaseURLParams, 'appId' | 'envId'>>()

    const path = isAppView
        ? ROUTER_URLS.DEVTRON_APP_DETAILS.ENV_DETAILS
        : ROUTER_URLS.APP_GROUP_DETAILS.APP_DETAILS

    const handleOnChange = (option: SelectPickerOptionType) => {
        const newUrl = generatePath(path, {
            appId: isAppView ? appId : String(option.value),
            envId: isAppView ? String(option.value) : envId,
        })
        navigate(newUrl)
    }

    return (
        <>
            <div style={{ width: 'clamp( 100px, 30%, 100px )', height: '100%', position: 'relative' }}>
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
                    {isAppView ? 'ENV' : 'APP'}
                </div>
            </div>
            <div data-testid="app-deployed-env-name" className="app-details__selector w-200 dc__zi-12">
                <SelectPicker
                    inputId="app-environment-select"
                    placeholder={`Select ${isAppView ? 'Environment' : 'Application'}`}
                    options={options}
                    value={value}
                    onChange={handleOnChange}
                    closeMenuOnSelect
                    isSearchable
                    classNamePrefix="app-environment-select"
                />
            </div>
        </>
    )
}

const AppSelector = ({ applications }: { applications: EnvAppsMetaDTO['apps'] }) => {
    const { appId } = useParams<Pick<BaseURLParams, 'appId'>>()

    const appIdVsNameMap = (applications ?? []).reduce((agg, curr) => {
        // eslint-disable-next-line no-param-reassign
        agg[curr.appId] = curr.appName
        return agg
    }, {})

    const appOptions = (applications ?? []).map((app) => ({
        label: app.appName,
        value: app.appId,
    }))

    return (
        <AppEnvDropdown options={appOptions} value={appId ? { label: appIdVsNameMap[+appId], value: +appId } : null} />
    )
}

const EnvSelector = ({ environments }: { environments: AppEnvironment[] }) => {
    const { envId } = useParams<Pick<BaseURLParams, 'envId'>>()

    const envIdVsNameMap = (environments ?? []).reduce((agg, curr) => {
        // eslint-disable-next-line no-param-reassign
        agg[curr.environmentId] = curr.environmentName
        return agg
    }, {})

    const isolatedEnvOptions = (environments ?? []).filter((env) => env.isVirtualEnvironment).map(getEnvOptions)

    const envOptions: Array<GroupBase<SelectPickerOptionType<number>> | SelectPickerOptionType<number>> = [
        ...(environments ?? []).filter((env) => !env.isVirtualEnvironment).map(getEnvOptions),
        ...(isolatedEnvOptions.length
            ? [
                  {
                      label: 'Isolated Environments',
                      options: isolatedEnvOptions,
                  },
              ]
            : []),
    ]

    return (
        <AppEnvDropdown
            isAppView
            options={envOptions}
            value={envId ? { label: envIdVsNameMap[+envId], value: +envId } : null}
        />
    )
}

const AppEnvSelector = ({ isAppView, environments, applications }: AppEnvSelectorProps) =>
    isAppView ? <EnvSelector environments={environments} /> : <AppSelector applications={applications} />

export default AppEnvSelector
