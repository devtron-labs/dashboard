import { generatePath } from 'react-router-dom'
import { GroupBase, OptionsOrGroups } from 'react-select'
import moment from 'moment'

import {
    DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP,
    SelectPickerOptionType,
    stringComparatorBySortOrder,
    YAMLStringify,
    DeploymentConfigDiffProps,
    SortingOrder,
    yamlComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICCheck } from '@Icons/ic-check.svg'
import { ReactComponent as ICStamp } from '@Icons/ic-stamp.svg'
import { ReactComponent as ICEditFile } from '@Icons/ic-edit-file.svg'
import { Moment12HourFormat } from '@Config/constants'
import { prepareHistoryData } from '@Components/app/details/cdDetails/service'
import { TemplateListDTO, TemplateListType } from '@Components/deploymentConfig/types'
import {
    AppEnvDeploymentConfigDTO,
    AppEnvDeploymentConfigQueryParamsType,
    AppEnvDeploymentConfigType,
    ConfigMapSecretDataConfigDatumDTO,
    ConfigMapSecretDataDTO,
    ConfigResourceType,
    DeploymentTemplateDTO,
} from '@Pages/Applications/DevtronApps/service.types'
import { DraftState } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecret.types'

import {
    EnvironmentOptionType,
    EnvResourceType,
    AppEnvDeploymentConfigQueryParams,
    DeploymentConfigParams,
    DiffHeadingDataType,
    DeploymentConfigCompareProps,
} from '../../AppConfig.types'
import { BASE_CONFIGURATIONS } from '../../AppConfig.constants'

/**
 * Retrieves the draft data from the given configuration data object.
 *
 * @param configData - The configuration data object.
 * @returns The draft data if available, otherwise the original data.
 */
export const getDraftData = (configData: ConfigMapSecretDataConfigDatumDTO): ConfigMapSecretDataConfigDatumDTO => {
    if (configData?.draftMetadata) {
        const parsedData = JSON.parse(configData.draftMetadata.data)
        return { ...parsedData.configData[0], draftMetadata: configData.draftMetadata }
    }

    return configData
}

/**
 * Combines two arrays of configuration data objects based on a 'name' key.
 *
 * @param primaryArray - The first array of configuration data objects.
 * @param secondaryArray - The second array of configuration data objects.
 * @returns The combined array of configuration data objects.
 */
export const mergeConfigDataArraysByName = (
    primaryArray: ConfigMapSecretDataConfigDatumDTO[],
    secondaryArray: ConfigMapSecretDataConfigDatumDTO[],
): ConfigMapSecretDataConfigDatumDTO[][] => {
    const dataMap = new Map<string, ConfigMapSecretDataConfigDatumDTO[]>()

    const sortedPrimaryArray = primaryArray
        .map(getDraftData)
        .sort((a, b) => stringComparatorBySortOrder(a.name, b.name))

    const sortedSecondaryArray = secondaryArray
        .map(getDraftData)
        .sort((a, b) => stringComparatorBySortOrder(a.name, b.name))

    sortedPrimaryArray.forEach((item) => dataMap.set(item.name, [item, null]))
    sortedSecondaryArray.forEach((item) => {
        const key = item.name
        if (dataMap.has(key)) {
            dataMap.set(key, [dataMap.get(key)[0], item])
        } else {
            dataMap.set(key, [null, item])
        }
    })

    return Array.from(dataMap.values())
}

/**
 * Retrieves data for a given configuration, depending on the type.
 *
 * @param cmSecretData - The configuration data containing secret and non-secret data.
 * @param type - The type of configuration resource (e.g., Secret or ConfigMap).
 * @returns The config data if found, otherwise null.
 */
