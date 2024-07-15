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
import { getSecretInitState } from './secret.utils'

const secureValues = (data, isExternalType) => {
    const decodedData = isExternalType ? decode(data) : data
    return Object.keys(decodedData).map((k, idx) => {
        return {
            k,
            v: typeof decodedData[k] === 'object' ? YAMLStringify(decodedData[k]) : decodedData[k],
            keyError: '',
            valueError: '',
            id: idx,
        }
    })
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
    return [{ k: '', v: '', keyError: '', valueError: '', id: '' }]
}

export const initState = (
    configMapSecretData,
    componentType: CMSecretComponentType,
    cmSecretStateLabel: CM_SECRET_STATE,
): ConfigMapState | ConfigMapSecretState => {
    const secretInitState =
        componentType === CMSecretComponentType.Secret ? getSecretInitState(configMapSecretData) : {}
    const initialState = {
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
        showProtectedDeleteModal: false,
        showProtectedDeleteOverrideModal: false,
        showDraftSaveModal: false,
        draftPayload: null,
        isValidateFormError: false,
        ...secretInitState,
    }
    return initialState
}

export const ConfigMapReducer = (state: ConfigMapSecretState, action: ConfigMapAction) => {
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
        case ConfigMapActionTypes.toggleDialog:
            return { ...state, dialog: !state.dialog }
        case ConfigMapActionTypes.toggleDeleteModal:
            return { ...state, showDeleteModal: !state.showDeleteModal }
        case ConfigMapActionTypes.toggleProtectedDeleteModal:
            return { ...state, showProtectedDeleteModal: !state.showProtectedDeleteModal }
        case ConfigMapActionTypes.toggleProtectedDeleteOverrideModal:
            return { ...state, showProtectedDeleteOverrideModal: !state.showProtectedDeleteOverrideModal }

        case ConfigMapActionTypes.setExternalType:
            return { ...state, externalType: action.payload }
        case ConfigMapActionTypes.setSecretDataYaml:
            return { ...state, secretDataYaml: action.payload }
        case ConfigMapActionTypes.setEsoYaml:
            return { ...state, esoSecretYaml: action.payload }
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

        case ConfigMapActionTypes.toggleDraftSaveModal:
            return { ...state, showDraftSaveModal: !state.showDraftSaveModal }
        case ConfigMapActionTypes.setValidateFormError:
            return { ...state, isValidateFormError: action.payload }

        default:
            return state
    }
}
