import { CM_SECRET_STATE } from './Constants'
import { getSecretInitState } from './Secret/secret.utils'
import { ConfigMapAction, ConfigMapActionTypes, ConfigMapSecretState, ConfigMapState } from './Types'
import YAML from 'yaml'
import { decode } from '../../util/Util'

const initialDuplicate = (configMapSecretData, isOverrideView, componentType) => {
    if (isOverrideView && configMapSecretData?.global) {
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
        } else if (
            componentType === 'secret' &&
            (configMapSecretData?.secretData || configMapSecretData?.esoSecretData?.esoData)
        ) {
            return configMapSecretData.secretData || configMapSecretData.esoSecretData
        }
    }
    return null
}

const secureValues = (data, isExternalType) => {
    const decodedData = isExternalType ? decode(data) : data
    return Object.keys(decodedData).map((k) => {
        return {
            k,
            v: typeof decodedData[k] === 'object' ? YAML.stringify(decodedData[k], { indent: 2 }) : decodedData[k],
            keyError: '',
            valueError: '',
        }
    })
}

export const processCurrentData = (configMapSecretData, cmSecretStateLabel, componentType) => {
    if (configMapSecretData?.data) {
        return secureValues(
            configMapSecretData.data,
            componentType === 'secret' && configMapSecretData.externalType === '',
        )
    } else if (cmSecretStateLabel === CM_SECRET_STATE.INHERITED && configMapSecretData?.defaultData) {
        return secureValues(
            configMapSecretData.defaultData,
            componentType === 'secret' && configMapSecretData.externalType === '',
        )
    }
}

export const initState = (
    configMapSecretData,
    isOverrideView: boolean,
    componentType: string,
    cmSecretStateLabel: CM_SECRET_STATE,
): ConfigMapState | ConfigMapSecretState => {
    const secretInitState = componentType === 'secret' ? getSecretInitState(configMapSecretData) : {}
    const initialState = {
        loading: false,
        dialog: false,
        subPath: configMapSecretData?.subPath ?? '',
        filePermission: { value: configMapSecretData?.filePermission ?? '', error: '' },
        currentData: processCurrentData(configMapSecretData, cmSecretStateLabel, componentType),
        duplicate: initialDuplicate(configMapSecretData, isOverrideView, componentType),
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
        cmSecretState: cmSecretStateLabel,
        showDeleteModal: false,
        ...secretInitState,
    }
    return initialState
}

export const ConfigMapReducer = (state: ConfigMapSecretState, action: ConfigMapAction) => {
    switch (action.type) {
        case ConfigMapActionTypes.deleteOverride:
            return { ...action.payload }
        case ConfigMapActionTypes.submitLoading:
            return { ...state, submitLoading: true }
        case ConfigMapActionTypes.overrideLoading:
            return { ...state, overrideLoading: true }
        case ConfigMapActionTypes.success:
        case ConfigMapActionTypes.error:
            return { ...state, submitLoading: false, overrideLoading: false }
        case ConfigMapActionTypes.toggleDialog:
            return { ...state, dialog: !state.dialog }
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
        case ConfigMapActionTypes.setShowDeleteModal:
            return { ...state, showDeleteModal: !state.showDeleteModal }

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
        case ConfigMapActionTypes.setCodeEditorRadio:
            return { ...state, codeEditorRadio: action.payload }
        case ConfigMapActionTypes.updateCurrentData:
            return { ...state, currentData: action.payload }
        case ConfigMapActionTypes.toggleSecretMode:
            return { ...state, secretMode: !state.secretMode }
        case ConfigMapActionTypes.toggleUnAuthorized:
            return { ...state, unAuthorized: action.payload }

        case ConfigMapActionTypes.multipleOptions:
            return { ...state, ...action.payload }
        default:
            return state
    }
}