const getConfigData = (
    cmSecretData: ConfigMapSecretDataConfigDatumDTO,
    type: ConfigResourceType,
): Record<string, string> => {
    const secretKeys = ['secretData', 'esoSecretData', 'defaultSecretData', 'defaultESOSecretData']

    if (type === ConfigResourceType.Secret) {
        const data = secretKeys.find((key) => Object.keys(cmSecretData?.[key] ?? {}).length > 0)
        if (data) {
            return cmSecretData[data]
        }
    }

    const configmapKeys = ['data', 'defaultData']
    const data = configmapKeys.find((key) => Object.keys(cmSecretData?.[key] ?? {}).length > 0)
    if (data) {
        return cmSecretData[data]
    }

    // Return undefined intentionally, as JSON.stringify converts null to "null" but keeps undefined as undefined.
    return undefined
}

/**
 * Obfuscates the data based on user roles and matching keys.
 *
 * @param compareToData - Data to compare against, in the format of a record with string keys and values.
 * @param compareWithData - Data to compare with, in the format of a record with string keys and values.
 * @param compareToIsAdmin - Boolean flag indicating if the first dataset belongs to an admin user.
 * @param compareWithIsAdmin - Boolean flag indicating if the second dataset belongs to an admin user.
 * @returns An object containing the obfuscated versions of both datasets.
 */
const getObfuscatedData = (
    compareToData: Record<string, string>,
    compareWithData: Record<string, string>,
    compareToIsAdmin = false,
    compareWithIsAdmin = false,
) => {
    // Identify keys with matching values in both datasets
    const sameKeys: Record<string, boolean> = Object.keys(compareToData).reduce((acc, key) => {
        if (compareToData[key] === compareWithData[key]) {
            acc[key] = true
        }
        return acc
    }, {})

    // Function to obfuscate data based on same keys and admin status
    const obfuscateData = (data: Record<string, string>, isAdmin: boolean): Record<string, string> => {
        if (isAdmin) return data
        return Object.keys(data).reduce((acc, key) => {
            acc[key] = sameKeys[key] ? '********' : '************'
            return acc
        }, {})
    }

    const compareToObfuscatedData = obfuscateData(compareToData, compareToIsAdmin)
    const compareWithObfuscatedData = obfuscateData(compareWithData, compareWithIsAdmin)

    // Return undefined intentionally, as JSON.stringify converts null to "null" but keeps undefined as undefined.

    return {
        compareToObfuscatedData: Object.keys(compareToObfuscatedData).length ? compareToObfuscatedData : undefined,
        compareWithObfuscatedData: Object.keys(compareWithObfuscatedData).length
            ? compareWithObfuscatedData
            : undefined,
    }
}

/**
 * Retrieves code editor data, potentially obfuscating it based on user roles and resource type.
 *
 * @param compareToValue - The first dataset value to compare.
 * @param compareWithValue - The second dataset value to compare.
 * @param type - The type of the resource.
 * @param compareToIsAdmin - Boolean flag indicating if the first dataset belongs to an admin user.
 * @param compareWithIsAdmin - Boolean flag indicating if the second dataset belongs to an admin user.
 * @returns An object containing data for the code editor, with obfuscation applied if the type is Secret.
 */
const getCodeEditorData = (
    compareToValue: ConfigMapSecretDataConfigDatumDTO,
    compareWithValue: ConfigMapSecretDataConfigDatumDTO,
    type: ConfigResourceType,
    compareToIsAdmin: boolean,
    compareWithIsAdmin: boolean,
) => {
    const compareToConfigData = getConfigData(compareToValue, type)
    const compareWithConfigData = getConfigData(compareWithValue, type)

    let compareToCodeEditorData
    let compareWithCodeEditorData

    if (type === ConfigResourceType.Secret) {
        const { compareToObfuscatedData, compareWithObfuscatedData } = getObfuscatedData(
            compareToConfigData ?? {},
            compareWithConfigData ?? {},
            compareToIsAdmin,
            compareWithIsAdmin,
        )

        compareToCodeEditorData = {
            displayName: 'data',
            value: JSON.stringify(compareToObfuscatedData) || '',
        }

        compareWithCodeEditorData = {
            displayName: 'data',
            value: JSON.stringify(compareWithObfuscatedData) || '',
        }
    } else {
        compareToCodeEditorData = {
            displayName: 'data',
            value: JSON.stringify(compareToConfigData) || '',
        }

        compareWithCodeEditorData = {
            displayName: 'data',
            value: JSON.stringify(compareWithConfigData) || '',
        }
    }

    return { compareToCodeEditorData, compareWithCodeEditorData }
}

