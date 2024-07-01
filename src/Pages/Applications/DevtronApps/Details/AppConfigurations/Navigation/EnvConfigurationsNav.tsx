/*
 *   Copyright (c) 2024 Devtron Inc.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, { useEffect, useState } from 'react'
import { useRouteMatch, useLocation, NavLink, generatePath, useHistory } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import ReactSelect, { DropdownIndicatorProps, GroupBase, OptionProps, components } from 'react-select'

import { commonSelectStyles, getCommonSelectStyle } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ArrowDown } from '../../../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as ICBack } from '../../../../../../assets/icons/ic-caret-left-small.svg'
import { ReactComponent as ICAdd } from '../../../../../../assets/icons/ic-add.svg'
import { ReactComponent as ICStamp } from '../../../../../../assets/icons/ic-stamp.svg'
import { ReactComponent as ICEditFile } from '../../../../../../assets/icons/ic-edit-file.svg'
import { ReactComponent as ProtectedIcon } from '../../../../../../assets/icons/ic-shield-protect-fill.svg'
import { URLS } from '../../../../../../config'
import { CollapsibleList, CollapsibleListConfig } from '../../../../../Shared'
import { AppEnvironment } from '../../../../../../services/service.types'
import { ResourceConfigState } from '../../../service.types'
import { useAppConfigurationContext } from '../AppConfiguration.context'

export const Option = (props: OptionProps<AppEnvironment, false, GroupBase<AppEnvironment>>) => {
    const { data, label } = props

    return (
        <components.Option {...props}>
            <div className="flexbox dc__align-items-center dc__gap-8">
                <span className="flex-grow-1 dc__align-left">{label}</span>
                {data.isProtected && <ProtectedIcon className="icon-dim-20 fcv-5 dc__no-shrink" />}
            </div>
        </components.Option>
    )
}

export const DropdownIndicator = (props: DropdownIndicatorProps<AppEnvironment, false, GroupBase<AppEnvironment>>) => {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className="icon-dim-16" data-testid="env-configuration-dropdown" />
        </components.DropdownIndicator>
    )
}

const envSelectStyles = getCommonSelectStyle({
    container: (base, state) => ({ ...commonSelectStyles.container(base, state), flexGrow: 1 }),
    menu: (base) => ({ ...base, minWidth: '238px', left: '-32px' }),
    control: (base, state) => ({
        ...commonSelectStyles.control(base, state),
        border: 'none',
        flexGrow: 1,
        backgroundColor: 'transparent',
        minHeight: '0',
        justifyContent: 'flex-start',
    }),
    valueContainer: (base) => ({
        ...commonSelectStyles.valueContainer(base),
        padding: '0',
        flex: 'initial',
        fontSize: '13px',
        fontWeight: 600,
    }),
    singleValue: (base) => ({ ...base, margin: '0' }),
    input: (base) => ({ ...base, margin: '0', padding: '0' }),
    dropdownIndicator: (base, state) => ({
        ...commonSelectStyles.dropdownIndicator(base, state),
        padding: '0',
    }),
    option: (base, state) => ({
        ...commonSelectStyles.option(base, state),
        padding: '6px 8px',
        ...(state.isFocused ? { backgroundColor: 'var(--N50)' } : {}),
        ...(state.isSelected
            ? {
                  color: 'var(--B500)',
                  backgroundColor: 'var(--B100)',
              }
            : {}),
    }),
})

const ShimmerText = ({ width }: { width: string }) => (
    <div className={`p-8 h-32 w-${width}`}>
        <div className="shimmer-loading w-100 h-100" />
    </div>
)

export const EnvConfigurationsNav = () => {
    // HOOKS
    const history = useHistory()
    const { pathname } = useLocation()
    const {
        path,
        params: { envId },
    } = useRouteMatch<{ envId: string }>()
    const { appId, envConfig, fetchEnvConfig, isBaseConfigProtected, environments, lastUnlockedStage } =
        useAppConfigurationContext()

    // STATES
    const [expandedIds, setExpandedIds] = useState([])
    const [updatedEnvConfig, setUpdatedEnvConfig] = useState(envConfig)

    // CONSTANTS
    /** Current Environment Data. */
    const environmentData = environments?.find(({ environmentId }) => environmentId === +envId) || {
        environmentName: 'Base Configurations',
        environmentId: -1,
        isProtected: isBaseConfigProtected,
    }

    useEffect(() => {
        // Expands the collapsible list based on path
        if (pathname.includes('/configmap')) {
            setExpandedIds(['configmap'])
        }

        if (pathname.includes('/secrets')) {
            setExpandedIds(['secrets'])
        }

        // Fetch the env configuration
        fetchEnvConfig(+(envId || -1))

        return () => {
            setExpandedIds([])
        }
    }, [envId])

    useEffect(() => {
        setUpdatedEnvConfig(envConfig)
    }, [envConfig])

    // METHODS
    /**
     * Generates a URL path based on the provided resource type, configuration state, href, and environment ID.
     *
     * @param resourceType - The type of resource.
     * @param [configState] - The state of the resource configuration.
     * @param [href] - An optional href to include in the path.
     * @param [_envId=envId] - The environment ID, defaults to global envId if not provided.
     * @returns - The generated URL path.
     */
    const getPath = (resourceType: string, configState?: ResourceConfigState, href?: string, _envId = envId) => {
        const createPath = configState === ResourceConfigState.Unnamed ? '/create' : ''
        const additionalPath = href ? `/${href}` : ''
        const resourcePath = _envId ? `/${resourceType}` : ''
        const url = `${resourcePath}${createPath || additionalPath}`

        return `${generatePath(path, {
            appId,
            resourceType: _envId ? URLS.APP_ENV_OVERRIDE_CONFIG : resourceType,
            envId: _envId || undefined,
        })}${url}`
    }

    /**
     * Returns an object containing the appropriate icon, icon properties and tooltip properties based on the resource configuration state.
     *
     * @param configState - The state of the resource configuration.
     * @returns An object containing the icon, iconProps and iconTooltipProps if conditions are met, otherwise an empty object.
     */
    const getIcon = (configState: ResourceConfigState) => {
        if (
            environmentData.isProtected &&
            configState !== ResourceConfigState.Published &&
            configState !== ResourceConfigState.Unnamed
        ) {
            return {
                icon: configState === ResourceConfigState.ApprovalPending ? ICStamp : ICEditFile,
                iconTooltipProps: {
                    content: configState === ResourceConfigState.ApprovalPending ? 'Approval pending' : 'Draft',
                    placement: 'right' as const,
                    arrow: false,
                },
                iconProps: {
                    className: configState === ResourceConfigState.Draft ? 'scn-7' : '',
                },
            }
        }

        return {}
    }

    /** Renders the Deployment Template Nav Icon based on `envConfig`. */
    const renderDeploymentTemplateNavIcon = () => {
        const {
            icon: DeploymentTemplateIcon,
            iconTooltipProps,
            iconProps,
        } = getIcon(envConfig.deploymentTemplate.configState)

        return DeploymentTemplateIcon ? (
            <Tippy {...iconTooltipProps}>
                <div className="flex">
                    <DeploymentTemplateIcon {...iconProps} className={`icon-dim-16 ${iconProps.className}`} />
                </div>
            </Tippy>
        ) : null
    }

    /**
     * Handles the click event for a collapsible header icon, updating the environment configuration and navigation path.
     *
     * @param resourceType - The type of resource, either 'configmap' or 'secrets'.
     */
    const collapsibleHeaderIconClick = (resourceType: 'configmap' | 'secrets') => () => {
        if (pathname.includes(`/create`)) {
            return
        }

        setExpandedIds([resourceType])
        history.push(getPath(resourceType, ResourceConfigState.Unnamed))

        const newEnvConfig = updatedEnvConfig
        newEnvConfig[resourceType === 'configmap' ? 'configMaps' : 'secrets'].push({
            title: 'Unnamed',
            configState: ResourceConfigState.Unnamed,
        })
        setUpdatedEnvConfig(newEnvConfig)
    }

    /** Collapsible List Config. */
    const collapsibleListConfig: CollapsibleListConfig[] = [
        {
            header: 'Config Maps',
            id: 'configmap',
            headerIcon: ICAdd,
            headerIconProps: {
                className: 'fcn-6',
                onClick: collapsibleHeaderIconClick('configmap'),
            },
            items: updatedEnvConfig.configMaps.map(({ title, configState }) => ({
                title,
                subtitle: 'Created at environment',
                href: getPath('configmap', configState, title),
                ...getIcon(configState),
            })),
        },
        {
            header: 'Secrets',
            id: 'secrets',
            headerIcon: ICAdd,
            headerIconProps: {
                className: 'fcn-6',
                onClick: collapsibleHeaderIconClick('secrets'),
            },
            items: updatedEnvConfig.secrets.map(({ title, configState }) => ({
                title,
                subtitle: 'Created at environment',
                href: getPath('secrets', configState, title),
                ...getIcon(configState),
            })),
        },
    ]

    // REACT SELECT PROPS
    const envOptions = [
        {
            environmentName: 'Base Configurations',
            environmentId: -1,
            isProtected: isBaseConfigProtected,
        },
        ...environments,
    ]

    const onEnvSelect = ({ environmentId }) => {
        history.push(
            getPath('deployment-template', undefined, undefined, environmentId !== -1 ? environmentId.toString() : ''),
        )
    }

    const renderEnvSelector = () => {
        return (
            <div className="flexbox dc__align-center dc__gap-8 p-12 dc__border-bottom en-1">
                <NavLink to={lastUnlockedStage}>
                    <div className="dc__border br-4 flex p-1">
                        <ICBack className="icon-dim-16" />
                    </div>
                </NavLink>
                <ReactSelect
                    classNamePrefix="env-config-selector"
                    isSearchable={false}
                    isClearable={false}
                    value={environmentData}
                    options={envOptions}
                    getOptionLabel={(option) => `${option.environmentName}`}
                    getOptionValue={(option) => `${option.environmentId}`}
                    styles={envSelectStyles}
                    components={{
                        IndicatorSeparator: null,
                        Option,
                        DropdownIndicator,
                    }}
                    onChange={onEnvSelect}
                    placeholder="Select Environment"
                />
                {environmentData.isProtected && <ProtectedIcon className="icon-dim-20 fcv-5 dc__no-shrink" />}
            </div>
        )
    }

    return (
        <>
            {renderEnvSelector()}
            <div className="mw-none p-8">
                {!environments.length || envConfig.isLoading ? (
                    ['90', '70', '50'].map((item) => <ShimmerText key={item} width={item} />)
                ) : (
                    <>
                        <NavLink
                            data-testid="env-deployment-template"
                            className="app-compose__nav-item cursor dc__gap-8"
                            to={getPath('deployment-template')}
                        >
                            <span className="dc__ellipsis-right">Deployment template</span>
                            {renderDeploymentTemplateNavIcon()}
                        </NavLink>
                        <CollapsibleList expandedIds={expandedIds} config={collapsibleListConfig} />
                    </>
                )}
            </div>
        </>
    )
}
