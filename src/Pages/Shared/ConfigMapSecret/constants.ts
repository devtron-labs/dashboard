import { CMSecretComponentType } from '@devtron-labs/devtron-fe-common-lib'
import { ConfigMapSecretNullStateProps } from './types'

export const CM_SECRET_COMPONENT_NAME = {
    [CMSecretComponentType.ConfigMap]: 'ConfigMap',
    [CMSecretComponentType.Secret]: 'Secret',
}

export const EXTERNAL_INFO_TEXT = {
    [CMSecretComponentType.Secret]: {
        title: 'Mount Existing Kubernetes Secret',
        infoText:
            'Secret will not be created by system. However, they will be used inside the pod. Please make sure that secret with the same name is present in the environment.',
    },
    [CMSecretComponentType.ConfigMap]: {
        title: 'Using External Configmaps',
        infoText:
            'Configmap will not be created by system. However, they will be used inside the pod. Please make sure that configmap with the same name is present in the environment',
    },
}

export const CM_SECRET_EMPTY_STATE_TEXT = {
    [CMSecretComponentType.ConfigMap]: {
        title: 'ConfigMaps',
        subtitle:
            'The ConfigMap API resource holds key-value pairs of the configuration data that can be consumed by pods or used to store configuration data for system components such as controllers.',
        buttonText: 'Create ConfigMap',
    },
    [CMSecretComponentType.Secret]: {
        title: 'Secrets',
        subtitle:
            'Secret objects let you store and manage sensitive information, such as passwords, authentication tokens, and ssh keys.',
        buttonText: 'Create Secret',
    },
}

export const getCMSecretNullStateText = (
    componentType: CMSecretComponentType = CMSecretComponentType.ConfigMap,
    componentName: string = '',
): Record<ConfigMapSecretNullStateProps['nullStateType'], { title: string; subTitle: string }> => ({
    DELETE_OVERRIDE: {
        title: 'Delete override requested',
        subTitle: 'This override will be deleted on approval',
    },
    DELETE: {
        title: 'File deletion requested',
        subTitle: `This ${componentName} will be deleted on approval`,
    },
    NOT_OVERRIDDEN: {
        title: 'This file is not overridden',
        subTitle: `Published override for this file will be available here`,
    },
    NO_CM_CS: {
        title: CM_SECRET_EMPTY_STATE_TEXT[componentType].title,
        subTitle: CM_SECRET_EMPTY_STATE_TEXT[componentType].subtitle,
    },
})

export const CODE_EDITOR_RADIO_STATE_VALUE = { DATA: 'Data', SAMPLE: 'Sample' }

export const DATA_HEADER_MAP = { DEFAULT: 'default' }

export const VIEW_MODE = {
    GUI: 'gui',
    YAML: 'yaml',
    MANIFEST: 'manifest',
}

export const sampleJSONs = {
    ESO_GoogleSecretsManager: {
        secretStore: {
            gcpsm: {
                auth: {
                    secretRef: {
                        secretAccessKeySecretRef: {
                            name: 'gcpsm-secret',
                            key: 'secret-access-credentials',
                        },
                    },
                },
                projectID: 'myProject',
            },
        },
        esoData: [
            {
                secretKey: 'prod-mysql-password',
                key: 'secrets/prod-mysql-secrets',
            },
            {
                secretKey: 'prod-mysql-password',
                key: 'secrets/prod-mysql-secrets',
            },
        ],
    },
    ESO_AWSSecretsManager: {
        secretStore: {
            aws: {
                service: 'SecretsManager',
                region: 'us-east-1',
                auth: {
                    secretRef: {
                        accessKeyIDSecretRef: {
                            name: 'awssm-secret',
                            key: 'access-key',
                        },
                        secretAccessKeySecretRef: {
                            name: 'awssm-secret',
                            key: 'secret-access-key',
                        },
                    },
                },
            },
        },
        esoData: [
            {
                secretKey: 'prod-mysql-password',
                key: 'secrets/prod-mysql-secrets',
                property: 'prodPassword',
            },
            {
                secretKey: 'prod-mysql-password',
                key: 'secrets/prod-mysql-secrets',
                property: 'prodPassword',
            },
        ],
    },
    ESO_AzureSecretsManager: {
        secretStore: {
            azurekv: {
                tenantId: 'd3bc2180-xxxx-xxxx-xxxx-154105743342',
                vaultUrl: 'https://my-keyvault-name.vault.azure.net',
                authSecretRef: {
                    clientId: {
                        name: 'azure-secret-sp',
                        key: 'ClientID',
                    },
                    clientSecret: {
                        name: 'azure-secret-sp',
                        key: 'ClientSecret',
                    },
                },
            },
        },
        esoData: [
            {
                secretKey: 'prod-mysql-password',
                key: 'secrets/prod-mysql-secrets',
            },
            {
                secretKey: 'prod-mysql-password',
                key: 'secrets/prod-mysql-secrets',
            },
        ],
    },
    ESO_HashiCorpVault: {
        secretStore: {
            vault: {
                server: 'http://my.vault.server:8200',
                path: 'secret',
                version: 'v2',
                auth: {
                    tokenSecretRef: {
                        name: 'vault-token',
                        key: 'token',
                    },
                },
            },
        },
        esoData: [
            {
                secretKey: 'prod-mysql-password',
                key: 'secrets/prod-mysql-secrets',
                property: 'prodPassword',
            },
            {
                secretKey: 'prod-mysql-password',
                key: 'secrets/prod-mysql-secrets',
                property: 'prodPassword',
            },
        ],
    },
    default: [
        {
            key: 'service/credentials',
            name: 'secret-key',
            property: 'property-name',
            isBinary: true,
        },
        {
            key: 'service/credentials',
            name: 'secret-key',
            property: 'property-name',
            isBinary: true,
        },
    ],
}

export const CONFIG_MAP_SECRET_NO_DATA_ERROR = 'This is a required field'