/**
 * Prepares the data for displaying the diff view between two configuration items.
 *
 * @param compareTo - The configuration item of compare to.
 * @param compareWith - The configuration item of compare with.
 * @param type - The type of the resource, indicating if it's a Secret or another type.
 * @param compareToIsAdmin - Boolean flag indicating if the compareTo item belongs to an admin user.
 * @param compareWithIsAdmin - Boolean flag indicating if the compareWith item belongs to an admin user.
 * @returns An object containing the diff data for both items and a boolean indicating if there is a difference.
 */
const getDiffViewData = (
    compareTo: ConfigMapSecretDataConfigDatumDTO,
    compareWith: ConfigMapSecretDataConfigDatumDTO,
    type: ConfigResourceType,
    compareToIsAdmin: boolean,
    compareWithIsAdmin: boolean,
) => {
    // Prepare the code editor data for compareTo and compareWith items
    const { compareToCodeEditorData, compareWithCodeEditorData } = getCodeEditorData(
        compareTo,
        compareWith,
        type,
        compareToIsAdmin,
        compareWithIsAdmin,
    )

    // Determine the history data map based on the type of resource
    const historyDataMap =
        type === ConfigResourceType.Secret
            ? DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.SECRET.VALUE
            : DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.CONFIGMAP.VALUE

    // Prepare the history data for the compareTo
    const compareToDiff = prepareHistoryData(
        { ...(compareTo || {}), codeEditorValue: compareToCodeEditorData },
        historyDataMap,
        type === ConfigResourceType.Secret && !compareToIsAdmin,
    )

    // Prepare the history data for the compareWith
    const compareWithDiff = prepareHistoryData(
        { ...(compareWith || {}), codeEditorValue: compareWithCodeEditorData },
        historyDataMap,
        type === ConfigResourceType.Secret && !compareWithIsAdmin,
    )

    // Check if there is a difference between the compareTo and compareWith data
    const hasDiff = compareWithCodeEditorData.value !== compareToCodeEditorData.value

    // Return the combined diff data
    return {
        compareToDiff,
        compareWithDiff,
        hasDiff,
    }
}

const getDeploymentTemplateDiffViewData = (data: DeploymentTemplateDTO | null, sortOrder: SortingOrder) => {
    const parsedDraftData = JSON.parse(data?.deploymentDraftData?.configData[0].draftMetadata.data || null)
    const _data =
        parsedDraftData?.envOverrideValues ||
        parsedDraftData?.valuesOverride ||
        parsedDraftData?.defaultAppOverride ||
        data?.data ||
        null

    const codeEditorValue = {
        displayName: 'data',
        value: _data
            ? YAMLStringify(_data, {
                  sortMapEntries: (a, b) => yamlComparatorBySortOrder(a, b, sortOrder),
              }) ?? ''
            : '',
    }

    const diffViewData = prepareHistoryData(
        { codeEditorValue },
        DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.DEPLOYMENT_TEMPLATE.VALUE,
    )

    return diffViewData
}

