import YAML from 'yaml'

import {
    AppEnvDeploymentConfigDTO,
    applyCompareDiffOnUneditedDocument,
    CMSecretExternalType,
    ConfigHeaderTabType,
    ConfigMapSecretDataType,
    decode,
    DEFAULT_SECRET_PLACEHOLDER,
    DraftAction,
    DraftMetadataDTO,
    DraftState,
    DryRunEditorMode,
    ERROR_STATUS_CODE,
    getSelectPickerOptionByValue,
    hasESO,
    OverrideMergeStrategyType,
    YAMLStringify,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'

import { ResourceConfigStage } from '@Pages/Applications/DevtronApps/service.types'

import { DEFAULT_MERGE_STRATEGY } from '@Pages/Applications/DevtronApps/Details/AppConfigurations/MainContent/constants'
import {
    CODE_EDITOR_RADIO_STATE,
    CONFIG_MAP_SECRET_DEFAULT_CURRENT_DATA,
    configMapDataTypeOptions,
    configMapSecretMountDataMap,
    getSecretDataTypeOptions,
} from './constants'
import {
    CMSecretYamlData,
    ConfigMapSecretFormProps,
    ConfigMapSecretUseFormProps,
    CMSecretComponentType,
    CM_SECRET_STATE,
    CMSecretDraftData,
    CMSecretPayloadType,
    CMSecretConfigData,
    ESOSecretData,
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
const secureValues = (data: Record<string, string>, decodeData: boolean): CMSecretYamlData[] => {
    let decodedData = data || DEFAULT_SECRET_PLACEHOLDER

    if (decodeData) {
        try {
            decodedData = decode(data)
        } catch {
            noop()
        }
    }

    return Object.keys(decodedData).map((k, id) => ({
        k,
        v: typeof decodedData[k] === 'object' ? YAMLStringify(decodedData[k]) : decodedData[k],
        id,
    }))
}

const processCurrentData = ({
    configMapSecretData,
    cmSecretStateLabel,
    isSecret,
}: Pick<ConfigMapSecretFormProps, 'configMapSecretData' | 'cmSecretStateLabel'> & {
    isSecret: boolean
}) => {
    if (configMapSecretData.mergeStrategy === OverrideMergeStrategyType.PATCH) {
        if (configMapSecretData.patchData) {
            return secureValues(configMapSecretData.patchData, isSecret && configMapSecretData.externalType === '')
        }

        return CONFIG_MAP_SECRET_DEFAULT_CURRENT_DATA
    }

    if (configMapSecretData.data) {
        return secureValues(configMapSecretData.data, isSecret && configMapSecretData.externalType === '')
    }

    if (cmSecretStateLabel === CM_SECRET_STATE.INHERITED && configMapSecretData.defaultData) {
        return secureValues(configMapSecretData.defaultData, isSecret && configMapSecretData.externalType === '')
    }

    return CONFIG_MAP_SECRET_DEFAULT_CURRENT_DATA
}

const processExternalSubPathValues = ({
    data,
    esoSubPath,
    external,
    subPath,
}: Pick<CMSecretConfigData, 'data' | 'esoSubPath' | 'subPath' | 'external'>) => {
    if (subPath && external && data) {
        return Object.keys(data).join(', ')
    }
    if (esoSubPath) {
        return esoSubPath.join(', ')
    }
    return ''
}

export const convertYAMLToKeyValuePair = (yaml: string): CMSecretYamlData[] => {
    try {
        const obj = yaml && YAML.parse(yaml)
        if (typeof obj !== 'object') {
            throw new Error()
        }
        const keyValueArray: CMSecretYamlData[] = Object.keys(obj).reduce((agg, k, id) => {
            if (!k && !obj[k]) {
                return CONFIG_MAP_SECRET_DEFAULT_CURRENT_DATA
            }
            const v = obj[k] && typeof obj[k] === 'object' ? YAMLStringify(obj[k]) : obj[k].toString()

            return [...agg, { k, v: v ?? '', id }]
        }, [])
        return keyValueArray
    } catch {
        return CONFIG_MAP_SECRET_DEFAULT_CURRENT_DATA
    }
}

export const convertKeyValuePairToYAML = (currentData: CMSecretYamlData[]) =>
    currentData.length ? YAMLStringify(currentData.reduce((agg, { k, v }) => ({ ...agg, [k]: v }), {})) : ''

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

const getSecretDataFromConfigData = ({
    secretData,
    defaultSecretData,
    esoSecretData: baseEsoSecretData,
    defaultESOSecretData,
}: ConfigMapSecretFormProps['configMapSecretData']): Pick<
    ConfigMapSecretUseFormProps,
    'secretDataYaml' | 'esoSecretYaml'
> => {
    let jsonForSecretDataYaml: string

    if (secretData?.length) {
        jsonForSecretDataYaml = YAMLStringify(secretData)
    } else if (defaultSecretData?.length) {
        jsonForSecretDataYaml = YAMLStringify(defaultSecretData)
    }

    const esoSecretData: Record<string, any> =
        !(baseEsoSecretData?.esoData || []).length &&
        !baseEsoSecretData?.template &&
        !baseEsoSecretData?.esoDataFrom &&
        defaultESOSecretData
            ? defaultESOSecretData
            : baseEsoSecretData

    const isEsoSecretData: boolean =
        (esoSecretData?.secretStore || esoSecretData?.secretStoreRef) &&
        (esoSecretData.esoData || esoSecretData.template || esoSecretData.esoDataFrom)

    return {
        secretDataYaml: jsonForSecretDataYaml ?? '',
        esoSecretYaml: isEsoSecretData ? YAMLStringify(esoSecretData) : '',
    }
}

export const getConfigMapSecretFormInitialValues = ({
    isJob,
    configMapSecretData,
    cmSecretStateLabel,
    componentType,
    skipValidation = false,
}: Pick<ConfigMapSecretFormProps, 'isJob' | 'cmSecretStateLabel' | 'componentType' | 'configMapSecretData'> & {
    skipValidation?: boolean
}): ConfigMapSecretUseFormProps => {
    const isSecret = componentType === CMSecretComponentType.Secret

    const {
        name,
        external,
        externalType,
        type,
        mountPath,
        defaultMountPath,
        subPath,
        data,
        defaultData,
        filePermission,
        roleARN,
        esoSubPath,
    } = configMapSecretData || {}

    const commonInitialValues: ConfigMapSecretUseFormProps = {
        name: name ?? '',
        isSecret,
        external: external ?? false,
        externalType: externalType ?? CMSecretExternalType.Internal,
        selectedType: type ?? configMapSecretMountDataMap.environment.value,
        isFilePermissionChecked: !!filePermission,
        isSubPathChecked: !!subPath,
        filePermission: filePermission ?? '',
        volumeMountPath: mountPath ?? defaultMountPath ?? '',
        roleARN: roleARN ?? '',
        yamlMode: true,
        hasCurrentDataErr: false,
        isResolvedData: false,
        skipValidation,
        currentData: null,
        esoSecretYaml: null,
        externalSubpathValues: null,
        mergeStrategy: null,
        secretDataYaml: null,
        yaml: null,
    }

    if (configMapSecretData) {
        const defaultMergeStrategy = isJob || external ? OverrideMergeStrategyType.REPLACE : DEFAULT_MERGE_STRATEGY
        const mergeStrategy =
            configMapSecretData.mergeStrategy ||
            (cmSecretStateLabel === CM_SECRET_STATE.INHERITED ? defaultMergeStrategy : null)

        const currentData = processCurrentData({
            configMapSecretData: { ...configMapSecretData, mergeStrategy },
            cmSecretStateLabel,
            isSecret,
        })

        return {
            ...commonInitialValues,
            externalSubpathValues: processExternalSubPathValues({
                data: data || defaultData,
                external,
                subPath,
                esoSubPath,
            }),
            yaml: convertKeyValuePairToYAML(currentData),
            currentData,
            mergeStrategy,
            ...getSecretDataFromConfigData(configMapSecretData),
        }
    }

    return {
        ...commonInitialValues,
        externalSubpathValues: '',
        yaml: '"": ""\n',
        currentData: CONFIG_MAP_SECRET_DEFAULT_CURRENT_DATA,
        esoSecretYaml: '{}',
        secretDataYaml: '[]',
        mergeStrategy: null,
    }
}

export const getConfigMapSecretReadOnlyValues = ({
    configMapSecretData,
    cmSecretStateLabel,
    componentType,
    isJob,
}: Pick<ConfigMapSecretFormProps, 'componentType' | 'configMapSecretData' | 'cmSecretStateLabel' | 'isJob'>) => {
    if (!configMapSecretData) {
        return {
            configData: [],
            data: null,
        }
    }

    const {
        external,
        externalType,
        esoSecretYaml,
        externalSubpathValues,
        filePermission,
        isSubPathChecked,
        roleARN,
        secretDataYaml,
        selectedType,
        volumeMountPath,
        yaml,
        currentData,
        isSecret,
    } = getConfigMapSecretFormInitialValues({
        isJob,
        configMapSecretData,
        cmSecretStateLabel,
        componentType,
    })
    const mountExistingExternal =
        external && externalType === (isSecret ? CMSecretExternalType.KubernetesSecret : CMSecretExternalType.Internal)

    let dataType = ''
    if (!isSecret) {
        dataType = configMapDataTypeOptions.find(({ value }) =>
            external && externalType === ''
                ? value === CMSecretExternalType.KubernetesConfigMap
                : value === externalType,
        ).label as string
    } else {
        dataType =
            external && externalType === ''
                ? CMSecretExternalType.KubernetesSecret
                : (getSelectPickerOptionByValue(getSecretDataTypeOptions(isJob, true), externalType).label as string)
    }

    return {
        configData: [
            {
                displayName: 'DataType',
                value: dataType,
                key: 'dataType',
            },
            {
                displayName: 'Mount data as',
                value: configMapSecretMountDataMap[selectedType].title,
                key: 'mountDataAs',
            },
            {
                displayName: 'Volume mount path',
                value: volumeMountPath,
                key: 'volumeMountPath',
            },
            {
                displayName: 'Set Sub Path',
                value:
                    (configMapSecretMountDataMap[selectedType].value === 'volume' &&
                        (isSubPathChecked ? 'True' : 'False')) ||
                    '',
                key: 'setSubPath',
            },
            {
                displayName: 'Subpath Values',
                value: externalSubpathValues,
                key: 'externalSubpathValues',
            },
            {
                displayName: 'File Permission',
                value: filePermission,
                key: 'filePermission',
            },
            {
                displayName: 'Role ARN',
                value: roleARN,
                key: 'roleArn',
            },
        ],
        data: !mountExistingExternal ? (currentData?.[0]?.k && yaml) || esoSecretYaml || secretDataYaml : null,
    }
}
// FORM UTILS ----------------------------------------------------------------

// PAYLOAD UTILS ----------------------------------------------------------------
export const getESOSecretDataFromYAML = (yaml: string): ESOSecretData => {
    try {
        const json = YAML.parse(yaml)
        if (typeof json === 'object') {
            const payload = {
                secretStore: json.secretStore,
                secretStoreRef: json.secretStoreRef,
                refreshInterval: json.refreshInterval,
                // if null don't send these keys which is achieved by `undefined`
                esoData: undefined,
                esoDataFrom: undefined,
                template: undefined,
            }
            if (Array.isArray(json?.esoData)) {
                payload.esoData = json.esoData
            }
            if (Array.isArray(json?.esoDataFrom)) {
                payload.esoDataFrom = json.esoDataFrom
            }
            if (typeof json?.template === 'object' && !Array.isArray(json.template)) {
                payload.template = json.template
            }
            return payload
        }
        return null
    } catch {
        return null
    }
}

export const getConfigMapSecretPayload = ({
    isSecret,
    external,
    externalType,
    externalSubpathValues,
    yaml,
    yamlMode,
    currentData,
    esoSecretYaml,
    filePermission,
    name,
    selectedType,
    isFilePermissionChecked,
    roleARN,
    volumeMountPath,
    isSubPathChecked,
    mergeStrategy,
}: ConfigMapSecretUseFormProps) => {
    const isESO = isSecret && hasESO(externalType)
    const _currentData = yamlMode ? convertYAMLToKeyValuePair(yaml) : currentData
    const data = _currentData.reduce((acc, curr) => {
        if (!curr.k) {
            return acc
        }
        const value = curr.v ?? ''

        return {
            ...acc,
            [curr.k]: isSecret && externalType === '' ? btoa(value) : value,
        }
    }, {})

    const payload: CMSecretPayloadType = {
        name,
        type: selectedType,
        external,
        data,
        roleARN: null,
        externalType: null,
        esoSecretData: null,
        mountPath: null,
        subPath: null,
        filePermission: null,
        esoSubPath: null,
        mergeStrategy,
    }

    if (
        (isSecret && externalType === CMSecretExternalType.KubernetesSecret) ||
        (!isSecret && external) ||
        (isSecret && isESO)
    ) {
        delete payload[CODE_EDITOR_RADIO_STATE.DATA]
    }
    if (isSecret) {
        payload.roleARN = ''
        payload.externalType = externalType

        if (isESO) {
            const esoSecretData = getESOSecretDataFromYAML(esoSecretYaml)
            if (esoSecretData) {
                payload.esoSecretData = {
                    secretStore: esoSecretData.secretStore,
                    esoData: esoSecretData.esoData,
                    secretStoreRef: esoSecretData.secretStoreRef,
                    refreshInterval: esoSecretData.refreshInterval,
                    esoDataFrom: esoSecretData.esoDataFrom,
                    template: esoSecretData.template,
                }
                payload.roleARN = roleARN
                if (isSubPathChecked && externalSubpathValues) {
                    payload.esoSubPath = externalSubpathValues.replace(/\s+/g, '').split(',')
                }
            }
        }
    }
    if (selectedType === configMapSecretMountDataMap.volume.value) {
        payload.mountPath = volumeMountPath
        payload.subPath = isSubPathChecked
        if (isFilePermissionChecked) {
            payload.filePermission = filePermission.length === 3 ? `0${filePermission}` : `${filePermission}`
        }

        if (
            isSubPathChecked &&
            ((isSecret && externalType === CMSecretExternalType.KubernetesSecret) || (!isSecret && external))
        ) {
            const externalSubpathKey = externalSubpathValues.replace(/\s+/g, '').split(',')
            const secretKeys = {}
            externalSubpathKey.forEach((key) => {
                secretKeys[key] = ''
            })
            payload.data = secretKeys
        }
    }

    return payload
}

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
