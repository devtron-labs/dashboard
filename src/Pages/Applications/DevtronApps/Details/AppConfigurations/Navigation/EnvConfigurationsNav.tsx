import { MouseEvent, useEffect, useState } from 'react'
import { useRouteMatch, useLocation, NavLink, useHistory } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { GroupBase, OptionsOrGroups } from 'react-select'

import {
    CollapsibleList,
    CollapsibleListConfig,
    EnvResourceType,
    getSelectPickerOptionByValue,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerVariantType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICBack } from '@Icons/ic-caret-left-small.svg'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as ICLocked } from '@Icons/ic-locked.svg'
import { ReactComponent as ICFileCode } from '@Icons/ic-file-code.svg'
import { URLS } from '@Config/routes'
import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ProtectedIcon } from '@Icons/ic-shield-protect-fill.svg'
import { ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'

import { BASE_CONFIGURATIONS } from '../AppConfig.constants'
import { EnvConfigRouteParams, EnvConfigurationsNavProps, EnvConfigObjectKey } from '../AppConfig.types'
import { getEnvConfiguration, getNavigationPath, resourceTypeBasedOnPath } from './Navigation.helper'

const CompareWithButton = importComponentFromFELibrary('CompareWithButton', null, 'function')

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
    showComparison,
    isCMSecretLocked,
}: EnvConfigurationsNavProps) => {
    // HOOKS
    const history = useHistory()
    const { pathname } = useLocation()
    const { path, params } = useRouteMatch<EnvConfigRouteParams>()
    const { envId, appId } = params

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

        setExpandedIds({ ...expandedIds, [resourceType]: true })

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
        if (environmentData.id === BASE_CONFIGURATIONS.id && envId) {
            // Removing `/env-override/:envId` from pathname, resulting path will be base configuration path.
            const [basePath, resourcePath] = pathname.split(`/${URLS.APP_ENV_OVERRIDE_CONFIG}/${envId}`)
            history.push(`${basePath}${resourcePath}`)
        }
    }, [environmentData, envId])

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
            setUpdatedEnvConfig(isCreate ? addUnnamedNavLink(newEnvConfig) : newEnvConfig)
        }
    }, [isLoading, config, pathname])

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
        if (pathname.includes(`${_resourceType}/create`) || isCMSecretLocked) {
            return
        }
        setExpandedIds({ ...expandedIds, [_resourceType]: true })
        history.push(getNavigationPath(path, params, environmentData.id, _resourceType, 'create', paramToCheck))
    }

    /** Collapsible List Config. */
    const collapsibleListConfig: CollapsibleListConfig[] = [
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
                  endIcon: isBaseConfigProtected ? <ProtectedIcon className="icon-dim-20 fcv-5 dc__no-shrink" /> : null,
              },
          ]
        : []

    const envOptions: OptionsOrGroups<SelectPickerOptionType<number>, GroupBase<SelectPickerOptionType<number>>> = [
        ...baseEnvOption,
        {
            label: paramToCheck === 'envId' ? 'Environments' : 'Applications',
            options: environments.map(({ name, id, isProtected }) => ({
                label: name,
                value: id,
                endIcon: isProtected ? <ProtectedIcon className="icon-dim-20 fcv-5 dc__no-shrink" /> : null,
            })),
        },
    ]

    const onEnvSelect = ({ value }: SelectPickerOptionType<number>) => {
        if (environmentData.id === value) {
            return
        }

        const name = pathname.split(`${resourceType}/`)[1]
        history.push(getNavigationPath(path, params, value, resourceType, name, paramToCheck))
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
                    value={getSelectPickerOptionByValue(envOptions, +params[paramToCheck], baseEnvOption[0])}
                    options={envOptions}
                    onChange={onEnvSelect}
                    placeholder="Select Environment"
                    showSelectedOptionIcon={false}
                />
            </div>
            {environmentData?.isProtected && <ProtectedIcon className="icon-dim-20 fcv-5 dc__no-shrink" />}
        </div>
    )

    const renderCompareWithBtn = () => {
        const { name: compareTo } = environmentData

        // Determine base path based on pathname
        const isOverrideConfig = pathname.includes(URLS.APP_ENV_OVERRIDE_CONFIG)
        const basePath = isOverrideConfig
            ? pathname.split(URLS.APP_ENV_OVERRIDE_CONFIG)[0]
            : `${pathname.split(URLS.APP_CONFIG)[0]}${URLS.APP_CONFIG}`

        // Determine comparePath based on paramToCheck
        let comparePath = ''
        if (paramToCheck === 'envId') {
            comparePath = isOverrideConfig
                ? `${basePath}${envId}/${URLS.APP_ENV_CONFIG_COMPARE}/${compareTo}${pathname.split(`${URLS.APP_ENV_OVERRIDE_CONFIG}/${envId}`)[1]}`
                : `${basePath}/${URLS.APP_ENV_CONFIG_COMPARE}${pathname.split(URLS.APP_CONFIG)[1]}`
        } else if (paramToCheck === 'appId') {
            comparePath = `${basePath}/${appId}/${URLS.APP_ENV_CONFIG_COMPARE}/${compareTo}${pathname.split(`${URLS.APP_CONFIG}/${appId}`)[1]}`
        }

        return (
            <div className="p-8">
                <CompareWithButton href={comparePath} />
            </div>
        )
    }

    return (
        <>
            {renderEnvSelector()}
            {showComparison && CompareWithButton && renderCompareWithBtn()}
            <div className="mw-none p-8">
                {isLoading || !environmentData ? (
                    ['90', '70', '50'].map((item) => <ShimmerText key={item} width={item} />)
                ) : (
                    <>
                        {showDeploymentTemplate && updatedEnvConfig.deploymentTemplate && (
                            <NavLink
                                data-testid="env-deployment-template"
                                className="dc__nav-item cursor dc__gap-8 fs-13 lh-32 cn-7 w-100 br-4 px-8 flexbox dc__align-items-center dc__no-decor"
                                to={updatedEnvConfig.deploymentTemplate.href}
                                onClick={handleDeploymentTemplateNavLinkOnClick}
                            >
                                <ICFileCode className="icon-dim-16 dc__nav-item__start-icon" />
                                <span className="dc__truncate flex-grow-1">
                                    {updatedEnvConfig.deploymentTemplate.title}
                                </span>
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
