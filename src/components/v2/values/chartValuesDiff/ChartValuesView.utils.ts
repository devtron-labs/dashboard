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
            return 'numberInput'
        default:
            return type
    }
}

export const dummySchema = {
    $schema: 'http://json-schema.org/schema#',
    type: 'object',
    properties: {
        drupalUsername: {
            type: 'string',
            title: 'Username',
            form: true,
        },
        drupalPassword: {
            type: 'string',
            title: 'Password',
            form: true,
            description: 'Defaults to a random 10-character alphanumeric string if not set',
        },
        drupalEmail: {
            type: 'string',
            title: 'Admin email',
            form: true,
        },
        persistence: {
            type: 'object',
            properties: {
                drupal: {
                    type: 'object',
                    properties: {
                        size: {
                            type: 'string',
                            title: 'Persistent Volume Size',
                            form: true,
                            render: 'slider',
                            sliderMin: 1,
                            sliderMax: 100,
                            sliderUnit: 'Gi',
                        },
                    },
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
        service: {
            type: 'object',
            form: true,
            title: 'Service Configuration',
            properties: {
                type: {
                    type: 'string',
                    form: true,
                    title: 'Service Type',
                    description: 'Allowed values: "ClusterIP", "NodePort" and "LoadBalancer"',
                },
            },
        },
        mariadb: {
            type: 'object',
            title: 'MariaDB Details',
            form: true,
            properties: {
                enabled: {
                    type: 'boolean',
                    title: 'Use a new MariaDB database hosted in the cluster',
                    form: true,
                    description:
                        'Whether to deploy a mariadb server to satisfy the applications database requirements. To use an external database switch this off and configure the external database details',
                },
                primary: {
                    type: 'object',
                    properties: {
                        persistence: {
                            type: 'object',
                            properties: {
                                size: {
                                    type: 'string',
                                    title: 'Volume Size',
                                    form: true,
                                    hidden: {
                                        value: false,
                                        path: 'mariadb/enabled',
                                    },
                                    render: 'slider',
                                    sliderMin: 1,
                                    sliderMax: 100,
                                    sliderUnit: 'Gi',
                                },
                            },
                        },
                    },
                },
            },
        },
        externalDatabase: {
            type: 'object',
            title: 'External Database Details',
            description: 'If MariaDB is disabled. Use this section to specify the external database details',
            form: true,
            hidden: 'mariadb/enabled',
            properties: {
                host: {
                    type: 'string',
                    form: true,
                    title: 'Database Host',
                },
                user: {
                    type: 'string',
                    form: true,
                    title: 'Database Username',
                },
                password: {
                    type: 'string',
                    form: true,
                    title: 'Database Password',
                },
                database: {
                    type: 'string',
                    form: true,
                    title: 'Database Name',
                },
                port: {
                    type: 'integer',
                    form: true,
                    title: 'Database Port',
                },
            },
        },
        resources: {
            type: 'object',
            title: 'Requested Resources',
            description: 'Configure resource requests',
            form: true,
            properties: {
                requests: {
                    type: 'object',
                    properties: {
                        memory: {
                            type: 'string',
                            form: true,
                            render: 'slider',
                            title: 'Memory Request',
                            sliderMin: 10,
                            sliderMax: 2048,
                            sliderUnit: 'Mi',
                        },
                        cpu: {
                            type: 'string',
                            form: true,
                            render: 'slider',
                            title: 'CPU Request',
                            sliderMin: 100,
                            sliderMax: 2000,
                            sliderUnit: 'm',
                        },
                    },
                },
            },
        },
        metrics: {
            type: 'object',
            properties: {
                enabled: {
                    type: 'boolean',
                    title: 'Enable Metrics',
                    description: 'Prometheus Exporter / Metrics',
                    form: true,
                },
            },
        },
    },
}

export const convertJSONSchemaToMap = (
    schema,
    parsedValuesYamlDocument: YAML.Document.Parsed,
    parentRef = '',
    keyValuePair = new Map<string, any>(),
) => {
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
                value: property.enum
                    ? { label: property.enum[0], value: property.enum[0] }
                    : parsedValuesYamlDocument.getIn(propertyPath.split('/')),
                parentRef: parentRef,
                children: haveChildren && Object.keys(property.properties).map((key) => `${propertyPath}/${key}`),
            }

            delete newProps['properties'] // Don't need properties as there're already being flatten
            keyValuePair.set(propertyPath, newProps)

            if (haveChildren) {
                convertJSONSchemaToMap(property, parsedValuesYamlDocument, propertyPath, keyValuePair)
            }
        })
    }

    return keyValuePair
}
