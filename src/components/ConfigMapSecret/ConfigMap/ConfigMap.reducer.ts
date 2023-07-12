import { PATTERNS } from '../../../config'
import { ConfigMapAction, ConfigMapActionTypes, ConfigMapState } from './ConfigMap.type'

export const initState = (configMap): ConfigMapState => {
    return {
        mountPath: configMap?.mountPath ?? '',
        loading: false,
        dialog: false,
        subPath: configMap?.subPath ?? '',
        filePermission: { value: configMap?.filePermission ?? '', error: '' },
        duplicate: configMap?.data
            ? Object.keys(configMap.data).map((k) => ({ k, v: configMap.data[k], keyError: '', valueError: '' }))
            : null,
        external: configMap?.external,
        selectedType: configMap?.type,
        volumeMountPath: { value: configMap?.mountPath ?? configMap?.defaultMountPath, error: '' },
        isSubPathChecked: !!configMap?.subPath,
        externalSubpathValues: {
            value: configMap?.data ? Object.keys(configMap?.data).join(',') : '',
            error: '',
        },
        isFilePermissionChecked: !!configMap?.filePermission,
        configName: {
            value: configMap?.data?.name,
            error: '',
        },
    }
}

export const ConfigMapReducer = (state: ConfigMapState, action: ConfigMapAction) => {
    switch (action.type) {
        case ConfigMapActionTypes.removeDuplicate:
            return { ...state, duplicate: null, mountPath: '' }
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
        case ConfigMapActionTypes.multipleOptions:
            return { ...state, ...action.payload }

        default:
            return state
    }
}
