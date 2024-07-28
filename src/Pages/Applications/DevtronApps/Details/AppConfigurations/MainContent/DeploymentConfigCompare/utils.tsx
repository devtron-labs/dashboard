import { generatePath } from 'react-router-dom'
import { GroupBase, OptionsOrGroups } from 'react-select'

import {
    DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP,
    SelectPickerOptionType,
    stringComparatorBySortOrder,
    YAMLStringify,
    DeploymentConfigDiffProps,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICCheck } from '@Icons/ic-check.svg'
import { ReactComponent as ICStamp } from '@Icons/ic-stamp.svg'
import { ReactComponent as ICEditFile } from '@Icons/ic-edit-file.svg'
import { prepareHistoryData } from '@Components/app/details/cdDetails/service'
import { TemplateListDTO, TemplateListType } from '@Components/deploymentConfig/types'
import {
    AppEnvDeploymentConfigDTO,
    AppEnvDeploymentConfigQueryParamsType,
    AppEnvDeploymentConfigType,
    ConfigMapSecretDataConfigDatumDTO,
    ConfigResourceType,
    DeploymentTemplateDTO,
} from '@Pages/Applications/DevtronApps/service.types'
import { DraftState } from '@Pages/Shared/ConfigMapSecret/ConfigMapSecret.types'

import {
    EnvironmentOptionType,
    EnvResourceType,
    AppEnvDeploymentConfigQueryParams,
    DeploymentConfigParams,
} from '../../AppConfig.types'

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

const getObfuscatedData = (
    codeEditorData: { [key: string]: string },
    type: ConfigResourceType,
    unAuthorized: boolean,
) => {
    const _codeEditorData = { ...codeEditorData }
    if (type === ConfigResourceType.Secret && unAuthorized && _codeEditorData) {
        Object.keys(_codeEditorData).reduce(
            (acc, curr) => ({ ...acc, [acc[curr]]: Array(8).fill('*').join('') }),
            _codeEditorData,
        )
    }
    return _codeEditorData
}

const getCodeEditorData = (
    cmSecretData: ConfigMapSecretDataConfigDatumDTO,
    type: ConfigResourceType,
    isUnAuthorized: boolean,
) => {
    if (type === ConfigResourceType.Secret) {
        if (Object.keys(cmSecretData.secretData ?? {}).length > 0) {
            return cmSecretData.secretData
        }
        if (Object.keys(cmSecretData.esoSecretData ?? {}).length > 0) {
            return cmSecretData.esoSecretData
        }
        if (Object.keys(cmSecretData.defaultSecretData ?? {}).length > 0) {
            return cmSecretData.defaultSecretData
        }
        if (Object.keys(cmSecretData.defaultESOSecretData ?? {}).length > 0) {
            return cmSecretData.defaultESOSecretData
        }
    }

    if (Object.keys(cmSecretData.data ?? {}).length > 0) {
        return getObfuscatedData(cmSecretData.data, type, isUnAuthorized)
    }

    if (Object.keys(cmSecretData.defaultData ?? {}).length > 0) {
        return getObfuscatedData(cmSecretData.defaultData, type, isUnAuthorized)
    }

    return null
}

const getDeploymentTemplateDiffViewData = (data: DeploymentTemplateDTO | null) => {
    const _data =
        JSON.parse(data?.data?.configData?.[0].draftMetadata.data || null)?.envOverrideValues ||
        JSON.parse(data?.deploymentDraftData?.configData[0].draftMetadata.data || null)?.envOverrideValues ||
        data?.data ||
        null

    const codeEditorValue = {
        displayName: 'data',
        value: _data ? YAMLStringify(_data) ?? '' : '',
    }

    const diffViewData = prepareHistoryData(
        { codeEditorValue },
        DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.DEPLOYMENT_TEMPLATE.VALUE,
    )

    return diffViewData
}

