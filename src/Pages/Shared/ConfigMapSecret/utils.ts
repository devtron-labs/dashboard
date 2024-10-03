import YAML from 'yaml'

import {
    AppEnvDeploymentConfigDTO,
    decode,
    DraftAction,
    DraftMetadataDTO,
    DraftState,
    getSelectPickerOptionByValue,
    ToastManager,
    ToastVariantType,
    YAMLStringify,
} from '@devtron-labs/devtron-fe-common-lib'

import { ResourceConfigStage } from '@Pages/Applications/DevtronApps/service.types'

import { CMSecret, CMSecretConfigData } from '../ConfigMapSecretOld/ConfigMapSecret.types'
import {
    CODE_EDITOR_RADIO_STATE,
    configMapDataTypeOptions,
    configMapSecretMountDataMap,
    getSecretDataTypeOptions,
} from './constants'
import {
    CMSecretYamlData,
    ConfigMapSecretFormProps,
    ConfigMapSecretUseFormProps,
    CMSecretExternalType,
    CMSecretComponentType,
    CM_SECRET_STATE,
    CMSecretDraftData,
    CMSecretPayloadType,
} from './types'

// HELPERS UTILS ----------------------------------------------------------------
export const hasHashiOrAWS = (externalType: CMSecretExternalType): boolean =>
    externalType === CMSecretExternalType.AWSSecretsManager ||
    externalType === CMSecretExternalType.AWSSystemManager ||
    externalType === CMSecretExternalType.HashiCorpVault

export const hasESO = (externalType: CMSecretExternalType): boolean =>
    externalType === CMSecretExternalType.ESO_GoogleSecretsManager ||
    externalType === CMSecretExternalType.ESO_AzureSecretsManager ||
    externalType === CMSecretExternalType.ESO_AWSSecretsManager ||
    externalType === CMSecretExternalType.ESO_HashiCorpVault

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
const secureValues = (data: Record<string, string>, decodeData: boolean, hideData: boolean) => {
    const decodedData = decodeData ? decode(data) : data
    const hiddenData = hideData && Array(8).fill('*').join('')
    return Object.keys(decodedData).map((k, id) => ({
        k,
        v:
            typeof decodedData[k] === 'object'
                ? hiddenData || YAMLStringify(decodedData[k])
                : hiddenData || decodedData[k],
        keyError: '',
        valueError: '',
        id,
    }))
}

export const processCurrentData = (
    configMapSecretData: CMSecretConfigData,
    cmSecretStateLabel: CM_SECRET_STATE,
    componentType: CMSecretComponentType,
) => {
    if (configMapSecretData?.data) {
        return secureValues(
            configMapSecretData.data,
            componentType === CMSecretComponentType.Secret && configMapSecretData.externalType === '',
            componentType === CMSecretComponentType.Secret && configMapSecretData.unAuthorized,
        )
    }
    if (cmSecretStateLabel === CM_SECRET_STATE.INHERITED && configMapSecretData?.defaultData) {
        return secureValues(
            configMapSecretData.defaultData,
            componentType === CMSecretComponentType.Secret && configMapSecretData.externalType === '',
            componentType === CMSecretComponentType.Secret && configMapSecretData.unAuthorized,
        )
    }
    return [{ k: '', v: '', keyError: '', valueError: '' }]
}

export const convertYAMLToKeyValuePair = (yaml: string): CMSecretYamlData[] => {
    if (!yaml) {
        return []
    }

    try {
        const obj = YAML.parse(yaml)
        if (typeof obj === 'object') {
            const keyValueArray: CMSecretYamlData[] = Object.keys(obj).reduce((agg, k, id) => {
                if (!k && !obj[k]) {
                    return agg
                }
                const v = obj[k] && typeof obj[k] === 'object' ? YAMLStringify(obj[k]) : obj[k].toString()

                return [...agg, { k, v: v ?? '', keyError: '', valueError: '', id }]
            }, [])
            return keyValueArray
        }

        return []
    } catch {
        return []
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

        return { ...agg, [k]: Array(8).fill('*').join('') }
    }, obj)

    return YAMLStringify(keyValueArray)
}

