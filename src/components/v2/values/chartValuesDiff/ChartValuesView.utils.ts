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
import { Operation } from 'fast-json-patch'
import { JSONPath } from 'jsonpath-plus'
import { convertJSONPointerToJSONPath, getDefaultValueFromType } from '@devtron-labs/devtron-fe-common-lib'
import { ChartValuesViewAction, ChartValuesViewActionTypes, ChartValuesViewState } from './ChartValuesView.type'
import { getGeneratedHelmManifest } from '../common/chartValues.api'
import {
    ChartDeploymentManifestDetailResponse,
    getDeploymentManifestDetails,
} from '../../chartDeploymentHistory/chartDeploymentHistory.service'

export const getCompareValuesSelectStyles = () => ({
    control: (base) => ({
        ...base,
        backgroundColor: 'var(--N100)',
        border: 'none',
        boxShadow: 'none',
        minHeight: '32px',
    }),
    option: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        backgroundColor: state.isFocused ? 'var(--N100)' : 'var(--bg-primary)',
    }),
    menu: (base) => ({
        ...base,
        marginTop: '2px',
        minWidth: '240px',
    }),
    menuList: (base) => ({
        ...base,
        position: 'relative',
        paddingBottom: 0,
        paddingTop: 0,
        maxHeight: '250px',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        padding: 0,
        color: 'var(--N400)',
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
    noOptionsMessage: (base) => ({
        ...base,
        color: 'var(--N600)',
    }),
})

const generateManifestGenerationKey = (
    isCreateValueView: boolean,
    isExternalApp: boolean,
    appName: string,
    valueName: string,
    commonState: ChartValuesViewState,
) => {
    if (isCreateValueView) {
        return `0_${valueName}_${commonState.chartValues?.id}_default_${commonState.selectedVersionUpdatePage?.id}`
    }
    if (isExternalApp) {
        return `${commonState.releaseInfo.deployedAppDetail.environmentDetail.namespace}_${
            commonState.releaseInfo.deployedAppDetail.appName
        }_${commonState.chartValues?.id}_${commonState.selectedVersionUpdatePage?.id}`
    }
    return `${commonState.selectedEnvironment?.value || 0}_${appName}_${commonState.chartValues?.id}_${
        commonState.selectedEnvironment?.namespace || 'default'
    }_${commonState.selectedVersionUpdatePage?.id}`
}

export const updateGeneratedManifest = async (
    isCreateValueView: boolean,
    isUnlinkedCLIApp: boolean,
    isExternalApp: boolean,
    isDeployChartView: boolean,
    appName: string,
    valueName: string,
    commonState: ChartValuesViewState,
    appStoreApplicationVersionId: number,
    appId: string,
    deploymentVersion: number,
    valuesYaml: string,
    dispatch: (action: ChartValuesViewAction) => void,
) => {
    const _manifestGenerationKey = generateManifestGenerationKey(
        isCreateValueView,
        isExternalApp,
        appName,
        valueName,
        commonState,
    )

    if (commonState.manifestGenerationKey === _manifestGenerationKey && !commonState.valuesYamlUpdated) {
        return
    }

    dispatch({
        type: ChartValuesViewActionTypes.multipleOptions,
        payload: {
            generatingManifest: true,
            manifestGenerationKey: _manifestGenerationKey,
            valuesEditorError: '',
        },
    })

    if (isUnlinkedCLIApp) {
        const response: ChartDeploymentManifestDetailResponse = await getDeploymentManifestDetails(
            appId,
            deploymentVersion,
            isExternalApp,
        )
        dispatch({
            type: ChartValuesViewActionTypes.multipleOptions,
            payload: {
                generatedManifest: response.result.manifest,
                valuesYamlUpdated: false,
                valuesEditorError: '',
                generatingManifest: false,
            },
        })

        return
    }

    if (isDeployChartView) {
        await getGeneratedHelmManifest(
            commonState.selectedEnvironment.value,
            commonState.selectedEnvironment.clusterId || commonState.installedConfig.clusterId,
            commonState.selectedEnvironment.namespace,
            appName,
            appStoreApplicationVersionId,
            valuesYaml,
            dispatch,
        )
    } else if (isCreateValueView) {
        await getGeneratedHelmManifest(0, 1, 'default', valueName, appStoreApplicationVersionId, valuesYaml, dispatch)
    } else {
        await getGeneratedHelmManifest(
            commonState.installedConfig.environmentId,
            commonState.installedConfig.clusterId,
            commonState.installedConfig.namespace,
            commonState.installedConfig.appName,
            appStoreApplicationVersionId,
            valuesYaml,
            dispatch,
        )
    }
}

export const getAndUpdateSchemaValue = (
    modifiedValuesYaml: string,
    schemaJson: ChartValuesViewState['schemaJson'],
    dispatch: (action: ChartValuesViewAction) => void,
): void => {
    const parsedValuesYamlDocument = YAML.parseDocument(modifiedValuesYaml || '')
    dispatch({
        type: ChartValuesViewActionTypes.multipleOptions,
        payload: {
            valuesYamlDocument: parsedValuesYamlDocument,
            schemaJson,
        },
    })
}

export const updateYamlDocument = (
    operations: Operation[],
    json: object,
    valuesYamlDocument: YAML.Document.Parsed,
    dispatch: React.Dispatch<ChartValuesViewAction>,
): void => {
    operations.forEach((operation) => {
        const path = operation.path.slice(1).split('/')
        if (operation.op === 'add') {
            valuesYamlDocument.addIn(path, operation.value)
        } else if (operation.op === 'remove') {
            // NOTE: should never throw error since we are using the path
            // from patch operations, it means the value should exist
            const value = JSONPath({
                json,
                path: convertJSONPointerToJSONPath(operation.path),
                resultType: 'value',
                wrap: false,
            })
            if (!value) {
                throw Error('failed to resolve value of remove operation path!')
            }
            if (typeof value === 'object') {
                valuesYamlDocument.deleteIn(path)
            } else {
                valuesYamlDocument.setIn(path, getDefaultValueFromType(value))
            }
        } else if (operation.op === 'replace') {
            valuesYamlDocument.setIn(path, operation.value)
        } else {
            throw Error('unmatched json patch operation found!')
        }
    })

    dispatch({
        type: ChartValuesViewActionTypes.multipleOptions,
        payload: {
            valuesYamlDocument,
            modifiedValuesYaml: valuesYamlDocument.toString(),
        },
    })
}
