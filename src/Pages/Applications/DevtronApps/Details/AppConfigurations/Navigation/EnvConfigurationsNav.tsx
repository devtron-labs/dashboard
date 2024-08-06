import { useEffect, useState } from 'react'
import { useRouteMatch, useLocation, NavLink, useHistory } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import ReactSelect from 'react-select'

import { ReactComponent as ICBack } from '@Icons/ic-caret-left-small.svg'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as ProtectedIcon } from '@Icons/ic-shield-protect-fill.svg'
import { CollapsibleList, CollapsibleListConfig } from '@Pages/Shared/CollapsibleList'
import { ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'

import { BASE_CONFIGURATIONS } from '../AppConfig.constants'
import {
    EnvConfigRouteParams,
    EnvConfigurationsNavProps,
    EnvResourceType,
    EnvConfigObjectKey,
} from '../AppConfig.types'
import { getEnvConfiguration, getNavigationPath, resourceTypeBasedOnPath } from './Navigation.helper'
import { EnvSelectDropdownIndicator, envSelectStyles, EnvSelectOption } from './EnvSelect.utils'

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
    isBaseConfigProtected,
    environments,
    goBackURL,
    paramToCheck = 'envId',
}: EnvConfigurationsNavProps) => {
    // HOOKS
    const history = useHistory()
    const { pathname } = useLocation()
    const { path, params } = useRouteMatch<EnvConfigRouteParams>()
    const { envId } = params

    // STATES
    const [expandedIds, setExpandedIds] =
        useState<Record<Exclude<EnvResourceType, EnvResourceType.DeploymentTemplate>, boolean>>()
    const [updatedEnvConfig, setUpdatedEnvConfig] = useState<ReturnType<typeof getEnvConfiguration>>({
        deploymentTemplate: null,
        configmaps: [],
        secrets: [],
    })

    // CONSTANTS
    const { isLoading, config } = envConfig
    /** Current Environment Data. */
    const environmentData =
        environments.find((environment) => environment.id === +params[paramToCheck]) ||
        (showBaseConfigurations
            ? {
                  name: BASE_CONFIGURATIONS.name,
                  id: BASE_CONFIGURATIONS.id,
                  isProtected: isBaseConfigProtected,
              }
            : null)
    const resourceType = resourceTypeBasedOnPath(pathname)
    const isCreate = pathname.includes('/create')

    const addUnnamedNavLink = (_updatedEnvConfig: ReturnType<typeof getEnvConfiguration> = updatedEnvConfig) => {
        const envConfigKey =
            resourceType === EnvResourceType.ConfigMap ? EnvConfigObjectKey.ConfigMap : EnvConfigObjectKey.Secret

        return {
            ..._updatedEnvConfig,
            [envConfigKey]: [
                ..._updatedEnvConfig[envConfigKey],
                {
                    title: 'Unnamed',
                    href: getNavigationPath(path, params, environmentData.id, resourceType, 'create', paramToCheck),
                    configState: ResourceConfigState.Unnamed,
                    subtitle: '',
                },
            ],
        }
    }

    useEffect(() => {
        // Fetch the env configuration
        fetchEnvConfig(+(envId || BASE_CONFIGURATIONS.id))

        return () => {
            setExpandedIds(null)
        }
    }, [])

    useEffect(() => {
        if (!isLoading && config) {
            const newEnvConfig = getEnvConfiguration(config, path, params, environmentData, paramToCheck)

            setExpandedIds({
                configmap: !!config.configmaps.length,
                secrets: !!config.secrets.length,
                ...(isCreate ? { [resourceType]: true } : {}),
            })
            setUpdatedEnvConfig(isCreate ? addUnnamedNavLink(newEnvConfig) : newEnvConfig)
        }
    }, [isLoading, config, pathname])

    // METHODS
    /** Renders the Deployment Template Nav Icon based on `envConfig`. */
    const renderDeploymentTemplateNavIcon = () => {
        const { iconConfig } = updatedEnvConfig.deploymentTemplate

        return iconConfig ? (
            <Tippy {...iconConfig.tooltipProps}>
                <div className="flex">
                    <iconConfig.Icon
                        {...iconConfig.props}
                        className={`icon-dim-16 dc__no-shrink ${iconConfig.props.className}`}
                    />
                </div>
            </Tippy>
        ) : null
    }

    /** Handles collapse button click. */
    const onCollapseBtnClick = (id: string) => {
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
        if (pathname.includes(`${_resourceType}/create`)) {
            return
        }
        setExpandedIds({ ...expandedIds, [_resourceType]: true })
        history.push(getNavigationPath(path, params, environmentData.id, _resourceType, 'create', paramToCheck))
    }

    /** Collapsible List Config. */
    const collapsibleListConfig: CollapsibleListConfig[] = [
        {
            header: 'Config Maps',
            id: EnvResourceType.ConfigMap,
            headerIconConfig: {
                Icon: ICAdd,
                props: {
                    className: 'fcn-6',
                },
                btnProps: {
                    onClick: onHeaderIconBtnClick(EnvResourceType.ConfigMap),
                },
                tooltipProps: {
                    content: 'Add ConfigMap',
                    arrow: false,
                    placement: 'bottom',
                },
            },
            items: updatedEnvConfig.configmaps,
            noItemsText: 'No configmaps',
            isExpanded: expandedIds?.configmap,
        },
        {
            header: 'Secrets',
            id: EnvResourceType.Secret,
            headerIconConfig: {
                Icon: ICAdd,
                props: {
                    className: 'fcn-6',
                },
                btnProps: {
                    onClick: onHeaderIconBtnClick(EnvResourceType.Secret),
                },
                tooltipProps: {
                    content: 'Add Secret',
                    arrow: false,
                    placement: 'bottom',
                },
            },
            items: updatedEnvConfig.secrets,
            noItemsText: 'No secrets',
            isExpanded: expandedIds?.secrets,
        },
    ]

    // REACT SELECT PROPS
    const envOptions = [
        ...(showBaseConfigurations
            ? [
                  {
                      name: BASE_CONFIGURATIONS.name,
                      id: BASE_CONFIGURATIONS.id,
                      isProtected: isBaseConfigProtected,
                  },
              ]
            : []),
        ...environments,
    ]

    const onEnvSelect = ({ id }: typeof environmentData) => {
        if (environmentData.id === id) {
            return
        }

        const name = pathname.split(`${resourceType}/`)[1]
        history.push(getNavigationPath(path, params, id, resourceType, name, paramToCheck))
    }

    const renderEnvSelector = () => {
        return (
            <div className="flexbox dc__align-center dc__gap-8 p-12 dc__border-bottom-n1">
                <NavLink to={goBackURL}>
                    <div className="dc__border br-4 flex p-1 dc__hover-n50">
                        <ICBack className="icon-dim-16" />
                    </div>
                </NavLink>
                <ReactSelect<typeof environmentData>
                    classNamePrefix="env-config-selector"
                    isClearable={false}
                    value={environmentData}
                    options={envOptions}
                    getOptionLabel={(option) => `${option.name}`}
                    getOptionValue={(option) => `${option.id}`}
                    styles={envSelectStyles}
                    components={{
                        IndicatorSeparator: null,
                        Option: EnvSelectOption,
                        DropdownIndicator: EnvSelectDropdownIndicator,
                    }}
                    onChange={onEnvSelect}
                    placeholder="Select Environment"
                />
                {environmentData?.isProtected && <ProtectedIcon className="icon-dim-20 fcv-5 dc__no-shrink" />}
            </div>
        )
    }

    return (
        <>
            {renderEnvSelector()}
            <div className="mw-none p-8">
                {isLoading || !environmentData ? (
                    ['90', '70', '50'].map((item) => <ShimmerText key={item} width={item} />)
                ) : (
                    <>
                        {showDeploymentTemplate && updatedEnvConfig.deploymentTemplate && (
                            <NavLink
                                data-testid="env-deployment-template"
                                className="dc__nav-item cursor dc__gap-8 fs-13 lh-32 cn-7 w-100 br-4 px-8 flexbox dc__align-items-center dc__content-space dc__no-decor"
                                to={updatedEnvConfig.deploymentTemplate.href}
                            >
                                <span className="dc__truncate">{updatedEnvConfig.deploymentTemplate.title}</span>
                                {renderDeploymentTemplateNavIcon()}
                            </NavLink>
                        )}
                        <CollapsibleList config={collapsibleListConfig} onCollapseBtnClick={onCollapseBtnClick} />
                    </>
                )}
            </div>
        </>
    )
}
