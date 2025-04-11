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

import YAML from 'yaml'

import {
    AppEnvDeploymentConfigDTO,
    applyCompareDiffOnUneditedDocument,
    CM_SECRET_STATE,
    CMSecretComponentType,
    CMSecretConfigData,
    CMSecretExternalType,
    ConfigHeaderTabType,
    configMapDataTypeOptions,
    ConfigMapSecretDataType,
    configMapSecretMountDataMap,
    ConfigMapSecretUseFormProps,
    decode,
    DEFAULT_SECRET_PLACEHOLDER,
    DraftAction,
    DraftMetadataDTO,
    DraftState,
    DryRunEditorMode,
    ERROR_STATUS_CODE,
    getConfigMapSecretFormInitialValues,
    getConfigMapSecretPayload,
    getSecretDataTypeOptions,
    getSelectPickerOptionByValue,
    KeyValueTableData,
    KeyValueTableProps,
    OverrideMergeStrategyType,
    SelectPickerOptionType,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { MERGE_STRATEGY_OPTIONS } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/constants'
import { ResourceConfigStage } from '@Pages/Applications/DevtronApps/service.types'

import {
    CMSecretDraftData,
    ConfigMapSecretDecodedDataProps,
    ConfigMapSecretDecodedDataReturnType,
    ConfigMapSecretDryRunProps,
    ConfigMapSecretEncodedDataProps,
    ConfigMapSecretEncodedDataReturnType,
    ConfigMapSecretFormProps,
    ConfigMapSecretQueryParamsType,
} from './types'

// HELPERS UTILS ----------------------------------------------------------------
export const getConfigMapSecretStateLabel = (configStage: ResourceConfigStage, isOverrideView: boolean) => {
    if (isOverrideView) {
        switch (configStage) {
            case ResourceConfigStage.Overridden:
                return CM_SECRET_STATE.OVERRIDDEN
            case ResourceConfigStage.Inheriting:
                return CM_SECRET_STATE.INHERITED
            default:
                return configStage === ResourceConfigStage.Unpublished
                    ? CM_SECRET_STATE.UNPUBLISHED
                    : CM_SECRET_STATE.ENV
        }
    }

    return configStage === ResourceConfigStage.Unpublished ? CM_SECRET_STATE.UNPUBLISHED : CM_SECRET_STATE.BASE
}
// HELPERS UTILS ----------------------------------------------------------------

// FORM UTILS ----------------------------------------------------------------
export const getLockedYamlString = (yaml: string) => {
    const obj = YAML.parse(yaml)
    const keyValueArray = Object.keys(obj).reduce((agg, k) => {
        if (!k && !obj[k]) {
            return agg
        }

        return { ...agg, [k]: DEFAULT_SECRET_PLACEHOLDER }
    }, obj)

    return YAMLStringify(keyValueArray)
}

export const getYAMLWithStringifiedNumbers = (yaml: string) => {
    const parsedYAML = YAML.parse(yaml)
    const jsonWithStringifiedNumbers = JSON.parse(
        JSON.stringify(parsedYAML, (_, value) =>
            // Check if the value is a number (but not NaN or Infinity) and return it as a string
            typeof value === 'number' && Number.isFinite(value) ? String(value) : value,
        ),
    )
    return YAMLStringify(jsonWithStringifiedNumbers)
}

// FORM UTILS ----------------------------------------------------------------

// PAYLOAD UTILS ----------------------------------------------------------------
const getConfigMapSecretDecodedData = <IsDraft extends boolean = false>({
    configMapSecretData,
    isDraft,
    isSecret,
}: ConfigMapSecretDecodedDataProps<IsDraft>): ConfigMapSecretDecodedDataReturnType<IsDraft> => {
    if (!configMapSecretData || !isSecret || configMapSecretData.unAuthorized) {
        return configMapSecretData
    }

    if (!isDraft) {
        const _configMapSecretData =
            configMapSecretData as ConfigMapSecretDecodedDataProps<false>['configMapSecretData']
        if (!isSecret || _configMapSecretData.unAuthorized || _configMapSecretData.externalType !== '') {
            return _configMapSecretData as ConfigMapSecretDecodedDataReturnType<IsDraft>
        }

        return {
            ..._configMapSecretData,
            data: decode(_configMapSecretData.data),
            isDecoded: true,
        } as ConfigMapSecretDecodedDataReturnType<IsDraft>
    }

    const draftData = configMapSecretData as ConfigMapSecretDecodedDataProps<true>['configMapSecretData']
    const cmSecretData = draftData.parsedData.configData[0]
    if (!isSecret || draftData.unAuthorized || cmSecretData.externalType !== '') {
        return draftData as ConfigMapSecretDecodedDataReturnType<IsDraft>
    }

    return {
        ...draftData,
        parsedData: { ...draftData.parsedData, configData: [{ ...cmSecretData, data: decode(cmSecretData.data) }] },
        isDecoded: true,
    } as ConfigMapSecretDecodedDataReturnType<IsDraft>
}

const getConfigMapSecretEncodedData = <IsDraft extends boolean = false>({
    configMapSecretData,
    isDraft,
}: ConfigMapSecretEncodedDataProps<IsDraft>): ConfigMapSecretEncodedDataReturnType<IsDraft> => {
    if (!configMapSecretData || !configMapSecretData.isDecoded) {
        return configMapSecretData
    }

    if (!isDraft) {
        const _configMapSecretData =
            configMapSecretData as ConfigMapSecretEncodedDataProps<false>['configMapSecretData']
        return {
            ..._configMapSecretData,
            data: decode(_configMapSecretData.data, true),
        } as ConfigMapSecretEncodedDataReturnType<IsDraft>
    }

    const draftData = configMapSecretData as ConfigMapSecretEncodedDataProps<true>['configMapSecretData']
    const { parsedData } = draftData
    return {
        ...draftData,
        parsedData: {
            ...parsedData,
            configData: [{ ...parsedData.configData[0], data: decode(parsedData.configData[0].data, true) }],
        },
    } as ConfigMapSecretEncodedDataReturnType<IsDraft>
}

export const getConfigMapSecretResolvedDataPayload = ({
    formData,
    inheritedConfigMapSecretData,
    configMapSecretData,
    draftData,
    isSecret,
}: {
    formData: ConfigMapSecretUseFormProps
    inheritedConfigMapSecretData: CMSecretConfigData
    configMapSecretData: CMSecretConfigData
    draftData: CMSecretDraftData
    isSecret: boolean
}) => {
    const values = {
        formData,
        inheritedConfigMapSecretData: getConfigMapSecretDecodedData({
            configMapSecretData: inheritedConfigMapSecretData,
            isSecret,
        }),
        configMapSecretData: getConfigMapSecretDecodedData({ configMapSecretData, isSecret }),
        draftData: getConfigMapSecretDecodedData({ configMapSecretData: draftData, isSecret, isDraft: true }),
    }

    return YAMLStringify(values)
}
// PAYLOAD UTILS ----------------------------------------------------------------

// DATA UTILS ----------------------------------------------------------------
export const getConfigMapSecretDraftAndPublishedData = ({
    isJob,
    isSecret,
    cmSecretConfigDataRes,
    draftConfigDataRes,
}: Pick<ConfigMapSecretFormProps, 'isJob'> & {
    isSecret: boolean
    cmSecretConfigDataRes: PromiseSettledResult<ConfigMapSecretDataType | AppEnvDeploymentConfigDTO>
    draftConfigDataRes: PromiseSettledResult<DraftMetadataDTO>
}) => {
    let configMapSecretData: CMSecretConfigData = null
    let draftData: CMSecretDraftData = null
    let isDeleteDisabled = false

    // DRAFT DATA PROCESSING
    if (draftConfigDataRes.status === 'fulfilled') {
        const draftConfigData = draftConfigDataRes.value

        if (
            draftConfigData &&
            (draftConfigData.draftState === DraftState.Init || draftConfigData.draftState === DraftState.AwaitApproval)
        ) {
            try {
                draftData = {
                    ...draftConfigData,
                    parsedData: JSON.parse(draftConfigData.data),
                    unAuthorized: !draftConfigData.isAppAdmin,
                }
            } catch {
                draftData = {
                    ...draftConfigData,
                    parsedData: { appId: 0, configData: [], id: 0, isDeletable: false },
                    unAuthorized: !draftConfigData.isAppAdmin,
                }
            }
        }
    }

    // MAIN DATA PROCESSING
    if (cmSecretConfigDataRes.status === 'fulfilled') {
        const cmSecretConfigData = cmSecretConfigDataRes.value

        if (cmSecretConfigData) {
            const configData = isJob
                ? (cmSecretConfigData as ConfigMapSecretDataType).configData
                : (cmSecretConfigData as AppEnvDeploymentConfigDTO)[!isSecret ? 'configMapData' : 'secretsData'].data
                      .configData

            // Since, jobs can only be created by super-admin users, modify this once API support is available.
            const unAuthorized = isJob ? false : !(cmSecretConfigData as AppEnvDeploymentConfigDTO).isAppAdmin
            // Flag from the API to disable the delete operation.
            isDeleteDisabled =
                !isJob &&
                !(cmSecretConfigData as AppEnvDeploymentConfigDTO)[!isSecret ? 'configMapData' : 'secretsData'].data
                    .isDeletable

            if (configData?.length) {
                configMapSecretData = {
                    ...configData[0],
                    unAuthorized,
                }
            }
        } else if (draftConfigDataRes.status === 'fulfilled') {
            const draftConfigData = draftConfigDataRes.value

            if (draftConfigData && draftConfigData.draftState === DraftState.Published) {
                configMapSecretData = {
                    ...JSON.parse(draftConfigData.data).configData[0],
                    unAuthorized: !draftConfigData.isAppAdmin,
                }
            }
        }
    }

    return { configMapSecretData, draftData, isDeleteDisabled }
}

export const getConfigMapSecretInheritedData = ({
    cmSecretConfigDataRes,
    isJob,
    isSecret,
}: {
    cmSecretConfigDataRes: PromiseSettledResult<ConfigMapSecretDataType | AppEnvDeploymentConfigDTO>
    isJob: boolean
    isSecret: boolean
}): CMSecretConfigData => {
    if (
        (cmSecretConfigDataRes.status === 'fulfilled' && !cmSecretConfigDataRes.value) ||
        cmSecretConfigDataRes.status === 'rejected'
    ) {
        return null
    }

    const cmSecretConfigData = cmSecretConfigDataRes.value
    return isJob
        ? { ...(cmSecretConfigData as ConfigMapSecretDataType).configData[0], unAuthorized: false }
        : {
              ...(cmSecretConfigData as AppEnvDeploymentConfigDTO)[!isSecret ? 'configMapData' : 'secretsData'].data
                  .configData[0],
              unAuthorized: !(cmSecretConfigData as AppEnvDeploymentConfigDTO).isAppAdmin,
          }
}

export const getConfigMapSecretResolvedData = (
    resolvedData: string,
): {
    resolvedFormData: ConfigMapSecretUseFormProps
    resolvedInheritedConfigMapSecretData: CMSecretConfigData
    resolvedConfigMapSecretData: CMSecretConfigData
    resolvedDraftData: CMSecretDraftData
} => {
    const parsedResolvedData = YAML.parse(resolvedData)

    return {
        resolvedFormData: parsedResolvedData.formData
            ? { ...parsedResolvedData.formData, yaml: getYAMLWithStringifiedNumbers(parsedResolvedData.formData.yaml) }
            : null,
        resolvedInheritedConfigMapSecretData: getConfigMapSecretEncodedData({
            configMapSecretData: parsedResolvedData.inheritedConfigMapSecretData,
        }),
        resolvedConfigMapSecretData: getConfigMapSecretEncodedData({
            configMapSecretData: parsedResolvedData.configMapSecretData,
        }),
        resolvedDraftData: getConfigMapSecretEncodedData({
            configMapSecretData: parsedResolvedData.draftData,
            isDraft: true,
        }),
    }
}

export const getDryRunConfigMapSecretData = ({
    cmSecretStateLabel,
    draftData,
    inheritedConfigMapSecretData,
    publishedConfigMapSecretData,
    dryRunEditorMode,
    formData,
}: Pick<
    ConfigMapSecretDryRunProps,
    | 'formData'
    | 'dryRunEditorMode'
    | 'cmSecretStateLabel'
    | 'inheritedConfigMapSecretData'
    | 'publishedConfigMapSecretData'
    | 'draftData'
>) => {
    let configMapSecretData: CMSecretConfigData =
        cmSecretStateLabel === CM_SECRET_STATE.INHERITED ? inheritedConfigMapSecretData : publishedConfigMapSecretData

    if (draftData) {
        if (draftData.action === DraftAction.Delete) {
            configMapSecretData = inheritedConfigMapSecretData
        } else if (draftData.draftState === DraftState.Init || draftData.draftState === DraftState.AwaitApproval) {
            configMapSecretData = {
                ...draftData.parsedData.configData[0],
                unAuthorized: !draftData.isAppAdmin,
            }
        }
    }

    if (!configMapSecretData?.unAuthorized && dryRunEditorMode === DryRunEditorMode.VALUES_FROM_DRAFT) {
        const payload = getConfigMapSecretPayload(formData)
        const inheritedData = inheritedConfigMapSecretData?.data || {}

        configMapSecretData = {
            ...((configMapSecretData || {}) as CMSecretConfigData),
            ...payload,
            ...(payload.mergeStrategy === OverrideMergeStrategyType.PATCH
                ? {
                      data: applyCompareDiffOnUneditedDocument(inheritedData, {
                          ...inheritedData,
                          ...payload.data,
                      }),
                  }
                : {}),
        }
    } else if (dryRunEditorMode === DryRunEditorMode.PUBLISHED_VALUES) {
        configMapSecretData = publishedConfigMapSecretData ?? null
    }

    return configMapSecretData
}

export const getConfigMapSecretDataType = (
    external: boolean,
    externalType: CMSecretExternalType,
    isSecret: boolean,
) => {
    if (!isSecret) {
        return configMapDataTypeOptions.find(({ value }) =>
            external && externalType === ''
                ? value === CMSecretExternalType.KubernetesConfigMap
                : value === externalType,
        ).label as string
    }

    return external && externalType === ''
        ? CMSecretExternalType.KubernetesSecret
        : (getSelectPickerOptionByValue(getSecretDataTypeOptions(false, true), externalType).label as string)
}

export const getConfigMapSecretKeyValueTableRows = (data: KeyValueTableData[]): KeyValueTableProps['initialRows'] =>
    data.map(({ key, value, id }) => ({
        data: {
            key: {
                value: key,
            },
            value: {
                value: typeof value === 'object' ? YAMLStringify(value) : value.toString(),
            },
        },
        id,
    }))

export const getExpressEditComparisonViewLHS = ({
    isDraft,
    draftData,
    publishedConfigMapSecretData,
    isSecret,
    hasPublishedConfig,
}: {
    isDraft: boolean
    draftData: CMSecretDraftData
    publishedConfigMapSecretData: CMSecretConfigData
    isSecret: boolean
    hasPublishedConfig: boolean
}) => {
    if (isDraft && draftData) {
        return getConfigMapSecretFormInitialValues({
            configMapSecretData: { ...draftData.parsedData.configData[0], unAuthorized: false },
            cmSecretStateLabel: null,
            fallbackMergeStrategy: null,
            componentType: isSecret ? CMSecretComponentType.Secret : CMSecretComponentType.ConfigMap,
        })
    }

    if (hasPublishedConfig && publishedConfigMapSecretData) {
        return getConfigMapSecretFormInitialValues({
            configMapSecretData: publishedConfigMapSecretData,
            cmSecretStateLabel: null,
            fallbackMergeStrategy: null,
            componentType: isSecret ? CMSecretComponentType.Secret : CMSecretComponentType.ConfigMap,
        })
    }

    return null
}

export const getCMCSExpressEditComparisonDataDiffConfig = ({
    lhs,
    rhs,
    onMergeStrategySelect,
}: {
    lhs: ConfigMapSecretUseFormProps
    rhs: ConfigMapSecretUseFormProps
    onMergeStrategySelect: (newValue: SelectPickerOptionType) => void
}) => [
    ...(rhs.mergeStrategy
        ? [
              {
                  title: 'Merge strategy',
                  lhs: {
                      displayValue: lhs?.mergeStrategy,
                  },
                  rhs: {
                      value: rhs.mergeStrategy,
                      dropdownConfig: {
                          options: MERGE_STRATEGY_OPTIONS,
                          onChange: onMergeStrategySelect,
                      },
                  },
              },
          ]
        : []),
    {
        title: 'Data type',
        lhs: {
            displayValue: lhs ? getConfigMapSecretDataType(lhs.external, lhs.externalType, rhs.isSecret) : null,
        },
        rhs: {
            displayValue: getConfigMapSecretDataType(rhs.external, rhs.externalType, rhs.isSecret),
        },
    },
    {
        title: 'Mount data as',
        lhs: {
            displayValue: lhs ? configMapSecretMountDataMap[lhs.selectedType].title : null,
        },
        rhs: {
            displayValue: configMapSecretMountDataMap[rhs.selectedType].title,
        },
    },
    {
        title: 'Volume mount path',
        lhs: {
            displayValue: lhs?.volumeMountPath,
        },
        rhs: {
            displayValue: rhs.volumeMountPath,
        },
    },
    {
        title: 'Set Sub Path',
        lhs: {
            displayValue:
                (configMapSecretMountDataMap[lhs?.selectedType]?.value === 'volume' &&
                    (lhs?.isSubPathChecked ? 'True' : 'False')) ||
                '',
        },
        rhs: {
            displayValue:
                (configMapSecretMountDataMap[rhs.selectedType].value === 'volume' &&
                    (rhs.isSubPathChecked ? 'True' : 'False')) ||
                '',
        },
    },
    {
        title: 'Subpath Values',
        lhs: {
            displayValue: lhs?.externalSubpathValues,
        },
        rhs: {
            displayValue: rhs.externalSubpathValues,
        },
    },
    {
        title: 'File Permission',
        lhs: {
            displayValue: lhs?.filePermission,
        },
        rhs: {
            displayValue: rhs.filePermission,
        },
    },
    {
        title: 'Role ARN',
        lhs: {
            displayValue: lhs?.roleARN,
        },
        rhs: {
            displayValue: rhs.roleARN,
        },
    },
]

export const getConfigMapSecretError = <T extends unknown>(res: PromiseSettledResult<T>) =>
    res.status === 'rejected' && res.reason?.code !== ERROR_STATUS_CODE.NOT_FOUND ? res.reason : null

export const parseConfigMapSecretSearchParams = (searchParams: URLSearchParams): ConfigMapSecretQueryParamsType => {
    const headerTab = searchParams.get('headerTab') as ConfigMapSecretQueryParamsType['headerTab']

    return {
        headerTab: Object.values(ConfigHeaderTabType).includes(headerTab) ? headerTab : null,
    }
}
// DATA UTILS ----------------------------------------------------------------
