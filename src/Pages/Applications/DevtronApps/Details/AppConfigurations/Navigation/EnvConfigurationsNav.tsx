import { useEffect, useState } from 'react'
import { useRouteMatch, useLocation, NavLink, useHistory } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import ReactSelect, { GroupBase, OptionProps, components } from 'react-select'

import { ResourceKindType } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICBack } from '@Icons/ic-caret-left-small.svg'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ReactComponent as ProtectedIcon } from '@Icons/ic-shield-protect-fill.svg'
import { getJobOtherEnvironmentMin } from '@Services/service'
import { AppEnvironment } from '@Services/service.types'
import { EnvSelectDropdownIndicator, envSelectStyles } from 'src/util/EnvSelect.utils'
import { CollapsibleList, CollapsibleListConfig } from '@Pages/Shared/CollapsibleList'
import { ResourceConfigState } from '@Pages/Applications/DevtronApps/service.types'

import { useAppConfigurationContext } from '../AppConfiguration.provider'
import { EnvResourceType } from '../appConfig.type'
import { getEnvConfiguration, getNavigationPath } from './Navigation.helper'

// COMPONENTS
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

// LOADING SHIMMER
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
    } = useRouteMatch<{ envId: string; resourceType: string }>()
    const { appId, resourceKind, envConfig, fetchEnvConfig, isBaseConfigProtected, environments, lastUnlockedStage } =
        useAppConfigurationContext()

    // STATES
    const [expandedIds, setExpandedIds] = useState<Record<EnvResourceType, boolean>>()
    const [updatedEnvConfig, setUpdatedEnvConfig] = useState<ReturnType<typeof getEnvConfiguration>>({
        deploymentTemplate: null,
        configmaps: [],
        secrets: [],
    })
    const [jobEnvs, setJobEnvs] = useState<AppEnvironment[]>([])

    // CONSTANTS
    const isDevtronApp = resourceKind === ResourceKindType.devtronApplication
    const isJob = resourceKind === ResourceKindType.job
    /** Current Environment Data. */
    const environmentData = (isDevtronApp ? environments : jobEnvs)?.find(
        ({ environmentId }) => environmentId === +envId,
    ) || {
        environmentName: 'Base Configurations',
        environmentId: -1,
        isProtected: isBaseConfigProtected,
    }

    const addUnnamedNavLink = (
        _updatedEnvConfig: ReturnType<typeof getEnvConfiguration>,
        resourceType: EnvResourceType,
    ) =>
        _updatedEnvConfig[resourceType === EnvResourceType.ConfigMap ? 'configmaps' : 'secrets'].push({
            title: 'Unnamed',
            href: getNavigationPath(
                path,
                appId,
                environmentData.environmentId,
                resourceType,
                ResourceConfigState.Unnamed,
            ),
            configState: ResourceConfigState.Unnamed,
            subtitle: '',
        })

    useEffect(() => {
        // Fetch the env configuration
        fetchEnvConfig(+(envId || -1))

        return () => {
            setExpandedIds(null)
        }
    }, [envId])

    useEffect(() => {
        if (!envConfig.isLoading && envConfig.config) {
            const newEnvConfig = getEnvConfiguration(envConfig.config, path, appId, environmentData)
            let resourceType: EnvResourceType

            if (pathname.includes('/configmap')) {
                resourceType = EnvResourceType.ConfigMap
            } else if (pathname.includes('/secrets')) {
                resourceType = EnvResourceType.Secret
            }

            if (pathname.includes('/create')) {
                addUnnamedNavLink(newEnvConfig, resourceType)
            }

            setExpandedIds((prevState) => ({ ...prevState, [resourceType]: true }))
            setUpdatedEnvConfig(newEnvConfig)
        }
    }, [envConfig, pathname])

    useEffect(() => {
        if (isJob) {
            getJobOtherEnvironmentMin(appId)
                .then(({ result }) => {
                    setJobEnvs(result)
                })
                .catch(() => {})
        }
    }, [])

    // METHODS
    /** Renders the Deployment Template Nav Icon based on `envConfig`. */
    const renderDeploymentTemplateNavIcon = () => {
        const { iconConfig } = updatedEnvConfig.deploymentTemplate

        return iconConfig ? (
            <Tippy {...iconConfig.tooltipProps}>
                <div className="flex">
                    <iconConfig.Icon {...iconConfig.props} className={`icon-dim-16 ${iconConfig.props.className}`} />
                </div>
            </Tippy>
        ) : null
    }

    /** Handles collapse button click. */
    const onCollapseBtnClick = (id: string) => {
        setExpandedIds({ ...expandedIds, [id]: !expandedIds?.[id] })
    }

    /**
     * Handles the click event for a collapsible header icon, updating the environment configuration and navigation path.
     *
     * @param resourceType - The type of resource
     */
    const onHeaderIconBtnClick = (resourceType: EnvResourceType) => () => {
        if (pathname.includes(`${resourceType}/create`)) {
            return
        }

        setExpandedIds({ ...expandedIds, [resourceType]: true })
        history.push(
            getNavigationPath(path, appId, environmentData.environmentId, resourceType, ResourceConfigState.Unnamed),
        )

        const newEnvConfig = updatedEnvConfig
        addUnnamedNavLink(newEnvConfig, resourceType)
        setUpdatedEnvConfig(newEnvConfig)
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
            },
            items: updatedEnvConfig.secrets,
            noItemsText: 'No secrets',
            isExpanded: expandedIds?.secrets,
        },
    ]

    // REACT SELECT PROPS
    const envOptions = [
        {
            environmentName: 'Base Configurations',
            environmentId: -1,
            isProtected: isBaseConfigProtected,
        },
        ...((isDevtronApp ? environments : jobEnvs) || []),
    ]

    const onEnvSelect = ({ environmentId }: typeof environmentData) => {
        if (isDevtronApp) {
            history.push(getNavigationPath(path, appId, environmentId, EnvResourceType.DeploymentTemplate))
        } else {
            history.push(
                getNavigationPath(
                    path,
                    appId,
                    environmentId,
                    EnvResourceType.ConfigMap,
                    undefined,
                    updatedEnvConfig.configmaps[0]?.title,
                ),
            )
        }
    }

    const renderEnvSelector = () => {
        return (
            <div className="flexbox dc__align-center dc__gap-8 p-12 dc__border-bottom en-1">
                <NavLink to={lastUnlockedStage}>
                    <div className="dc__border br-4 flex p-1">
                        <ICBack className="icon-dim-16" />
                    </div>
                </NavLink>
                <ReactSelect<typeof environmentData>
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
                        DropdownIndicator: EnvSelectDropdownIndicator,
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
                {envConfig.isLoading ? (
                    ['90', '70', '50'].map((item) => <ShimmerText key={item} width={item} />)
                ) : (
                    <>
                        {isDevtronApp && updatedEnvConfig.deploymentTemplate && (
                            <NavLink
                                data-testid="env-deployment-template"
                                className="app-compose__nav-item cursor dc__gap-8"
                                to={updatedEnvConfig.deploymentTemplate.href}
                            >
                                <span className="dc__ellipsis-right">{updatedEnvConfig.deploymentTemplate.title}</span>
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
