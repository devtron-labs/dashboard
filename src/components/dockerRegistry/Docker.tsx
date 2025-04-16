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

import { KeyboardEventHandler, useEffect, useState } from 'react'
import {
    showError,
    Progressing,
    sortCallback,
    ErrorScreenNotAuthorized,
    Reload,
    RadioGroup,
    RadioGroupItem,
    not,
    CHECKBOX_VALUE,
    Checkbox,
    REGISTRY_TYPE_MAP,
    ConditionalWrap,
    RepositoryAction,
    ServerErrors,
    useAsync,
    CustomInput,
    noop,
    InfoIconTippy,
    DEFAULT_SECRET_PLACEHOLDER,
    OptionType,
    SelectPicker,
    ToastVariantType,
    ToastManager,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ERROR_STATUS_CODE,
    DeleteConfirmationModal,
    Textarea,
    Tooltip,
    RegistryType as CommonRegistryType,
    RegistryIcon,
    ComponentSizeType,
    PasswordField,
    ButtonComponentType,
    InfoBlock,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { useForm, handleOnBlur, handleOnFocus, parsePassword, importComponentFromFELibrary, Trash } from '../common'
import {
    getClusterListMinWithoutAuth,
    getDockerRegistryList,
    validateContainerConfiguration,
} from '../../services/service'
import { saveRegistryConfig, updateRegistryConfig, deleteDockerReg } from './service'
import { List } from '../globalConfigurations/GlobalConfiguration'
import {
    DOCUMENTATION,
    RegistryTypeName,
    OCIRegistryConfigConstants,
    OCIRegistryStorageConfigType,
    RegistryStorageType,
    RegistryPayloadType,
    REGISTRY_TITLE_DESCRIPTION_CONTENT,
    RegistryType,
    EA_MODE_REGISTRY_TITLE_DESCRIPTION_CONTENT,
    URLS,
    PATTERNS,
    OCIRegistryStorageActionType,
} from '../../config'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as ICHelpOutline } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Info } from '../../assets/icons/ic-info-outlined.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as InfoFilled } from '../../assets/icons/ic-info-filled.svg'
import { DC_CONTAINER_REGISTRY_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import { AuthenticationType } from '../cluster/cluster.type'
import ManageRegistry from './ManageRegistry'
import {
    CredentialType,
    CustomCredential,
    RemoteConnectionType,
    RemoteConnectionTypeRegistry,
    SSHAuthenticationType,
} from './dockerType'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import { VALIDATION_STATUS, ValidateForm } from '../common/ValidateForm/ValidateForm'

const RegistryHelmPushCheckbox = importComponentFromFELibrary('RegistryHelmPushCheckbox')
const RemoteConnectionRadio = importComponentFromFELibrary('RemoteConnectionRadio')
const getRemoteConnectionConfig = importComponentFromFELibrary('getRemoteConnectionConfig', noop, 'function')

enum CERTTYPE {
    SECURE = 'secure',
    INSECURE = 'insecure',
    SECURE_WITH_CERT = 'secure-with-cert',
}

const getInitialSSHAuthenticationType = (remoteConnectionConfig: any): SSHAuthenticationType => {
    const sshConfig = remoteConnectionConfig?.sshConfig
    if (sshConfig) {
        if (sshConfig.sshPassword && sshConfig.sshAuthKey) {
            return SSHAuthenticationType.Password_And_SSH_Private_Key
        } else if (sshConfig.sshAuthKey) {
            return SSHAuthenticationType.SSH_Private_Key
        }
    }
    return SSHAuthenticationType.Password
}

export default function Docker({ ...props }) {
    const [loading, result, error, reload] = useAsync(getDockerRegistryList, [], props.isSuperAdmin)
    const [clusterOption, setClusterOptions] = useState([])
    const [clusterLoader, setClusterLoader] = useState(false)

    const _getInit = async () => {
        if (props.isHyperionMode) {
            return
        }
        setClusterLoader(true)
        await getClusterListMinWithoutAuth()
            .then((clusterListRes) => {
                if (Array.isArray(clusterListRes.result)) {
                    setClusterOptions([
                        { label: 'All clusters', value: '-1' },
                        ...clusterListRes.result
                            .filter((cluster) => !cluster.isVirtualCluster)
                            .map((cluster) => {
                                return {
                                    label: cluster.cluster_name,
                                    value: cluster.id,
                                }
                            }),
                    ])
                }
                setClusterLoader(false)
            })
            .catch((err) => {
                showError(err)
                setClusterLoader(false)
            })
    }

    useEffect(() => {
        if (props.isSuperAdmin) {
            _getInit()
        }
    }, [])

    if (!props.isSuperAdmin) {
        return <ErrorScreenNotAuthorized />
    }
    if ((loading && !result) || clusterLoader) {
        return <Progressing pageLoader />
    }
    if (error) {
        showError(error)
        if (!result) {
            return <Reload />
        }
    }
    if (clusterOption.length === 0 && !props.isHyperionMode) {
        return <Reload />
    }

    let dockerRegistryList = result?.result || []
    dockerRegistryList = dockerRegistryList.sort((a, b) => sortCallback('id', a, b))
    dockerRegistryList = [{ id: null }].concat(dockerRegistryList)
    const additionalRegistryTitleTippyContent = () => {
        if (props.isHyperionMode) {
            return null
        }
        return <p className="p-12 fs-13 fw-4 lh-20">{REGISTRY_TITLE_DESCRIPTION_CONTENT.additionalParagraphText}</p>
    }

    return (
        <section
            className="global-configuration__component flex-1"
            data-testid="select-existing-container-registry-list"
        >
            <div className="flex left fs-16 cn-9 fw-6 mb-20" data-testid="container-oci-registry-heading">
                {props.isHyperionMode
                    ? EA_MODE_REGISTRY_TITLE_DESCRIPTION_CONTENT.heading
                    : REGISTRY_TITLE_DESCRIPTION_CONTENT.heading}
                <InfoIconTippy
                    heading={
                        props.isHyperionMode
                            ? EA_MODE_REGISTRY_TITLE_DESCRIPTION_CONTENT.heading
                            : REGISTRY_TITLE_DESCRIPTION_CONTENT.heading
                    }
                    infoText={
                        props.isHyperionMode
                            ? EA_MODE_REGISTRY_TITLE_DESCRIPTION_CONTENT.infoText
                            : REGISTRY_TITLE_DESCRIPTION_CONTENT.infoText
                    }
                    additionalContent={additionalRegistryTitleTippyContent()}
                    documentationLinkText={
                        props.isHyperionMode
                            ? EA_MODE_REGISTRY_TITLE_DESCRIPTION_CONTENT.documentationLinkText
                            : REGISTRY_TITLE_DESCRIPTION_CONTENT.documentationLinkText
                    }
                    documentationLink={DOCUMENTATION.GLOBAL_CONFIG_DOCKER}
                    iconClassName="icon-dim-20 ml-4"
                />
            </div>
            {dockerRegistryList.map((docker) => (
                <CollapsedList
                    isHyperionMode={props.isHyperionMode}
                    reload={reload}
                    {...docker}
                    clusterOption={clusterOption}
                    key={docker.id || Math.random().toString(36).substr(2, 5)}
                />
            ))}
        </section>
    )
}

const CollapsedList = ({
    isHyperionMode,
    id = '',
    pluginId = null,
    registryUrl = '',
    registryType = '',
    awsAccessKeyId = '',
    awsSecretAccessKey = '',
    awsRegion = '',
    isDefault = false,
    active = true,
    username = '',
    password = '',
    reload,
    connection = '',
    cert = '',
    isOCICompliantRegistry = isHyperionMode,
    isPublic = false,
    ipsConfig = !isHyperionMode
        ? {
              id: 0,
              credentialType: '',
              credentialValue: '',
              appliedClusterIdsCsv: '',
              ignoredClusterIdsCsv: '',
          }
        : null,
    remoteConnectionConfig = getRemoteConnectionConfig(),
    clusterOption,
    repositoryList = [],
    disabledFields = [],
    ociRegistryConfig,
    ...rest
}) => {
    const [collapsed, toggleCollapse] = useState(true)
    const history = useHistory()
    const { path } = useRouteMatch()
    const params = useParams<{ id: string }>()

    const setToggleCollapse = () => {
        if (id === null && params.id !== '0') {
            history.push(`${path.replace(':id', '0')}`)
        } else if (id && params.id !== id) {
            history.push(`${path.replace(':id', id)}`)
        } else {
            history.push(`${path.replace('/:id', '')}`)
        }
    }

    return (
        <article className={`collapsed-list collapsed-list--docker collapsed-list--${id ? 'update' : 'create dashed'}`}>
            <List
                dataTestId={id || 'add-registry-button'}
                onClick={setToggleCollapse}
                className={`${!id && !collapsed ? 'no-grid-column' : ''}`}
            >
                {id && (
                    <List.Logo>
                        <RegistryIcon registryType={registryType as CommonRegistryType} />
                    </List.Logo>
                )}
                {!id && collapsed && (
                    <List.Logo>
                        <Add className="icon-dim-24 fcb-5 dc__vertical-align-middle" />
                    </List.Logo>
                )}

                <div className="flex left">
                    <List.Title
                        style={{ color: !id && !collapsed ? 'var(--N900)' : '' }}
                        title={id || 'Add Registry'}
                        subtitle={registryUrl}
                        tag={isDefault ? 'DEFAULT' : ''}
                    />
                </div>
                {id && (
                    <List.DropDown
                        onClick={setToggleCollapse}
                        className="rotate"
                        style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                    />
                )}
            </List>
            {(params.id === id || (!id && params.id === '0')) && (
                <DockerForm
                    {...{
                        isHyperionMode,
                        id,
                        pluginId,
                        registryUrl,
                        registryType,
                        awsAccessKeyId,
                        awsSecretAccessKey,
                        awsRegion,
                        isDefault,
                        active,
                        username,
                        password,
                        reload,
                        toggleCollapse,
                        connection,
                        cert,
                        isOCICompliantRegistry,
                        ipsConfig,
                        remoteConnectionConfig,
                        clusterOption,
                        setToggleCollapse,
                        repositoryList,
                        isPublic,
                        disabledFields,
                        ociRegistryConfig,
                    }}
                />
            )}
        </article>
    )
}

const DockerForm = ({
    isHyperionMode,
    id,
    pluginId,
    registryUrl,
    registryType,
    awsAccessKeyId,
    awsSecretAccessKey,
    awsRegion,
    isDefault,
    active,
    username,
    password,
    reload,
    toggleCollapse,
    connection,
    cert,
    isOCICompliantRegistry,
    ipsConfig,
    remoteConnectionConfig,
    clusterOption,
    setToggleCollapse,
    repositoryList,
    isPublic,
    disabledFields,
    ociRegistryConfig = isPublic || isHyperionMode
        ? {
              CHART: OCIRegistryConfigConstants.PULL,
          }
        : {
              CONTAINER: OCIRegistryConfigConstants.PULL_PUSH,
          },
    ...rest
}) => {
    const re = PATTERNS.APP_NAME
    const regExp = new RegExp(re)
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            registryType: { value: registryType || 'ecr', error: '' },
            advanceSelect: { value: connection || CERTTYPE.SECURE, error: '' },
            certInput: { value: cert || '', error: '' },
        },
        {
            registryType: {
                required: true,
                validator: { error: 'Type is required', regex: /^.*$/ },
            },
            advanceSelect: {
                required: true,
                validator: { error: 'Mode is required', regex: /^.*$/ },
            },
            certInput: {
                required: false,
            },
        },
        onValidation,
    )
    const history = useHistory()
    const [loading, toggleLoading] = useState(false)
    const [Isdefault, toggleDefault] = useState(isDefault)
    const [toggleCollapsedAdvancedRegistry, setToggleCollapsedAdvancedRegistry] = useState(false)
    const [certError, setCertInputError] = useState('')
    const _selectedDockerRegistryType = REGISTRY_TYPE_MAP[state.registryType.value || 'ecr']
    const [selectedDockerRegistryType, setSelectedDockerRegistryType] = useState(_selectedDockerRegistryType)
    const regPass =
        state.registryType.value === RegistryType.GCR || state.registryType.value === RegistryType.ARTIFACT_REGISTRY
            ? password.substring(1, password.length - 1)
            : password

    let _remoteConnectionMethod = RemoteConnectionType.Direct
    if (remoteConnectionConfig?.connectionMethod) {
        _remoteConnectionMethod = remoteConnectionConfig?.connectionMethod
    }
    const [remoteConnectionMethod, setRemoteConnectionMethod] = useState(_remoteConnectionMethod)

    const initialSSHAuthenticationType = getInitialSSHAuthenticationType(remoteConnectionConfig)

    const [sshConnectionType, setSSHConnectionType] = useState(initialSSHAuthenticationType)

    const [customState, setCustomState] = useState({
        id: { value: id, error: '' },
        awsAccessKeyId: { value: awsAccessKeyId, error: '' },
        awsSecretAccessKey: {
            value: id && !awsSecretAccessKey ? DEFAULT_SECRET_PLACEHOLDER : awsSecretAccessKey,
            error: '',
        },
        registryUrl: { value: registryUrl, error: '' },
        username: { value: username, error: '' },
        password: {
            value: id && !password ? DEFAULT_SECRET_PLACEHOLDER : regPass,
            error: '',
        },
        repositoryList: {
            value: repositoryList.map((item) => ({ label: item, value: item })),
            error: '',
            inputValue: '',
        },
        remoteConnectionConfig: {
            connectionMethod: { value: remoteConnectionMethod, error: '' },
            proxyConfig: {
                proxyUrl: { value: remoteConnectionConfig?.proxyConfig?.proxyUrl || '', error: '' },
            },
            sshConfig: {
                sshServerAddress: { value: remoteConnectionConfig?.sshConfig?.sshServerAddress || '', error: '' },
                sshUsername: { value: remoteConnectionConfig?.sshConfig?.sshUsername || '', error: '' },
                sshPassword: { value: remoteConnectionConfig?.sshConfig?.sshPassword || '', error: '' },
                sshAuthKey: { value: remoteConnectionConfig?.sshConfig?.sshAuthKey || '', error: '' },
            },
        },
    })
    const customStateValidator = {
        id: [
            { error: 'Name is required', regex: /^(?=.*).+$/ },
            {
                error: "Start with alphabet; End with alphanumeric; Use only lowercase; Allowed:(-); Do not use 'spaces'",
                regex: regExp,
            },
            { error: 'Minimum 3 and Maximum 30 characters required', regex: /^.{3,30}$/ },
        ],
        registryUrl: [{ error: "Registry URL is required; Do not use 'spaces'", regex: /^(?=.*).+$/ }],
        proxyUrl: [
            {
                error: 'Please provide a valid URL. URL must start with http:// or https://',
                regex: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
            },
        ],
        sshServerAddress: [
            {
                error: 'Please provide a valid URL. URL must start with http:// or https://',
                regex: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
            },
        ],
        sshUsername: [
            {
                error: 'Username or User Identifier is required. Username cannot contain spaces or special characters other than _ and -',
                regex: /^[A-Za-z0-9_-]+$/,
            },
        ],
        sshPassword: [{ error: 'password is required', regex: /^(?!\s*$).+/ }],
        sshAuthKey: [{ error: 'private key is required', regex: /^(?!\s*$).+/ }],
    }

    const clusterlistMap = new Map()

    for (let index = 0; index < clusterOption.length; index++) {
        const currentItem = clusterOption[index]
        clusterlistMap.set(`${currentItem.value}`, currentItem)
    }
    let _ignoredClusterIdsCsv = !ipsConfig
        ? []
        : ipsConfig.ignoredClusterIdsCsv && ipsConfig.ignoredClusterIdsCsv != '-1'
          ? ipsConfig.ignoredClusterIdsCsv.split(',').map((clusterId) => {
                return clusterlistMap.get(clusterId)
            })
          : !ipsConfig.appliedClusterIdsCsv || ipsConfig.ignoredClusterIdsCsv === '-1'
            ? clusterOption
            : []

    _ignoredClusterIdsCsv = _ignoredClusterIdsCsv.filter((clusterIds) => !!clusterIds)

    let _appliedClusterIdsCsv = ipsConfig?.appliedClusterIdsCsv
        ? ipsConfig.appliedClusterIdsCsv.indexOf('-1') >= 0
            ? clusterOption
            : ipsConfig.appliedClusterIdsCsv.split(',').map((clusterId) => {
                  if (clusterId || clusterlistMap.get(clusterId)) {
                      return clusterlistMap.get(clusterId)
                  }
              })
        : []

    _appliedClusterIdsCsv = _appliedClusterIdsCsv.filter((clusterIds) => !!clusterIds)

    const isCustomScript = ipsConfig?.credentialType === CredentialType.CUSTOM_CREDENTIAL

    const defaultCustomCredential = {
        server: '',
        email: '',
        username: '',
        password: '',
    }

    const [confirmationModal, setConfirmationModal] = useState(false)
    const [isIAMAuthType, setIAMAuthType] = useState(!awsAccessKeyId && !awsSecretAccessKey)
    const [blackList, setBlackList] = useState(_ignoredClusterIdsCsv)
    const [whiteList, setWhiteList] = useState(_appliedClusterIdsCsv)
    const [blackListEnabled, setBlackListEnabled] = useState<boolean>(_appliedClusterIdsCsv.length === 0)
    const [credentialsType, setCredentialType] = useState<string>(
        ipsConfig?.credentialType || CredentialType.SAME_AS_REGISTRY,
    )
    const [credentialValue, setCredentialValue] = useState<string>(isCustomScript ? '' : ipsConfig?.credentialValue)
    const [showManageModal, setManageModal] = useState(false)
    const [registryStorageType, setRegistryStorageType] = useState<string>(
        isPublic ? RegistryStorageType.OCI_PUBLIC : RegistryStorageType.OCI_PRIVATE,
    )

    const InitialValueOfIsContainerStore: boolean =
        ociRegistryConfig?.CONTAINER === OCIRegistryConfigConstants.PULL_PUSH
    const [isContainerStore, setContainerStore] = useState<boolean>(InitialValueOfIsContainerStore)
    const [OCIRegistryStorageConfig, setOCIRegistryStorageConfig] =
        useState<OCIRegistryStorageConfigType>(ociRegistryConfig)
    const [customCredential, setCustomCredential] = useState<CustomCredential>(
        isCustomScript && ipsConfig?.credentialValue ? JSON.parse(ipsConfig.credentialValue) : defaultCustomCredential,
    )
    const [errorValidation, setErrorValidation] = useState<boolean>(false)
    const [showHelmPull, setListRepositories] = useState<boolean>(
        ociRegistryConfig?.CHART === OCIRegistryConfigConstants.PULL ||
            ociRegistryConfig?.CHART === OCIRegistryConfigConstants.PULL_PUSH,
    )
    const [isOCIRegistryHelmPush, setOCIRegistryHelmPush] = useState<boolean>(
        ociRegistryConfig?.CHART === OCIRegistryConfigConstants.PUSH ||
            ociRegistryConfig?.CHART === OCIRegistryConfigConstants.PULL_PUSH,
    )
    const [validationError, setValidationError] = useState({ errTitle: '', errMessage: '' })
    const [validationStatus, setValidationStatus] = useState(
        VALIDATION_STATUS.DRY_RUN || VALIDATION_STATUS.FAILURE || VALIDATION_STATUS.LOADER || VALIDATION_STATUS.SUCCESS,
    )
    const [repositoryError, setRepositoryError] = useState<string>('')
    const ChartStoreRedirectionUrl: string = id ? `${URLS.CHARTS_DISCOVER}?registryId=${id}` : URLS.CHARTS_DISCOVER

    const customHandleChange = (e): void => {
        updateWithCustomStateValidation(e.target.name, e.target.value)
    }

    const changeSSHAuthenticationType = (authType: SSHAuthenticationType) => {
        setSSHConnectionType(authType)
    }

    const updateWithCustomStateValidation = (name: string, value: any): boolean => {
        let errorMessage: string = ''
        customStateValidator[name]?.forEach((validator) => {
            if (!validator.regex.test(value)) {
                errorMessage = validator.error
            }
        })
        setCustomState((st) => ({ ...st, [name]: { value, error: errorMessage } }))
        return !!errorMessage
    }

    const updateWithCustomStateValidationForRemoteConnectionConfig = (name: string, value: string): boolean => {
        let errorMessage: string = ''
        customStateValidator[name]?.forEach((validator) => {
            if (!validator.regex.test(value)) {
                errorMessage = validator.error
            }
        })

        if (name.startsWith('proxy')) {
            setCustomState((_state) => ({
                ..._state,
                remoteConnectionConfig: {
                    ..._state.remoteConnectionConfig,
                    proxyConfig: {
                        ..._state.remoteConnectionConfig.proxyConfig,
                        [name]: { value, error: errorMessage },
                    },
                },
            }))
        } else if (name.startsWith('ssh')) {
            setCustomState((_state) => ({
                ..._state,
                remoteConnectionConfig: {
                    ..._state.remoteConnectionConfig,
                    sshConfig: {
                        ..._state.remoteConnectionConfig.sshConfig,
                        [name]: { value, error: errorMessage },
                    },
                },
            }))
        }
        return !!errorMessage
    }

    const handleRegistryTypeChange = (selectedRegistry) => {
        setSelectedDockerRegistryType(selectedRegistry)
        setCustomState((st) => ({
            ...st,
            registryUrl: { value: selectedRegistry.defaultRegistryURL, error: '' },
            username: { value: selectedRegistry.id.defaultValue, error: '' },
            password: { value: selectedRegistry.password.defaultValue, error: '' },
            awsAccessKeyId: { value: '', error: '' },
            awsSecretAccessKey: { value: '', error: '' },
        }))
    }

    const handleOnChangeForRemoteConnectionRadio = (connectionType) => {
        setRemoteConnectionMethod(connectionType)
        setCustomState((_state) => ({
            ..._state,
            remoteConnectionConfig: {
                ..._state.remoteConnectionConfig,
                connectionMethod: { value: connectionType, error: '' },
            },
        }))
    }

    const handleOnChangeConfig = (e) => {
        let { name, value } = e.target

        if (name.startsWith('proxy')) {
            setCustomState((_state) => ({
                ..._state,
                remoteConnectionConfig: {
                    ..._state.remoteConnectionConfig,
                    proxyConfig: {
                        ..._state.remoteConnectionConfig.proxyConfig,
                        [name]: { value: value, error: '' },
                    },
                },
            }))
        } else if (name.startsWith('ssh')) {
            setCustomState((_state) => ({
                ..._state,
                remoteConnectionConfig: {
                    ..._state.remoteConnectionConfig,
                    sshConfig: {
                        ..._state.remoteConnectionConfig.sshConfig,
                        [name]: { value: value, error: '' },
                    },
                },
            }))
        }
    }

    const handleRepositoryListError = () => {
        let errorMessage = ''

        if (!customState.repositoryList.value.length) {
            errorMessage = 'Registry List is required'
            setCustomState({ ...customState, repositoryList: { ...customState.repositoryList, error: errorMessage } })
        }

        return !!errorMessage
    }

    const onECRAuthTypeChange = (e) => {
        if (e.target.value === AuthenticationType.IAM) {
            setIAMAuthType(true)
            setCustomState((_state) => ({
                ..._state,
                awsAccessKeyId: { value: '', error: '' },
                awsSecretAccessKey: { value: '', error: '' },
            }))
        } else {
            setIAMAuthType(false)
            setCustomState((_state) => ({
                ..._state,
                awsAccessKeyId: { value: awsAccessKeyId, error: '' },
                awsSecretAccessKey: { value: awsSecretAccessKey, error: '' },
            }))
        }
    }

    const onRegistryStorageTypeChange = (e) => {
        if (e.target.value === RegistryStorageType.OCI_PRIVATE) {
            setRegistryStorageType(RegistryStorageType.OCI_PRIVATE)
            setCustomState((st) => ({
                ...st,
                registryUrl: {
                    value: selectedDockerRegistryType.defaultRegistryURL || customState.registryUrl.value,
                    error: '',
                },
            }))
        } else if (e.target.value === RegistryStorageType.OCI_PUBLIC) {
            setRegistryStorageType(RegistryStorageType.OCI_PUBLIC)
        }
    }

    function fetchAWSRegion(): string {
        const pattern =
            registryStorageType === RegistryStorageType.OCI_PUBLIC
                ? /^public\.ecr\.aws(\/.*)?$/i
                : /(ecr.)[a-z]{2}-[a-z]*-[0-9]{1}/i
        const result = customState.registryUrl.value.match(pattern)
        if (!result) {
            setCustomState((st) => ({
                ...st,
                registryUrl: { ...st.registryUrl, error: st.registryUrl.value ? 'Invalid URL' : 'Mandatory' },
            }))
            return ''
        }
        return result[0].split('ecr.')[1]
    }

    function isValidJson(inputString: string): boolean {
        try {
            JSON.parse(inputString)
        } catch (e) {
            return false
        }
        return true
    }

    const getRegistryPayload = (awsRegion?: string): RegistryPayloadType => {
        const appliedClusterIdsCsv = whiteList?.map((cluster) => cluster?.value)?.join(',')
        const ignoredClusterIdsCsv = blackList?.map((cluster) => cluster?.value)?.join(',')
        const trimmedUsername = customState.username.value.replace(/\s/g, '')
        const _ociRegistryConfig =
            registryStorageType === RegistryStorageType.OCI_PUBLIC || isHyperionMode
                ? { CHART: OCIRegistryConfigConstants.PULL }
                : OCIRegistryStorageConfig
        return {
            id: customState.id.value,
            pluginId: 'cd.go.artifact.docker.registry',
            registryType: selectedDockerRegistryType.value,
            isDefault:
                !isHyperionMode &&
                (registryStorageType === RegistryStorageType.OCI_PRIVATE ||
                    selectedDockerRegistryType.value === RegistryType.GCR)
                    ? Isdefault
                    : false,
            isOCICompliantRegistry: selectedDockerRegistryType.value !== RegistryType.GCR,
            ociRegistryConfig: selectedDockerRegistryType.value !== RegistryType.GCR ? _ociRegistryConfig : null,
            isPublic:
                selectedDockerRegistryType.value !== RegistryType.GCR
                    ? registryStorageType === RegistryStorageType.OCI_PUBLIC
                    : false,
            repositoryList:
                selectedDockerRegistryType.value !== RegistryType.GCR &&
                (registryStorageType === RegistryStorageType.OCI_PUBLIC ||
                    OCIRegistryStorageConfig?.CHART === OCIRegistryConfigConstants.PULL_PUSH ||
                    OCIRegistryStorageConfig?.CHART === OCIRegistryConfigConstants.PULL)
                    ? customState.repositoryList.value.map((item) => item.value)
                    : null,
            registryUrl: customState.registryUrl.value
                ?.trim()
                .replace(/^https?:\/\//, '')
                .replace(/^oci?:\/\//, '')
                .replace(/^docker?:\/\//, '')
                .replace(/^http?:\/\//, ''),
            ...(selectedDockerRegistryType.value === RegistryType.ECR &&
            registryStorageType !== RegistryStorageType.OCI_PUBLIC
                ? {
                      awsAccessKeyId: customState.awsAccessKeyId.value?.trim(),
                      awsSecretAccessKey: parsePassword(customState.awsSecretAccessKey.value),
                      awsRegion,
                  }
                : {}),
            ...((selectedDockerRegistryType.value === RegistryType.ARTIFACT_REGISTRY &&
                registryStorageType !== RegistryStorageType.OCI_PUBLIC) ||
            selectedDockerRegistryType.value === RegistryType.GCR
                ? {
                      username: trimmedUsername,
                      password:
                          customState.password.value === DEFAULT_SECRET_PLACEHOLDER
                              ? parsePassword(customState.password.value)
                              : `'${parsePassword(customState.password.value)}'`,
                  }
                : {}),
            ...(registryStorageType !== RegistryStorageType.OCI_PUBLIC &&
            (selectedDockerRegistryType.value === RegistryType.DOCKER_HUB ||
                selectedDockerRegistryType.value === RegistryType.ACR ||
                selectedDockerRegistryType.value === RegistryType.QUAY)
                ? {
                      username: trimmedUsername,
                      password: parsePassword(customState.password.value),
                  }
                : {}),
            ...(registryStorageType !== RegistryStorageType.OCI_PUBLIC &&
            selectedDockerRegistryType.value === RegistryType.OTHER
                ? {
                      username: trimmedUsername,
                      password: parsePassword(customState.password.value),
                      connection: state.advanceSelect.value,
                      cert: state.advanceSelect.value !== CERTTYPE.SECURE_WITH_CERT ? '' : state.certInput.value,
                  }
                : {}),

            ipsConfig:
                selectedDockerRegistryType.value === RegistryType.GCR ||
                (registryStorageType === RegistryStorageType.OCI_PRIVATE && OCIRegistryStorageConfig?.CONTAINER) ||
                !isHyperionMode
                    ? {
                          id: ipsConfig.id,
                          credentialType: credentialsType,
                          credentialValue:
                              credentialsType === CredentialType.CUSTOM_CREDENTIAL
                                  ? JSON.stringify(customCredential)
                                  : credentialValue,
                          appliedClusterIdsCsv:
                              whiteList.length && whiteList.findIndex((cluster) => cluster.value === '-1') >= 0
                                  ? '-1'
                                  : appliedClusterIdsCsv,
                          ignoredClusterIdsCsv:
                              whiteList.length === 0 &&
                              (blackList.length === 0 || blackList.findIndex((cluster) => cluster.value === '-1') >= 0)
                                  ? '-1'
                                  : ignoredClusterIdsCsv,
                      }
                    : null,
            remoteConnectionConfig: getRemoteConnectionConfig(
                customState.remoteConnectionConfig,
                customState.remoteConnectionConfig.connectionMethod.value,
                sshConnectionType,
            ),
        }
    }

    const handleDefaultChange = (e) => {
        if (isDefault) {
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Please mark another as default.',
            })
            return
        }
        toggleDefault(not)
    }

    async function onClickValidate() {
        const isValidated = performCustomValidation()
        if (!isValidated) {
            return
        }
        setValidationStatus(VALIDATION_STATUS.LOADER)
        const payload = getRegistryPayload(awsRegion)

        const promise = validateContainerConfiguration(payload)
        await promise
            .then((response) => {
                if (response.code === 200) {
                    setValidationStatus(VALIDATION_STATUS.SUCCESS)
                }
            })
            .catch((error) => {
                const code = error['code']
                const message = error['errors'][0].userMessage
                if (code === 400) {
                    setValidationStatus(VALIDATION_STATUS.FAILURE)
                    setValidationError({ errTitle: message, errMessage: message })
                } else {
                    // showError(error)
                    setValidationStatus(VALIDATION_STATUS.DRY_RUN)
                }
            })
    }

    async function onSave() {
        if (credentialsType === CredentialType.NAME && !credentialValue) {
            setErrorValidation(true)
            return
        }

        let awsRegion
        if (selectedDockerRegistryType.value === RegistryType.ECR) {
            awsRegion = fetchAWSRegion()
            if (!awsRegion) {
                return
            }
        }

        const payload = getRegistryPayload(awsRegion)

        const api = id ? updateRegistryConfig : saveRegistryConfig
        try {
            toggleLoading(true)
            id && (await onClickValidate())
            await api(payload, id)
            if (!id) {
                toggleCollapse(true)
            }
            await reload()
            await setToggleCollapse()
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Successfully saved',
            })
        } catch (err) {
            if (err instanceof ServerErrors && Array.isArray(err.errors) && err.code === 409) {
                err.errors.map(({ userMessage, internalMessage }) => {
                    setRepositoryError(userMessage || internalMessage)
                })
            } else {
                showError(err)
            }
        } finally {
            toggleLoading(false)
        }
    }

    const performCustomValidation = (): boolean => {
        if (!id && updateWithCustomStateValidation('id', customState.id.value)) {
            return false
        }
        if (!customState.id.value) {
            setCustomState((st) => ({
                ...st,
                id: { ...st.id, error: 'Name is required' },
            }))
            return false
        }
        if (customState.id.value.includes('/')) {
            setCustomState((st) => ({
                ...st,
                id: { ...st.id, error: 'Do not use "/"' },
            }))
            return false
        }

        // Custom state validation for Registry URL
        if (updateWithCustomStateValidation('registryUrl', customState.registryUrl.value)) {
            return false
        }
        switch (selectedDockerRegistryType.value) {
            case RegistryType.ECR:
                if (
                    registryStorageType === RegistryStorageType.OCI_PRIVATE &&
                    !isIAMAuthType &&
                    (!customState.awsAccessKeyId.value || !(customState.awsSecretAccessKey.value || id))
                ) {
                    setCustomState((st) => ({
                        ...st,
                        awsAccessKeyId: { ...st.awsAccessKeyId, error: st.awsAccessKeyId.value ? '' : 'Mandatory' },
                        awsSecretAccessKey: {
                            ...st.awsSecretAccessKey,
                            error: id || st.awsSecretAccessKey.value ? '' : 'Mandatory',
                        },
                    }))
                    return false
                }
                break
            case RegistryType.DOCKER_HUB:
                if (
                    registryStorageType === RegistryStorageType.OCI_PRIVATE &&
                    (!customState.username.value || !(customState.password.value || id))
                ) {
                    setCustomState((st) => ({
                        ...st,
                        username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                        password: { ...st.password, error: id || st.password.value ? '' : 'Mandatory' },
                    }))
                    return false
                }
                break
            case RegistryType.ARTIFACT_REGISTRY:
            case RegistryType.GCR:
                const isValidJsonFile: boolean = isValidJson(customState.password.value) || !!id
                const isValidJsonStr: string = isValidJsonFile ? '' : 'Invalid JSON'
                if (
                    registryStorageType === RegistryStorageType.OCI_PRIVATE &&
                    (!customState.username.value || !(customState.password.value || id) || !isValidJsonFile)
                ) {
                    setCustomState((st) => ({
                        ...st,
                        username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                        password: {
                            ...st.password,
                            error: id || st.password.value ? isValidJsonStr : 'Mandatory',
                        },
                    }))
                    return false
                }
                break
            case RegistryType.ACR:
            case RegistryType.QUAY:
            case RegistryType.OTHER:
                let error = false
                if (
                    registryStorageType === RegistryStorageType.OCI_PRIVATE &&
                    (!customState.username.value || !(customState.password.value || id))
                ) {
                    setCustomState((st) => ({
                        ...st,
                        username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                        password: { ...st.password, error: id || st.password.value ? '' : 'Mandatory' },
                    }))
                    error = true
                }

                if (
                    selectedDockerRegistryType.value === RegistryType.OTHER &&
                    state.advanceSelect.value === CERTTYPE.SECURE_WITH_CERT
                ) {
                    if (state.certInput.value === '') {
                        if (!toggleCollapsedAdvancedRegistry) {
                            setToggleCollapsedAdvancedRegistry(not)
                        }
                        setCertInputError('Mandatory')
                        error = true
                    } else {
                        setCertInputError('')
                    }
                }
                if (error) {
                    return false
                }
                break
        }

        // Default validation for OCI registries
        if (selectedDockerRegistryType.value !== RegistryType.GCR) {
            if (showHelmPull || registryStorageType === RegistryStorageType.OCI_PUBLIC) {
                if (handleRepositoryListError()) {
                    return false
                }
            }
            if (
                registryStorageType === RegistryStorageType.OCI_PRIVATE &&
                !(isContainerStore || isOCIRegistryHelmPush || showHelmPull)
            ) {
                return false
            }
        }

        if (customState.remoteConnectionConfig) {
            const { proxyConfig, sshConfig } = customState.remoteConnectionConfig
            if (
                remoteConnectionMethod === RemoteConnectionType.Proxy &&
                updateWithCustomStateValidationForRemoteConnectionConfig('proxyUrl', proxyConfig.proxyUrl.value)
            ) {
                return false
            }
            if (remoteConnectionMethod === RemoteConnectionType.SSHTunnel) {
                if (
                    updateWithCustomStateValidationForRemoteConnectionConfig(
                        'sshServerAddress',
                        sshConfig.sshServerAddress.value,
                    ) ||
                    updateWithCustomStateValidationForRemoteConnectionConfig('sshUsername', sshConfig.sshUsername.value)
                ) {
                    return false
                }
                if (
                    (sshConnectionType === SSHAuthenticationType.Password ||
                        sshConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key) &&
                    updateWithCustomStateValidationForRemoteConnectionConfig('sshPassword', sshConfig.sshPassword.value)
                ) {
                    return false
                }
                if (
                    (sshConnectionType === SSHAuthenticationType.SSH_Private_Key ||
                        sshConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key) &&
                    updateWithCustomStateValidationForRemoteConnectionConfig('sshAuthKey', sshConfig.sshAuthKey.value)
                ) {
                    return false
                }
            }
        }
        return true
    }

    function onValidation() {
        const isValidated = performCustomValidation()
        // save on successfully validated
        if (isValidated) {
            onSave()
        }
    }

    const advanceRegistryOptions = [
        { label: 'Allow only secure connection', value: CERTTYPE.SECURE, tippy: '' },
        {
            label: 'Allow secure connection with CA certificate',
            value: CERTTYPE.SECURE_WITH_CERT,
            tippy: 'Use to verify self-signed TLS Certificate',
        },
        {
            label: 'Allow insecure connection',
            value: CERTTYPE.INSECURE,
            tippy: 'This will enable insecure registry communication',
        },
    ]

    const onClickShowManageModal = (): void => {
        setManageModal(true)
    }
    const onClickHideManageModal = (): void => {
        setManageModal(false)
    }
    const handleChartStoreRedirection = (): void => {
        history.push(ChartStoreRedirectionUrl)
    }

    const handleContainerStoreUpdateAction = (isContainerStore: boolean): void => {
        if (!isContainerStore) {
            delete OCIRegistryStorageConfig['CONTAINER']
            setOCIRegistryStorageConfig({
                ...OCIRegistryStorageConfig,
            })
        } else {
            setOCIRegistryStorageConfig({
                ...OCIRegistryStorageConfig,
                CONTAINER: OCIRegistryConfigConstants.PULL_PUSH,
            })
        }
        setContainerStore(isContainerStore)
    }

    const handleOCIRegistryHelmPushAction = (isOCIRegistryHelmPush: boolean): void => {
        if (!isOCIRegistryHelmPush && !showHelmPull) {
            delete OCIRegistryStorageConfig['CHART']
            setOCIRegistryStorageConfig({
                ...OCIRegistryStorageConfig,
            })
        } else {
            let _currentChartConfig: OCIRegistryStorageActionType = isOCIRegistryHelmPush
                ? OCIRegistryConfigConstants.PUSH
                : OCIRegistryConfigConstants.PULL
            if (isOCIRegistryHelmPush && showHelmPull) {
                _currentChartConfig = OCIRegistryConfigConstants.PULL_PUSH
            }
            setOCIRegistryStorageConfig({
                ...OCIRegistryStorageConfig,
                CHART: _currentChartConfig,
            })
        }
        setOCIRegistryHelmPush(isOCIRegistryHelmPush)
    }

    const handleOCIRegistryHelmPullAction = (showHelmPull: boolean): void => {
        if (!isOCIRegistryHelmPush && !showHelmPull) {
            delete OCIRegistryStorageConfig['CHART']
            setOCIRegistryStorageConfig({
                ...OCIRegistryStorageConfig,
            })
        } else {
            let _currentChartConfig: OCIRegistryStorageActionType = showHelmPull
                ? OCIRegistryConfigConstants.PULL
                : OCIRegistryConfigConstants.PUSH
            if (isOCIRegistryHelmPush && showHelmPull) {
                _currentChartConfig = OCIRegistryConfigConstants.PULL_PUSH
            }
            setOCIRegistryStorageConfig({
                ...OCIRegistryStorageConfig,
                CHART: _currentChartConfig,
            })
        }
        setListRepositories(showHelmPull)
    }

    const handleOCIRegistryStorageAction = (e, key) => {
        e.stopPropagation()
        switch (key) {
            case RepositoryAction.CONTAINER:
                handleContainerStoreUpdateAction(!isContainerStore)
                break
            case RepositoryAction.CHART_PUSH:
                handleOCIRegistryHelmPushAction(!isOCIRegistryHelmPush)
                break
            case RepositoryAction.CHART_PULL:
                handleOCIRegistryHelmPullAction(!showHelmPull)
                break
        }
    }

    const appliedClusterList = whiteList?.map((_ac) => {
        return _ac?.label
    })

    const ignoredClusterList = blackList?.map((_ic) => {
        return _ic?.label
    })

    const renderRegistryCredentialText = () => {
        if (
            ipsConfig?.ignoredClusterIdsCsv === '-1' ||
            ignoredClusterList.findIndex((cluster) => cluster === 'All clusters') >= 0
        ) {
            return <div className="fw-6">No Cluster</div>
        }
        if (appliedClusterList.findIndex((cluster) => cluster === 'All clusters') >= 0) {
            return <div className="fw-6">All Clusters</div>
        }
        if (appliedClusterList.length > 0) {
            return <div className="fw-6"> {`Clusters: ${appliedClusterList}`} </div>
        }
        return <div className="fw-6">{` Clusters except ${ignoredClusterList}`} </div>
    }

    const renderRegistryCredentialsAutoInjectToClustersComponent = () => {
        if (!showManageModal) {
            return (
                <div className="en-2 bw-1 br-4 pt-10 pb-10 pl-16 pr-16 mb-16 fs-13">
                    <div className="flex dc__content-space">
                        <div className="cn-7 flex left ">
                            Registry credential access is auto injected to
                            <InfoIconTippy
                                heading="Manage access of registry credentials"
                                infoText="Clusters need permission to pull container image from private repository in
                                            the registry. You can control which clusters have access to the pull image
                                            from private repositories.
                                        "
                                iconClassName="icon-dim-16 fcn-6"
                            />
                        </div>
                        <div className="cb-5 cursor" onClick={onClickShowManageModal}>
                            Manage
                        </div>
                    </div>
                    {renderRegistryCredentialText()}
                </div>
            )
        }

        return (
            <ManageRegistry
                clusterOption={clusterOption}
                blackList={blackList}
                setBlackList={setBlackList}
                whiteList={whiteList}
                setWhiteList={setWhiteList}
                blackListEnabled={blackListEnabled}
                setBlackListEnabled={setBlackListEnabled}
                credentialsType={credentialsType}
                setCredentialType={setCredentialType}
                credentialValue={credentialValue}
                setCredentialValue={setCredentialValue}
                onClickHideManageModal={onClickHideManageModal}
                appliedClusterList={appliedClusterList}
                ignoredClusterList={ignoredClusterList}
                setCustomCredential={setCustomCredential}
                customCredential={customCredential}
                setErrorValidation={setErrorValidation}
                errorValidation={errorValidation}
            />
        )
    }

    const renderStoredContainerImage = () => {
        if (
            registryStorageType === RegistryStorageType.OCI_PUBLIC &&
            selectedDockerRegistryType.value !== RegistryType.GCR
        ) {
            return
        }
        if (
            registryStorageType === RegistryStorageType.OCI_PRIVATE &&
            selectedDockerRegistryType.value !== RegistryType.GCR
        ) {
            return (
                <>
                    <div className="dc__position-rel dc__hover mb-20">
                        <span className="form__input-header pb-20">
                            How do you want Devtron to connect with this registry?
                        </span>
                        <span className="pb-20">
                            {RemoteConnectionRadio && (
                                <RemoteConnectionRadio
                                    resourceType={RemoteConnectionTypeRegistry}
                                    connectionMethod={customState.remoteConnectionConfig?.connectionMethod}
                                    proxyConfig={customState.remoteConnectionConfig?.proxyConfig}
                                    sshConfig={customState.remoteConnectionConfig?.sshConfig}
                                    changeRemoteConnectionType={handleOnChangeForRemoteConnectionRadio}
                                    changeSSHAuthenticationType={changeSSHAuthenticationType}
                                    handleOnChange={handleOnChangeConfig}
                                />
                            )}
                        </span>
                    </div>
                    <div className="mb-12">
                        <span className="flexbox mr-16 cn-7 fs-13 fw-6 lh-20">
                            <span className="flex left w-150">
                                <span className="dc__required-field">Use repository to</span>
                            </span>
                            {!(isContainerStore || isOCIRegistryHelmPush || showHelmPull) && (
                                <span className="form__error">
                                    <Error className="form__icon form__icon--error" />
                                    This field is mandatory
                                </span>
                            )}
                        </span>
                    </div>
                    {!isHyperionMode && (
                        <ConditionalWrap
                            condition={disabledFields.some((test) => test === RepositoryAction.CONTAINER)}
                            wrap={(children) => (
                                <Tooltip
                                    alwaysShowTippyOnHover
                                    placement="left"
                                    content="Cannot be disabled as some build pipelines are using this registry to push container images."
                                >
                                    <div>{children}</div>
                                </Tooltip>
                            )}
                        >
                            <div
                                className={`flex left ${isContainerStore ? 'mb-12' : ''} ${
                                    !RegistryHelmPushCheckbox ? 'mb-12' : ''
                                }`}
                            >
                                <Checkbox
                                    rootClassName={`${
                                        disabledFields.some((test) => test === 'CONTAINER')
                                            ? 'registry-disabled-checkbox'
                                            : ''
                                    } docker-default mb-0`}
                                    isChecked={isContainerStore}
                                    value={CHECKBOX_VALUE.CHECKED}
                                    onChange={(e) => handleOCIRegistryStorageAction(e, RepositoryAction.CONTAINER)}
                                    dataTestId="store-checkbox"
                                    disabled={disabledFields.some((test) => test === RepositoryAction.CONTAINER)}
                                >
                                    Push container images
                                </Checkbox>
                            </div>
                        </ConditionalWrap>
                    )}
                    {!isHyperionMode && isContainerStore && (
                        <div className="pl-28">{renderRegistryCredentialsAutoInjectToClustersComponent()}</div>
                    )}
                    {!isHyperionMode && (
                        <ConditionalWrap
                            condition={disabledFields.some((test) => test === RepositoryAction.CHART_PUSH)}
                            wrap={(children) => (
                                <Tooltip
                                    alwaysShowTippyOnHover
                                    placement="left"
                                    content="Cannot be disabled as some deployment pipelines are using this registry to push helm packages."
                                >
                                    <div>{children}</div>
                                </Tooltip>
                            )}
                        >
                            <div>
                                {RegistryHelmPushCheckbox && (
                                    <RegistryHelmPushCheckbox
                                        handleOCIRegistryStorageAction={handleOCIRegistryStorageAction}
                                        disabledFields={disabledFields}
                                        isOCIRegistryHelmPush={isOCIRegistryHelmPush}
                                    />
                                )}
                            </div>
                        </ConditionalWrap>
                    )}
                    <ConditionalWrap
                        condition={disabledFields.some((test) => test === RepositoryAction.CHART_PULL)}
                        wrap={(children) => (
                            <Tooltip
                                alwaysShowTippyOnHover
                                placement="left"
                                content="Cannot be disabled as some applications are deployed using helm charts from this registry."
                            >
                                <div>{children}</div>
                            </Tooltip>
                        )}
                    >
                        <div>
                            <Checkbox
                                rootClassName={`${
                                    isHyperionMode ||
                                    disabledFields.some((test) => test === RepositoryAction.CHART_PULL)
                                        ? 'registry-disabled-checkbox'
                                        : ''
                                } docker-default mb-12`}
                                id={RepositoryAction.CHART_PULL}
                                isChecked={showHelmPull}
                                value={CHECKBOX_VALUE.CHECKED}
                                onChange={(e) => handleOCIRegistryStorageAction(e, RepositoryAction.CHART_PULL)}
                                dataTestId="store-checkbox"
                                disabled={
                                    isHyperionMode ||
                                    disabledFields.some((test) => test === RepositoryAction.CHART_PULL)
                                }
                            >
                                Use as chart repository (Pull helm charts and show in
                                <span className="ml-4 dc__link cursor" onClick={handleChartStoreRedirection}>
                                    chart store
                                </span>
                                .)
                            </Checkbox>
                        </div>
                    </ConditionalWrap>
                    {showHelmPull && <div className="pl-28">{renderRepositoryList()}</div>}

                    {!isHyperionMode && <hr className="mt-16 mb-16" />}
                </>
            )
        }
        return renderRegistryCredentialsAutoInjectToClustersComponent()
    }

    // CREATABLE METHODS
    /**
     * Sets the input value of creatable select as repository list value.
     */
    const setRepoListValue = () => {
        const { inputValue, value } = customState.repositoryList

        if (!inputValue.trim()) {
            return
        }

        setCustomState({
            ...customState,
            repositoryList: {
                error: '',
                inputValue: '',
                value: [...value, { label: inputValue.trim(), value: inputValue.trim() }],
            },
        })
    }

    /**
     * Handles the creatable value change.
     * @param value value of the creatable select.
     */
    const handleCreatableChange = (value: OptionType[]) => {
        setCustomState({ ...customState, repositoryList: { ...customState.repositoryList, value } })
    }

    /**
     * Handles the creatable input change.
     * @param inputValue inputValue tof the creatable select.
     */
    const handleCreatableInputChange = (inputValue: string) => {
        setCustomState((prev) => ({
            ...prev,
            repositoryList: { ...prev.repositoryList, inputValue },
        }))
    }

    /**
     * Handles the key down event of the creatable select.
     */
    const handleCreatableKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
        switch (event.key) {
            case 'Enter':
            case 'Tab':
            case ' ': // Space
            case ',':
                setRepoListValue()
                event.preventDefault()
        }
    }

    const renderPrivateDockerInfoContent = () => {
        return (
            <div className="flexbox dc__gap-6">
                Helm charts from provided repositories will be shown in the
                <Button
                    text="Chart store"
                    variant={ButtonVariantType.text}
                    component={ButtonComponentType.link}
                    linkProps={{
                        to: ChartStoreRedirectionUrl,
                    }}
                    dataTestId="chart-store-link"
                />
            </div>
        )
    }

    const renderRepositoryList = () => {
        if (selectedDockerRegistryType.value === RegistryType.GCR) {
            return
        }
        return (
            <>
                <div className="mb-12">
                    <SelectPicker
                        required
                        label="List of repositories"
                        isMulti
                        options={[]}
                        autoFocus
                        isClearable
                        placeholder="Enter repository name and press enter"
                        inputValue={customState.repositoryList.inputValue}
                        value={customState.repositoryList.value}
                        onBlur={setRepoListValue}
                        onInputChange={handleCreatableInputChange}
                        onKeyDown={handleCreatableKeyDown}
                        onChange={handleCreatableChange}
                        inputId="repository-list"
                        error={repositoryError || customState.repositoryList?.error}
                        shouldHideMenu
                        size={ComponentSizeType.large}
                    />
                </div>
                {registryStorageType === RegistryStorageType.OCI_PUBLIC && (
                    <InfoBlock description={renderPrivateDockerInfoContent()} />
                )}
            </>
        )
    }

    const renderDefaultRegistry = () => {
        if (
            !isHyperionMode &&
            (selectedDockerRegistryType.value === RegistryType.GCR ||
                (registryStorageType === RegistryStorageType.OCI_PRIVATE &&
                    (isContainerStore || isOCIRegistryHelmPush)))
        ) {
            return (
                <div className="flex left">
                    <Checkbox
                        rootClassName="docker-default mb-0"
                        isChecked={Isdefault}
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={handleDefaultChange}
                        dataTestId="set-as-default-registry-checkbox"
                    >
                        Set as default registry
                    </Checkbox>
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="top"
                        content={
                            <span style={{ display: 'block', width: '160px' }}>
                                Default container registry is automatically selected while creating an application.
                            </span>
                        }
                    >
                        <div className="flex">
                            <ICHelpOutline className="icon-dim-20 ml-8" />
                        </div>
                    </Tippy>
                </div>
            )
        }
    }

    const isGCROrGCP =
        selectedDockerRegistryType.value === RegistryType.ARTIFACT_REGISTRY ||
        selectedDockerRegistryType.value === RegistryType.GCR

    const renderAuthentication = () => {
        if (registryStorageType !== RegistryStorageType.OCI_PUBLIC) {
            if (selectedDockerRegistryType.value === RegistryType.ECR) {
                return (
                    <>
                        <div className="form__row mb-0-imp">
                            <RadioGroup
                                className="flex-wrap regisrty-form__radio-group"
                                value={isIAMAuthType ? AuthenticationType.IAM : AuthenticationType.BASIC}
                                name="ecr-authType"
                                onChange={onECRAuthTypeChange}
                            >
                                <span className="flex left cn-7 w-150 mr-16 fs-13 fw-6 lh-20 ">
                                    <span className="dc__required-field">Authentication</span>
                                </span>
                                <RadioGroupItem value={AuthenticationType.IAM} dataTestId="ec2-iam-role-button">
                                    EC2 IAM Role
                                </RadioGroupItem>
                                <RadioGroupItem value={AuthenticationType.BASIC} dataTestId="user-auth-button">
                                    User auth
                                </RadioGroupItem>
                            </RadioGroup>
                        </div>
                        {!isIAMAuthType && (
                            <>
                                <div className="form__row">
                                    <CustomInput
                                        name="awsAccessKeyId"
                                        required
                                        value={customState.awsAccessKeyId.value}
                                        error={customState.awsAccessKeyId.error}
                                        onChange={customHandleChange}
                                        label={selectedDockerRegistryType.id.label}
                                        placeholder={selectedDockerRegistryType.id.placeholder}
                                    />
                                </div>
                                <div className="form__row">
                                    <PasswordField
                                        name="awsSecretAccessKey"
                                        required
                                        value={customState.awsSecretAccessKey.value}
                                        error={customState.awsSecretAccessKey.error}
                                        shouldShowDefaultPlaceholderOnBlur={!!id}
                                        onChange={customHandleChange}
                                        label={selectedDockerRegistryType.password.label}
                                        placeholder={selectedDockerRegistryType.password.placeholder}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )
            }
            return (
                <>
                    <div className={`${isGCROrGCP ? '' : 'form__row--two-third'}`}>
                        <div className="form__row">
                            <CustomInput
                                name="username"
                                required
                                value={customState.username.value || selectedDockerRegistryType.id.defaultValue}
                                error={customState.username.error}
                                onChange={customHandleChange}
                                label={selectedDockerRegistryType.id.label}
                                disabled={!!selectedDockerRegistryType.id.defaultValue}
                                placeholder={
                                    selectedDockerRegistryType.id.placeholder
                                        ? selectedDockerRegistryType.id.placeholder
                                        : 'Enter username'
                                }
                            />
                        </div>
                        <div className="form__row">
                            {(selectedDockerRegistryType.value === RegistryType.DOCKER_HUB ||
                                selectedDockerRegistryType.value === RegistryType.ACR ||
                                selectedDockerRegistryType.value === RegistryType.QUAY ||
                                selectedDockerRegistryType.value === RegistryType.OTHER) && (
                                <PasswordField
                                    shouldShowDefaultPlaceholderOnBlur={!!id}
                                    name="password"
                                    required
                                    value={customState.password.value}
                                    error={customState.password.error}
                                    onChange={customHandleChange}
                                    label={selectedDockerRegistryType.password.label}
                                    placeholder={
                                        selectedDockerRegistryType.password.placeholder
                                            ? selectedDockerRegistryType.password.placeholder
                                            : 'Enter password/token'
                                    }
                                />
                            )}
                        </div>
                    </div>
                    {isGCROrGCP && (
                        <Textarea
                            label={selectedDockerRegistryType.password.label}
                            required
                            name="password"
                            value={customState.password.value}
                            onBlur={id && handleOnBlur}
                            onFocus={handleOnFocus}
                            onChange={customHandleChange}
                            placeholder={selectedDockerRegistryType.password.placeholder}
                            error={customState.password?.error}
                            shouldTrim={false}
                        />
                    )}
                </>
            )
        }
    }

    const renderPublicECR = () => {
        if (
            selectedDockerRegistryType.value === RegistryType.GCR &&
            registryStorageType === RegistryStorageType.OCI_PUBLIC
        ) {
            return (
                <>
                    <div className={`${isGCROrGCP ? '' : 'form__row--two-third'}`}>
                        <div className="form__row">
                            <CustomInput
                                name="username"
                                required
                                value={customState.username.value || selectedDockerRegistryType.id.defaultValue}
                                error={customState.username.error}
                                onChange={customHandleChange}
                                label={selectedDockerRegistryType.id.label}
                                disabled={!!selectedDockerRegistryType.id.defaultValue}
                                placeholder={
                                    selectedDockerRegistryType.id.placeholder
                                        ? selectedDockerRegistryType.id.placeholder
                                        : 'Enter username'
                                }
                            />
                        </div>
                        <div className="form__row">
                            {(selectedDockerRegistryType.value === RegistryType.DOCKER_HUB ||
                                selectedDockerRegistryType.value === RegistryType.ACR ||
                                selectedDockerRegistryType.value === RegistryType.QUAY ||
                                selectedDockerRegistryType.value === RegistryType.OTHER) && (
                                <PasswordField
                                    shouldShowDefaultPlaceholderOnBlur={!!id}
                                    name="password"
                                    required
                                    value={customState.password.value}
                                    error={customState.password.error}
                                    onChange={customHandleChange}
                                    label={selectedDockerRegistryType.password.label}
                                    placeholder={
                                        selectedDockerRegistryType.password.placeholder
                                            ? selectedDockerRegistryType.password.placeholder
                                            : 'Enter password/token'
                                    }
                                />
                            )}
                        </div>
                    </div>
                    {isGCROrGCP && (
                        <Textarea
                            label={selectedDockerRegistryType.password.label}
                            required
                            name="password"
                            value={customState.password.value}
                            onBlur={id && handleOnBlur}
                            onFocus={handleOnFocus}
                            onChange={customHandleChange}
                            placeholder={selectedDockerRegistryType.password.placeholder}
                            error={customState.password?.error}
                            shouldTrim={false}
                        />
                    )}
                </>
            )
        }
    }

    const showConfirmationModal = () => setConfirmationModal(true)
    const closeConfirmationModal = () => setConfirmationModal(false)

    const onDelete = async () => {
        const deletePayload = getRegistryPayload(
            selectedDockerRegistryType.value === RegistryType.ECR && fetchAWSRegion(),
        )
        await deleteDockerReg(deletePayload)
        reload()
    }

    // For EA Mode GCR is not available as it is not OCI compliant
    const EA_MODE_REGISTRY_TYPE_MAP = Object.fromEntries(
        Object.entries(REGISTRY_TYPE_MAP).filter(([key, _]) => key !== 'gcr'),
    )
    return (
        <form onSubmit={handleOnSubmit} className="docker-form divider" autoComplete="off" noValidate>
            <div className="pl-20 pr-20 pt-20 pb-20">
                <div
                    className={`form__row--two-third ${
                        selectedDockerRegistryType.value === RegistryType.GCR ? 'mb-16' : ''
                    }`}
                >
                    <div>
                        <SelectPicker
                            inputId="container-registry-type"
                            label="Registry provider"
                            required
                            classNamePrefix="select-container-registry-type"
                            isClearable={false}
                            options={
                                isHyperionMode
                                    ? Object.values(EA_MODE_REGISTRY_TYPE_MAP)
                                    : Object.values(REGISTRY_TYPE_MAP)
                            }
                            value={selectedDockerRegistryType}
                            onChange={handleRegistryTypeChange}
                            isDisabled={!!id}
                        />
                        {state.registryType.error && <div className="form__error">{state.registryType.error}</div>}
                    </div>
                    {selectedDockerRegistryType.gettingStartedLink && (
                        <div style={{ paddingTop: '38px', display: 'flex' }}>
                            <InfoFilled className="mr-5 form__icon--info" />
                            <span>
                                Don’t have {selectedDockerRegistryType.label} account?
                                <a
                                    href={selectedDockerRegistryType.gettingStartedLink}
                                    target="_blank"
                                    className="ml-5 cb-5"
                                    rel="noreferrer"
                                >
                                    Getting started with {selectedDockerRegistryType.label}
                                </a>
                            </span>
                        </div>
                    )}
                </div>
                {selectedDockerRegistryType.value !== RegistryType.GCR && (
                    <div className="form__row">
                        <RadioGroup
                            className="flex-wrap regisrty-form__radio-group"
                            value={registryStorageType}
                            name="registry-type"
                            disabled={id}
                            onChange={onRegistryStorageTypeChange}
                        >
                            <span className="flex left cn-7 w-150 mr-16 fs-13 fw-6 lh-20">Registry type</span>
                            <RadioGroupItem
                                value={RegistryStorageType.OCI_PRIVATE}
                                dataTestId="oci-private-registry-radio-button"
                            >
                                {RegistryTypeName[RegistryStorageType.OCI_PRIVATE]}
                            </RadioGroupItem>
                            <RadioGroupItem
                                value={RegistryStorageType.OCI_PUBLIC}
                                dataTestId="oci-prublic-registry-radio-button"
                            >
                                {RegistryTypeName[RegistryStorageType.OCI_PUBLIC]}
                            </RadioGroupItem>
                        </RadioGroup>
                        <hr className="mt-0 mb-0" />
                    </div>
                )}
                {!(
                    isGCROrGCP ||
                    registryStorageType === RegistryStorageType.OCI_PUBLIC ||
                    selectedDockerRegistryType.value === RegistryType.OTHER
                ) && (
                    <ValidateForm
                        id={id}
                        onClickValidate={onClickValidate}
                        validationError={validationError}
                        isChartRepo
                        validationStatus={validationStatus}
                        configName="registry"
                    />
                )}

                <div className="form__row--two-third">
                    <div className="form__row">
                        <CustomInput
                            required
                            name="id"
                            value={customState.id.value}
                            error={customState.id.error}
                            onChange={customHandleChange}
                            label="Name"
                            disabled={!!id}
                            placeholder="e.g. Registry name"
                            autoFocus
                        />
                    </div>
                    <div className="form__row">
                        <CustomInput
                            name="registryUrl"
                            required
                            label={selectedDockerRegistryType.registryURL.label}
                            value={customState.registryUrl.value || selectedDockerRegistryType.registryURL.defaultValue}
                            error={customState.registryUrl.error}
                            onChange={customHandleChange}
                            disabled={
                                selectedDockerRegistryType.value === RegistryType.GCR ||
                                (registryStorageType === RegistryStorageType.OCI_PRIVATE &&
                                    !!(registryUrl || selectedDockerRegistryType.defaultRegistryURL))
                            }
                            placeholder={selectedDockerRegistryType.registryURL.placeholder}
                        />
                    </div>
                </div>
                {renderAuthentication()}

                {renderPublicECR()}

                {selectedDockerRegistryType.value === RegistryType.OTHER && (
                    <div className={`form__buttons flex left ${toggleCollapsedAdvancedRegistry ? '' : 'mb-16'}`}>
                        <Dropdown
                            onClick={(e) => setToggleCollapsedAdvancedRegistry(not)}
                            className="rotate icon-dim-18 pointer fcn-6"
                            style={{ ['--rotateBy' as any]: !toggleCollapsedAdvancedRegistry ? '-90deg' : '0deg' }}
                        />
                        <label
                            className="fs-13 mb-0 ml-8 pointer"
                            onClick={(e) => setToggleCollapsedAdvancedRegistry(not)}
                        >
                            Advanced Registry URL Connection Options
                        </label>
                        <a target="_blank" href="https://docs.docker.com/registry/insecure/" rel="noreferrer">
                            <Info className="icon-dim-16 ml-4 mt-5" />
                        </a>
                    </div>
                )}
                {toggleCollapsedAdvancedRegistry && selectedDockerRegistryType.value === RegistryType.OTHER && (
                    <div className="form__row ml-3" style={{ width: '100%' }}>
                        {advanceRegistryOptions.map(({ label: Lable, value, tippy }) => (
                            <div>
                                <label
                                    key={value}
                                    className={`flex left pointer secureFont workflow-node__text-light ${
                                        value != CERTTYPE.SECURE ? 'mt-20' : 'mt-18'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="advanceSelect"
                                        value={value}
                                        onChange={handleOnChange}
                                        checked={value === state.advanceSelect.value}
                                    />
                                    <span className="ml-10 fs-13">{Lable}</span>
                                    {value != CERTTYPE.SECURE && (
                                        <Tippy
                                            className="default-tt ml-10"
                                            arrow={false}
                                            placement="top"
                                            content={<span className="dc__block w-160">{tippy}</span>}
                                        >
                                            <div className="flex">
                                                <ICHelpOutline className="icon-dim-16 ml-4" />
                                            </div>
                                        </Tippy>
                                    )}
                                </label>
                                {value == CERTTYPE.SECURE_WITH_CERT &&
                                    state.advanceSelect.value == CERTTYPE.SECURE_WITH_CERT && (
                                        <div className="ml-20">
                                            <Textarea
                                                name="certInput"
                                                placeholder="Begins with -----BEGIN CERTIFICATE-----"
                                                onChange={handleOnChange}
                                                value={state.certInput.value}
                                                error={certError}
                                                shouldTrim={false}
                                            />
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                )}
                {registryStorageType !== RegistryStorageType.OCI_PUBLIC && <hr className="mt-0 mb-16" />}
                {renderStoredContainerImage()}
                {registryStorageType === RegistryStorageType.OCI_PUBLIC && renderRepositoryList()}
                {renderDefaultRegistry()}
            </div>
            <div className="p-20 divider">
                <div className="flexbox">
                    {id && (
                        <Button
                            text="Delete"
                            variant={ButtonVariantType.secondary}
                            style={ButtonStyleType.negative}
                            startIcon={<Trash />}
                            dataTestId="delete-container-registry"
                            onClick={showConfirmationModal}
                        />
                    )}
                    <div className="flex right w-100 dc__gap-12">
                        <Button
                            dataTestId="container-registry-cancel-button"
                            onClick={setToggleCollapse}
                            text="Cancel"
                            variant={ButtonVariantType.secondary}
                            size={ComponentSizeType.medium}
                        />
                        <Button
                            dataTestId="container-registry-save-button"
                            disabled={loading}
                            text={id ? 'Update' : 'Save'}
                            size={ComponentSizeType.medium}
                            buttonProps={{
                                type: 'submit',
                            }}
                        />
                    </div>
                </div>

                {confirmationModal && (
                    <DeleteConfirmationModal
                        title={id}
                        component={DeleteComponentsName.ContainerRegistry}
                        renderCannotDeleteConfirmationSubTitle={DC_CONTAINER_REGISTRY_CONFIRMATION_MESSAGE}
                        errorCodeToShowCannotDeleteDialog={ERROR_STATUS_CODE.INTERNAL_SERVER_ERROR}
                        onDelete={onDelete}
                        closeConfirmationModal={closeConfirmationModal}
                    />
                )}
            </div>
        </form>
    )
}
