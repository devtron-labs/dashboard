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

import YAML, { YAMLMap } from 'yaml'
import { showError } from '@devtron-labs/devtron-fe-common-lib'
import { ChartValuesViewAction, ChartValuesViewActionTypes, ChartValuesViewState } from './ChartValuesView.type'
import { getGeneratedHelmManifest } from '../common/chartValues.api'
import {
    ChartDeploymentManifestDetailResponse,
    getDeploymentManifestDetails,
} from '../../chartDeploymentHistory/chartDeploymentHistory.service'

export const getCompareValuesSelectStyles = () => {
    return {
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
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
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
    }
}

const generateManifestGenerationKey = (
    isCreateValueView: boolean,
    isExternalApp: boolean,
    appName: string,
    valueName: string,
    commonState: ChartValuesViewState,
) => {
    return isCreateValueView
        ? `0_${valueName}_${commonState.chartValues?.id}_default_${commonState.selectedVersionUpdatePage?.id}`
        : isExternalApp
          ? `${commonState.releaseInfo.deployedAppDetail.environmentDetail.namespace}_${commonState.releaseInfo.deployedAppDetail.appName}_${commonState.chartValues?.id}_${commonState.selectedVersionUpdatePage?.id}`
          : `${commonState.selectedEnvironment?.value || 0}_${appName}_${commonState.chartValues?.id}_${
                commonState.selectedEnvironment?.namespace || 'default'
            }_${commonState.selectedVersionUpdatePage?.id}`
}