export const getSecretDataFromConfigData = (
    configMapSecretData: ConfigMapSecretFormProps['configMapSecretData'],
): Pick<ConfigMapSecretUseFormProps, 'secretDataYaml' | 'esoSecretYaml'> => {
    let jsonForSecretDataYaml: string

    if (configMapSecretData?.secretData?.length) {
        jsonForSecretDataYaml = YAMLStringify(configMapSecretData.secretData)
    } else if (configMapSecretData?.defaultSecretData?.length) {
        jsonForSecretDataYaml = YAMLStringify(configMapSecretData.defaultSecretData)
    }

    const esoSecretData: Record<string, any> =
        (configMapSecretData?.esoSecretData?.esoData || []).length === 0 && configMapSecretData?.defaultESOSecretData
            ? configMapSecretData?.defaultESOSecretData
            : configMapSecretData?.esoSecretData

    const isEsoSecretData: boolean =
        (esoSecretData?.secretStore || esoSecretData?.secretStoreRef) && esoSecretData.esoData

    return {
        secretDataYaml: jsonForSecretDataYaml ?? '',
        esoSecretYaml: isEsoSecretData ? YAMLStringify(esoSecretData) : '',
    }
}

export const getConfigMapSecretFormInitialValues = ({
    configMapSecretData,
    cmSecretStateLabel,
    componentType,
}: Pick<
    ConfigMapSecretFormProps,
    'cmSecretStateLabel' | 'componentType' | 'configMapSecretData'
>): ConfigMapSecretUseFormProps => {
    const isSecret = componentType === CMSecretComponentType.Secret

    if (configMapSecretData) {
        const {
            name,
            external,
            externalType,
            type,
            mountPath,
            defaultMountPath,
            subPath,
            data,
            filePermission,
            roleARN,
        } = configMapSecretData
        const currentData = processCurrentData(
            configMapSecretData,
            cmSecretStateLabel,
            componentType,
        ) as CMSecretYamlData[]

        return {
            name,
            isSecret,
            externalType: (externalType as CMSecretExternalType) ?? CMSecretExternalType.Internal,
            external,
            selectedType: type ?? configMapSecretMountDataMap.environment.value,
            isFilePermissionChecked: !!filePermission,
            isSubPathChecked: !!subPath,
            externalSubpathValues:
                isSecret && subPath && externalType === CMSecretExternalType.KubernetesSecret && data
                    ? Object.keys(data).join(',')
                    : '',
            filePermission: filePermission ?? '',
            volumeMountPath: mountPath ?? defaultMountPath ?? '',
            roleARN: roleARN ?? '',
            yamlMode: true,
            yaml: convertKeyValuePairToYAML(currentData),
            currentData,
            hasCurrentDataErr: false,
            ...getSecretDataFromConfigData(configMapSecretData),
        }
    }

    return {
        name: '',
        isSecret,
        externalType: CMSecretExternalType.Internal,
        external: false,
        selectedType: configMapSecretMountDataMap.environment.value,
        isFilePermissionChecked: false,
        isSubPathChecked: false,
        externalSubpathValues: '',
        filePermission: '',
        volumeMountPath: '',
        roleARN: '',
        yamlMode: true,
        yaml: '"": ""',
        currentData: [],
        hasCurrentDataErr: false,
        esoSecretYaml: '{}',
        secretDataYaml: '[]',
    }
}

