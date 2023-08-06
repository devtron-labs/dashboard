import React, { useEffect, useState } from 'react'
import {
    useForm,
    useAsync,
    CustomInput,
    handleOnBlur,
    handleOnFocus,
    parsePassword,
    importComponentFromFELibrary,
} from '../common'
import {
    showError,
    Progressing,
    TippyCustomized,
    TippyTheme,
    sortCallback,
    ErrorScreenNotAuthorized,
    multiSelectStyles,
    Reload,
    RadioGroup,
    RadioGroupItem,
    not,
    CHECKBOX_VALUE,
    Checkbox,
    REGISTRY_TYPE_MAP,
    InfoColourBar,
} from '@devtron-labs/devtron-fe-common-lib'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { getClusterListMinWithoutAuth, getDockerRegistryList } from '../../services/service'
import { saveRegistryConfig, updateRegistryConfig, deleteDockerReg } from './service'
import { List } from '../globalConfigurations/GlobalConfiguration'
import { toast } from 'react-toastify'
import {
    DOCUMENTATION,
    RegistryTypeName,
    OCIRegistryConfigConstants,
    OCIRegistryStorageConfigType,
    RegistryStorageType,
    RegistryPayloadType,
    REGISTRY_TITLE_DESCRIPTION_CONTENT,
    RegistryType,
} from '../../config'
import Tippy from '@tippyjs/react'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Info } from '../../assets/icons/ic-info-outlined.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as InfoFilled } from '../../assets/icons/ic-info-filled.svg'
import DeleteComponent from '../../util/DeleteComponent'
import { DC_CONTAINER_REGISTRY_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import ReactSelect, { components } from 'react-select'
import { AuthenticationType, DEFAULT_SECRET_PLACEHOLDER } from '../cluster/cluster.type'
import ManageRegistry from './ManageRegistry'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { CredentialType, CustomCredential } from './dockerType'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'

const OCIRegistryUseActionHelmPushMessage = importComponentFromFELibrary(
    'OCIRegistryUseActionHelmPushMessage',
    '',
    'function',
)

enum CERTTYPE {
    SECURE = 'secure',
    INSECURE = 'insecure',
    SECURE_WITH_CERT = 'secure-with-cert',
}

export default function Docker({ ...props }) {
    const [loading, result, error, reload] = useAsync(getDockerRegistryList, [], props.isSuperAdmin)
    const [clusterOption, setClusterOptions] = useState([])
    const [clusterLoader, setClusterLoader] = useState(false)
    const [registryStorageType, setRegistryStorageType] = useState(RegistryStorageType.OCI_PRIVATE)

    const _getInit = async () => {
        setClusterLoader(true)
        await getClusterListMinWithoutAuth()
            .then((clusterListRes) => {
                if (Array.isArray(clusterListRes.result)) {
                    setClusterOptions([
                        { label: 'All clusters', value: '-1' },
                        ...clusterListRes.result.map((cluster) => {
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
    if ((loading && !result) || clusterLoader) return <Progressing pageLoader />
    if (error) {
        showError(error)
        if (!result) return <Reload />
    }
    if (clusterOption.length === 0) {
        return <Reload />
    }

    let dockerRegistryList = result?.result || []
    dockerRegistryList = dockerRegistryList.sort((a, b) => sortCallback('id', a, b))
    dockerRegistryList = [{ id: null }].concat(dockerRegistryList)
    const additionalRegistryTitleTippyContent = () => {
        return <p className="p-12 fs-13 fw-4 lh-20">{REGISTRY_TITLE_DESCRIPTION_CONTENT.additionalParagraphText}</p>
    }

    return (
        <section
            className="global-configuration__component flex-1"
            data-testid="select-existing-container-registry-list"
        >
            <div className="flex left fs-16 cn-9 fw-6 mb-20" data-testid="container-oci-registry-heading">
                Container / OCI Registry
                <TippyCustomized
                    theme={TippyTheme.white}
                    className="w-300"
                    placement="top"
                    Icon={HelpIcon}
                    iconClass="fcv-5"
                    heading={REGISTRY_TITLE_DESCRIPTION_CONTENT.heading}
                    infoText={REGISTRY_TITLE_DESCRIPTION_CONTENT.infoText}
                    additionalContent={additionalRegistryTitleTippyContent()}
                    documentationLinkText={REGISTRY_TITLE_DESCRIPTION_CONTENT.documentationLinkText}
                    documentationLink={DOCUMENTATION.GLOBAL_CONFIG_DOCKER}
                    showCloseButton={true}
                    trigger="click"
                    interactive={true}
                >
                    <Question className="icon-dim-16 fcn-6 ml-4 cursor" />
                </TippyCustomized>
            </div>
            {dockerRegistryList.map((docker) => (
                <CollapsedList
                    reload={reload}
                    {...docker}
                    clusterOption={clusterOption}
                    key={docker.id || Math.random().toString(36).substr(2, 5)}
                    setRegistryStorageType={setRegistryStorageType}
                    registryStorageType={registryStorageType}
                />
            ))}
        </section>
    )
}

function CollapsedList({
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
    isOCICompliantRegistry = false,
    registryStorageType,
    setRegistryStorageType,
    ociRegistryConfig = OCIRegistryUseActionHelmPushMessage
        ? {
              CONTAINER: OCIRegistryConfigConstants.PULL_PUSH,
              CHART: OCIRegistryConfigConstants.PUSH,
          }
        : registryStorageType === RegistryStorageType.OCI_PUBLIC
        ? {
              CHART: OCIRegistryConfigConstants.PULL,
          }
        : {
              CONTAINER: OCIRegistryConfigConstants.PULL_PUSH,
          },
    ipsConfig = {
        id: 0,
        credentialType: '',
        credentialValue: '',
        appliedClusterIdsCsv: '',
        ignoredClusterIdsCsv: '',
    },
    clusterOption,
    repositoryList = '',
    isPublic,
    ...rest
}) {
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
                        <div className={'dc__registry-icon ' + registryType}></div>
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
                        ociRegistryConfig,
                        ipsConfig,
                        clusterOption,
                        setToggleCollapse,
                        repositoryList,
                        isPublic,
                        registryStorageType,
                        setRegistryStorageType,
                    }}
                />
            )}
        </article>
    )
}

function DockerForm({
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
    ociRegistryConfig,
    ipsConfig,
    clusterOption,
    setToggleCollapse,
    repositoryList,
    isPublic,
    registryStorageType,
    setRegistryStorageType,
    ...rest
}) {
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            id: { value: id, error: '' },
            registryType: { value: registryType || 'ecr', error: '' },
            advanceSelect: { value: connection || CERTTYPE.SECURE, error: '' },
            certInput: { value: cert || '', error: '' },
            repositoryList: { value: repositoryList || '', error: '' },
        },
        {
            id: {
                required: true,
                validator: { error: 'Name is required', regex: /^.*$/ },
            },
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
            repositoryList: {
                required: false,
            },
        },
        onValidation,
    )
    const [loading, toggleLoading] = useState(false)
    const [Isdefault, toggleDefault] = useState(isDefault)
    const [toggleCollapsedAdvancedRegistry, setToggleCollapsedAdvancedRegistry] = useState(false)
    const [certError, setCertInputError] = useState('')
    const [OCIRegisrtyInputError, setOCIRegisrtyInputError] = useState<boolean>(false)
    let _selectedDockerRegistryType = REGISTRY_TYPE_MAP[state.registryType.value || 'ecr']
    const [selectedDockerRegistryType, setSelectedDockerRegistryType] = useState(_selectedDockerRegistryType)
    const regPass =
        state.registryType.value === 'gcr' || state.registryType.value === 'artifact-registry'
            ? password.substring(1, password.length - 1)
            : password
    const [customState, setCustomState] = useState({
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
    })

    const clusterlistMap = new Map()

    for (let index = 0; index < clusterOption.length; index++) {
        const currentItem = clusterOption[index]
        clusterlistMap.set(currentItem.value + '', currentItem)
    }

    const _ignoredClusterIdsCsv = !ipsConfig
        ? []
        : ipsConfig.ignoredClusterIdsCsv && ipsConfig.ignoredClusterIdsCsv != '-1'
        ? ipsConfig.ignoredClusterIdsCsv.split(',').map((clusterId) => {
              return clusterlistMap.get(clusterId)
          })
        : !ipsConfig.appliedClusterIdsCsv || ipsConfig.ignoredClusterIdsCsv === '-1'
        ? clusterOption
        : []

    const _appliedClusterIdsCsv = ipsConfig?.appliedClusterIdsCsv
        ? ipsConfig.appliedClusterIdsCsv.split(',').map((clusterId) => {
              return clusterlistMap.get(clusterId)
          })
        : []

    const isCustomScript = ipsConfig?.credentialType === CredentialType.CUSTOM_CREDENTIAL

    const defaultCustomCredential = {
        server: '',
        email: '',
        username: '',
        password: '',
    }

    const [deleting, setDeleting] = useState(false)
    const [confirmation, toggleConfirmation] = useState(false)
    const [isIAMAuthType, setIAMAuthType] = useState(!awsAccessKeyId && !awsSecretAccessKey)
    const [blackList, setBlackList] = useState(_ignoredClusterIdsCsv)
    const [whiteList, setWhiteList] = useState(_appliedClusterIdsCsv)
    const [blackListEnabled, setBlackListEnabled] = useState<boolean>(_appliedClusterIdsCsv.length === 0)
    const [credentialsType, setCredentialType] = useState<string>(
        ipsConfig?.credentialType || CredentialType.SAME_AS_REGISTRY,
    )
    const [credentialValue, setCredentialValue] = useState<string>(isCustomScript ? '' : ipsConfig?.credentialValue)
    const [showManageModal, setManageModal] = useState(false)
    let InitialValueOfIsContainerStore: boolean = ociRegistryConfig?.CONTAINER === OCIRegistryConfigConstants.PULL_PUSH
    InitialValueOfIsContainerStore = OCIRegistryUseActionHelmPushMessage
        ? InitialValueOfIsContainerStore &&
          (ociRegistryConfig?.CHART === OCIRegistryConfigConstants.PULL_PUSH ||
              ociRegistryConfig?.CHART === OCIRegistryConfigConstants.PUSH ||
              ociRegistryConfig?.CHART === OCIRegistryConfigConstants.PULL)
        : InitialValueOfIsContainerStore
    const [isContainerStore, setContainerStore] = useState<boolean>(InitialValueOfIsContainerStore)
    const [OCIRegistryStorageConfig, setOCIRegistryStorageConfig] =
        useState<OCIRegistryStorageConfigType>(ociRegistryConfig)
    const [customCredential, setCustomCredential] = useState<CustomCredential>(
        isCustomScript && ipsConfig?.credentialValue ? JSON.parse(ipsConfig.credentialValue) : defaultCustomCredential,
    )
    const [errorValidation, setErrorValidation] = useState<boolean>(false)
    const [showHelmPull, setListRepositories] = useState<boolean>(false)
    const [isOCIRegistryHelmPush, setOCIRegistryHelmPush] = useState<boolean>(false)

    function customHandleChange(e) {
        setCustomState((st) => ({ ...st, [e.target.name]: { value: e.target.value, error: '' } }))
    }

    const handleRegistryTypeChange = (selectedRegistry) => {
        setSelectedDockerRegistryType(selectedRegistry)
        setCustomState((st) => ({
            ...st,
            username: { value: selectedRegistry.id.defaultValue, error: '' },
            registryUrl: { value: selectedRegistry.defaultRegistryURL, error: '' },
        }))
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
        } else if (e.target.value === RegistryStorageType.OCI_PUBLIC) {
            setRegistryStorageType(RegistryStorageType.OCI_PUBLIC)
        }
    }

    function fetchAWSRegion(): string {
        const pattern = /(ecr.)[a-z]{2}-[a-z]*-[0-9]{1}/i
        let result = customState.registryUrl.value.match(pattern)
        if (!result) {
            setCustomState((st) => ({
                ...st,
                registryUrl: { ...st.registryUrl, error: st.registryUrl.value ? 'Invalid URL' : 'Mandatory' },
            }))
            return ''
        }
        return result[0].split('ecr.')[1]
    }

    function isValidJson(inputString: string) {
        try {
            JSON.parse(inputString)
        } catch (e) {
            return false
        }
        return true
    }

    const getRegistryPayload = (awsRegion?: string): RegistryPayloadType => {
        let appliedClusterIdsCsv = whiteList?.map((cluster) => cluster?.value)?.join(',')
        let ignoredClusterIdsCsv = blackList?.map((cluster) => cluster?.value)?.join(',')
        const trimmedUsername = customState.username.value.replace(/\s/g, '')
        return {
            id: state.id.value,
            pluginId: 'cd.go.artifact.docker.registry',
            registryType: selectedDockerRegistryType.value,
            isDefault: registryStorageType !== RegistryStorageType.OCI_PRIVATE || isContainerStore ? Isdefault : false,
            isOCICompliantRegistry: selectedDockerRegistryType.value !== RegistryType.GCR,
            isPublic: registryStorageType === RegistryStorageType.OCI_PUBLIC,
            repositoryList: state.repositoryList && state.repositoryList?.value?.split(',') || [],
            registryUrl: customState.registryUrl.value,
            ...(selectedDockerRegistryType.value === RegistryType.ECR
                ? {
                      awsAccessKeyId: customState.awsAccessKeyId.value,
                      awsSecretAccessKey: parsePassword(customState.awsSecretAccessKey.value),
                      awsRegion: awsRegion,
                  }
                : {}),
            ...(selectedDockerRegistryType.value === RegistryType.ARTIFACT_REGISTRY ||
            selectedDockerRegistryType.value === RegistryType.GCR
                ? {
                      username: trimmedUsername,
                      password:
                          customState.password.value === DEFAULT_SECRET_PLACEHOLDER
                              ? parsePassword(customState.password.value)
                              : `'${parsePassword(customState.password.value)}'`,
                  }
                : {}),
            ...(selectedDockerRegistryType.value === RegistryType.DOCKER_HUB ||
            selectedDockerRegistryType.value === RegistryType.ACR ||
            selectedDockerRegistryType.value === RegistryType.QUAY
                ? {
                      username: trimmedUsername,
                      password: parsePassword(customState.password.value),
                  }
                : {}),
            ...(selectedDockerRegistryType.value === RegistryType.OTHER
                ? {
                      username: trimmedUsername,
                      password: parsePassword(customState.password.value),
                      connection: state.advanceSelect.value,
                      cert: state.advanceSelect.value !== CERTTYPE.SECURE_WITH_CERT ? '' : state.certInput.value,
                  }
                : {}),

            ipsConfig: {
                id: ipsConfig.id,
                credentialType: credentialsType,
                credentialValue:
                    credentialsType === CredentialType.CUSTOM_CREDENTIAL
                        ? JSON.stringify(customCredential)
                        : credentialValue,
                appliedClusterIdsCsv: appliedClusterIdsCsv,
                ignoredClusterIdsCsv:
                    whiteList.length === 0 &&
                    (blackList.length === 0 || blackList.findIndex((cluster) => cluster.value === '-1') >= 0)
                        ? '-1'
                        : ignoredClusterIdsCsv,
            },
        }
    }

    const handleDefaultChange = (e) => {
        if (isDefault) {
            toast.success('Please mark another as default.')
            return
        }
        toggleDefault(not)
    }

    async function onSave() {
        if (credentialsType === CredentialType.NAME && !credentialValue) {
            setErrorValidation(true)
            return
        }
        if (registryStorageType === RegistryStorageType.OCI_PUBLIC) {
            setOCIRegistryStorageConfig({
                CHART: OCIRegistryConfigConstants.PULL,
            })
        }

        let awsRegion
        if (selectedDockerRegistryType.value === RegistryType.ECR) {
            awsRegion = fetchAWSRegion()
            if (!awsRegion) return
        }
        let payload = getRegistryPayload(awsRegion)
        payload.ociRegistryConfig = isPublic ? { CHART: OCIRegistryConfigConstants.PULL } : OCIRegistryStorageConfig

        const api = id ? updateRegistryConfig : saveRegistryConfig
        try {
            toggleLoading(true)
            await api(payload, id)
            if (!id) {
                toggleCollapse(true)
            }
            await reload()
            await setToggleCollapse()
            toast.success('Successfully saved.')
        } catch (err) {
            showError(err)
        } finally {
            toggleLoading(false)
        }
    }

    function onValidation() {
        if (selectedDockerRegistryType.value === RegistryType.ECR) {
            if (
                (!isIAMAuthType &&
                    (!customState.awsAccessKeyId.value || !(customState.awsSecretAccessKey.value || id))) ||
                !customState.registryUrl.value
            ) {
                setCustomState((st) => ({
                    ...st,
                    awsAccessKeyId: { ...st.awsAccessKeyId, error: st.awsAccessKeyId.value ? '' : 'Mandatory' },
                    awsSecretAccessKey: {
                        ...st.awsSecretAccessKey,
                        error: id || st.awsSecretAccessKey.value ? '' : 'Mandatory',
                    },
                    registryUrl: { ...st.registryUrl, error: st.registryUrl.value ? '' : 'Mandatory' },
                }))
                return
            }
        } else if (selectedDockerRegistryType.value === RegistryType.DOCKER_HUB) {
            if (
                registryStorageType === RegistryStorageType.OCI_PRIVATE &&
                (!customState.username.value || !(customState.password.value || id))
            ) {
                setCustomState((st) => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: { ...st.password, error: id || st.password.value ? '' : 'Mandatory' },
                }))
                return
            }
        } else if (
            selectedDockerRegistryType.value === RegistryType.ARTIFACT_REGISTRY ||
            selectedDockerRegistryType.value === RegistryType.GCR
        ) {
            const isValidJsonFile = isValidJson(customState.password.value) || id
            const isValidJsonStr = isValidJsonFile ? '' : 'Invalid JSON'
            if (
                (registryStorageType === RegistryStorageType.OCI_PRIVATE && !customState.username.value) ||
                !(customState.password.value || id) ||
                !isValidJsonFile
            ) {
                setCustomState((st) => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: {
                        ...st.password,
                        error: id || st.password.value ? isValidJsonStr : 'Mandatory',
                    },
                }))
                return
            }
        } else if (
            selectedDockerRegistryType.value === RegistryType.ACR ||
            selectedDockerRegistryType.value === RegistryType.QUAY ||
            selectedDockerRegistryType.value === RegistryType.OTHER
        ) {
            let error = false
            if (
                (!isPublic && !customState.username.value) ||
                !(customState.password.value || id) ||
                !customState.registryUrl.value
            ) {
                setCustomState((st) => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: { ...st.password, error: id || st.password.value ? '' : 'Mandatory' },
                    registryUrl: { ...st.registryUrl, error: st.registryUrl.value ? '' : 'Mandatory' },
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
                return
            }
        }

        onSave()
    }

    let advanceRegistryOptions = [
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

    const handleOCIRegistryStorageAction = (key) => {
        if (key === OCIRegistryConfigConstants.PUSH) {
            setOCIRegistryHelmPush(!isOCIRegistryHelmPush)
            !isOCIRegistryHelmPush &&
                setOCIRegistryStorageConfig({
                    CHART: OCIRegistryConfigConstants.PUSH,
                })
        }
        if (key === OCIRegistryConfigConstants.PULL) {
            setListRepositories(!showHelmPull)
            !showHelmPull &&
                setOCIRegistryStorageConfig({
                    CHART: OCIRegistryConfigConstants.PULL,
                })
        }
        if (key === OCIRegistryConfigConstants.PULL_PUSH) {
            setContainerStore(!isContainerStore)
            !isContainerStore &&
                setOCIRegistryStorageConfig({
                    CONTAINER: OCIRegistryConfigConstants.PULL_PUSH,
                })
        }
    }

    const registryOptions = (props) => {
        props.selectProps.styles.option = getCustomOptionSelectionStyle()
        return (
            <components.Option {...props}>
                <div style={{ display: 'flex' }}>
                    <div className={'dc__registry-icon dc__git-logo mr-5 ' + props.data.value}></div>
                    {props.label}
                </div>
            </components.Option>
        )
    }
    const registryControls = (props) => {
        let value = ''
        if (props.hasValue) {
            value = props.getValue()[0].value
        }
        return (
            <components.Control {...props}>
                <div className={'dc__registry-icon dc__git-logo ml-5 ' + value}></div>
                {props.children}
            </components.Control>
        )
    }

    const _multiSelectStyles = {
        ...multiSelectStyles,
        menu: (base, state) => ({
            ...base,
            marginTop: 'auto',
        }),
        menuList: (base) => {
            return {
                ...base,
                position: 'relative',
                maxHeight: '250px',
                paddingBottom: '4px',
            }
        },
    }

    const appliedClusterList = whiteList?.map((_ac) => {
        return _ac.label
    })

    const ignoredClusterList = blackList?.map((_ic) => {
        return _ic.label
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
        } else {
            return <div className="fw-6">{` Clusters except ${ignoredClusterList}`} </div>
        }
    }

    const renderRegistryCredentialsAutoInjectToClustersComponent = () => {
        if (!showManageModal) {
            return (
                <div className="en-2 bw-1 br-4 pt-10 pb-10 pl-16 pr-16 mb-16 fs-13">
                    <div className="flex dc__content-space">
                        <div className="cn-7 flex left ">
                            Registry credential access is auto injected to
                            <TippyCustomized
                                theme={TippyTheme.white}
                                className="w-332"
                                placement="top"
                                Icon={HelpIcon}
                                iconClass="fcv-5"
                                heading="Manage access of registry credentials"
                                infoText="Clusters need permission to pull container image from private repository in
                                    the registry. You can control which clusters have access to the pull image
                                    from private repositories.
                                "
                                showCloseButton={true}
                                trigger="click"
                                interactive={true}
                            >
                                <Question className="icon-dim-16 fcn-6 ml-4 cursor" />
                            </TippyCustomized>
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
        if (registryStorageType !== RegistryStorageType.OCI_PUBLIC) {
            return registryStorageType === RegistryStorageType.OCI_PRIVATE &&
                selectedDockerRegistryType.value !== RegistryType.GCR ? (
                <>
                    <div className="mb-12">
                        <span className="flexbox mr-16 cn-7 fs-13 fw-6 lh-20">
                            <span className="flex left w-150">
                                <span className="dc__required-field">Use repository to</span>
                            </span>
                            {OCIRegisrtyInputError && (
                                <span className="form__error">
                                    <Error className="form__icon form__icon--error" />
                                    This field is mandatory
                                </span>
                            )}
                        </span>
                    </div>
                    <div className={`flex left ${isContainerStore ? 'mb-12' : ''}`}>
                        <Checkbox
                            rootClassName="docker-default mb-0"
                            isChecked={isContainerStore}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={() => handleOCIRegistryStorageAction(OCIRegistryConfigConstants.PULL_PUSH)}
                            dataTestId={`store-${
                                OCIRegistryUseActionHelmPushMessage ? 'container-and-chart' : 'container'
                            }-checkbox`}
                        >
                            Push container images
                            {OCIRegistryUseActionHelmPushMessage ? ` & ${OCIRegistryUseActionHelmPushMessage}` : ''}
                        </Checkbox>
                    </div>

                    {isContainerStore && (
                        <>
                            <div className="pl-28">{renderRegistryCredentialsAutoInjectToClustersComponent()}</div>
                        </>
                    )}
                    <Checkbox
                        rootClassName="docker-default mb-12 mt-12"
                        id="helm-push"
                        isChecked={isOCIRegistryHelmPush}
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={() => handleOCIRegistryStorageAction(OCIRegistryConfigConstants.PUSH)}
                        dataTestId={`store-${
                            OCIRegistryUseActionHelmPushMessage ? 'container-and-chart' : 'container'
                        }-checkbox`}
                    >
                        Push helm packages
                    </Checkbox>
                    <Checkbox
                        rootClassName="docker-default mb-0"
                        id="helm-pull"
                        isChecked={showHelmPull}
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={() => handleOCIRegistryStorageAction(OCIRegistryConfigConstants.PULL)}
                        dataTestId={`store-${
                            OCIRegistryUseActionHelmPushMessage ? 'container-and-chart' : 'container'
                        }-checkbox`}
                    >
                        Use as chart repository (Pull helm charts and show in chart store)
                    </Checkbox>
                    {showHelmPull && <div className="pl-28">{renderOCIPublic()}</div>}
                    <hr className="mt-16 mb-16" />
                </>
            ) : (
                renderRegistryCredentialsAutoInjectToClustersComponent()
            )
        }
    }

    const renderRepositoryList = () => {
        return (
            <div className="form__row">
                <CustomInput
                    dataTestid="container-registry-name"
                    labelClassName="dc__required-field"
                    name="repositoryList"
                    autoFocus={true}
                    value={state.repositoryList?.value}
                    autoComplete="off"
                    error={state.repositoryList.error}
                    tabIndex={3}
                    onChange={handleOnChange}
                    label="List of repositories"
                    placeholder="Enter repository names separated by comma (eg. prometheus, nginx)"
                />
            </div>
        )
    }

    const renderOCIPublic = () => {
        if (selectedDockerRegistryType.value !== RegistryType.GCR) {
            return (
                <>
                    {renderRepositoryList()}
                    <InfoColourBar
                        message="Helm charts from provided repositories will be shown in the Chart store."
                        classname="info_bar mb-16"
                        Icon={InfoIcon}
                        iconClass="icon-dim-20"
                    />
                </>
            )
        }
    }

    const renderDefaultRegistry = () => {
        if (
            registryStorageType !== RegistryStorageType.OCI_PUBLIC &&
            (selectedDockerRegistryType.value === RegistryType.GCR ||
                registryStorageType !== RegistryStorageType.OCI_PRIVATE ||
                isContainerStore)
        ) {
            return (
                <>
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
                            <Question className="icon-dim-20 ml-8" />
                        </Tippy>
                    </div>
                </>
            )
        }
    }

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
                                        dataTestid="aws-access-keyid-textbox"
                                        name="awsAccessKeyId"
                                        labelClassName="dc__required-field"
                                        tabIndex={5}
                                        value={customState.awsAccessKeyId.value}
                                        error={customState.awsAccessKeyId.error}
                                        onChange={customHandleChange}
                                        label={selectedDockerRegistryType.id.label}
                                        autoComplete="off"
                                        placeholder={selectedDockerRegistryType.id.placeholder}
                                    />
                                </div>
                                <div className="form__row">
                                    <CustomInput
                                        dataTestid="aws-secret-access-key-textbox"
                                        name="awsSecretAccessKey"
                                        labelClassName="dc__required-field"
                                        tabIndex={6}
                                        value={customState.awsSecretAccessKey.value}
                                        error={customState.awsSecretAccessKey.error}
                                        onBlur={id && handleOnBlur}
                                        onFocus={handleOnFocus}
                                        onChange={customHandleChange}
                                        label={selectedDockerRegistryType.password.label}
                                        placeholder={selectedDockerRegistryType.password.placeholder}
                                        autoComplete="off"
                                    />
                                </div>
                            </>
                        )}
                    </>
                )
            } else {
                return (
                    <div className="form__row--two-third">
                        <div className="form__row">
                            <CustomInput
                                dataTestid="container-registry-username-textbox"
                                name="username"
                                labelClassName="dc__required-field"
                                tabIndex={5}
                                value={customState.username.value || selectedDockerRegistryType.id.defaultValue}
                                autoComplete="off"
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
                                <CustomInput
                                    dataTestid="container-registry-password-textbox"
                                    name="password"
                                    labelClassName="dc__required-field"
                                    tabIndex={6}
                                    value={customState.password.value}
                                    error={customState.password.error}
                                    onChange={customHandleChange}
                                    onBlur={id && handleOnBlur}
                                    onFocus={handleOnFocus}
                                    label={selectedDockerRegistryType.password.label}
                                    placeholder={
                                        selectedDockerRegistryType.password.placeholder
                                            ? selectedDockerRegistryType.password.placeholder
                                            : 'Enter password/token'
                                    }
                                    autoComplete="off"
                                />
                            )}
                            {(selectedDockerRegistryType.value === RegistryType.ARTIFACT_REGISTRY ||
                                selectedDockerRegistryType.value === RegistryType.GCR) && (
                                <>
                                    <label htmlFor="" className="form__label w-100 dc__required-field">
                                        {selectedDockerRegistryType.password.label}
                                    </label>
                                    <textarea
                                        name="password"
                                        tabIndex={6}
                                        data-testid="artifact-service-account-textbox"
                                        value={customState.password.value}
                                        className="w-100 p-10"
                                        rows={3}
                                        onBlur={id && handleOnBlur}
                                        onFocus={handleOnFocus}
                                        onChange={customHandleChange}
                                        placeholder={selectedDockerRegistryType.password.placeholder}
                                    />
                                    {customState.password?.error && (
                                        <div className="form__error">
                                            <Error className="form__icon form__icon--error" />
                                            {customState.password?.error}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        }
    }

    return (
        <form onSubmit={handleOnSubmit} className="docker-form divider" autoComplete="off">
            <div className="pl-20 pr-20 pt-20 pb-20">
                <div
                    className={`form__row--two-third ${
                        selectedDockerRegistryType.value === RegistryType.GCR ? 'mb-16' : ''
                    }`}
                >
                    <div className="flex left column top">
                        <label htmlFor="" className="form__label w-100 cb-7 dc__required-field">
                            Registry provider
                        </label>
                        <ReactSelect
                            classNamePrefix="select-container-registry-type"
                            className="m-0 w-100"
                            tabIndex={1}
                            isMulti={false}
                            isClearable={false}
                            options={Object.values(REGISTRY_TYPE_MAP)}
                            getOptionLabel={(option) => `${option.label}`}
                            getOptionValue={(option) => `${option.value}`}
                            value={selectedDockerRegistryType}
                            styles={_multiSelectStyles}
                            components={{
                                IndicatorSeparator: null,
                                Option: registryOptions,
                                Control: registryControls,
                            }}
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
                <div className="form__row--two-third">
                    <div className="form__row">
                        <CustomInput
                            dataTestid="container-registry-name"
                            labelClassName="dc__required-field"
                            name="id"
                            autoFocus={true}
                            value={state.id.value}
                            autoComplete="off"
                            error={state.id.error}
                            tabIndex={1}
                            onChange={handleOnChange}
                            label="Name"
                            disabled={!!id}
                            placeholder="e.g. Registry name"
                        />
                    </div>
                    <div className="form__row">
                        <CustomInput
                            dataTestid="container-registry-url-textbox"
                            name="registryUrl"
                            tabIndex={3}
                            labelClassName="dc__required-field"
                            label={selectedDockerRegistryType.registryURL.label}
                            value={customState.registryUrl.value || selectedDockerRegistryType.registryURL.defaultValue}
                            autoComplete="off"
                            error={customState.registryUrl.error}
                            onChange={customHandleChange}
                            disabled={
                                registryStorageType === RegistryStorageType.OCI_PRIVATE &&
                                !!(registryUrl || selectedDockerRegistryType.defaultRegistryURL)
                            }
                            placeholder={selectedDockerRegistryType.registryURL.placeholder}
                        />
                    </div>
                </div>
                {renderAuthentication()}
                {selectedDockerRegistryType.value === RegistryType.OTHER && (
                    <>
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
                            <a target="_blank" href="https://docs.docker.com/registry/insecure/">
                                <Info className="icon-dim-16 ml-4 mt-5" />
                            </a>
                        </div>
                    </>
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
                                            <Question className="icon-dim-16 ml-4" />
                                        </Tippy>
                                    )}
                                </label>
                                {value == CERTTYPE.SECURE_WITH_CERT &&
                                    state.advanceSelect.value == CERTTYPE.SECURE_WITH_CERT && (
                                        <div className="ml-20">
                                            <textarea
                                                name="certInput"
                                                placeholder="Begins with -----BEGIN CERTIFICATE-----"
                                                className="form__input"
                                                style={{ height: '100px', backgroundColor: '#f7fafc' }}
                                                onChange={handleOnChange}
                                                value={state.certInput.value}
                                            />
                                            {certError && (
                                                <div className="form__error">
                                                    <Error className="form__icon form__icon--error" />
                                                    {certError}
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                )}
                {registryStorageType !== RegistryStorageType.OCI_PUBLIC && <hr className="mt-0 mb-16" />}
                {renderStoredContainerImage()}
                {registryStorageType === RegistryStorageType.OCI_PUBLIC && renderOCIPublic()}
                {renderDefaultRegistry()}
            </div>
            <div className="p-20 divider">
                <div className="flex right">
                    {id && (
                        <button
                            className="cta flex h-36 delete dc__m-auto ml-0"
                            data-testid="delete-container-registry"
                            type="button"
                            onClick={() => toggleConfirmation(true)}
                        >
                            {deleting ? <Progressing /> : 'Delete'}
                        </button>
                    )}
                    <button className="cta flex h-36 mr-16 cancel" type="button" onClick={setToggleCollapse}>
                        Cancel
                    </button>
                    <button
                        className="cta flex h-36"
                        type="submit"
                        disabled={loading}
                        data-testid="container-registry-save-button"
                    >
                        {loading ? <Progressing /> : 'Save'}
                    </button>
                </div>

                {confirmation && (
                    <DeleteComponent
                        setDeleting={setDeleting}
                        deleteComponent={deleteDockerReg}
                        payload={getRegistryPayload(
                            selectedDockerRegistryType.value === RegistryType.ECR && fetchAWSRegion(),
                        )}
                        title={id}
                        toggleConfirmation={toggleConfirmation}
                        component={DeleteComponentsName.ContainerRegistry}
                        confirmationDialogDescription={DC_CONTAINER_REGISTRY_CONFIRMATION_MESSAGE}
                        reload={reload}
                    />
                )}
            </div>
        </form>
    )
}