export const updateGeneratedManifest = (
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
        getDeploymentManifestDetails(appId, deploymentVersion, isExternalApp).then(
            (response: ChartDeploymentManifestDetailResponse) => {
                dispatch({
                    type: ChartValuesViewActionTypes.multipleOptions,
                    payload: {
                        generatedManifest: response.result.manifest,
                        valuesYamlUpdated: false,
                        valuesEditorError: '',
                        generatingManifest: false,
                    },
                })
            },
        )

        return
    }

    if (isDeployChartView) {
        getGeneratedHelmManifest(
            commonState.selectedEnvironment.value,
            commonState.selectedEnvironment.clusterId || commonState.installedConfig.clusterId,
            commonState.selectedEnvironment.namespace,
            appName,
            appStoreApplicationVersionId,
            valuesYaml,
            dispatch,
        )
    } else if (isCreateValueView) {
        getGeneratedHelmManifest(0, 1, 'default', valueName, appStoreApplicationVersionId, valuesYaml, dispatch)
    } else {
        getGeneratedHelmManifest(
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

const getFieldType = (type: string, renderType: string, containsEnum): string => {
    switch (type) {
        case 'string':
            return containsEnum ? 'select' : renderType || 'input'
        case 'object':
            return 'formBox'
        case 'boolean':
            return 'checkbox'
        case 'integer':
        case 'number':
            return 'numberInput'
        default:
            return type
    }
}

const isFieldEnabled = (property: any, isChild: boolean): boolean => {
    if (property.form && (isChild || !property.properties)) {
        return true
    }
    if (!isChild && property.properties) {
        return Object.values(property.properties).some((_prop) => {
            if (_prop['properties']) {
                return isFieldEnabled(_prop, isChild)
            }

            return _prop['form']
        })
    }

    return false
}

export const isRequiredField = (property: any, isChild: boolean, schemaJson: Map<string, any>): boolean => {
    if (isChild) {
        const _parentValue = schemaJson.get(property.parentRef)

        if (_parentValue?.required) {
            return _parentValue.required.includes(property.key.split('/').slice(1).join('/'))
        }
        if (property.parentRef) {
            return isRequiredField(_parentValue, true, schemaJson)
        }
    }

    return !!property.required
}

const convertItemsToObj = (items) => {
    const itemsObj = {}
    for (const item of items) {
        itemsObj[item.key.value] = item.value.value
    }
    return itemsObj
}

const getAvailalbePath = (parentPathKey: string[], valuesYamlDocument: YAML.Document.Parsed): string[] => {
    let currentPath: string[] = []
    let noValueInCurrentPath = false
    for (const _pathKey of parentPathKey) {
        if (noValueInCurrentPath) {
            break
        } else {
            const _currentPath = currentPath.concat(_pathKey)
            const _valueInCurrentPath = valuesYamlDocument.getIn(_currentPath)
            if (
                typeof _valueInCurrentPath === 'undefined' ||
                _valueInCurrentPath === null ||
                (_valueInCurrentPath instanceof YAMLMap &&
                    _valueInCurrentPath.items &&
                    !_valueInCurrentPath.items.length)
            ) {
                noValueInCurrentPath = true
            } else {
                currentPath = _currentPath
            }
        }
    }

    return currentPath
}

export const getPathAndValueToSetIn = (
    pathKey: string[],
    valuesYamlDocument: YAML.Document.Parsed,
    _newValue: any,
): {
    pathToSetIn: string[]
    valueToSetIn: any
} => {
    let pathToSetIn = []
    let valueToSetIn
    const parentPathKey = pathKey.slice(0, pathKey.length - 1)
    const parentValue = valuesYamlDocument.getIn(parentPathKey)
    if (
        typeof parentValue === 'undefined' ||
        parentValue === null ||
        (parentValue instanceof YAMLMap && parentValue.items && !parentValue.items.length)
    ) {
        const availablePath = getAvailalbePath(parentPathKey, valuesYamlDocument)
        const availablePathToSetIn = pathKey.slice(availablePath.length + 1)
        valueToSetIn = { [availablePathToSetIn.join('.')]: _newValue }
        pathToSetIn = pathKey.slice(0, availablePath.length + 1)
    } else if (typeof parentValue === 'object') {
        valueToSetIn = {
            ...(parentValue['items'] ? convertItemsToObj(parentValue['items']) : parentValue),
            [pathKey[pathKey.length - 1]]: _newValue,
        }
        pathToSetIn = parentPathKey
    }

    return { pathToSetIn, valueToSetIn }
}

export const getAndUpdateSchemaValue = (
    modifiedValuesYaml: string,
    schemaJson: Map<string, any>,
    dispatch: (action: ChartValuesViewAction) => void,
): void => {
    const parsedValuesYamlDocument = YAML.parseDocument(modifiedValuesYaml || '')
    const updatedSchemaJson = schemaJson

    if (updatedSchemaJson?.size && parsedValuesYamlDocument?.contents) {
        for (const [key, value] of updatedSchemaJson) {
            const _value = parsedValuesYamlDocument.getIn(key.split('/')) ?? value.default
            value.value =
                value['type'] === 'select'
                    ? value['enum']?.includes(_value)
                        ? { label: _value, value: _value }
                        : null
                    : _value
            updatedSchemaJson.set(key, value)
        }
    }

    dispatch({
        type: ChartValuesViewActionTypes.multipleOptions,
        payload: {
            valuesYamlDocument: parsedValuesYamlDocument,
            schemaJson: updatedSchemaJson,
        },
    })
}

const getPathKeyAndPropsPair = (
    schema,
    parentRef = '',
    pathKeyAndPropsPair = new Map<string, any>(),
): Map<string, any> => {
    if (schema?.properties) {
        const { properties } = schema
        Object.keys(properties).forEach((propertyKey) => {
            const propertyPath = `${parentRef}${parentRef ? '/' : ''}${propertyKey}`
            const property = properties[propertyKey]
            const haveChildren = property.type === 'object' && property.properties
            const newProps = {
                ...property,
                key: propertyPath,
                type: getFieldType(property.type, property.render, !!property.enum),
                showBox: property.type === 'object' && property.form,
                value: property.enum ? { label: property.enum[0], value: property.enum[0] } : property.default,
                showField: property.required || isFieldEnabled(property, !!parentRef),
                parentRef,
                children: haveChildren && Object.keys(property.properties).map((key) => `${propertyPath}/${key}`),
            }

            delete newProps['properties'] // Don't need properties as they're already being flatten
            pathKeyAndPropsPair.set(propertyPath, newProps)

            if (haveChildren) {
                getPathKeyAndPropsPair(property, propertyPath, pathKeyAndPropsPair)
            }
        })
    }

    return pathKeyAndPropsPair
}

export const convertSchemaJsonToMap = (valuesSchemaJson: string): Map<string, any> | null => {
    if (valuesSchemaJson?.trim()) {
        try {
            return getPathKeyAndPropsPair(JSON.parse(valuesSchemaJson))
        } catch (e) {
            showError(e)
        }
    }
    return null
}