export const getConfigMapSecretReadOnlyValues = ({
    configMapSecretData,
    componentType,
}: Pick<ConfigMapSecretFormProps, 'componentType' | 'configMapSecretData'>) => {
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
    } = getConfigMapSecretFormInitialValues({
        configMapSecretData,
        cmSecretStateLabel: CM_SECRET_STATE.INHERITED,
        componentType,
    })

    let dataType = ''
    if (componentType === CMSecretComponentType.ConfigMap) {
        dataType = configMapDataTypeOptions.find(({ value }) =>
            external && externalType === ''
                ? value === CMSecretExternalType.KubernetesConfigMap
                : value === externalType,
        ).label as string
    } else {
        dataType =
            external && externalType === ''
                ? CMSecretExternalType.KubernetesSecret
                : (getSelectPickerOptionByValue(getSecretDataTypeOptions(false), externalType).label as string)
    }

    return {
        configData: [
            {
                displayName: 'DataType',
                value: dataType,
            },
            {
                displayName: 'Mount data as',
                value: configMapSecretMountDataMap[selectedType].title,
            },
            {
                displayName: 'Volume mount path',
                value: volumeMountPath,
            },
            {
                displayName: 'Set Sub Path',
                value:
                    (configMapSecretMountDataMap[selectedType].value === 'volume' && isSubPathChecked
                        ? 'True'
                        : 'False') || '',
            },
            {
                displayName: 'External Subpath Values',
                value: externalSubpathValues,
            },
            {
                displayName: 'File Permission',
                value: filePermission,
            },
            {
                displayName: 'Role ARN',
                value: roleARN,
            },
        ],
        data: (currentData?.[0]?.k && yaml) || esoSecretYaml || secretDataYaml,
    }
}
// FORM UTILS ----------------------------------------------------------------

// PAYLOAD UTILS ----------------------------------------------------------------
export const transformSecretDataJSON = (jsonObj: any[]) =>
    jsonObj.map((j) => {
        const temp = {
            isBinary: null,
            fileName: null,
            name: null,
            property: null,
            value: null,
        }
        temp.isBinary = j.isBinary
        if (j.key) {
            temp.fileName = j.key
        }
        if (j.property) {
            temp.property = j.property
        }
        if (j.name) {
            temp.name = j.name
        }
        return temp
    })

const getSecretDataFromYAML = (yaml: string) => {
    try {
        const json = YAML.parse(yaml)
        if (Array.isArray(json)) {
            return transformSecretDataJSON(json)
        }
        return []
    } catch {
        return []
    }
}