const getDiffHeading = <DeploymentTemplate extends boolean>(
    data: DiffHeadingDataType<DeploymentTemplate>,
    deploymentTemplate?: DeploymentTemplate,
) => {
    let doesNotExist = false
    let isDraft = false
    let isApprovalPending = false

    if (deploymentTemplate) {
        const _data = data as DeploymentTemplateDTO
        if (!_data?.deploymentDraftData && !_data?.data) {
            doesNotExist = true
        } else if (
            _data?.deploymentDraftData?.configData[0].draftMetadata.draftState === DraftState.Init ||
            _data?.data?.configData?.[0].draftMetadata.draftState === DraftState.Init
        ) {
            isDraft = true
        } else if (
            _data?.deploymentDraftData?.configData[0].draftMetadata.draftState === DraftState.AwaitApproval ||
            _data?.data?.configData?.[0].draftMetadata.draftState === DraftState.AwaitApproval
        ) {
            isApprovalPending = true
        }
    } else {
        const _data = data as ConfigMapSecretDataConfigDatumDTO
        if (!_data?.draftMetadata && !_data?.data && !_data?.defaultData) {
            doesNotExist = true
        } else if (
            _data?.draftMetadata?.draftState === DraftState.Init ||
            _data?.draftMetadata?.draftState === DraftState.Init
        ) {
            isDraft = true
        } else if (
            _data?.draftMetadata?.draftState === DraftState.AwaitApproval ||
            _data?.draftMetadata?.draftState === DraftState.AwaitApproval
        ) {
            isApprovalPending = true
        }
    }

    if (doesNotExist) {
        return <span className="fs-12 fw-6 cn-9">Does not exist</span>
    }

    if (isDraft) {
        return (
            <div className="flexbox dc__align-items-center dc__gap-8 ">
                <ICEditFile className="icon-dim-16 scr-5" />
                <span className="fs-12 fw-6 cr-5">Draft</span>
            </div>
        )
    }

    if (isApprovalPending) {
        return (
            <div className="flexbox dc__align-items-center dc__gap-8 ">
                <ICStamp className="icon-dim-16" />
                <span className="fs-12 fw-6 cv-5">Approval pending</span>
            </div>
        )
    }

    return (
        <div className="flexbox dc__align-items-center dc__gap-8 ">
            <ICCheck className="scn-9 icon-dim-16" />
            <span className="fs-12 fw-6 cn-9">Published</span>
        </div>
    )
}

const getConfigMapSecretData = (
    compareToList: ConfigMapSecretDataDTO,
    compareWithList: ConfigMapSecretDataDTO,
    resourceType: ConfigResourceType,
    compareToIsAdmin: boolean,
    compareWithIsAdmin: boolean,
) => {
    const combinedList = mergeConfigDataArraysByName(
        compareToList?.data.configData || [],
        compareWithList?.data.configData || [],
    )

    const deploymentConfig = combinedList.map(([currentItem, compareItem]) => {
        const { compareToDiff, compareWithDiff, hasDiff } = getDiffViewData(
            currentItem,
            compareItem,
            resourceType,
            compareToIsAdmin,
            compareWithIsAdmin,
        )

        return {
            id: `${resourceType === ConfigResourceType.ConfigMap ? EnvResourceType.ConfigMap : EnvResourceType.Secret}-${currentItem?.name || compareItem?.name}`,
            title: currentItem?.name || compareItem?.name,
            primaryConfig: {
                heading: getDiffHeading(compareItem),
                list: compareWithDiff,
            },
            secondaryConfig: {
                heading: getDiffHeading(currentItem),
                list: compareToDiff,
            },
            hasDiff,
        }
    })

    return deploymentConfig
}

/**
 * Generates a list of deployment configurations for application environments and identifies changes between the current and compare lists.
 *
 * @param currentList - The current deployment configuration list.
 * @param compareList - The deployment configuration list to compare against.
 * @returns The combined deployment configuration list and an object indicating which configurations have changed.
 */
