import React from 'react'
import { components } from 'react-select'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { ReactComponent as InfoIcon } from '../../assets/icons/ic-info-outlined.svg'
import { multiSelectStyles } from '../common'
import { toast } from 'react-toastify'
import { SECRET_TOAST_INFO } from './constants'
import YAML from 'yaml'
import { EsoData } from '../deploymentConfig/types'

export const CODE_EDITOR_RADIO_STATE = { DATA: 'data', SAMPLE: 'sample' }

export const CODE_EDITOR_RADIO_STATE_VALUE = { DATA: 'Data', SAMPLE: 'Sample' }

export const DATA_HEADER_MAP = { DEFAULT: 'default' }

export const VIEW_MODE = {
    YAML: 'yaml',
    GUI: 'gui',
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

export const dataHeaders = {
    ESO_GoogleSecretsManager: (
        <div>
            #Sample Data
            <br />
            #secretKey: Name of the secret
            <br />
            #key: GCP secret name
            <br />
            #property: GCP Secrets Manager secret key
            <br />
            #secretAccessKeySecretRef.name: The secret name which would be used for authentication
            <br />
            #secretAccessKeySecretRef.key: Key name containing SA key
            <br />
            #projectID: GCP Project ID where secret is created
            <br />
        </div>
    ),
    ESO_AWSSecretsManager: (
        <div>
            #Sample Data <br />
            #accessKeyIDSecretRef.name: Name of secret created that would be used for authentication <br />
            #region: The region where Secret is created <br />
            #secretKey: Name of the secret created <br />
            #key: AWS Secrets Manager secret name <br />
            #property: AWS Secrets Manager secret key <br />
        </div>
    ),
    ESO_AzureSecretsManager: (
        <div>
            #Sample Data <br />
            #tenantId: azure tenant ID <br />
            #vaultUrl: URL of your vault instance <br />
            #authSecretRef.name: Name of secret created that would be used for authentication <br />
            #secretKey: Name of the secret <br />
            #key: Azure Key vault secret name <br />
        </div>
    ),
    ESO_HashiCorpVault: (
        <div>
            #Sample Data <br />
            #vault.server: Server URL where vault is running <br />
            #vault.path: Path where secret is stored <br />
            #tokenSecretRef.name: The secret name which would be used for authentication <br />
            #tokenSecretRef.key: Key name containing token <br />
            #secretKey: Name of the secret <br />
            #key: Vault secret name <br />
            #property: Vault secret key <br />
        </div>
    ),
    default: (
        <div>
            # Sample Data<br></br># key: Secret key in backend<br></br># name: Name for this key in the generated secret
            <br></br># property: Property to extract if secret in backend is a JSON object(optional)<br></br># isBinary:
            Set this to true if configuring an item for a binary file stored(optional)<br></br>
        </div>
    ),
}

export const getTypeGroups = (typeValue?: string) => {
    const noGroups: any[] = [
            { value: '', label: 'Kubernetes Secret' },
            { value: 'KubernetesSecret', label: 'Mount Existing Kubernetes Secret' },
        ],
        esoGroups: any[] = [
            { value: 'ESO_GoogleSecretsManager', label: 'Google Secrets Manager' },
            { value: 'ESO_AWSSecretsManager', label: 'AWS Secrets Manager' },
            { value: 'ESO_AzureSecretsManager', label: 'Azure Secrets Manager' },
            { value: 'ESO_HashiCorpVault', label: 'Hashi Corp Vault' },
        ],
        ksoGroups: any[] = [
            { value: 'AWSSecretsManager', label: 'AWS Secrets Manager', deprecated: true },
            { value: 'AWSSystemManager', label: 'AWS System Manager', deprecated: true },
            { value: 'HashiCorpVault', label: 'Hashi Corp Vault', deprecated: true },
        ]

    const externalType = [...noGroups, ...esoGroups, ...ksoGroups].find((x) => x.value === typeValue)

    if (typeValue) return externalType
    return [
        {
            label: '',
            options: noGroups,
        },
        {
            label: 'External Secret Operator (ESO)',
            options: esoGroups,
        },
        {
            label: 'Kubernetes External Secret (KES)',
            options: ksoGroups,
        },
    ]
}

export function SecretOptions(props) {
    props.selectProps.styles.option = getCustomOptionSelectionStyle()
    return (
        <components.Option {...props}>
            <div>
                <div>{props.data.label}</div>
                {props.data?.deprecated && <div className="cy-7 fw-4 fs-11">Deprecated</div>}
            </div>
        </components.Option>
    )
}

export function GroupHeading(props) {
    if (!props.data.label) return null
    return (
        <components.GroupHeading {...props}>
            <div className="flex flex-justify h-100">
                {props.data.label}
                <a className="flex" href="https://github.com/external-secrets/external-secrets" target="_blank">
                    <InfoIcon className="icon-dim-20 fcn-6" />
                </a>
            </div>
        </components.GroupHeading>
    )
}

export const groupStyle = () => {
    return {
        ...multiSelectStyles,
        menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left' }),
        control: (base) => ({ ...base, border: '1px solid #d6dbdf', width: '450px' }),
        group: (base) => ({
            ...base,
            paddingTop: 0,
            paddingBottom: 0,
        }),
        groupHeading: (base) => ({
            ...base,
            fontWeight: 600,
            fontSize: '12px',
            height: '28px',
            color: 'var(--N900)',
            backgroundColor: 'var(--N100)',
            marginBottom: 0,
        }),
        indicatorsContainer: (provided, state) => ({
            ...provided,
        }),
    }
}

export const hasHashiOrAWS = (externalType): boolean => {
    return (
        externalType === 'AWSSecretsManager' || externalType === 'AWSSystemManager' || externalType === 'HashiCorpVault'
    )
}

export const hasESO = (externalType): boolean => {
    return (
        externalType === 'ESO_GoogleSecretsManager' ||
        externalType === 'ESO_AzureSecretsManager' ||
        externalType === 'ESO_AWSSecretsManager' ||
        externalType === 'ESO_HashiCorpVault'
    )
}

export const hasProperty = (externalType): boolean => {
    return externalType === 'ESO_AWSSecretsManager'
}

export const secretValidationInfoToast = (isESO,secretStore,secretStoreRef) => {
    let errorMessage = ''
    if (isESO) {
        if (secretStore && secretStoreRef) {
            errorMessage = SECRET_TOAST_INFO.BOTH_STORE_AVAILABLE
        } else if (secretStore || secretStoreRef) {
            errorMessage = SECRET_TOAST_INFO.CHECK_KEY_SECRET_KEY
        } else {
            errorMessage = SECRET_TOAST_INFO.BOTH_STORE_UNAVAILABLE
        }
    } else {
        errorMessage = SECRET_TOAST_INFO.CHECK_KEY_NAME
    }
    toast.error(errorMessage)
}

export function handleSecretDataYamlChange(
    yaml: any,
    codeEditorRadio: string,
    isESO: boolean,
    setEsoYaml: (arg: string) => void,
    setSecretDataYaml: (arg: string) => void,
    setSecretData: (arg: any[]) => void,
    setEsoData: (arg: EsoData[]) => void,
    setSecretStore: (arg: any) => void,
    setScretStoreRef: (arg: any) => void,
    setRefreshInterval: (arg: string) => void
): void {
    if (codeEditorRadio !== CODE_EDITOR_RADIO_STATE.DATA) return
    if (isESO) {
        setEsoYaml(yaml)
    } else {
        setSecretDataYaml(yaml)
    }
    try {
        let json = YAML.parse(yaml)
        if (!json || !Object.keys(json).length) {
            setSecretData([])
            setEsoData([])
            setSecretStore(null)
            setScretStoreRef(null)
            setRefreshInterval(null)
            return
        }
        if (isESO) {
            setSecretStore(json.secretStore)
            setScretStoreRef(json.secretStoreRef)
            setRefreshInterval(json.refreshInterval)
        }
        if (!isESO && Array.isArray(json)) {
            json = json.map((j) => {
                let temp = {}
                temp['isBinary'] = j.isBinary
                if (j.key) {
                    temp['fileName'] = j.key
                }
                if (j.property) {
                    temp['property'] = j.property
                }
                if (j.name) {
                    temp['name'] = j.name
                }
                return temp
            })
            setSecretData(json)
        }
        if (isESO && Array.isArray(json?.esoData)) {
            setEsoData(json.esoData)
        }
    } catch (error) {}
}