const getESOSecretDataFromYAML = (yaml: string) => {
    try {
        const json = YAML.parse(yaml)
        const payload = {
            secretStore: json.secretStore,
            secretStoreRef: json.secretStoreRef,
            refreshInterval: json.refreshInterval,
            esoData: null,
        }
        if (Array.isArray(json?.esoData)) {
            payload.esoData = json.esoData
        }
        return payload
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
    secretDataYaml,
    volumeMountPath,
    isSubPathChecked,
}: ConfigMapSecretUseFormProps) => {
    const isESO = isSecret && hasESO(externalType)
    const isHashiOrAWS = isSecret && hasHashiOrAWS(externalType)
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
        secretData: null,
        esoSecretData: null,
        mountPath: null,
        subPath: null,
        filePermission: null,
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

        if (isHashiOrAWS) {
            const secretData = getSecretDataFromYAML(secretDataYaml)
            payload.secretData = secretData
                .map((s) => ({
                    key: s.fileName,
                    name: s.name,
                    isBinary: s.isBinary,
                    property: s.property,
                }))
                .filter((s) => s.key || s.name || s.property)
            payload.roleARN = roleARN
        } else if (isESO) {
            const esoSecretData = getESOSecretDataFromYAML(esoSecretYaml)
            if (esoSecretData) {
                payload.esoSecretData = {
                    secretStore: esoSecretData.secretStore,
                    esoData: esoSecretData.esoData,
                    secretStoreRef: esoSecretData.secretStoreRef,
                    refreshInterval: esoSecretData.refreshInterval,
                }
                payload.roleARN = roleARN
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
// PAYLOAD UTILS ----------------------------------------------------------------

// DATA UTILS ----------------------------------------------------------------
export const getConfigMapSecretDraftAndPublishedData = ({
    isJob,
    cmSecretStateLabel,
    isSecret,
    configStage,
    name,
    componentName,
    cmSecretConfigData,
    draftConfigData,
}: {
    isJob: boolean
    cmSecretStateLabel: CM_SECRET_STATE
    isSecret: boolean
    configStage: ResourceConfigStage
    name: string
    componentName: string
    cmSecretConfigData: CMSecret | AppEnvDeploymentConfigDTO
    draftConfigData: DraftMetadataDTO
}) => {
    const data: {
        configMapSecretData: CMSecretConfigData
        draftData: CMSecretDraftData
    } = { configMapSecretData: null, draftData: null }

    let hasNotFoundErr = false

    // DRAFT DATA PROCESSING
    let draftId: number
    let draftState: DraftState
    if (
        draftConfigData &&
        (draftConfigData.draftState === DraftState.Init || draftConfigData.draftState === DraftState.AwaitApproval)
    ) {
        data.draftData = {
            ...draftConfigData,
            unAuthorized: !draftConfigData.isAppAdmin,
        }
        draftId = draftConfigData.draftId
        draftState = draftConfigData.draftState
    }

    // MAIN DATA PROCESSING
    if (cmSecretConfigData) {
        let configMapSecretData: CMSecretConfigData
        const configData = isJob
            ? (cmSecretConfigData as CMSecret).configData
            : (cmSecretConfigData as AppEnvDeploymentConfigDTO)[!isSecret ? 'configMapData' : 'secretsData'].data
                  .configData

        // Since, jobs can only be created by super-admin users, modify this once API support is available.
        const unAuthorized = isJob ? false : !(cmSecretConfigData as AppEnvDeploymentConfigDTO).isAppAdmin

        if (configData?.length) {
            configMapSecretData = {
                ...configData[0],
                unAuthorized,
                ...(draftId && draftState
                    ? {
                          draftId,
                          draftState,
                      }
                    : {}),
            }
        }

        if (cmSecretStateLabel !== CM_SECRET_STATE.UNPUBLISHED) {
            if (configData?.length) {
                const result: CMSecretConfigData = {
                    ...configData[0],
                    unAuthorized,
                }

                result.overridden = configStage === ResourceConfigStage.Overridden

                if (isSecret && data.draftData) {
                    if (
                        cmSecretStateLabel === CM_SECRET_STATE.INHERITED &&
                        draftState === DraftState.Published &&
                        data.draftData.action === DraftAction.Update
                    ) {
                        result.overridden = true
                    } else if (
                        cmSecretStateLabel === CM_SECRET_STATE.OVERRIDDEN &&
                        draftState === DraftState.Published &&
                        data.draftData.action === DraftAction.Delete
                    ) {
                        result.overridden = false
                    }
                }

                configMapSecretData = {
                    ...result,
                }
                data.configMapSecretData = configMapSecretData
            } else {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: `The ${componentName} '${name}' has been deleted`,
                })
                hasNotFoundErr = true
                data.configMapSecretData = null
            }
        } else if (cmSecretStateLabel === CM_SECRET_STATE.UNPUBLISHED && data.draftData) {
            if (draftState === DraftState.Published) {
                const dataFromDraft = JSON.parse(data.draftData.data).configData[0]
                data.configMapSecretData = {
                    ...dataFromDraft,
                    unAuthorized: !dataFromDraft.isAppAdmin,
                }
            } else if (draftState === DraftState.Discarded) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: `The ${componentName} '${name}' has been deleted`,
                })
                hasNotFoundErr = true
                data.configMapSecretData = null
            }
        }
    }

    return { data, hasNotFoundErr }
}

export const getConfigMapSecretInheritedData = ({
    cmSecretConfigData,
    isJob,
    isSecret,
}: {
    cmSecretConfigData: CMSecret | AppEnvDeploymentConfigDTO
    isJob: boolean
    isSecret: boolean
}): CMSecretConfigData => {
    if (!cmSecretConfigData) {
        return null
    }

    return isJob
        ? { ...(cmSecretConfigData as CMSecret).configData[0], unAuthorized: false }
        : {
              ...(cmSecretConfigData as AppEnvDeploymentConfigDTO)[!isSecret ? 'configMapData' : 'secretsData'].data
                  .configData[0],
              unAuthorized: !(cmSecretConfigData as AppEnvDeploymentConfigDTO).isAppAdmin,
          }
}
// DATA UTILS ----------------------------------------------------------------
