import { PATTERNS } from '../../../config'
import { getSecretInitState } from '../Secret/secret.utils'
import { ConfigMapAction, ConfigMapActionTypes, ConfigMapState } from './ConfigMap.type'
import YAML from 'yaml'

const initialDuplicate = (configMapSecretData, isOverrideView) => {
    if (!isOverrideView) {
        if (configMapSecretData?.data) {
            return Object.keys(configMapSecretData.data).map((k) => ({
                k,
                v:
                    typeof configMapSecretData.data[k] === 'object'
                        ? YAML.stringify(configMapSecretData.data[k], { indent: 2 })
                        : configMapSecretData.data[k],
                keyError: '',
                valueError: '',
            }))
        } else {
            return [{ k: '', v: '', keyError: '', valueError: '' }]
        }
    } else {
        if (configMapSecretData?.data) {
            return configMapSecretData.name && configMapSecretData.global
                ? Object.keys(configMapSecretData.data).map((k) => ({
                      k,
                      v: configMapSecretData.data[k],
                      keyError: '',
                      valueError: '',
                  }))
                : configMapSecretData.data
        } else if (configMapSecretData?.name && configMapSecretData?.global) {
            return (
                configMapSecretData.secretData ||
                (configMapSecretData.esoSecretData?.esoData && configMapSecretData.esoSecretData)
            )
        } else {
            return null
        }
    }
}

export const initState = (configMapSecretData, isOverrideView: boolean, componentType: string): ConfigMapState => {
    const secretInitState = componentType === 'secret' ? getSecretInitState(configMapSecretData, isOverrideView) : {}
    return {
        loading: false,
        dialog: false,
        subPath: configMapSecretData?.subPath ?? '',
        filePermission: { value: configMapSecretData?.filePermission ?? '', error: '' },
        duplicate: initialDuplicate(configMapSecretData, isOverrideView),
        externalValues: configMapSecretData?.data
            ? Object.keys(configMapSecretData.data).map((k) => ({
                  k,
                  v:
                      typeof configMapSecretData.data[k] === 'object'
                          ? YAML.stringify(configMapSecretData.data[k], { indent: 2 })
                          : configMapSecretData.data[k],
                  keyError: '',
                  valueError: '',
              }))
            : [{ k: '', v: '', keyError: '', valueError: '' }],
        external: configMapSecretData?.external ?? false,
        selectedType: configMapSecretData?.type ?? 'environment',
        volumeMountPath: { value: configMapSecretData?.mountPath ?? configMapSecretData?.defaultMountPath, error: '' },
        isSubPathChecked: !!configMapSecretData?.subPath,
        externalSubpathValues: {
            value: configMapSecretData?.data ? Object.keys(configMapSecretData?.data).join(',') : '',
            error: '',
        },
        isFilePermissionChecked: !!configMapSecretData?.filePermission,
        configName: {
            value: configMapSecretData?.name ?? '',
            error: '',
        },
        yamlMode: true,
        ...secretInitState,
    }
}

export const ConfigMapReducer = (state: ConfigMapState, action: ConfigMapAction) => {
    switch (action.type) {
        case ConfigMapActionTypes.removeDuplicate:
            return { ...state, duplicate: null, volumeMountPath: { value: '', error: '' } }
        case ConfigMapActionTypes.addParam:
            return {
                ...state,
                duplicate: state.duplicate.concat([{ k: '', v: '', keyError: '', valueError: '' }]),
            }
        case ConfigMapActionTypes.keyValueChange:
            let duplicate = state.duplicate
            duplicate[action.payload.index] = {
                k: action.payload.k,
                v: action.payload.v,
                keyError: '',
                valueError: '',
            }
            return { ...state, duplicate: [...duplicate] }
        case ConfigMapActionTypes.keyValueDelete:
            let dup = [...state.duplicate]
            dup.splice(action.payload.index, 1)
            return { ...state, duplicate: [...dup] }
        case ConfigMapActionTypes.submitLoading:
            return { ...state, submitLoading: true }
        case ConfigMapActionTypes.overrideLoading:
            return { ...state, overrideLoading: true }
        case ConfigMapActionTypes.createErrors:
            return {
                ...state,
                duplicate: state.duplicate.reduce((agg, dup) => {
                    if (!!dup.k && typeof dup.v === 'string') return agg
                    return [
                        ...agg,
                        {
                            ...dup,
                            keyError:
                                typeof dup.v === 'string' && !new RegExp(PATTERNS.CONFIG_MAP_AND_SECRET_KEY).test(dup.k)
                                    ? "Key must consist of alphanumeric characters, '.', '-' and '_'"
                                    : '',
                            valueError: dup.v !== 'string' && dup.k ? 'Both key value pairs are required' : '',
                        },
                    ]
                }, []),
            }
        case ConfigMapActionTypes.success:
        case ConfigMapActionTypes.error:
            return { ...state, submitLoading: false, overrideLoading: false }
        case ConfigMapActionTypes.toggleDialog:
            return { ...state, dialog: !state.dialog }
        case ConfigMapActionTypes.yamlToValues:
            return { ...state, duplicate: action.payload }
        case ConfigMapActionTypes.setExternal:
            return { ...state, external: action.payload }
        case ConfigMapActionTypes.setSelectedType:
            return { ...state, selectedType: action.payload }
        case ConfigMapActionTypes.setVolumeMountPath:
            return { ...state, volumeMountPath: action.payload }
        case ConfigMapActionTypes.setIsSubPathChecked:
            return { ...state, isSubPathChecked: !state.isSubPathChecked }
        case ConfigMapActionTypes.setExternalSubpathValues:
            return { ...state, externalSubpathValues: action.payload }
        case ConfigMapActionTypes.setIsFilePermissionChecked:
            return { ...state, isFilePermissionChecked: !state.isFilePermissionChecked }
        case ConfigMapActionTypes.setFilePermission:
            return { ...state, filePermission: action.payload }
        case ConfigMapActionTypes.setConfigName:
            return { ...state, configName: action.payload }
        case ConfigMapActionTypes.toggleYamlMode:
            return { ...state, yamlMode: !state.yamlMode }

        case ConfigMapActionTypes.setExternalType:
            return { ...state, externalType: action.payload }
        case ConfigMapActionTypes.setSecretDataYaml:
            return { ...state, secretDataYaml: action.payload }
        case ConfigMapActionTypes.setEsoYaml:
            return { ...state, esoYaml: action.payload }
        case ConfigMapActionTypes.setEsoData:
            return { ...state, esoData: action.payload }
        case ConfigMapActionTypes.setSecretData:
            return { ...state, secretData: action.payload }
        case ConfigMapActionTypes.setRoleARN:
            return { ...state, roleARN: action.payload }
        case ConfigMapActionTypes.setExternalValues:
            return { ...state, externalValues: action.payload }
        case ConfigMapActionTypes.setCodeEditorRadio:
            return { ...state, codeEditorRadio: action.payload }
        case ConfigMapActionTypes.unlock:
            return { ...state, locked: action.payload }
        case ConfigMapActionTypes.toggleSecretMode:
            return { ...state, secretMode: action.payload }

        case ConfigMapActionTypes.multipleOptions:
            return { ...state, ...action.payload }
        default:
            return state
    }
}
