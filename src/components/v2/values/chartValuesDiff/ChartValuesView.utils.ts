import { getGeneratedHelmManifest } from '../common/chartValues.api'
import { ChartValuesViewAction, ChartValuesViewActionTypes, ChartValuesViewState } from './ChartValuesView.type'

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
            if: {
                properties: {
                    createDatabase: { enum: [true] },
                },
            },
            then: {
                properties: {
                    database: {
                        pattern: '[a-zA-Z0-9]{1,64}',
                    },
                },
            },
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
                replicationUser: {
                    type: 'string',
                    title: 'MySQL replication username',
                },
                replicationPassword: {
                    type: 'string',
                    title: 'MySQL replication password',
                },
                createDatabase: {
                    type: 'boolean',
                    title: 'MySQL create custom database',
                },
            },
        },
        primary: {
            type: 'object',
            title: 'Primary database configuration',
            form: true,
            properties: {
                podSecurityContext: {
                    type: 'object',
                    title: 'MySQL primary Pod security context',
                    properties: {
                        enabled: {
                            type: 'boolean',
                            default: false,
                        },
                        fsGroup: {
                            type: 'integer',
                            default: 1001,
                            hidden: {
                                value: false,
                                path: 'primary/podSecurityContext/enabled',
                            },
                        },
                    },
                },
                containerSecurityContext: {
                    type: 'object',
                    title: 'MySQL primary container security context',
                    properties: {
                        enabled: {
                            type: 'boolean',
                            default: false,
                        },
                        runAsUser: {
                            type: 'integer',
                            default: 1001,
                            hidden: {
                                value: false,
                                path: 'primary/containerSecurityContext/enabled',
                            },
                        },
                    },
                },
                persistence: {
                    type: 'object',
                    title: 'Enable persistence using Persistent Volume Claims',
                    properties: {
                        enabled: {
                            type: 'boolean',
                            form: true,
                            default: true,
                            title: 'If true, use a Persistent Volume Claim, If false, use emptyDir',
                        },
                        size: {
                            type: 'string',
                            title: 'Persistent Volume Size',
                            form: true,
                            render: 'slider',
                            sliderMin: 1,
                            sliderUnit: 'Gi',
                            hidden: {
                                value: false,
                                path: 'primary/persistence/enabled',
                            },
                        },
                    },
                },
            },
        },
        secondary: {
            type: 'object',
            title: 'Secondary database configuration',
            form: true,
            properties: {
                podSecurityContext: {
                    type: 'object',
                    title: 'MySQL secondary Pod security context',
                    properties: {
                        enabled: {
                            type: 'boolean',
                            default: false,
                        },
                        fsGroup: {
                            type: 'integer',
                            default: 1001,
                            hidden: {
                                value: false,
                                path: 'secondary/podSecurityContext/enabled',
                            },
                        },
                    },
                },
                containerSecurityContext: {
                    type: 'object',
                    title: 'MySQL secondary container security context',
                    properties: {
                        enabled: {
                            type: 'boolean',
                            default: false,
                        },
                        runAsUser: {
                            type: 'integer',
                            default: 1001,
                            hidden: {
                                value: false,
                                path: 'secondary/containerSecurityContext/enabled',
                            },
                        },
                    },
                },
                persistence: {
                    type: 'object',
                    title: 'Enable persistence using Persistent Volume Claims',
                    properties: {
                        enabled: {
                            type: 'boolean',
                            default: true,
                            title: 'If true, use a Persistent Volume Claim, If false, use emptyDir',
                        },
                        size: {
                            type: 'string',
                            title: 'Persistent Volume Size',
                            form: true,
                            render: 'slider',
                            sliderMin: 1,
                            sliderUnit: 'Gi',
                            hidden: {
                                value: false,
                                path: 'secondary/persistence/enabled',
                            },
                        },
                    },
                },
            },
        },
    },
}

export const dummySchemaT = {
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
                            sliderMin: 10,
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

export const convertJSONSchemaToMap = (schema, parentRef = '', keyValuePair = new Map<string, any>()) => {
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
                showField: isFieldEnabled(property, !!parentRef),
                parentRef: parentRef,
                children: haveChildren && Object.keys(property.properties).map((key) => `${propertyPath}/${key}`),
            }

            delete newProps['properties'] // Don't need properties as there're already being flatten
            keyValuePair.set(propertyPath, newProps)

            if (haveChildren) {
                convertJSONSchemaToMap(property, propertyPath, keyValuePair)
            }
        })
    }

    return keyValuePair
}
