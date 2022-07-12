import { getGeneratedHelmManifest } from '../common/chartValues.api'
import { ChartValuesViewAction, ChartValuesViewActionTypes, ChartValuesViewState } from './ChartValuesView.type'
import YAML from 'yaml'

export const getCommonSelectStyle = (styleOverrides = {}) => {
    return {
        menuList: (base) => ({
            ...base,
            paddingTop: 0,
            paddingBottom: 0,
        }),
        control: (base, state) => ({
            ...base,
            minHeight: '32px',
            boxShadow: 'none',
            backgroundColor: 'var(--N50)',
            border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
            cursor: 'pointer',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
            padding: '10px 12px',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: 'var(--N400)',
            padding: '0 8px',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '0 8px',
        }),
        loadingMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        ...styleOverrides,
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
        : `${commonState.selectedEnvironment.value}_${appName}_${commonState.chartValues?.id}_${commonState.selectedEnvironment.namespace}_${commonState.selectedVersionUpdatePage?.id}`
}

export const updateGeneratedManifest = (
    isCreateValueView: boolean,
    isExternalApp: boolean,
    isDeployChartView: boolean,
    appName: string,
    valueName: string,
    commonState: ChartValuesViewState,
    appStoreApplicationVersionId: number,
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
