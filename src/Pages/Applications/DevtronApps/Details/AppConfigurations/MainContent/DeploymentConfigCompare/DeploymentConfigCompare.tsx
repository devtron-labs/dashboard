import { useEffect, useMemo } from 'react'
import { generatePath, useLocation, useRouteMatch } from 'react-router-dom'
import { GroupBase, OptionsOrGroups } from 'react-select'
import moment from 'moment'

import {
    useUrlFilters,
    SelectPickerOptionType,
    SelectPickerVariantType,
    useAsync,
    ErrorScreenManager,
    DeploymentConfigDiff,
    DeploymentConfigDiffProps,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'
import { Moment12HourFormat } from '@Config/constants'
import {
    AppEnvDeploymentConfigQueryParamsType,
    AppEnvDeploymentConfigType,
} from '@Pages/Applications/DevtronApps/service.types'
import { getAppEnvDeploymentConfig } from '@Pages/Applications/DevtronApps/service'
import { getOptions } from '@Components/deploymentConfig/service'

import { BASE_CONFIGURATIONS } from '../../AppConfig.constants'
import {
    AppEnvDeploymentConfigQueryParams,
    DeploymentConfigCompareProps,
    DeploymentConfigParams,
} from '../../AppConfig.types'
import {
    getAppEnvDeploymentConfigList,
    getDefaultVersionAndPreviousDeploymentOptions,
    getEnvironmentIdByEnvironmentName,
    getOptionByValue,
    getPreviousDeploymentOptionValue,
    getPreviousDeploymentValue,
    parseCompareWithSearchParams,
} from './utils'

export const DeploymentConfigCompare = ({ environments, appName }: DeploymentConfigCompareProps) => {
    // HOOKS
    const { path, params } = useRouteMatch<DeploymentConfigParams>()
    const { appId, resourceType, resourceName, envName } = params
    const { pathname, search } = useLocation()
    const { sortBy, sortOrder, handleSorting } = useStateFilters({
        initialSortKey: 'sort-config',
    })

    // SEARCH PARAMS
    const {
        compareWith,
        identifierId,
        pipelineId,
        compareWithIdentifierId,
        compareWithPipelineId,
        compareWithConfigType,
        configType,
        chartRefId,
        updateSearchParams,
    } = useUrlFilters<never, AppEnvDeploymentConfigQueryParamsType>({
        parseSearchParams: parseCompareWithSearchParams,
    })

    // Ensure default query parameters are set if they are not already present
    useEffect(() => {
        if ((!chartRefId && !compareWithConfigType) || !configType) {
            updateSearchParams({
                compareWithConfigType: compareWithConfigType || AppEnvDeploymentConfigType.PUBLISHED_ONLY,
                configType: configType || AppEnvDeploymentConfigType.PUBLISHED_ONLY,
            })
        }
    }, [])

    // ASYNC CALLS
    // Load options for dropdown menus of previous deployments and default versions
    const [optionsLoader, options, optionsErr] = useAsync(
        () =>
            Promise.all([
                getOptions(+appId, getEnvironmentIdByEnvironmentName(environments, envName)),
                getOptions(+appId, getEnvironmentIdByEnvironmentName(environments, compareWith)),
            ]),
        [envName, compareWith],
    )
    // Options for previous deployments and default versions
    const currentEnvOptions = useMemo(
        () => (!optionsLoader && options ? getDefaultVersionAndPreviousDeploymentOptions(options[0].result) : null),
        [options, optionsLoader],
    )
    const compareEnvOptions = useMemo(
        () => (!optionsLoader && options ? getDefaultVersionAndPreviousDeploymentOptions(options[1].result) : null),
        [options, optionsLoader],
    )

    // Load data for comparing the two environments
    const [comparisonDataLoader, comparisonData, comparisonDataErr] = useAsync(
        () =>
            Promise.all([
                getAppEnvDeploymentConfig({
                    appName,
                    envName: envName || '',
                    configType,
                    identifierId,
                    pipelineId,
                }),
                getAppEnvDeploymentConfig({
                    appName,
                    envName: compareWith || '',
                    configType: compareWithConfigType,
                    identifierId: chartRefId || compareWithIdentifierId,
                    pipelineId: compareWithPipelineId,
                }),
            ]),
        [
            appName,
            compareWith,
            compareWithConfigType,
            configType,
            identifierId,
            compareWithIdentifierId,
            pipelineId,
            compareWithPipelineId,
            chartRefId,
        ],
        !!configType && !!compareWithConfigType,
    )

    // Generate the deployment configuration list for the environments using comparison data
    const appEnvDeploymentConfigList = useMemo(() => {
        if (!comparisonDataLoader && comparisonData) {
            const currentData = comparisonData[0].result
            const compareData = comparisonData[1].result

            const configData = getAppEnvDeploymentConfigList(currentData, compareData, path, params, search, sortOrder)
            return configData
        }

        return null
    }, [comparisonDataLoader, comparisonData, sortOrder])

    // SELECT PICKER OPTIONS
    /** Compare Environment Select Picker Options  */
    const compareEnvironmentSelectorOptions: OptionsOrGroups<
        SelectPickerOptionType,
        GroupBase<SelectPickerOptionType>
    > = [
        {
            label: BASE_CONFIGURATIONS.name,
            value: '',
        },
        {
            label: 'Environments',
            options: environments.map(({ name }) => ({
                label: name,
                value: name,
            })),
        },
        {
            label: 'Default values',
            options:
                currentEnvOptions?.defaultVersions.map(({ chartRefId: _chartRefId, chartVersion }) => ({
                    label: `v${chartVersion} (Default)`,
                    value: _chartRefId,
                })) || [],
        },
    ]

    /**
     * Get the configuration type options for the current or compare environment.
     *
     * @param isCompare - If true, compare env data will be used.
     * @returns The configuration type options for the select picker.
     */
    const getEnvironmentConfigTypeOptions = (
        isCompare?: boolean,
    ): OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>> => [
        {
            label: 'Published only',
            value: AppEnvDeploymentConfigType.PUBLISHED_ONLY,
            description: 'Configurations that will be deployed in the next deployment',
        },
        {
            label: 'Drafts only',
            value: AppEnvDeploymentConfigType.DRAFT_ONLY,
            description: 'Configurations in draft or approval pending state',
        },
        {
            label: 'Saved (Includes drafts)',
            value: AppEnvDeploymentConfigType.PUBLISHED_WITH_DRAFT,
            description: 'Last saved configurations including any drafts',
        },
        {
            label: 'Previous Deployments',
            options: ((isCompare ? compareEnvOptions : currentEnvOptions)?.previousDeployments || []).map(
                ({ finishedOn, chartVersion, pipelineId: _pipelineId, deploymentTemplateHistoryId }) => ({
                    label: `${moment(finishedOn).format(Moment12HourFormat)} (v${chartVersion})`,
                    value: getPreviousDeploymentOptionValue(deploymentTemplateHistoryId, _pipelineId),
                }),
            ),
        },
    ]

    // METHODS
    const onCompareEnvironmentChange = ({ value }: SelectPickerOptionType) => {
        if (typeof value === 'number') {
            updateSearchParams({
                chartRefId: value,
                compareWithConfigType: AppEnvDeploymentConfigType.DEFAULT_VERSION,
                compareWithIdentifierId: null,
                compareWithPipelineId: null,
            })
        } else if (typeof value === 'string') {
            updateSearchParams({
                compareWith: value,
                chartRefId: null,
                compareWithIdentifierId: null,
                compareWithPipelineId: null,
                compareWithConfigType:
                    compareWithConfigType === AppEnvDeploymentConfigType.DEFAULT_VERSION ||
                    compareWithConfigType === AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS
                        ? AppEnvDeploymentConfigType.PUBLISHED_ONLY
                        : compareWithConfigType,
            })
        }
    }

    const onEnvironmentConfigTypeChange =
        (isCompare?: boolean) =>
        ({ value }: SelectPickerOptionType) => {
            if (typeof value === 'string') {
                const modifiedValue = getPreviousDeploymentValue(value)
                if (modifiedValue) {
                    updateSearchParams({
                        [isCompare
                            ? AppEnvDeploymentConfigQueryParams.COMPARE_WITH_CONFIG_TYPE
                            : AppEnvDeploymentConfigQueryParams.CONFIG_TYPE]:
                            AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS,
                        ...(!isCompare
                            ? {
                                  identifierId: modifiedValue.identifierId,
                                  pipelineId: modifiedValue.pipelineId,
                              }
                            : {
                                  compareWithIdentifierId: modifiedValue.identifierId,
                                  compareWithPipelineId: modifiedValue.pipelineId,
                              }),
                    })
                } else {
                    updateSearchParams({
                        [isCompare
                            ? AppEnvDeploymentConfigQueryParams.COMPARE_WITH_CONFIG_TYPE
                            : AppEnvDeploymentConfigQueryParams.CONFIG_TYPE]: value,
                        ...(!isCompare
                            ? {
                                  identifierId: null,
                                  pipelineId: null,
                              }
                            : {
                                  compareWithIdentifierId: null,
                                  compareWithPipelineId: null,
                              }),
                    })
                }
            }
        }

    // DeploymentConfigDiff Props
    const renderCompareEnvironmentSelectorProps = () => ({
        id: 'compare-with-environment-selector',
        options: compareEnvironmentSelectorOptions,
        placeholder: 'Select Environment',
        classNamePrefix: 'compare-with-environment-selector',
        inputId: 'compare-with-environment-selector',
        name: 'compare-with-environment-selector',
        variant: SelectPickerVariantType.BORDERLESS,
        value: getOptionByValue(compareEnvironmentSelectorOptions, chartRefId || compareWith, {
            label: BASE_CONFIGURATIONS.name,
            value: '',
        }),
        onChange: onCompareEnvironmentChange,
    })

    const renderEnvironmentConfigTypeSelectorProps = (isCompare?: boolean) => ({
        id: `environment-config-type-selector-${isCompare ? 'compare' : 'current'}`,
        options: getEnvironmentConfigTypeOptions(isCompare),
        placeholder: 'Select State',
        classNamePrefix: 'environment-config-type-selector',
        inputId: `environment-config-type-selector-${isCompare ? 'compare' : 'current'}`,
        name: `environment-config-type-selector-${isCompare ? 'compare' : 'current'}`,
        variant: SelectPickerVariantType.BORDERLESS,
        isSearchable: false,
        value: getOptionByValue(
            getEnvironmentConfigTypeOptions(isCompare),
            !isCompare
                ? getPreviousDeploymentOptionValue(identifierId, pipelineId) || configType
                : getPreviousDeploymentOptionValue(compareWithIdentifierId, compareWithPipelineId) ||
                      compareWithConfigType,
            {
                label: BASE_CONFIGURATIONS.name,
                value: '',
            },
        ),
        onChange: onEnvironmentConfigTypeChange(isCompare),
    })

    const deploymentConfigDiffSelectors: DeploymentConfigDiffProps['selectorsConfig'] = {
        primaryConfig: [
            {
                id: 'compare-with-environment-selector',
                type: 'selectPicker',
                selectPickerProps: renderCompareEnvironmentSelectorProps(),
            },
            ...(compareWithConfigType !== AppEnvDeploymentConfigType.DEFAULT_VERSION
                ? [
                      {
                          id: `environment-config-type-selector-compare`,
                          type: 'selectPicker' as const,
                          selectPickerProps: renderEnvironmentConfigTypeSelectorProps(true),
                      },
                  ]
                : []),
        ],
        secondaryConfig: [
            {
                id: envName || BASE_CONFIGURATIONS.name,
                type: 'string',
                text: envName || BASE_CONFIGURATIONS.name,
            },
            {
                id: `environment-config-type-selector-current`,
                type: 'selectPicker',
                selectPickerProps: renderEnvironmentConfigTypeSelectorProps(),
            },
        ],
    }

    const getBackURL = () => {
        const envId = getEnvironmentIdByEnvironmentName(environments, envName)
        const basePath = pathname.split(`/${envName || URLS.APP_ENV_CONFIG_COMPARE}`)[0]
        const additionalPath =
            envId !== -1 ? `${URLS.APP_ENV_OVERRIDE_CONFIG}/${envId}/${resourceType}/${resourceName}` : resourceType

        return `${generatePath(basePath, { appId })}/${additionalPath}`
    }

    const getNavHelpText = () => {
        const chart = currentEnvOptions?.defaultVersions.find(
            ({ chartRefId: _chartRefId }) => _chartRefId === chartRefId,
        )
        const compareEnvText = `${chart ? `v${chart.chartVersion}(Default)` : compareWith || BASE_CONFIGURATIONS.name}`
        const currentEnvText = envName || BASE_CONFIGURATIONS.name

        return `Showing files from ${compareEnvText} & ${currentEnvText}`
    }

    // ERROR SCREEN
    if (comparisonDataErr || optionsErr) {
        return <ErrorScreenManager code={comparisonDataErr?.code || optionsErr?.code} />
    }

    return (
        <DeploymentConfigDiff
            isLoading={
                (comparisonDataLoader || !appEnvDeploymentConfigList || optionsLoader) &&
                !comparisonDataErr &&
                !optionsErr
            }
            {...appEnvDeploymentConfigList}
            goBackURL={getBackURL()}
            selectorsConfig={deploymentConfigDiffSelectors}
            scrollIntoViewId={`${resourceType}-${resourceName}`}
            navHeading={`Comparing ${envName || BASE_CONFIGURATIONS.name}`}
            navHelpText={getNavHelpText()}
            sortOrder={sortOrder}
            onSortBtnClick={() => handleSorting(sortBy)}
        />
    )
}