export const getAppEnvDeploymentConfigList = (
    currentList: AppEnvDeploymentConfigDTO,
    compareList: AppEnvDeploymentConfigDTO,
    path: string,
    params: DeploymentConfigParams,
    search: string,
    sortOrder?: SortingOrder,
): Pick<DeploymentConfigDiffProps, 'configList' | 'collapsibleNavList' | 'navList'> => {
    const currentDeploymentData = getDeploymentTemplateDiffViewData(currentList.deploymentTemplate, sortOrder)
    const compareDeploymentData = getDeploymentTemplateDiffViewData(compareList.deploymentTemplate, sortOrder)

    const deploymentTemplateData = {
        id: EnvResourceType.DeploymentTemplate,
        title: 'Deployment Template',
        primaryConfig: {
            heading: getDiffHeading(compareList.deploymentTemplate, true),
            list: compareDeploymentData,
        },
        secondaryConfig: {
            heading: getDiffHeading(currentList.deploymentTemplate, true),
            list: currentDeploymentData,
        },
        hasDiff: currentDeploymentData.codeEditorValue.value !== compareDeploymentData.codeEditorValue.value,
        isDeploymentTemplate: true,
    }

    const cmData = getConfigMapSecretData(
        currentList.configMapData,
        compareList.configMapData,
        ConfigResourceType.ConfigMap,
        currentList.isAppAdmin,
        compareList.isAppAdmin,
    )

    const secretData = getConfigMapSecretData(
        currentList.secretsData,
        compareList.secretsData,
        ConfigResourceType.Secret,
        currentList.isAppAdmin,
        compareList.isAppAdmin,
    )

    const configList: DeploymentConfigDiffProps['configList'] = [deploymentTemplateData, ...cmData, ...secretData]

    const navList: DeploymentConfigDiffProps['navList'] = [
        {
            title: deploymentTemplateData.title,
            hasDiff: deploymentTemplateData.hasDiff,
            href: `${generatePath(path, { ...params, resourceType: EnvResourceType.DeploymentTemplate, resourceName: null })}${search}`,
            onClick: () => {
                const element = document.getElementById(deploymentTemplateData.id)
                element?.scrollIntoView({ block: 'start', behavior: 'smooth' })
            },
        },
    ]

    const collapsibleNavList: DeploymentConfigDiffProps['collapsibleNavList'] = [
        {
            header: 'Config Maps',
            id: EnvResourceType.ConfigMap,
            items: cmData.map(({ title, hasDiff, id }) => ({
                title,
                hasDiff,
                href: `${generatePath(path, { ...params, resourceType: EnvResourceType.ConfigMap, resourceName: title })}${search}`,
                onClick: () => {
                    const element = document.querySelector(`#${id}`)
                    element?.scrollIntoView({ block: 'start', behavior: 'smooth' })
                },
            })),
            noItemsText: 'No configmaps',
        },
        {
            header: 'Secrets',
            id: EnvResourceType.Secret,
            items: secretData.map(({ title, hasDiff, id }) => ({
                title,
                hasDiff,
                href: `${generatePath(path, { ...params, resourceType: EnvResourceType.Secret, resourceName: title })}${search}`,
                onClick: () => {
                    const element = document.querySelector(`#${id}`)
                    element?.scrollIntoView({ block: 'start', behavior: 'smooth' })
                },
            })),
            noItemsText: 'No secrets',
        },
    ]

    return {
        configList,
        collapsibleNavList,
        navList,
    }
}

export const getPreviousDeploymentOptionValue = (identifierId: number, pipelineId?: number) => {
    if (identifierId && pipelineId) {
        return `${AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS}-${identifierId}-${pipelineId}`
    }
    if (identifierId) {
        return `${AppEnvDeploymentConfigType.DEFAULT_VERSION}-${identifierId}`
    }
    return null
}

export const getPreviousDeploymentValue = (value: string) => {
    const valueSplit = value.split('-')
    if (valueSplit[0] === AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS) {
        return {
            configType: AppEnvDeploymentConfigType.PREVIOUS_DEPLOYMENTS,
            identifierId: +valueSplit[1],
            pipelineId: +valueSplit[2],
        }
    }

    return null
}

export const getEnvironmentIdByEnvironmentName = (environments: EnvironmentOptionType[], name: string) =>
    environments.find(({ name: _name }) => name === _name)?.id || BASE_CONFIGURATIONS.id

