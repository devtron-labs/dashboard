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

import { YAMLStringify, decode } from '@devtron-labs/devtron-fe-common-lib'

import {
    CMSecretComponentType,
    ConfigMapAction,
    ConfigMapActionTypes,
    CMSecretConfigData,
    ConfigMapSecretState,
    ConfigMapState,
} from './ConfigMapSecret.types'
import { CM_SECRET_STATE } from './ConfigMapSecret.constants'
import { getSecretInitState } from './Secret.utils'

const secureValues = (data, isExternalType) => {
    const decodedData = isExternalType ? decode(data) : data
    return Object.keys(decodedData).map((k, id) => ({
        k,
        v: typeof decodedData[k] === 'object' ? YAMLStringify(decodedData[k]) : decodedData[k],
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
        )
    }
    if (cmSecretStateLabel === CM_SECRET_STATE.INHERITED && configMapSecretData?.defaultData) {
        return secureValues(
            configMapSecretData.defaultData,
            componentType === CMSecretComponentType.Secret && configMapSecretData.externalType === '',
        )
    }
    return [{ k: '', v: '', keyError: '', valueError: '' }]
}

const getExternalSubPathValues = (configMapSecretData: CMSecretConfigData) => {
    const externalSubPathValues = {
        value: configMapSecretData?.data ? Object.keys(configMapSecretData.data).join(',') : '',
        error: '',
    }

    if (!externalSubPathValues.value && configMapSecretData?.esoSubPath) {
        externalSubPathValues.value = configMapSecretData.esoSubPath ? configMapSecretData.esoSubPath.join(', ') : ''
    }

    return externalSubPathValues
}

export const initState = (
    configMapSecretData,
    componentType: CMSecretComponentType,
    cmSecretStateLabel: CM_SECRET_STATE,
): ConfigMapState | ConfigMapSecretState => {
    const secretInitState =
        componentType === CMSecretComponentType.Secret ? getSecretInitState(configMapSecretData) : {}

    const initialState = {
        isFormDirty: false,
        loading: false,
        dialog: false,
        subPath: configMapSecretData?.subPath ?? '',
        filePermission: { value: configMapSecretData?.filePermission ?? '', error: '' },
        currentData: processCurrentData(configMapSecretData, cmSecretStateLabel, componentType),
        externalValues: configMapSecretData?.data
            ? Object.keys(configMapSecretData.data).map((k) => ({
                  k,
                  v:
                      typeof configMapSecretData.data[k] === 'object'
                          ? YAMLStringify(configMapSecretData.data[k])
                          : configMapSecretData.data[k],
                  keyError: '',
                  valueError: '',
              }))
            : [{ k: '', v: '', keyError: '', valueError: '' }],
        external: configMapSecretData?.external ?? false,
        selectedType: configMapSecretData?.type ?? 'environment',
        volumeMountPath: { value: configMapSecretData?.mountPath ?? configMapSecretData?.defaultMountPath, error: '' },
        isSubPathChecked: !!configMapSecretData?.subPath,
        externalSubpathValues: getExternalSubPathValues(configMapSecretData),
        isFilePermissionChecked: !!configMapSecretData?.filePermission,
        configName: {
            value: configMapSecretData?.name ?? '',
            error: '',
        },
        yamlMode: true,
        cmSecretState: cmSecretStateLabel,
        showProtectedDeleteOverrideModal: false,
        showDraftSaveModal: false,
        draftPayload: null,
        isValidateFormError: false,
        ...secretInitState,
    }
    return initialState
}

export const ConfigMapSecretReducer = (state: ConfigMapSecretState, action: ConfigMapAction) => {
    switch (action.type) {
        case ConfigMapActionTypes.reInit:
            return { ...action.payload }
        case ConfigMapActionTypes.submitLoading:
            return { ...state, submitLoading: true }
        case ConfigMapActionTypes.overrideLoading:
            return { ...state, overrideLoading: true }
        case ConfigMapActionTypes.success:
        case ConfigMapActionTypes.error:
            return { ...state, submitLoading: false, overrideLoading: false }
        case ConfigMapActionTypes.setExternal:
            return { ...state, external: action.payload, isFormDirty: !!state.configName.value }
        case ConfigMapActionTypes.setSelectedType:
            return { ...state, selectedType: action.payload }
        case ConfigMapActionTypes.setVolumeMountPath:
            return { ...state, volumeMountPath: action.payload, isFormDirty: true }
        case ConfigMapActionTypes.setIsSubPathChecked:
            return { ...state, isSubPathChecked: !state.isSubPathChecked }
        case ConfigMapActionTypes.setExternalSubpathValues:
            return { ...state, externalSubpathValues: action.payload, isFormDirty: true }
        case ConfigMapActionTypes.setIsFilePermissionChecked:
            return { ...state, isFilePermissionChecked: !state.isFilePermissionChecked }
        case ConfigMapActionTypes.setFilePermission:
            return { ...state, filePermission: action.payload, isFormDirty: true }
        case ConfigMapActionTypes.setConfigName:
            return { ...state, configName: action.payload, isFormDirty: !!action.payload.value }
        case ConfigMapActionTypes.toggleYamlMode:
            return { ...state, yamlMode: !state.yamlMode }
        case ConfigMapActionTypes.toggleDialog:
            return { ...state, dialog: !state.dialog }
        case ConfigMapActionTypes.toggleProtectedDeleteOverrideModal:
            return { ...state, showProtectedDeleteOverrideModal: !state.showProtectedDeleteOverrideModal }
        case ConfigMapActionTypes.setExternalType:
            return { ...state, externalType: action.payload }
        case ConfigMapActionTypes.setSecretDataYaml:
            return { ...state, secretDataYaml: action.payload, isFormDirty: true }
        case ConfigMapActionTypes.setEsoYaml:
            return { ...state, esoSecretYaml: action.payload, isFormDirty: true }
        case ConfigMapActionTypes.setSecretData:
            return { ...state, secretData: action.payload, isFormDirty: true }
        case ConfigMapActionTypes.setRoleARN:
            return { ...state, roleARN: action.payload, isFormDirty: true }
        case ConfigMapActionTypes.setCodeEditorRadio:
            return { ...state, codeEditorRadio: action.payload }
        case ConfigMapActionTypes.updateCurrentData:
            return { ...state, currentData: action.payload, isFormDirty: true }
        case ConfigMapActionTypes.toggleSecretMode:
            return { ...state, secretMode: !state.secretMode }
        case ConfigMapActionTypes.toggleUnAuthorized:
            return { ...state, unAuthorized: action.payload }

        case ConfigMapActionTypes.multipleOptions:
            return { ...state, ...action.payload }

        case ConfigMapActionTypes.toggleDraftSaveModal:
            return { ...state, showDraftSaveModal: !state.showDraftSaveModal }
        case ConfigMapActionTypes.setValidateFormError:
            return { ...state, isValidateFormError: action.payload }
        case ConfigMapActionTypes.setFormDirty:
            return { ...state, isFormDirty: action.payload }

        default:
            return state
    }
}
