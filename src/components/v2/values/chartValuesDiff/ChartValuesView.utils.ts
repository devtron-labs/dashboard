import { getGeneratedHelmManifest } from '../common/chartValues.api'
import { ChartValuesViewAction, ChartValuesViewActionTypes, ChartValuesViewState } from './ChartValuesView.type'
import YAML from 'yaml'

const generateManifestGenerationKey = (isExternalApp: boolean, appName: string, commonState: ChartValuesViewState) => {
    return isExternalApp
        ? `${commonState.releaseInfo.deployedAppDetail.environmentDetail.namespace}_${commonState.releaseInfo.deployedAppDetail.appName}_${commonState.chartValues?.id}_${commonState.selectedVersionUpdatePage?.id}`
        : `${commonState.selectedEnvironment.value}_${appName}_${commonState.chartValues?.id}_${commonState.selectedEnvironment.namespace}_${commonState.selectedVersionUpdatePage?.id}`
}

export const updateGeneratedManifest = (
    isExternalApp: boolean,
    isDeployChartView: boolean,
    appName: string,
    commonState: ChartValuesViewState,
    appStoreApplicationVersionId: number,
    valuesYaml: string,
    dispatch: (action: ChartValuesViewAction) => void,
) => {
    const _manifestGenerationKey = generateManifestGenerationKey(isExternalApp, appName, commonState)

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
            return containsEnum ? 'select' : renderType ? renderType : 'input'
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

export const dummySchema = {
    $schema: 'http://json-schema.org/schema#',
    type: 'object',
    properties: {
        architecture: {
            type: 'string',
            title: 'MySQL architecture',
            form: true,
            description: 'Allowed values: `standalone` or `replication`',
            enum: ['standalone', 'replication'],
        },
        auth: {
            type: 'object',
            title: 'Authentication configuration',
            form: true,
            required: ['username', 'password'],
            properties: {
                rootPassword: {
                    type: 'string',
                    title: 'MySQL root password',
                    description: 'Defaults to a random 10-character alphanumeric string if not set',
                },
                database: {
                    type: 'string',
                    title: 'MySQL custom database name',
                    maxLength: 64,
                },
                username: {
                    type: 'string',
                    title: 'MySQL custom username',
                },
                password: {
                    type: 'string',
                    title: 'MySQL custom password',
                },
            },
        },
        ingress: {
            type: 'object',
            form: true,
            title: 'Ingress Configuration',
            properties: {
                enabled: {
                    type: 'boolean',
                    form: true,
                    title: 'Use a custom hostname',
                    description: 'Enable the ingress resource that allows you to access the Drupal installation.',
                },
                hostname: {
                    type: 'string',
                    form: true,
                    title: 'Hostname',
                    hidden: {
                        value: false,
                        path: 'ingress/enabled',
                    },
                },
            },
        },
    },
}

const isFieldEnabled = (property: any, isChild: boolean) => {
    if (property.form && !property.properties) {
        return true
    } else if (!isChild && property.properties) {
        return Object.values(property.properties).some((_prop) => {
            if (_prop['properties']) {
                return isFieldEnabled(_prop, isChild)
            }

            return _prop['form']
        })
    }

    return false
}

export const isRequiredField = (property: any, isChild: boolean, schemaJson: Map<string, any>) => {
    if (isChild) {
        const _parentValue = schemaJson.get(property.parentRef)

        if (_parentValue?.required) {
            return _parentValue.required.includes(property.key.split('/').slice(1).join('/'))
        } else if (property.parentRef) {
            return isRequiredField(_parentValue, true, schemaJson)
        }
    }

    return false
}

const convertItemsToObj = (items) => {
    const itemsObj = {}
    for (let item of items) {
        itemsObj[item.key.value] = item.value.value
    }
    return itemsObj
}

const getAvailalbePath = (parentPathKey: string[], valuesYamlDocument: YAML.Document.Parsed) => {
    let currentPath = [],
        noValueInCurrentPath = false
    for (let _pathKey of parentPathKey) {
        if (noValueInCurrentPath) {
            break
        } else {
            const _currentPath = currentPath.concat(_pathKey)
            const _valueInCurrentPath = valuesYamlDocument.getIn(_currentPath)
            if (typeof _valueInCurrentPath === 'undefined' || _valueInCurrentPath === null) {
                noValueInCurrentPath = true
            } else {
                currentPath = _currentPath
            }
        }
    }

    return currentPath
}

export const getPathAndValueToSetIn = (pathKey: string[], valuesYamlDocument: YAML.Document.Parsed, _newValue) => {
    let pathToSetIn = [],
        valueToSetIn
    const parentPathKey = pathKey.slice(0, pathKey.length - 1)
    const parentValue = valuesYamlDocument.getIn(parentPathKey)
    if (typeof parentValue === 'undefined' || parentValue === null) {
        const availablePath = getAvailalbePath(parentPathKey, valuesYamlDocument)
        const availablePathToSetIn = pathKey.slice(availablePath.length + 1)
        valueToSetIn = { [availablePathToSetIn.join('.')]: _newValue }
        pathToSetIn = pathKey.slice(0, availablePath.length + 1)
    } else if (typeof parentValue === 'object') {
        valueToSetIn = {
            ...(parentValue.items ? convertItemsToObj(parentValue.items) : parentValue),
            [pathKey[pathKey.length - 1]]: _newValue,
        }
        pathToSetIn = parentPathKey.splice(0, 1)
    }

    return { pathToSetIn, valueToSetIn }
}

export const convertJSONSchemaToMap = (schema, parentRef = '', pathKeyAndPropsPair = new Map<string, any>()) => {
    if (schema && schema.properties) {
        const properties = schema.properties
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
                parentRef: parentRef,
                children: haveChildren && Object.keys(property.properties).map((key) => `${propertyPath}/${key}`),
            }

            delete newProps['properties'] // Don't need properties as they're already being flatten
            pathKeyAndPropsPair.set(propertyPath, newProps)

            if (haveChildren) {
                convertJSONSchemaToMap(property, propertyPath, pathKeyAndPropsPair)
            }
        })
    }

    return pathKeyAndPropsPair
}
