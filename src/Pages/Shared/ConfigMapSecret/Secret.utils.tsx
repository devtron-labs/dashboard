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

import { components, OptionProps, GroupHeadingProps } from 'react-select'
import { NavLink } from 'react-router-dom'
import { toast } from 'react-toastify'
import YAML from 'yaml'

import { OptionType, YAMLStringify, showError } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as InfoIcon } from '@Icons/ic-info-outlined.svg'
import { URLS, DOCUMENTATION } from '@Config/index'
import { getCustomOptionSelectionStyle } from '@Components/v2/common/ReactSelect.utils'

import { SECRET_TOAST_INFO, CM_SECRET_STATE } from './ConfigMapSecret.constants'
import { processCurrentData } from './ConfigMapSecret.reducer'
import { ConfigMapAction, ConfigMapActionTypes, SecretState, CMSecretComponentType } from './ConfigMapSecret.types'

export const CODE_EDITOR_RADIO_STATE = { DATA: 'data', SAMPLE: 'sample' }

export const CODE_EDITOR_RADIO_STATE_VALUE = { DATA: 'Data', SAMPLE: 'Sample' }

export const DATA_HEADER_MAP = { DEFAULT: 'default' }

export const VIEW_MODE = {
    YAML: 'yaml',
    GUI: 'gui',
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

export const dataHeaders = {
    ESO_GoogleSecretsManager: (
        <div>
            #Sample Data
            <br />
            #secretKey: Name of the secret
            <br />
            #key: GCP secret name
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
            #secretKey: Name of the secret created. <br />
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
            # Sample Data
            <br /># key: Secret key in backend
            <br /># name: Name for this key in the generated secret
            <br /># property: Property to extract if secret in backend is a JSON object(optional)
            <br /># isBinary: Set this to true if configuring an item for a binary file stored(optional)
            <br />
        </div>
    ),
}

export const getTypeGroups = (isJobView?: boolean, typeValue?: string) => {
    const noGroups: any[] = [
        { value: '', label: 'Kubernetes Secret' },
        { value: 'KubernetesSecret', label: 'Mount Existing Kubernetes Secret' },
    ]
    const esoGroups: any[] = [
        { value: 'ESO_GoogleSecretsManager', label: 'Google Secrets Manager' },
        { value: 'ESO_AWSSecretsManager', label: 'AWS Secrets Manager' },
        { value: 'ESO_AzureSecretsManager', label: 'Azure Secrets Manager' },
        { value: 'ESO_HashiCorpVault', label: 'Hashi Corp Vault' },
    ]
    const ksoGroups: any[] = [
        { value: 'AWSSecretsManager', label: 'AWS Secrets Manager', deprecated: true },
        { value: 'AWSSystemManager', label: 'AWS System Manager', deprecated: true },
        { value: 'HashiCorpVault', label: 'Hashi Corp Vault', deprecated: true },
    ]
    const groupList = isJobView ? noGroups : [...noGroups, ...esoGroups, ...ksoGroups]
    const externalType = groupList.find((x) => x.value === typeValue)

    if (typeValue) {
        return externalType
    }
    if (isJobView) {
        const _externalType = [...noGroups].find((x) => x.value === typeValue)
        if (typeValue) {
            return _externalType
        }
        return [
            {
                label: '',
                options: noGroups,
            },
        ]
    }

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

export const SecretOptions = (props: OptionProps<ReturnType<typeof getTypeGroups>>) => {
    const { selectProps, data } = props

    const styles = { ...selectProps.styles, option: getCustomOptionSelectionStyle() }

    return (
        <components.Option {...props} selectProps={{ ...selectProps, styles }}>
            <div>
                <div>{data.label}</div>
                {data?.deprecated && <div className="cy-7 fw-4 fs-11">Deprecated</div>}
            </div>
        </components.Option>
    )
}

export const GroupHeading = (props: GroupHeadingProps<ReturnType<typeof getTypeGroups>>) => {
    const { data } = props

    if (!data.label) {
        return null
    }
    return (
        <components.GroupHeading {...props}>
            <div className="flex flex-justify h-100">
                {data.label}
                <a
                    className="flex"
                    href="https://github.com/external-secrets/external-secrets"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${data.label}-info`}
                >
                    <InfoIcon className="icon-dim-20 fcn-6" />
                </a>
            </div>
        </components.GroupHeading>
    )
}

export const hasHashiOrAWS = (externalType): boolean =>
    externalType === 'AWSSecretsManager' || externalType === 'AWSSystemManager' || externalType === 'HashiCorpVault'

export const hasESO = (externalType): boolean =>
    externalType === 'ESO_GoogleSecretsManager' ||
    externalType === 'ESO_AzureSecretsManager' ||
    externalType === 'ESO_AWSSecretsManager' ||
    externalType === 'ESO_HashiCorpVault'

export const hasProperty = (externalType): boolean => externalType === 'ESO_AWSSecretsManager'

export const secretValidationInfoToast = ({
    isESO,
    dataFrom,
    secretStore,
    secretStoreRef,
}: {
    isESO: boolean
} & Pick<SecretState, 'dataFrom' | 'secretStore' | 'secretStoreRef'>) => {
    let errorMessage = ''
    if (isESO) {
        if (dataFrom) {
            errorMessage = SECRET_TOAST_INFO.BOTH_ESO_DATA_AND_DATA_FROM_AVAILABLE
        } else if (secretStore && secretStoreRef) {
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

export async function prepareSecretOverrideData(configMapSecretData, dispatch: (action: ConfigMapAction) => void) {
    try {
        dispatch({
            type: ConfigMapActionTypes.multipleOptions,
            payload: {
                secretMode: false,
                cmSecretState: CM_SECRET_STATE.OVERRIDDEN,
                currentData: processCurrentData(
                    configMapSecretData,
                    CM_SECRET_STATE.INHERITED,
                    CMSecretComponentType.Secret,
                ),
            },
        })
        if (configMapSecretData.secretData) {
            const json = configMapSecretData.secretData.map((s) => ({
                fileName: s.key,
                name: s.name,
                property: s.property,
                isBinary: s.isBinary,
            }))
            dispatch({
                type: ConfigMapActionTypes.multipleOptions,
                payload: { secretDataYaml: YAMLStringify(configMapSecretData.secretData), secretData: json },
            })
        }
        if (configMapSecretData.esoSecretData?.esoData) {
            dispatch({
                type: ConfigMapActionTypes.multipleOptions,
                payload: {
                    esoData: configMapSecretData.esoSecretData.esoData,
                    secretStore: configMapSecretData.esoSecretData.secretStore,
                    secretStoreRef: configMapSecretData.esoSecretData.secretStoreRef,
                    refreshInterval: configMapSecretData.esoSecretData.refreshInterval,
                    esoSecretYaml: YAMLStringify(configMapSecretData.esoSecretData),
                },
            })
        }
    } catch (err) {
        showError(err)
    }
}

export const transformSecretDataJSON = (jsonObj: any[]) =>
    jsonObj.map((j) => {
        const temp = {
            isBinary: null,
            fileName: null,
            name: null,
            property: null,
            value: null,
        }
        temp.isBinary = j.isBinary
        if (j.key) {
            temp.fileName = j.key
        }
        if (j.property) {
            temp.property = j.property
        }
        if (j.name) {
            temp.name = j.name
        }
        return temp
    })

const handleValidJson = (isESO: boolean, json, dispatch: (action: ConfigMapAction) => void): void => {
    if (isESO) {
        const payload = {
            secretStore: json.secretStore,
            secretStoreRef: json.secretStoreRef,
            refreshInterval: json.refreshInterval,
            esoData: null,
            dataFrom: null,
            template: null,
        }
        if (Array.isArray(json?.esoData)) {
            payload.esoData = json.esoData
        }
        if (Array.isArray(json?.dataFrom)) {
            payload.dataFrom = json.dataFrom
        }
        if (typeof json?.template === 'object' && !Array.isArray(json.template)) {
            payload.template = json.template
        }
        dispatch({
            type: ConfigMapActionTypes.multipleOptions,
            payload,
        })
    } else if (Array.isArray(json)) {
        const _json = transformSecretDataJSON(json)
        dispatch({
            type: ConfigMapActionTypes.setSecretData,
            payload: _json,
        })
    }
}

export function handleSecretDataYamlChange(
    yaml: any,
    codeEditorRadio: string,
    isESO: boolean,
    dispatch: (action: ConfigMapAction) => void,
): void {
    if (codeEditorRadio !== CODE_EDITOR_RADIO_STATE.DATA) {
        return
    }
    dispatch({
        type: isESO ? ConfigMapActionTypes.setEsoYaml : ConfigMapActionTypes.setSecretDataYaml,
        payload: yaml,
    })
    try {
        const json = YAML.parse(yaml)
        if (!json || !Object.keys(json).length) {
            dispatch({
                type: ConfigMapActionTypes.multipleOptions,
                payload: {
                    secretData: [],
                    esoData: [],
                    secretStore: null,
                    secretStoreRef: null,
                    refreshInterval: null,
                },
            })
        } else {
            handleValidJson(isESO, json, dispatch)
        }
    } catch {
        // do nothing
    }
}

export const getSecretInitState = (configMapSecretData): SecretState => {
    let tempSecretData
    let jsonForSecretDataYaml
    if (configMapSecretData?.secretData?.length) {
        tempSecretData = configMapSecretData.secretData
        jsonForSecretDataYaml = configMapSecretData.secretData
    } else {
        tempSecretData = configMapSecretData?.defaultSecretData ?? []
        jsonForSecretDataYaml = configMapSecretData?.defaultSecretData ?? []
    }
    tempSecretData = tempSecretData.map((s) => ({
        fileName: s.key,
        name: s.name,
        isBinary: s.isBinary,
        property: s.property,
    }))
    jsonForSecretDataYaml = transformSecretDataJSON(jsonForSecretDataYaml)
    const tempEsoSecretData =
        (configMapSecretData?.esoSecretData?.esoData || []).length === 0 &&
        !configMapSecretData?.esoSecretData?.template &&
        !configMapSecretData?.esoSecretData?.dataFrom &&
        configMapSecretData?.defaultESOSecretData
            ? configMapSecretData?.defaultESOSecretData
            : configMapSecretData?.esoSecretData
    const isEsoSecretData: boolean =
        (tempEsoSecretData?.secretStore || tempEsoSecretData?.secretStoreRef) &&
        (tempEsoSecretData.esoData || tempEsoSecretData.template || tempEsoSecretData.dataFrom)
    return {
        externalType: configMapSecretData?.externalType ?? '',
        roleARN: {
            value: configMapSecretData?.roleARN ?? '',
            error: '',
        },
        esoData: tempEsoSecretData?.esoData,
        template: tempEsoSecretData?.template,
        dataFrom: tempEsoSecretData?.dataFrom,
        secretData: tempSecretData,
        secretDataYaml: YAMLStringify(jsonForSecretDataYaml),
        codeEditorRadio: CODE_EDITOR_RADIO_STATE.DATA,
        esoDataSecret: tempEsoSecretData?.esoData,
        secretStore: tempEsoSecretData?.secretStore,
        secretStoreRef: tempEsoSecretData?.secretStoreRef,
        refreshInterval: tempEsoSecretData?.refreshInterval,
        esoSecretYaml: isEsoSecretData ? YAMLStringify(tempEsoSecretData) : '',
        secretMode: false,
        unAuthorized: configMapSecretData?.unAuthorized ?? !!configMapSecretData?.name,
    }
}

export const ConfigMapOptions: OptionType[] = [
    { value: '', label: 'Kubernetes ConfigMap' },
    { value: 'KubernetesConfigMap', label: 'Kubernetes External ConfigMap' },
]

export const ExternalSecretHelpNote = () => (
    <div className="fs-13 fw-4 lh-18">
        <NavLink to={`${URLS.CHARTS_DISCOVER}?appStoreName=external-secret`} className="dc__link" target="_blank">
            External Secrets Operator
        </NavLink>
        &nbsp;should be installed in the target cluster.&nbsp;
        <a className="dc__link" href={DOCUMENTATION.EXTERNAL_SECRET} rel="noreferrer noopener" target="_blank">
            Learn more
        </a>
    </div>
)