export const isEnvProtected = (
    environments: EnvironmentOptionType[],
    envName: string,
    isBaseConfigProtected?: boolean,
) => environments.find(({ name }) => name === envName)?.isProtected || isBaseConfigProtected

export const getDefaultVersionAndPreviousDeploymentOptions = (data: TemplateListDTO[]) =>
    data.reduce<{ previousDeployments: TemplateListDTO[]; defaultVersions: TemplateListDTO[] }>(
        (acc, curr) => ({
            ...acc,
            ...(curr.type === TemplateListType.DefaultVersions && curr.chartType === 'Deployment'
                ? {
                      defaultVersions: [...acc.defaultVersions, curr],
                  }
                : acc.defaultVersions),
            ...(curr.type === TemplateListType.DeployedOnSelfEnvironment
                ? {
                      previousDeployments: [...acc.previousDeployments, curr],
                  }
                : acc.previousDeployments),
        }),
        {
            defaultVersions: [],
            previousDeployments: [],
        },
    )

/**
 * Retrieves an option from the options list based on the provided value.
 *
 * @param optionsList - The list of options or groups of options.
 * @param value - The value to compare against the options' values.
 * @param defaultOption - The default option to return if no match is found.
 * @returns The matched option or the default option if no match is found.
 */
export const getOptionByValue = (
    optionsList: OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>>,
    value: string | number,
    defaultOption: SelectPickerOptionType = { label: '', value: '' },
): SelectPickerOptionType => {
    const foundOption = optionsList.reduce(
        (acc, curr) => {
            if (!acc.notFound) return acc

            if ('value' in curr && curr.value === value) {
                return { data: curr, notFound: false }
            }

            if (!('value' in curr)) {
                const nestedOption = curr.options.find(({ value: _value }) => _value === value)
                if (nestedOption) {
                    return { data: nestedOption, notFound: false }
                }
            }

            return acc
        },
        { notFound: true, data: defaultOption },
    ).data

    return foundOption
}

export const parseCompareWithSearchParams =
    ({
        environments,
        type,
        compareTo,
    }: Pick<DeploymentConfigCompareProps, 'environments' | 'type'> & { compareTo: string }) =>
    (searchParams: URLSearchParams): AppEnvDeploymentConfigQueryParamsType => {
        const identifierId = searchParams.get(AppEnvDeploymentConfigQueryParams.IDENTIFIER_ID)
        const compareWithIdentifierId = searchParams.get(AppEnvDeploymentConfigQueryParams.COMPARE_WITH_IDENTIFIER_ID)
        const pipelineId = searchParams.get(AppEnvDeploymentConfigQueryParams.PIPELINE_ID)
        const compareWithPipelineId = searchParams.get(AppEnvDeploymentConfigQueryParams.COMPARE_WITH_PIPELINE_ID)
        const chartRefId = searchParams.get(AppEnvDeploymentConfigQueryParams.CHART_REF_ID)
        let configType = searchParams.get(AppEnvDeploymentConfigQueryParams.CONFIG_TYPE)
        let compareWithConfigType = searchParams.get(AppEnvDeploymentConfigQueryParams.COMPARE_WITH_CONFIG_TYPE)
        let compareWith = searchParams.get(AppEnvDeploymentConfigQueryParams.COMPARE_WITH)

        if ((!chartRefId && !compareWithConfigType) || !configType) {
            if (!compareWith) {
                // If `type` is 'app' (Application), set `compareWith` to the first environment if available,
                // otherwise leave it empty (base configuration).
                if (type === 'app') {
                    compareWith = environments.length && !compareTo ? environments[0].name : ''
                } else {
                    // If `type` is 'appGroup' (Application Groups), set `compareWith` to the first application.
                    // If the application to compare (`compareTo`) is the same as the first application,
                    // set `compareWith` to the second application if it exists; otherwise, set it to the first.
                    compareWith =
                        environments.length > 1 && compareTo === environments[0].name
                            ? environments[1].name
                            : environments[0].name
                }
            }
            compareWithConfigType = compareWithConfigType || AppEnvDeploymentConfigType.PUBLISHED_ONLY
            configType = configType || AppEnvDeploymentConfigType.PUBLISHED_ONLY
        }

        return {
            [AppEnvDeploymentConfigQueryParams.CONFIG_TYPE]: configType as AppEnvDeploymentConfigType,
            [AppEnvDeploymentConfigQueryParams.COMPARE_WITH]: compareWith,
            [AppEnvDeploymentConfigQueryParams.COMPARE_WITH_CONFIG_TYPE]:
                compareWithConfigType as AppEnvDeploymentConfigType,
            [AppEnvDeploymentConfigQueryParams.IDENTIFIER_ID]: identifierId ? parseInt(identifierId, 10) : null,
            [AppEnvDeploymentConfigQueryParams.PIPELINE_ID]: pipelineId ? parseInt(pipelineId, 10) : null,
            [AppEnvDeploymentConfigQueryParams.COMPARE_WITH_IDENTIFIER_ID]: compareWithIdentifierId
                ? parseInt(compareWithIdentifierId, 10)
                : null,
            [AppEnvDeploymentConfigQueryParams.COMPARE_WITH_PIPELINE_ID]: compareWithPipelineId
                ? parseInt(compareWithPipelineId, 10)
                : null,
            [AppEnvDeploymentConfigQueryParams.CHART_REF_ID]: chartRefId ? parseInt(chartRefId, 10) : null,
        }
    }

