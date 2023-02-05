import React, { useState } from 'react'
import { showError, useForm, Progressing, CustomInput, not, multiSelectStyles } from '../common'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { saveRegistryConfig, updateRegistryConfig, deleteDockerReg } from './service'
import { ProtectedInput } from '../globalConfigurations/GlobalConfiguration'
import { toast } from 'react-toastify'
import { REGISTRY_TYPE_MAP } from '../../config'
import Tippy from '@tippyjs/react'
import DeleteComponent from '../../util/DeleteComponent'
import { DC_CONTAINER_REGISTRY_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import ReactSelect, { components } from 'react-select'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { AuthenticationType } from '../cluster/cluster.type'
import ManageRegistry from './ManageRegistry'
import { CERTTYPE } from './docker.utils'
import { CredentialType, CustomCredential } from './dockerType'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help.svg'
import TippyCustomized, { TippyTheme } from '../common/TippyCustomized'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Info } from '../../assets/icons/ic-info-outlined.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as InfoFilled } from '../../assets/icons/ic-info-filled.svg'

export function DockerForm({
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
    ipsConfig,
    clusterOption,
    setToggleCollapse,
    ...rest
}) {
    const { state, handleOnChange, handleOnSubmit } = useForm(
        {
            id: { value: id, error: '' },
            registryType: { value: registryType || 'ecr', error: '' },
            advanceSelect: { value: connection || CERTTYPE.SECURE, error: '' },
            certInput: { value: cert || '', error: '' },
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
        },
        onValidation,
    )
    const [loading, toggleLoading] = useState(false)
    const [Isdefault, toggleDefault] = useState(isDefault)
    const [toggleCollapsedAdvancedRegistry, setToggleCollapsedAdvancedRegistry] = useState(false)
    const [certError, setCertInputError] = useState('')
    let _selectedDockerRegistryType = REGISTRY_TYPE_MAP[state.registryType.value || 'ecr']
    const [selectedDockerRegistryType, setSelectedDockerRegistryType] = useState(_selectedDockerRegistryType)
    const [customState, setCustomState] = useState({
        awsAccessKeyId: { value: awsAccessKeyId, error: '' },
        awsSecretAccessKey: { value: awsSecretAccessKey, error: '' },
        registryUrl: { value: registryUrl, error: '' },
        username: { value: id && username, error: '' },
        password: {
            value:
                state.registryType.value === 'gcr' || state.registryType.value === 'artifact-registry'
                    ? password.substring(1, password.length - 1)
                    : password,
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
    const [customCredential, setCustomCredential] = useState<CustomCredential>(
        isCustomScript && ipsConfig?.credentialValue ? JSON.parse(ipsConfig.credentialValue) : defaultCustomCredential,
    )
    const [errorValidation, setErrorValidation] = useState<boolean>(false)

    function customHandleChange(e) {
      console.log(e.target)
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

    console.log(state)

    const getRegistryPayload = (awsRegion?: string) => {
        let appliedClusterIdsCsv = whiteList?.map((cluster) => cluster?.value)?.join(',')
        let ignoredClusterIdsCsv = blackList?.map((cluster) => cluster?.value)?.join(',')
        return {
            id: state.id.value,
            pluginId: 'cd.go.artifact.docker.registry',
            registryType: selectedDockerRegistryType.value,
            isDefault: Isdefault,
            registryUrl: customState.registryUrl.value,
            ...(selectedDockerRegistryType.value === 'ecr'
                ? {
                      awsAccessKeyId: customState.awsAccessKeyId.value,
                      awsSecretAccessKey: customState.awsSecretAccessKey.value,
                      awsRegion: awsRegion,
                  }
                : {}),
            ...(selectedDockerRegistryType.value === 'artifact-registry' || selectedDockerRegistryType.value === 'gcr'
                ? { username: customState.username.value, password: `'${customState.password.value}'` }
                : {}),
            ...(selectedDockerRegistryType.value === 'docker-hub' ||
            selectedDockerRegistryType.value === 'acr' ||
            selectedDockerRegistryType.value === 'quay'
                ? { username: customState.username.value, password: customState.password.value }
                : {}),
            ...(selectedDockerRegistryType.value === 'other'
                ? {
                      username: customState.username.value,
                      password: customState.password.value,
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

    async function onSave() {
        if (credentialsType === CredentialType.NAME && !credentialValue) {
            setErrorValidation(true)
            return
        }

        let awsRegion
        if (selectedDockerRegistryType.value === 'ecr') {
            awsRegion = fetchAWSRegion()
            if (!awsRegion) return
        }
        let payload = getRegistryPayload(awsRegion)

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
        if (selectedDockerRegistryType.value === 'ecr') {
            if (
                (!isIAMAuthType && (!customState.awsAccessKeyId.value || !customState.awsSecretAccessKey.value)) ||
                !customState.registryUrl.value
            ) {
                setCustomState((st) => ({
                    ...st,
                    awsAccessKeyId: { ...st.awsAccessKeyId, error: st.awsAccessKeyId.value ? '' : 'Mandatory' },
                    awsSecretAccessKey: {
                        ...st.awsSecretAccessKey,
                        error: st.awsSecretAccessKey.value ? '' : 'Mandatory',
                    },
                    registryUrl: { ...st.registryUrl, error: st.registryUrl.value ? '' : 'Mandatory' },
                }))
                return
            }
        } else if (selectedDockerRegistryType.value === 'docker-hub') {
            if (!customState.username.value || !customState.password.value) {
                setCustomState((st) => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: { ...st.password, error: st.password.value ? '' : 'Mandatory' },
                }))
                return
            }
        } else if (
            selectedDockerRegistryType.value === 'artifact-registry' ||
            selectedDockerRegistryType.value === 'gcr'
        ) {
            const isValidJsonFile = isValidJson(customState.password.value)
            if (!customState.username.value || !customState.password.value || !isValidJsonFile) {
                setCustomState((st) => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: {
                        ...st.password,
                        error: st.password.value ? (isValidJsonFile ? '' : 'Invalid JSON') : 'Mandatory',
                    },
                }))
                return
            }
        } else if (
            selectedDockerRegistryType.value === 'acr' ||
            selectedDockerRegistryType.value === 'quay' ||
            selectedDockerRegistryType.value === 'other'
        ) {
            let error = false
            if (!customState.username.value || !customState.password.value || !customState.registryUrl.value) {
                setCustomState((st) => ({
                    ...st,
                    username: { ...st.username, error: st.username.value ? '' : 'Mandatory' },
                    password: { ...st.password, error: st.password.value ? '' : 'Mandatory' },
                    registryUrl: { ...st.registryUrl, error: st.registryUrl.value ? '' : 'Mandatory' },
                }))
                error = true
            }
            if (
                selectedDockerRegistryType.value === 'other' &&
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
                paddingBottom: '0px',
                maxHeight: '250px',
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

    return (
        <form onSubmit={(e) => handleOnSubmit(e)} className="docker-form" autoComplete="off">
            <div className="form__row">
                <CustomInput
                    name="id"
                    autoFocus={true}
                    value={state.id.value}
                    autoComplete="off"
                    error={state.id.error}
                    tabIndex={1}
                    onChange={handleOnChange}
                    label="Name*"
                    disabled={!!id}
                />
            </div>
            <div className="form__row form__row--two-third">
                <div className="flex left column top">
                    <label htmlFor="" className="form__label w-100">
                        Registry Type*
                    </label>
                    <ReactSelect
                        className="m-0 w-100"
                        tabIndex={2}
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
            <div className="form__row">
                <CustomInput
                    name="registryUrl"
                    tabIndex={3}
                    label={selectedDockerRegistryType.registryURL.label}
                    value={customState.registryUrl.value || selectedDockerRegistryType.registryURL.defaultValue}
                    autoComplete="off"
                    error={customState.registryUrl.error}
                    onChange={customHandleChange}
                    disabled={!!(registryUrl || selectedDockerRegistryType.defaultRegistryURL)}
                    placeholder={selectedDockerRegistryType.registryURL.placeholder}
                />
            </div>
            {selectedDockerRegistryType.value === 'ecr' ? (
                <>
                    <div className="form__row">
                        <span className="form__label">Authentication Type*</span>
                        <RadioGroup
                            className="ecr-authType__radio-group"
                            value={isIAMAuthType ? AuthenticationType.IAM : AuthenticationType.BASIC}
                            name="ecr-authType"
                            onChange={(e) => onECRAuthTypeChange(e)}
                        >
                            <RadioGroupItem value={AuthenticationType.IAM}> EC2 IAM Role </RadioGroupItem>
                            <RadioGroupItem value={AuthenticationType.BASIC}> User auth </RadioGroupItem>
                        </RadioGroup>
                    </div>
                    {!isIAMAuthType && (
                        <>
                            <div className="form__row">
                                <CustomInput
                                    name="awsAccessKeyId"
                                    tabIndex={4}
                                    value={customState.awsAccessKeyId.value}
                                    error={customState.awsAccessKeyId.error}
                                    onChange={customHandleChange}
                                    label={selectedDockerRegistryType.id.label}
                                    autoComplete='off'
                                    placeholder={selectedDockerRegistryType.id.placeholder}
                                />
                            </div>
                            <div className="form__row">
                                <ProtectedInput
                                    name="awsSecretAccessKey"
                                    tabIndex={5}
                                    value={customState.awsSecretAccessKey.value}
                                    error={customState.awsSecretAccessKey.error}
                                    onChange={customHandleChange}
                                    label={selectedDockerRegistryType.password.label}
                                    type="password"
                                    placeholder={selectedDockerRegistryType.password.placeholder}
                                />
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    <div className="form__row">
                        <CustomInput
                            name="username"
                            tabIndex={6}
                            value={customState.username.value || selectedDockerRegistryType.id.defaultValue}
                            autoComplete={'off'}
                            error={customState.username.error}
                            onChange={customHandleChange}
                            label={selectedDockerRegistryType.id.label}
                            disabled={!!selectedDockerRegistryType.id.defaultValue}
                            placeholder={selectedDockerRegistryType.id.placeholder}
                        />
                    </div>
                    <div className="form__row">
                        {(selectedDockerRegistryType.value === 'docker-hub' ||
                            selectedDockerRegistryType.value === 'acr' ||
                            selectedDockerRegistryType.value === 'quay' ||
                            selectedDockerRegistryType.value === 'other') && (
                            <ProtectedInput
                                name="password"
                                tabIndex={7}
                                value={customState.password.value}
                                error={customState.password.error}
                                onChange={customHandleChange}
                                label={selectedDockerRegistryType.password.label}
                                placeholder={selectedDockerRegistryType.password.placeholder}
                                type="password"
                            />
                        )}
                        {(selectedDockerRegistryType.value === 'artifact-registry' ||
                            selectedDockerRegistryType.value === 'gcr') && (
                            <>
                                <label htmlFor="" className="form__label w-100">
                                    {selectedDockerRegistryType.password.label}
                                </label>
                                <textarea
                                    name="password"
                                    tabIndex={8}
                                    value={customState.password.value}
                                    className="w-100 p-10"
                                    rows={3}
                                    onChange={customHandleChange}
                                    placeholder={selectedDockerRegistryType.password.placeholder}
                                />
                                {state.password?.error && <div className="form__error">{state.password?.error}</div>}
                            </>
                        )}
                    </div>
                </>
            )}
            {selectedDockerRegistryType.value === 'other' && <hr className="cn-1 bcn-1 en-1" style={{ height: 0.5 }} />}
            {selectedDockerRegistryType.value === 'other' && (
                <div className={`form__buttons flex left ${toggleCollapsedAdvancedRegistry ? '' : 'mb-22'}`}>
                    <Dropdown
                        onClick={(e) => setToggleCollapsedAdvancedRegistry(not)}
                        className="rotate icon-dim-18 pointer fcn-6"
                        style={{ ['--rotateBy' as any]: !toggleCollapsedAdvancedRegistry ? '-90deg' : '0deg' }}
                    />
                    <label className="fs-13 mb-0 ml-8 pointer" onClick={(e) => setToggleCollapsedAdvancedRegistry(not)}>
                        Advanced Registry URL Connection Options
                    </label>
                    <a target="_blank" href="https://docs.docker.com/registry/insecure/">
                        <Info className="icon-dim-16 ml-4 mt-5" />
                    </a>
                </div>
            )}
            {toggleCollapsedAdvancedRegistry && selectedDockerRegistryType.value === 'other' && (
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
                                        content={<span style={{ display: 'block', width: '160px' }}>{tippy}</span>}
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
            {!showManageModal ? (
                <div className="en-2 bw-1 br-4 pt-10 pb-10 pl-16 pr-16 mb-20 fs-13">
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
            ) : (
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
            )}

            <div className="form__row form__buttons  ">
                <label
                    htmlFor=""
                    className="docker-default flex left "
                    onClick={
                        isDefault
                            ? () => {
                                  toast.success('Please mark another as default.')
                              }
                            : (e) => toggleDefault((t) => !t)
                    }
                >
                    <input type="checkbox" className="cursor" name="default" checked={Isdefault} onChange={(e) => {}} />
                    <div className="mr-4"> Set as default registry </div>
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="top"
                        content={
                            <span style={{ display: 'block', width: '160px' }}>
                                Default container registry is automatically selected while creating an application.{' '}
                            </span>
                        }
                    >
                        <Question className="icon-dim-20" />
                    </Tippy>
                </label>
            </div>
            <div className={`flex right mb-20`}>
                {id && (
                    <button
                        className="cta delete dc__m-auto ml-0"
                        type="button"
                        onClick={() => toggleConfirmation(true)}
                    >
                        {deleting ? <Progressing /> : 'Delete'}
                    </button>
                )}
                <button className="cta mr-16 cancel" type="button" onClick={setToggleCollapse}>
                    Cancel
                </button>
                <button className="cta" type="submit" disabled={loading}>
                    {loading ? <Progressing /> : 'Save'}
                </button>
            </div>

            {confirmation && (
                <DeleteComponent
                    setDeleting={setDeleting}
                    deleteComponent={deleteDockerReg}
                    payload={getRegistryPayload(selectedDockerRegistryType.value === 'ecr' && fetchAWSRegion())}
                    title={id}
                    toggleConfirmation={toggleConfirmation}
                    component={DeleteComponentsName.ContainerRegistry}
                    confirmationDialogDescription={DC_CONTAINER_REGISTRY_CONFIRMATION_MESSAGE}
                    reload={reload}
                />
            )}
        </form>
    )
}