const getDiffViewData = (
    data: ConfigMapSecretDataConfigDatumDTO,
    type: ConfigResourceType,
    isUnAuthorized: boolean,
) => {
    const codeEditorValue = {
        displayName: 'data',
        value: data ? JSON.stringify(getCodeEditorData(data, type, isUnAuthorized)) ?? '' : '',
    }

    const diffViewData = prepareHistoryData(
        { ...(data || {}), codeEditorValue },
        type === ConfigResourceType.Secret
            ? DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.SECRET.VALUE
            : DEPLOYMENT_HISTORY_CONFIGURATION_LIST_MAP.CONFIGMAP.VALUE,
        type === ConfigResourceType.Secret && isUnAuthorized,
    )

    return diffViewData
}

export type DiffHeadingDataType<DeploymentTemplate> = DeploymentTemplate extends true
    ? DeploymentTemplateDTO
    : ConfigMapSecretDataConfigDatumDTO

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

const getConfigMapSecretData = (list1, list2, resourceType) => {
    const combinedList = mergeConfigDataArraysByName(list1?.data.configData || [], list2?.data.configData || [])

    const deploymentConfig = combinedList.map(([currentItem, compareItem]) => {
        const currentDiff = getDiffViewData(currentItem, resourceType, list1?.data.isEncrypted)
        const compareDiff = getDiffViewData(compareItem, resourceType, list2?.data.isEncrypted)
        const hasDiff = currentDiff.codeEditorValue.value !== compareDiff.codeEditorValue.value

        return {
            id: `${resourceType}-${currentItem?.name || compareItem?.name}`,
            title: currentItem?.name || compareItem?.name,
            primaryConfig: {
                heading: getDiffHeading(compareItem),
                list: compareDiff,
            },
            secondaryConfig: {
                heading: getDiffHeading(currentItem),
                list: currentDiff,
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
): Pick<DeploymentConfigDiffProps, 'configList' | 'collapsibleNavList' | 'navList'> => {
    const currentDeploymentData = getDeploymentTemplateDiffViewData(currentList.deploymentTemplate)
    const compareDeploymentData = getDeploymentTemplateDiffViewData(compareList.deploymentTemplate)

    const deploymentTemplateData = {
        id: 'compare-deployment-template',
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
        EnvResourceType.ConfigMap,
    )
    const secretData = getConfigMapSecretData(currentList.secretsData, compareList.secretsData, EnvResourceType.Secret)

    const configList = [deploymentTemplateData, ...cmData, ...secretData]

    const navList = [
        {
            title: deploymentTemplateData.title,
            hasDiff: deploymentTemplateData.hasDiff,
            href: `${generatePath(path, { ...params, resourceType: EnvResourceType.DeploymentTemplate })}${search}`,
            onClick: () => {
                const element = document.getElementById(deploymentTemplateData.id)
                element?.scrollIntoView({
                    behavior: 'smooth',
                })
            },
        },
    ]

    const collapsibleNavList = [
        {
            header: 'Config Maps',
            id: EnvResourceType.ConfigMap,
            items: cmData.map(({ title, hasDiff, id }) => ({
                title,
                hasDiff,
                href: `${generatePath(path, { ...params, resourceType: EnvResourceType.ConfigMap, resourceName: title })}${search}`,
                onClick: () => {
                    const element = document.getElementById(id)
                    element?.scrollIntoView({
                        behavior: 'smooth',
                    })
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
                    const element = document.getElementById(id)
                    element?.scrollIntoView({
                        behavior: 'smooth',
                    })
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
    environments.find(({ name: _name }) => name === _name)?.id || -1

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

export const parseCompareWithSearchParams = (searchParams: URLSearchParams): AppEnvDeploymentConfigQueryParamsType => {
    const identifierId = searchParams.get('identifierId')
    const compareWithIdentifierId = searchParams.get('compareWithIdentifierId')
    const pipelineId = searchParams.get('pipelineId')
    const compareWithPipelineId = searchParams.get('compareWithPipelineId')
    const chartRefId = searchParams.get('chartRefId')

    return {
        [AppEnvDeploymentConfigQueryParams.CONFIG_TYPE]: searchParams.get('configType') as AppEnvDeploymentConfigType,
        [AppEnvDeploymentConfigQueryParams.COMPARE_WITH]: searchParams.get('compareWith'),
        [AppEnvDeploymentConfigQueryParams.COMPARE_WITH_CONFIG_TYPE]: searchParams.get(
            'compareWithConfigType',
        ) as AppEnvDeploymentConfigType,
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