/**
 * Get the options for the compare environment.
 *
 * @param environmentList - List of environments.
 * @param defaultValuesList - List of chart default values.
 * @returns The environments options for the select picker.
 */
export const getCompareEnvironmentSelectorOptions = (
    environmentList: EnvironmentOptionType[] = [],
    defaultValuesList: TemplateListDTO[] = [],
    type: DeploymentConfigCompareProps['type'] = 'app',
): OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>> => [
    ...(type === 'app'
        ? [
              {
                  label: BASE_CONFIGURATIONS.name,
                  value: '',
              },
          ]
        : []),
    ...(type === 'app'
        ? [
              {
                  label: 'Environments',
                  options: environmentList.map(({ name }) => ({
                      label: name,
                      value: name,
                  })),
              },
          ]
        : environmentList.map(({ name }) => ({
              label: name,
              value: name,
          }))),
    ...(type === 'app'
        ? [
              {
                  label: 'Chart default values',
                  options:
                      defaultValuesList.map(({ chartRefId, chartVersion }) => ({
                          label: `v${chartVersion} (Default)`,
                          value: chartRefId,
                      })) || [],
              },
          ]
        : []),
]

/**
 * Get the configuration type options for the environment.
 *
 * @param previousDeploymentsList - List of previous deployments.
 * @returns The configuration type options for the select picker.
 */
export const getEnvironmentConfigTypeOptions = (
    previousDeploymentsList: TemplateListDTO[] = [],
    isProtected = false,
): OptionsOrGroups<SelectPickerOptionType, GroupBase<SelectPickerOptionType>> => [
    {
        label: 'Published only',
        value: AppEnvDeploymentConfigType.PUBLISHED_ONLY,
        description: 'Configurations that will be deployed in the next deployment',
    },
    ...(isProtected
        ? [
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
          ]
        : []),
    {
        label: 'Previous deployments',
        options: previousDeploymentsList.map(
            ({ finishedOn, chartVersion, pipelineId, deploymentTemplateHistoryId }) => ({
                label: `${moment(finishedOn).format(Moment12HourFormat)} (v${chartVersion})`,
                value: getPreviousDeploymentOptionValue(deploymentTemplateHistoryId, pipelineId),
            }),
        ),
    },
]
