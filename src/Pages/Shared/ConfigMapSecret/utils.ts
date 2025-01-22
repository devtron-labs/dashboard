import YAML from 'yaml'

import {
    AppEnvDeploymentConfigDTO,
    applyCompareDiffOnUneditedDocument,
    ConfigHeaderTabType,
    ConfigMapSecretDataType,
    decode,
    DEFAULT_SECRET_PLACEHOLDER,
    DraftAction,
    DraftMetadataDTO,
    DraftState,
    DryRunEditorMode,
    ERROR_STATUS_CODE,
    OverrideMergeStrategyType,
    YAMLStringify,
    ConfigMapSecretUseFormProps,
    CM_SECRET_STATE,
    CMSecretConfigData,
    getConfigMapSecretPayload,
} from '@devtron-labs/devtron-fe-common-lib'

import { ResourceConfigStage } from '@Pages/Applications/DevtronApps/service.types'

import {
    ConfigMapSecretFormProps,
    CMSecretDraftData,
    ConfigMapSecretDecodedDataReturnType,
    ConfigMapSecretDecodedDataProps,
    ConfigMapSecretEncodedDataProps,
    ConfigMapSecretEncodedDataReturnType,
    ConfigMapSecretQueryParamsType,
    ConfigMapSecretDryRunProps,
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

export const getConfigMapSecretError = <T extends unknown>(res: PromiseSettledResult<T>) =>
    res.status === 'rejected' && res.reason?.code !== ERROR_STATUS_CODE.NOT_FOUND ? res.reason : null

export const parseConfigMapSecretSearchParams = (searchParams: URLSearchParams): ConfigMapSecretQueryParamsType => {
    const headerTab = searchParams.get('headerTab') as ConfigMapSecretQueryParamsType['headerTab']

    return {
        headerTab: Object.values(ConfigHeaderTabType).includes(headerTab) ? headerTab : null,
    }
}
// DATA UTILS ----------------------------------------------------------------
