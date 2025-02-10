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

import { MouseEvent, useEffect, useMemo, useState } from 'react'
import { useRouteMatch, useLocation, NavLink, useHistory, generatePath } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { GroupBase, OptionsOrGroups } from 'react-select'

import {
    BASE_CONFIGURATION_ENV_ID,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    CollapsibleList,
    CollapsibleListConfig,
    ComponentSizeType,
    EnvResourceType,
    getSelectPickerOptionByValue,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
    URLS as CommonURLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICBack } from '@Icons/ic-caret-left-small.svg'
import { ReactComponent as ICArrowsLeftRight } from '@Icons/ic-arrows-left-right.svg'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as ICLocked } from '@Icons/ic-locked.svg'
import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import { URLS } from '@Config/routes'
import { ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'

import { BASE_CONFIGURATIONS } from '../AppConfig.constants'
import { EnvConfigRouteParams, EnvConfigurationsNavProps, EnvConfigObjectKey } from '../AppConfig.types'
import { getEnvConfiguration, getNavigationPath, resourceTypeBasedOnPath } from './Navigation.helper'

// LOADING SHIMMER
const ShimmerText = ({ width }: { width: string }) => (
    <div className={`p-8 h-32 w-${width}`}>
        <div className="shimmer-loading w-100 h-100" />
    </div>
)

export const EnvConfigurationsNav = ({
    showBaseConfigurations,
    showDeploymentTemplate,
    envConfig,
    fetchEnvConfig,
    environments: resourceList,
    goBackURL,
    paramToCheck = 'envId',
    showComparison,
    isCMSecretLocked,
    hideEnvSelector,
    compareWithURL,
    appOrEnvIdToResourceApprovalConfigurationMap,
}: EnvConfigurationsNavProps) => {
    // HOOKS
    const history = useHistory()
    const { pathname } = useLocation()
    const { path, params } = useRouteMatch<EnvConfigRouteParams>()
    const { envId } = params
    const parsedResourceId = +params[paramToCheck]

    // STATES
    const [expandedIds, setExpandedIds] =
        useState<Record<Extract<EnvResourceType, EnvResourceType.ConfigMap | EnvResourceType.Secret>, boolean>>()

    const [updatedEnvConfig, setUpdatedEnvConfig] = useState<ReturnType<typeof getEnvConfiguration>>({
        deploymentTemplate: null,
        configmaps: [],
        secrets: [],
    })

    // CONSTANTS
    const { isLoading, config } = envConfig
    /** Current Environment Data. */
    const resourceData =
        resourceList.find((resource) => resource.id === parsedResourceId) ||
        (showBaseConfigurations
            ? {
                  name: BASE_CONFIGURATIONS.name,
                  id: BASE_CONFIGURATIONS.id,
              }
            : null)
    const resourceType = resourceTypeBasedOnPath(pathname)
    const envConfigKey =
        resourceType === EnvResourceType.ConfigMap ? EnvConfigObjectKey.ConfigMap : EnvConfigObjectKey.Secret

    const isCreate = useMemo(
        () => !!pathname.match(/\bcreate\b/) && !updatedEnvConfig[envConfigKey].some(({ title }) => title === 'create'),
        [pathname, updatedEnvConfig, resourceType],
    )

    const addUnnamedNavLink = (_updatedEnvConfig: ReturnType<typeof getEnvConfiguration> = updatedEnvConfig) => {
        setExpandedIds({ ...expandedIds, [resourceType]: true })

        return {
            ..._updatedEnvConfig,
            [envConfigKey]: [
                ..._updatedEnvConfig[envConfigKey],
                {
                    title: 'Unnamed',
                    href: getNavigationPath(path, params, resourceType, 'create'),
                    configState: ResourceConfigState.Unnamed,
                    subtitle: '',
                },
            ],
        }
    }

    useEffect(() => {
        if (resourceData.id === BASE_CONFIGURATIONS.id && envId) {
            // Removing `/env-override/:envId` from pathname, resulting path will be base configuration path.
            const [basePath, resourcePath] = pathname.split(`/${URLS.APP_ENV_OVERRIDE_CONFIG}/${envId}`)
            history.push(`${basePath}${resourcePath}`)
        }
    }, [resourceData, envId])

    useEffect(() => {
        // Fetch the env configuration
        fetchEnvConfig(+(envId || BASE_CONFIGURATIONS.id))

        return () => {
            setExpandedIds(null)
        }
    }, [])

    useEffect(() => {
        if (!isLoading && config) {
            const newEnvConfig = getEnvConfiguration(
                config,
                path,
                params,
                // For base configurations, the resource id is undefined
                appOrEnvIdToResourceApprovalConfigurationMap?.[parsedResourceId || BASE_CONFIGURATION_ENV_ID]
                    ?.approvalConfigurationMap,
            )
            setUpdatedEnvConfig(isCreate ? addUnnamedNavLink(newEnvConfig) : newEnvConfig)
        }
    }, [isLoading, config, pathname, isCreate, appOrEnvIdToResourceApprovalConfigurationMap])

    useEffect(() => {
        if (!isLoading && config) {
            setExpandedIds({
                configmap: !!config.configmaps.length,
                secrets: !!config.secrets.length,
                ...(isCreate ? { [resourceType]: true } : {}),
            })
        }
    }, [isLoading, config])

    // METHODS
    /** Renders the Deployment Template Nav Icon based on `envConfig`. */
    const renderDeploymentTemplateNavIcon = () => {
        const { iconConfig } = updatedEnvConfig.deploymentTemplate

        return iconConfig ? (
            <Tippy {...iconConfig.tooltipProps}>
                <div className="flex">
                    <iconConfig.Icon
                        {...iconConfig.props}
                        className={`icon-dim-20 dc__no-shrink ${iconConfig.props.className}`}
                    />
                </div>
            </Tippy>
        ) : null
    }

    /** Handles collapse button click. */
    const onCollapseBtnClick = (id: string) => {
        if (isCMSecretLocked) {
            return
        }
        const updatedExpandedIds = { ...expandedIds }
        if (updatedExpandedIds[id]) {
            delete updatedExpandedIds[id]
        } else {
            updatedExpandedIds[id] = true
        }
        setExpandedIds(updatedExpandedIds)
    }

    /**
     * Handles the click event for a collapsible header icon, updating the environment configuration and navigation path.
     *
     * @param _resourceType - The type of resource
     */
    const onHeaderIconBtnClick = (_resourceType: EnvResourceType) => () => {
        if ((resourceType === _resourceType && isCreate) || isCMSecretLocked) {
            return
        }
        setExpandedIds({ ...expandedIds, [_resourceType]: true })
        history.push(getNavigationPath(path, params, _resourceType, 'create'))
    }

    /** Collapsible List Config. */
    const collapsibleListConfig: CollapsibleListConfig<'navLink'>[] = [
        {
            header: 'ConfigMaps',
            id: EnvResourceType.ConfigMap,
            headerIconConfig: {
                Icon: isCMSecretLocked ? ICLocked : ICAdd,
                props: {
                    className: 'fcn-6',
                },
                btnProps: {
                    onClick: onHeaderIconBtnClick(EnvResourceType.ConfigMap),
                },
                ...(!isCMSecretLocked
                    ? {
                          tooltipProps: {
                              content: 'Create ConfigMap',
                              arrow: false,
                              placement: 'right',
                          },
                      }
                    : {}),
            },
            items: updatedEnvConfig.configmaps,
            noItemsText: 'No configmaps',
            isExpanded: expandedIds?.configmap,
        },
        {
            header: 'Secrets',
            id: EnvResourceType.Secret,
            headerIconConfig: {
                Icon: isCMSecretLocked ? ICLocked : ICAdd,
                props: {
                    className: 'fcn-6',
                },
                btnProps: {
                    onClick: onHeaderIconBtnClick(EnvResourceType.Secret),
                },
                ...(!isCMSecretLocked
                    ? {
                          tooltipProps: {
                              content: 'Create Secret',
                              arrow: false,
                              placement: 'right',
                          },
                      }
                    : {}),
            },
            items: updatedEnvConfig.secrets,
            noItemsText: 'No secrets',
            isExpanded: expandedIds?.secrets,
        },
    ]

    // REACT SELECT PROPS
    const baseEnvOption = showBaseConfigurations
        ? [
              {
                  label: BASE_CONFIGURATIONS.name,
                  value: BASE_CONFIGURATIONS.id,
              },
          ]
        : []

    const envOptions: OptionsOrGroups<SelectPickerOptionType<number>, GroupBase<SelectPickerOptionType<number>>> = [
        ...baseEnvOption,
        {
            label: paramToCheck === 'envId' ? 'Environments' : 'Applications',
            options: resourceList.map(({ name, id }) => ({
                label: name,
                value: id,
            })),
        },
    ]

    const onEnvSelect = ({ value }: SelectPickerOptionType<number>) => {
        // Exit early if the selected environment is the current one
        if (resourceData.id === value) {
            return
        }

        // Extract the resource name from the current pathname based on resourceType
        const resourceName = pathname.split(`${resourceType}/`)[1]

        // Truncate the path to the base application configuration path
        const truncatedPath = `${path.split(CommonURLS.APP_CONFIG)[0]}${CommonURLS.APP_CONFIG}`

        // Build the new app path, conditionally adding the environment override config when switching to environment
        const appPath = `${truncatedPath}${
            value !== BASE_CONFIGURATIONS.id ? `/${URLS.APP_ENV_OVERRIDE_CONFIG}/:envId(\\d+)?` : ''
        }/:resourceType(${Object.values(EnvResourceType).join('|')})` // Dynamically set valid resource types

        // Generate the final path
        // if application/job (paramToCheck = envId), use `appPath`
        // otherwise applicationGroups (paramToCheck = 'appId'), use `path`
        const generatedPath = `${generatePath(paramToCheck === 'envId' ? appPath : path, {
            ...params,
            [paramToCheck]: value,
        })}${resourceName ? `/${resourceName}` : ''}`

        // Navigate to the generated path
        history.push(generatedPath)
    }

    const handleDeploymentTemplateNavLinkOnClick = (e: MouseEvent<HTMLAnchorElement>) => {
        if (pathname === updatedEnvConfig.deploymentTemplate.href) {
            e.preventDefault()
        }
    }

    const renderEnvSelector = () => (
        <div className="flexbox dc__align-center dc__gap-8 p-12 dc__border-bottom-n1">
            <NavLink to={goBackURL}>
                <div className="dc__border br-4 flex p-1 dc__hover-n50">
                    <ICBack className="icon-dim-16" />
                </div>
            </NavLink>
            <div className="flex-grow-1 text-left">
                <SelectPicker<number, false>
                    inputId="env-config-selector"
                    classNamePrefix="env-config-selector"
                    variant={SelectPickerVariantType.BORDER_LESS}
                    isClearable={false}
                    value={getSelectPickerOptionByValue(envOptions, parsedResourceId, baseEnvOption[0])}
                    options={envOptions}
                    onChange={onEnvSelect}
                    placeholder="Select Environment"
                    showSelectedOptionIcon={false}
                />
            </div>
        </div>
    )

    const renderCompareWithBtn = () => {
        const { name: compareTo } = resourceData

        // Extract the resource name from the current pathname based on resourceType
        const resourceName = pathname.split(`/${resourceType}/`)[1]

        // Construct the compare view path with dynamic route parameters for comparison
        const compareViewPath = `${compareWithURL}/${URLS.APP_ENV_CONFIG_COMPARE}/:compareTo?/:resourceType(${Object.values(EnvResourceType).join('|')})/:resourceName?`

        const compareWithHref = generatePath(compareViewPath, {
            ...params,
            // Only set compareTo if it's not the base configuration
            compareTo: compareTo !== BASE_CONFIGURATIONS.name ? compareTo : null,
            resourceType,
            resourceName: resourceName ?? null,
        })

        return (
            <div className="p-8">
                <Button
                    dataTestId="compare-with-button"
                    component={ButtonComponentType.link}
                    variant={ButtonVariantType.secondary}
                    size={ComponentSizeType.medium}
                    style={ButtonStyleType.neutral}
                    startIcon={<ICArrowsLeftRight />}
                    linkProps={{ to: compareWithHref }}
                    text="Compare with..."
                />
            </div>
        )
    }

    return (
        <nav className="flexbox-col h-100 dc__overflow-hidden">
            {!hideEnvSelector && renderEnvSelector()}
            {showComparison && renderCompareWithBtn()}
            <div className="mw-none p-8 flex-grow-1 dc__overflow-auto">
                {isLoading || !resourceData ? (
                    ['90', '70', '50'].map((item) => <ShimmerText key={item} width={item} />)
                ) : (
                    <>
                        {showDeploymentTemplate && updatedEnvConfig.deploymentTemplate && (
                            <NavLink
                                data-testid="env-deployment-template"
                                className="dc__nav-item cursor dc__gap-8 fs-13 lh-32 cn-7 w-100 br-4 px-8 flexbox dc__align-items-center dc__no-decor"
                                to={{ pathname: updatedEnvConfig.deploymentTemplate.href, search: '' }}
                                onClick={handleDeploymentTemplateNavLinkOnClick}
                            >
                                <ICFileCode className="icon-dim-16 dc__nav-item__start-icon" />
                                <span className="dc__truncate flex-grow-1">
                                    {updatedEnvConfig.deploymentTemplate.title}
                                </span>
                                {renderDeploymentTemplateNavIcon()}
                            </NavLink>
                        )}
                        <CollapsibleList
                            config={collapsibleListConfig}
                            tabType="navLink"
                            onCollapseBtnClick={onCollapseBtnClick}
                        />
                    </>
                )}
            </div>
        </nav>
    )
}
