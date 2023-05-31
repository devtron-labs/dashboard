import React, { useState, useRef } from 'react'
import {
    showError,
    Progressing,
    CHECKBOX_VALUE,
    ToastBody,
    Checkbox,
    RadioGroupItem,
    RadioGroup,
    EmptyState,
    InfoColourBar,
    Toggle,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as ErrorIcon } from '../../assets/icons/ic-warning-y6.svg'
import YAML from 'yaml'
import { useForm, CustomPassword, Info } from '../common'
import { CustomInput } from '../globalConfigurations/GlobalConfiguration'
import NoResults from '../../assets/img/empty-noresult@2x.png'
import { saveCluster, updateCluster, deleteCluster, validateCluster, saveClusters } from './cluster.service'
import { ResizableTextarea } from '../configMaps/ConfigMap'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Warning } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as FormError } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as ForwardArrow } from '../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as MechanicalOperation } from '../../assets/img/ic-mechanical-operation.svg'
import {
    AuthenticationType,
    DEFAULT_SECRET_PLACEHOLDER,
    DataListType,
    UserDetails,
    SaveClusterPayloadType,
} from './cluster.type'
import { toast } from 'react-toastify'

import { CLUSTER_COMMAND, AppCreationType, MODES } from '../../config'
import DeleteComponent from '../../util/DeleteComponent'
import { DC_CLUSTER_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import ClusterInfoStepsModal from './ClusterInfoStepsModal'
import TippyHeadless from '@tippyjs/react/headless'
import CodeEditor from '../CodeEditor/CodeEditor'
import { UPLOAD_STATE } from '../CustomChart/types'
import UserNameDropDownList from './UseNameListDropdown'


const PrometheusWarningInfo = () => {
    return (
        <div className="pt-10 pb-10 pl-16 pr-16 bcy-1 br-4 bw-1 dc__cluster-error mb-40">
            <div className="flex left dc__align-start">
                <Warning className="icon-dim-20 fcr-7" />
                <div className="ml-8 fs-13">
                    <span className="fw-6 dc__capitalize">Warning: </span>Prometheus configuration will be removed and
                    you won’t be able to see metrics for applications deployed in this cluster.
                </div>
            </div>
        </div>
    )
}

const PrometheusRequiredFieldInfo = () => {
    return (
        <div className="pt-10 pb-10 pl-16 pr-16 bcr-1 br-4 bw-1 er-2 mb-16">
            <div className="flex left dc__align-start">
                <Error className="icon-dim-20" />
                <div className="ml-8 fs-13">
                    Fill all the required fields OR turn off the above switch to skip configuring prometheus.
                </div>
            </div>
        </div>
    )
}

export default function ClusterForm({
    id,
    cluster_name,
    server_url,
    active,
    config,
    toggleEditMode,
    reload,
    prometheus_url,
    prometheusAuth,
    defaultClusterComponent,
    isGrafanaModuleInstalled,
    isTlsConnection,
    toggleCheckTlsConnection,
    setTlsConnectionFalse,
    toggleShowAddCluster,
    toggleKubeConfigFile,
    isKubeConfigFile,
    isClusterDetails,
    toggleClusterDetails,
}) {
    const [loading, setLoading] = useState(false)
    const [prometheusToggleEnabled, setPrometheusToggleEnabled] = useState(prometheus_url ? true : false)
    const [prometheusAuthenticationType, setPrometheusAuthenticationType] = useState({
        type: prometheusAuth?.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS,
    })
    let authenTicationType =
        prometheusAuth?.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS

    const isDefaultCluster = (): boolean => {
        return id == 1
    }
    const [deleting, setDeleting] = useState(false)
    const [confirmation, toggleConfirmation] = useState(false)
    const inputFileRef = useRef(null)
    const [uploadState, setUploadState] = useState<string>(UPLOAD_STATE.UPLOAD)
    const [saveYamlData, setSaveYamlData] = useState<string>('')
    const [errorText, setErrorText] = useState('')
    const [dataList, setDataList] = useState<DataListType[]>([])
    const [saveClusterList, setSaveClusterList] = useState<{ clusterName: string; status: string; message: string }[]>(
        [],
    )
    const [loader, setLoadingState] = useState<boolean>(false)
    const [hasValidationError, setValidationError] = useState<any>(null)
    const [selectedUserNameOptions, setSelectedUserNameOptions] = useState<Record<string, any>>({})
    const [isClusterSelected, setClusterSeleceted] = useState<Record<string, boolean>>({})
    const [selectAll, setSelectAll] = useState<boolean>(false)
    const [getClusterVar, setGetClusterState] = useState<boolean>(false)
    const { state,  handleOnChange, handleOnSubmit } = useForm(
        {
            cluster_name: { value: cluster_name, error: '' },
            url: { value: server_url, error: '' },
            userName: { value: prometheusAuth?.userName, error: '' },
            password: { value: prometheusAuth?.password, error: '' },
            tlsClientKey: { value: '', error: '' },
            tlsClientCert: { value: '', error: '' },
            certificateAuthorityData: { value: '', error: '' },
            token: { value: config?.bearer_token ? config.bearer_token : '', error: '' },
            endpoint: { value: prometheus_url || '', error: '' },
            authType: { value: authenTicationType, error: '' },
        },
        {
            cluster_name: {
                required: true,
                validators: [
                    { error: 'Name is required', regex: /^.*$/ },
                    { error: "Use only lowercase alphanumeric characters, '-', '_' or '.'", regex: /^[a-z0-9-\.\_]+$/ },
                    { error: "Cannot start/end with '-', '_' or '.'", regex: /^(?![-._]).*[^-._]$/ },
                    { error: 'Minimum 3 and Maximum 63 characters required', regex: /^.{3,63}$/ },
                ],
            },
            url: {
                required: true,
                validator: { error: 'URL is required', regex: /^.*$/ },
            },
            authType: {
                required: false,
                validator: { error: 'Authentication Type is required', regex: /^(?!\s*$).+/ },
            },
            userName: {
                required:
                    prometheusToggleEnabled && prometheusAuthenticationType.type === AuthenticationType.BASIC
                        ? true
                        : false,
                validator: { error: 'username is required', regex: /^(?!\s*$).+/ },
            },
            password: {
                required:
                    prometheusToggleEnabled && prometheusAuthenticationType.type === AuthenticationType.BASIC
                        ? true
                        : false,
                validator: { error: 'password is required', regex: /^(?!\s*$).+/ },
            },
            tlsClientKey: {
                required: id ? false : isTlsConnection,
            },
            tlsClientCert: {
                required: id ? false : isTlsConnection,
            },
            certificateAuthorityData: {
                required: id ? false : isTlsConnection,
            },
            token:
                isDefaultCluster() || id
                    ? {}
                    : {
                          required: true,
                          validator: { error: 'token is required', regex: /[^]+/ },
                      },
            endpoint: {
                required: prometheusToggleEnabled ? true : false,
                validator: { error: 'endpoint is required', regex: /^.*$/ },
            },
        },
        onValidation,
    )

    const toggleGetCluster = () => {
        setGetClusterState(!getClusterVar)
    }

    const handleEditConfigClick = () => {
        toggleGetCluster()
        toggleKubeConfigFile(true)
    }

    const getSaveClusterPayload = (dataLists: DataListType[]) => {
        const saveClusterPayload: SaveClusterPayloadType[] = []
        for (const _dataList of dataLists) {
            if (isClusterSelected[_dataList.cluster_name]) {
                const _clusterDetails: SaveClusterPayloadType = {
                    id: _dataList.id,
                    cluster_name: _dataList.cluster_name,
                    insecureSkipTlsVerify: _dataList.insecureSkipTlsVerify,
                    config: selectedUserNameOptions[_dataList.cluster_name]?.config ?? null,
                    active: true,
                    prometheus_url: '',
                    prometheusAuth: { userName: '', password: '' },
                    server_url: _dataList.server_url,
                }
                saveClusterPayload.push(_clusterDetails)
            }
        }

        return saveClusterPayload
    }

    async function saveClustersDetails() {
        try {
            let payload = getSaveClusterPayload(dataList)
            await saveClusters(payload).then((response) => {
                const _clusterList = response.result.map((_clusterSaveDetails, index) => {
                    let status
                    let message
                    if (
                        _clusterSaveDetails['errorInConnecting'].length === 0 &&
                        _clusterSaveDetails['clusterUpdated'] === false
                    ) {
                        status = 'Added'
                        message = 'Cluster Added'
                    } else if (_clusterSaveDetails['clusterUpdated'] === true) {
                        status = 'Updated'
                        message = 'Cluster Updated'
                    } else {
                        status = 'Failed'
                        message = _clusterSaveDetails['errorInConnecting']
                    }

                    return {
                        clusterName: _clusterSaveDetails['cluster_name'],
                        status: status,
                        message: message,
                    }
                })
                setSaveClusterList(_clusterList)
            })
            setLoadingState(false)
        } catch (err) {
            setLoadingState(false)
            showError(err)
        }
    }

    function YAMLtoJSON(saveYamlData) {
        try {
            let obj = YAML.parse(saveYamlData)
            let jsonStr = JSON.stringify(obj)
            return jsonStr
        } catch (error) {}
    }

    function isCheckboxDisabled() {
        const clusters = Object.values(selectedUserNameOptions)

        if (clusters.length === 0) {
            return true
        }

        return clusters.every((cluster) => {
            return cluster.errorInConnecting !== 'cluster-already-exists' && cluster.errorInConnecting.length > 0
        })
    }

    async function validateClusterDetail() {
        try {
            let payload = { config: YAMLtoJSON(saveYamlData) }
            await validateCluster(payload).then((response) => {
                const defaultUserNameSelections: Record<string, any> = {}
                const _clusterSelections: Record<string, boolean> = {}
                setDataList([
                    ...Object.values(response.result).map((_cluster) => {
                        const _userInfoList = [...Object.values(_cluster['userInfos'] as UserDetails[])]
                        defaultUserNameSelections[_cluster['cluster_name']] = {
                            label: _userInfoList[0].userName,
                            value: _userInfoList[0].userName,
                            errorInConnecting: _userInfoList[0].errorInConnecting,
                            config: _userInfoList[0].config,
                        }
                        _clusterSelections[_cluster['cluster_name']] = false

                        return {
                            cluster_name: _cluster['cluster_name'],
                            userInfos: _userInfoList,
                            server_url: _cluster['server_url'],
                            active: _cluster['active'],
                            defaultClusterComponent: _cluster['defaultClusterComponent'],
                            insecureSkipTlsVerify: _cluster['insecureSkipTlsVerify'],
                            id: _cluster['id'],
                        }
                    }),
                ])
                setSelectedUserNameOptions(defaultUserNameSelections)
                setClusterSeleceted(_clusterSelections)
                setLoadingState(false)
                toggleGetCluster()
                setValidationError(false)
            })
        } catch (err: any) {
            setLoadingState(false)
            setValidationError(true)
            const error = err?.errors?.[0];
            setErrorText(`${error.userMessage}`)
        }
    }

    const handleOnFocus = (e): void => {
        if (e.target.value === DEFAULT_SECRET_PLACEHOLDER) {
            e.target.value = ''
        }
    }

    const handleOnBlur = (e): void => {
        if (id && id !== 1 && !e.target.value) {
            e.target.value = DEFAULT_SECRET_PLACEHOLDER
        }
    }

    const getClusterPayload = () => {
        return {
            id,
            insecureSkipTlsVerify: !isTlsConnection,
            cluster_name: state.cluster_name.value,
            config: {
                bearer_token:
                    state.token.value && state.token.value !== DEFAULT_SECRET_PLACEHOLDER ? state.token.value : '',
                tls_key: state.tlsClientKey.value,
                cert_data: state.tlsClientCert.value,
                cert_auth_data: state.certificateAuthorityData.value,
            },
            active,
            prometheus_url: prometheusToggleEnabled ? state.endpoint.value : '',
            prometheusAuth: {
                userName: prometheusToggleEnabled ? state.userName.value : '',
                password: prometheusToggleEnabled ? state.password.value : '',
            },
        }
    }

    async function onValidation() {
        let payload = getClusterPayload()
        const urlValue = state.url.value?.trim() ?? ''
        if (urlValue.endsWith('/')) {
            payload['server_url'] = urlValue.slice(0, -1)
        } else {
            payload['server_url'] = urlValue
        }

        if (state.authType.value === AuthenticationType.BASIC && prometheusToggleEnabled) {
            let isValid = state.userName?.value && state.password?.value
            if (!isValid) {
                toast.error('Please add both username and password')
                return
            } else {
                payload.prometheusAuth['userName'] = state.userName.value || ''
                payload.prometheusAuth['password'] = state.password.value || ''
            }
        }
        if (isTlsConnection) {
            if (
                (state.tlsClientKey.value || state.tlsClientCert.value || state.certificateAuthorityData.value) &&
                prometheusToggleEnabled
            ) {
                let isValid =
                    state.tlsClientKey.value?.length > 0 &&
                    state.tlsClientCert.value?.length > 0 &&
                    state.certificateAuthorityData.value?.length > 0

                if (!isValid) {
                    toast.error('Please add TLS Key, Certificate, and Certificate Authority Data')
                    return
                } else {
                    payload.prometheusAuth['tlsClientKey'] = state.tlsClientKey.value || ''
                    payload.prometheusAuth['tlsClientCert'] = state.tlsClientCert.value || ''
                    payload.prometheusAuth['certificateAuthorityData'] = state.certificateAuthorityData.value || ''
                }
            }
        }

        const api = id ? updateCluster : saveCluster
        try {
            setLoading(true)
            const { result } = await api(payload)
            toast.success(
                <ToastBody
                    data-testid="validate-toast-for-kubeconfig"
                    title={`Successfully ${id ? 'updated' : 'saved'}`}
                />,
            )
            reload()
            toggleEditMode((e) => !e)
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
            toggleShowAddCluster()
            setTlsConnectionFalse()
        }
    }

    const setPrometheusToggle = () => {
        setPrometheusToggleEnabled(!prometheusToggleEnabled)
    }

    const OnPrometheusAuthTypeChange = (e) => {
        handleOnChange(e)
        if (state.authType.value == AuthenticationType.BASIC) {
            setPrometheusAuthenticationType({ type: AuthenticationType.ANONYMOUS })
        } else {
            setPrometheusAuthenticationType({ type: AuthenticationType.BASIC })
        }
    }

    let payload = {
        id,
        cluster_name,
        config: { bearer_token: state.token.value },
        active,
        prometheus_url: prometheusToggleEnabled ? state.endpoint.value : '',
        prometheusAuth: {
            userName: prometheusToggleEnabled ? state.userName.value : '',
            password: prometheusToggleEnabled ? state.password.value : '',
        },
        server_url,
        defaultClusterComponent: defaultClusterComponent,
        k8sversion: '',
        insecureSkipTlsVerify: !isTlsConnection,
    }

    const ClusterInfoComponent = () => {
        const k8sClusters = Object.values(CLUSTER_COMMAND)
        return (
            <>
                {k8sClusters.map((cluster, key) => (
                    <>
                        <TippyHeadless
                            className=""
                            theme="light"
                            placement="bottom"
                            trigger="click"
                            interactive={true}
                            render={() => (
                                <ClusterInfoStepsModal
                                    subTitle={cluster.title}
                                    command={cluster.command}
                                    clusterName={cluster.clusterName}
                                />
                            )}
                            maxWidth="468px"
                        >
                            <span className="ml-4 mr-2 cb-5 cursor">{cluster.heading}</span>
                        </TippyHeadless>
                        {key !== k8sClusters.length - 1 && <span className="cn-2">|</span>}
                    </>
                ))}
            </>
        )
    }

    const clusterLabel = () => {
        return (
            <div className="flex left ">
                Server URL & Bearer token{isDefaultCluster() ? '' : '*'}
                <span className="icon-dim-16 fcn-9 mr-4 ml-16">
                    <Question className="icon-dim-16" />
                </span>
                <span>How to find for </span>
                <ClusterInfoComponent />
            </div>
        )
    }

    const onFileChange = (e): void => {
        setUploadState(UPLOAD_STATE.UPLOADING)
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = () => {
            try {
                const data = YAML.parseDocument(reader.result.toString())
                setSaveYamlData(reader.result.toString())
            } catch (e) {}
        }
        reader.readAsText(file)
        setUploadState(UPLOAD_STATE.SUCCESS)
    }

    const handleBrowseFileClick = (): void => {
        inputFileRef.current.click()
    }

    const handleCloseButton = () => {
        if (id) {
            setTlsConnectionFalse()
            toggleEditMode((e) => !e)
            return
        }
        if (isKubeConfigFile) {
            toggleKubeConfigFile(!isKubeConfigFile)
        }
        if (getClusterVar) {
            toggleGetCluster()
        }
        if (isClusterDetails) {
            toggleClusterDetails(!isClusterDetails)
        }
        setTlsConnectionFalse()
        toggleShowAddCluster()

        setLoadingState(false)
        reload()
    }

    const renderUrlAndBearerToken = () => {
        return (
            <>
                <div className="form__row">
                    <CustomInput
                        labelClassName="dc__required-field"
                        autoComplete="off"
                        name="cluster_name"
                        disabled={isDefaultCluster()}
                        value={state.cluster_name.value}
                        error={state.cluster_name.error}
                        onChange={handleOnChange}
                        label="Cluster Name"
                        placeholder="Cluster Name"
                        dataTestid="cluster_name_input"
                    />
                </div>
                <div className="form__row mb-8-imp">
                    <CustomInput
                        autoComplete="off"
                        name="url"
                        value={state.url.value}
                        error={state.url.error}
                        onChange={handleOnChange}
                        label={clusterLabel()}
                        disabled={isDefaultCluster()}
                        placeholder="Enter server URL"
                        dataTestid="enter_server_url_input"
                    />
                </div>
                <div className="form__row form__row--bearer-token flex column left top">
                    {id !== 1 && (
                        <div className="bearer-token">
                            <ResizableTextarea
                                className="dc__resizable-textarea__with-max-height dc__required-field"
                                name="token"
                                value={
                                    id && id !== 1
                                        ? DEFAULT_SECRET_PLACEHOLDER
                                        : config && config.bearer_token
                                        ? config.bearer_token
                                        : ''
                                }
                                onChange={handleOnChange}
                                onBlur={handleOnBlur}
                                onFocus={handleOnFocus}
                                placeholder="Enter bearer token"
                                dataTestId="enter_bearer_token_input"
                            />
                        </div>
                    )}
                    {state.token.error && (
                        <label htmlFor="" className="form__error">
                            <FormError className="form__icon form__icon--error" />
                            {state.token.error}
                        </label>
                    )}
                </div>
                {isGrafanaModuleInstalled && id !== 1 && (
                    <>
                        <hr />
                        <div className="dc__position-rel flex left dc__hover mb-20">
                            <Checkbox
                                isChecked={isTlsConnection}
                                rootClassName="form__checkbox-label--ignore-cache mb-0"
                                value={'CHECKED'}
                                onChange={toggleCheckTlsConnection}
                            >
                                <div data-testid="use_secure_tls_connection_checkbox" className="mr-4 flex center">
                                    {' '}
                                    Use secure TLS connection {isTlsConnection}
                                </div>
                            </Checkbox>
                        </div>
                        {!isTlsConnection && <hr />}
                        {isTlsConnection && (
                            <>
                                <div>
                                    <span
                                        data-testid="certificate_authority_data"
                                        className="form__label dc__required-field"
                                    >
                                        Certificate Authority Data
                                    </span>
                                    <ResizableTextarea
                                        dataTestId="certificate_authority_data_input"
                                        className="dc__resizable-textarea__with-max-height w-100"
                                        name="certificateAuthorityData"
                                        value={
                                            id && id !== 1 && isTlsConnection
                                                ? DEFAULT_SECRET_PLACEHOLDER
                                                : state.certificateAuthorityData.value
                                        }
                                        onChange={handleOnChange}
                                        onBlur={handleOnBlur}
                                        onFocus={handleOnFocus}
                                        placeholder={'Enter CA Data'}
                                    />
                                    {state.certificateAuthorityData.error && (
                                        <label htmlFor="" className="form__error">
                                            <FormError className="form__icon form__icon--error" />
                                            {state.certificateAuthorityData.error}
                                        </label>
                                    )}
                                </div>
                                <div>
                                    <span data-testid="tls_client_key" className="form__label dc__required-field">
                                        TLS Key
                                    </span>
                                    <ResizableTextarea
                                        dataTestId="tls_client_key_input"
                                        className="dc__resizable-textarea__with-max-height w-100"
                                        name="tlsClientKey"
                                        value={
                                            id && id !== 1 && isTlsConnection
                                                ? DEFAULT_SECRET_PLACEHOLDER
                                                : state.tlsClientKey.value
                                        }
                                        onChange={handleOnChange}
                                        onBlur={handleOnBlur}
                                        onFocus={handleOnFocus}
                                        placeholder={'Enter tls Key'}
                                    />
                                    {state.tlsClientKey.error && (
                                        <label htmlFor="" className="form__error">
                                            <FormError className="form__icon form__icon--error" />
                                            {state.tlsClientKey.error}
                                        </label>
                                    )}
                                </div>
                                <div>
                                    <span data-testid="tls_certificate" className="form__label dc__required-field">
                                        TLS Certificate
                                    </span>
                                    <ResizableTextarea
                                        dataTestId="tls_certificate_input"
                                        className="dc__resizable-textarea__with-max-height w-100"
                                        name="tlsClientCert"
                                        value={
                                            id && id !== 1 && isTlsConnection
                                                ? DEFAULT_SECRET_PLACEHOLDER
                                                : state.tlsClientCert.value
                                        }
                                        onChange={handleOnChange}
                                        onBlur={handleOnBlur}
                                        onFocus={handleOnFocus}
                                        placeholder={'Enter tls Certificate'}
                                    />
                                    {state.tlsClientCert.error && (
                                        <label htmlFor="" className="form__error">
                                            <FormError className="form__icon form__icon--error" />
                                            {state.tlsClientCert.error}
                                        </label>
                                    )}
                                </div>
                                <hr />
                            </>
                        )}
                    </>
                )}
                <div className={`${prometheusToggleEnabled ? 'mb-20' : prometheus_url ? 'mb-20' : 'mb-40'} mt-20`}>
                    <div className="dc__content-space flex">
                        <span className="form__input-header">See metrics for applications in this cluster</span>
                        <div className="" style={{ width: '32px', height: '20px' }}>
                            <Toggle selected={prometheusToggleEnabled} onSelect={setPrometheusToggle} />
                        </div>
                    </div>
                    <span className="cn-6 fs-12">
                        Configure prometheus to see metrics like CPU, RAM, Throughput etc. for applications running in
                        this cluster
                    </span>
                </div>
                {isGrafanaModuleInstalled && !prometheusToggleEnabled && prometheus_url && <PrometheusWarningInfo />}
                {isGrafanaModuleInstalled && prometheusToggleEnabled && (
                    <div className="">
                        {(state.userName.error || state.password.error || state.endpoint.error) && (
                            <PrometheusRequiredFieldInfo />
                        )}
                        <div className="form__row">
                            <CustomInput
                                labelClassName="dc__required-field"
                                autoComplete="off"
                                name="endpoint"
                                value={state.endpoint.value}
                                error={state.endpoint.error}
                                onChange={handleOnChange}
                                label="Prometheus endpoint"
                            />
                        </div>
                        <div className="form__row">
                            <span className="form__label">Authentication Type*</span>
                            <RadioGroup
                                value={state.authType.value}
                                name={`authType`}
                                onChange={(e) => OnPrometheusAuthTypeChange(e)}
                            >
                                <RadioGroupItem value={AuthenticationType.BASIC}> Basic </RadioGroupItem>
                                <RadioGroupItem value={AuthenticationType.ANONYMOUS}> Anonymous </RadioGroupItem>
                            </RadioGroup>
                        </div>
                        {state.authType.value === AuthenticationType.BASIC ? (
                            <div className="form__row form__row--flex">
                                <div className="w-50 mr-8 ">
                                    <CustomInput
                                        name="userName"
                                        value={state.userName.value}
                                        error={state.userName.error}
                                        onChange={handleOnChange}
                                        label="Username"
                                    />
                                </div>
                                <div className="w-50 ml-8">
                                    <CustomPassword
                                        name="password"
                                        value={state.password.value}
                                        error={state.userName.error}
                                        onChange={handleOnChange}
                                        label="Password"
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </>
        )
    }

    const handleGetClustersClick = async () => {
        setLoadingState(true)
        await validateClusterDetail()
    }

    const onChangeEditorValue = (val: string) => {
        setSaveYamlData(val)
    }

    const codeEditor = () => {
        return (
            <>
                <div className="code-editor-container">
                    <CodeEditor
                        value={saveYamlData}
                        height="calc(100vh - 233px)"
                        diffView={false}
                        onChange={onChangeEditorValue}
                        mode={MODES.YAML}
                    >
                        <CodeEditor.Header>
                            <div className="user-list__subtitle flex pt-8 pb-8 pr-12 pl-12 fs-13 lh-20">
                                <span className="flex left">Paste the contents of kubeconfig file here</span>
                                <div className="dc__link ml-auto cursor">
                                    {uploadState !== UPLOAD_STATE.UPLOADING && (
                                        <div
                                            data-testid="browse_file_to_upload"
                                            onClick={handleBrowseFileClick}
                                            className="flex fw-6"
                                        >
                                            Browse file...
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={inputFileRef}
                                    onChange={onFileChange}
                                    accept=".yaml"
                                    style={{ display: 'none' }}
                                    data-testid="select_code_editor"
                                />
                            </div>
                        </CodeEditor.Header>
                        {hasValidationError && <CodeEditor.ErrorBar text={errorText} />}
                    </CodeEditor>
                </div>
            </>
        )
    }

    const LoadingCluster = (): JSX.Element => {
        return (
            <div className="cluster-form dc__position-rel h-100 bcn-0">
                <div className="flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 mb-20 pl-20 ">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Add Cluster</h2>
                    <button
                        type="button"
                        className="dc__transparent flex icon-dim-24 mr-24"
                        onClick={handleCloseButton}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div
                    className="flex flex-align-center dc__border-bottom w-100 flex-justify bcn-0 pb-12 pt-12 mb-20 pl-20"
                    style={{ height: 732 }}
                >
                    <EmptyState>
                        <EmptyState.Image>
                            <MechanicalOperation />
                        </EmptyState.Image>
                        <EmptyState.Title>
                            <h4 data-testid="mechanical_loader">Trying to connect to Cluster</h4>
                        </EmptyState.Title>
                        <EmptyState.Subtitle>
                            Please wait while the kubeconfig is verified and cluster details are fetched.
                        </EmptyState.Subtitle>
                    </EmptyState>
                </div>
                <div className="w-100 dc__border-top flex right pb-12 pt-12 dc__position-fixed dc__position-abs dc__bottom-0">
                    <button className="cta cancel" type="button" onClick={handleCloseButton} disabled={true}>
                        Cancel
                    </button>
                    <button className="cta mr-20 ml-20" disabled={true}>
                        {<Progressing />}
                    </button>
                </div>
            </div>
        )
    }

    const NoMatchingResults = (): JSX.Element => {
        return (
            <EmptyState>
                <EmptyState.Image>
                    <img src={NoResults} width="250" height="200" alt="No matching results" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h2 data-testid="no_matching_result" className="fs-16 fw-4 c-9">
                        No matching results
                    </h2>
                </EmptyState.Title>
                <EmptyState.Subtitle>We couldn't find any matching cluster</EmptyState.Subtitle>
            </EmptyState>
        )
    }

    if (loader) {
        return <LoadingCluster />
    }

    const saveClusterDetails = (): JSX.Element => {
        return (
            <>
                <div className="cluster-form dc__position-rel h-100 bcn-0">
                    <AddClusterHeader />
                    <div className="api-token__list en-2 bw-0 bcn-0 br-8">
                        <div
                            data-testid="cluster_list_page_after_selection"
                            className="saved-cluster-list-row cluster-env-list_table fs-12 pt-6 pb-6 fw-6 flex left lh-20 pl-20 pr-20  dc__border-bottom-n1"
                        >
                            <div></div>
                            <div data-testid="cluster_validate">CLUSTER</div>
                            <div data-testid="status_validate">STATUS</div>
                            <div data-testid="message_validate">MESSAGE</div>
                            <div></div>
                        </div>
                        <div className="dc__overflow-scroll" style={{ height: 'calc(100vh - 161px)' }}>
                            {!saveClusterList || saveClusterList.length === 0 ? (
                                <NoMatchingResults />
                            ) : (
                                saveClusterList.map((clusterListDetail, index) => (
                                    <div
                                        key={`api_${index}`}
                                        className="saved-cluster-list-row flex-align-center fw-4 cn-9 fs-13 pr-20 pl-20"
                                        style={{ height: '40px' }}
                                    >
                                        <div></div>
                                        <div
                                            data-testid={`validate-cluster-${clusterListDetail.clusterName}`}
                                            className="flexbox"
                                        >
                                            <span className="dc__ellipsis-right">{clusterListDetail.clusterName}</span>
                                        </div>
                                        <div className="flexbox dc__align-items-center">
                                            <div
                                                data-testid="status_icon_visibility"
                                                className={`dc__app-summary__icon icon-dim-16 mr-2 ${
                                                    clusterListDetail.status === 'Failed' ? 'failed' : 'succeeded'
                                                }`}
                                            ></div>
                                            <div
                                                data-testid={`validate-cluster-${clusterListDetail.status}`}
                                                className="dc__ellipsis-right"
                                            >
                                                {' '}
                                                {clusterListDetail.status}{' '}
                                            </div>
                                        </div>
                                        <div className="dc__ellipsis-right"> {clusterListDetail.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="w-100 dc__border-top flex right pb-12 pt-12 dc__position-fixed dc__position-abs dc__bottom-0">
                        <button
                            className="ml-20 dc_edit_button cb-5"
                            type="button"
                            onClick={handleEditConfigClick}
                            style={{ marginRight: 'auto' }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                <Edit className="icon-dim-16 scb-5 mr-4" />
                                Edit Kubeconfig
                            </span>
                        </button>
                        <button
                            data-testid="close_after_cluster_list_display"
                            className="cta mr-20"
                            type="button"
                            onClick={handleCloseButton}
                            style={{ marginLeft: 'auto' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </>
        )
    }

    const handleClusterDetailCall = async () => {
        setLoadingState(true)
        await saveClustersDetails()
        toggleKubeConfigFile(false)
        toggleClusterDetails(true)
    }

    if (loader) {
        return <LoadingCluster />
    }

    function toggleIsSelected(clusterName: string, forceUnselect?: boolean) {
        const _currentSelections = {
            ...isClusterSelected,
            [clusterName]: forceUnselect ? false : !isClusterSelected[clusterName],
        }
        setClusterSeleceted(_currentSelections)

        if (Object.values(_currentSelections).some((selected) => selected)) {
            setSelectAll(true)
        } else {
            setSelectAll(false)
        }
    }

    function toggleSelectAll(event) {
        if (isCheckboxDisabled()) {
            return
        }
        const currentSelections = { ...isClusterSelected }
        const _selectAll = event.currentTarget.checked

        Object.keys(currentSelections).forEach((selection) => {
            if (
                selectedUserNameOptions[selection].errorInConnecting !== 'cluster-already-exists' &&
                selectedUserNameOptions[selection].errorInConnecting.length > 0
            ) {
                return
            }

            currentSelections[selection] = _selectAll
        })

        setSelectAll(_selectAll)
        setClusterSeleceted(currentSelections)
    }

    function validCluster() {
        const _validCluster = dataList
        let count = 0

        _validCluster.forEach((_dataList) => {
            let found = false
            _dataList.userInfos.forEach((userInfo) => {
                if (
                    userInfo.errorInConnecting.length === 0 ||
                    userInfo.errorInConnecting === 'cluster-already-exists'
                ) {
                    found = true
                }
            })
            if (found) {
                count++
            }
        })
        return count
    }

    const getAllClustersCheckBoxValue = () => {
        if (Object.values(isClusterSelected).every((_selected) => _selected)) {
            return CHECKBOX_VALUE.CHECKED
        } else if (Object.values(isClusterSelected).some((_selected) => _selected)) {
            return CHECKBOX_VALUE.INTERMEDIATE
        }
    }

    const onChangeUserName = (selectedOption: any, clusterDetail: DataListType) => {
        setSelectedUserNameOptions({
            ...selectedUserNameOptions,
            [clusterDetail.cluster_name]: selectedOption,
        })
        toggleIsSelected(clusterDetail.cluster_name, true)
    }

    const displayClusterDetails = () => {
        const isAnyCheckboxSelected = Object.values(isClusterSelected).some((value) => value === true)
        return (
            <>
                {isKubeConfigFile && (
                    <div
                        data-testid="valid_cluster_infocolor_bar"
                        className="cluster-form dc__position-rel h-100 bcn-0"
                    >
                        <AddClusterHeader />
                        <div className="dc__overflow-scroll" style={{ height: 'calc(100vh-124px)' }}>
                            <div className="api-token__list en-2 bw-1 bcn-0 br-8 mr-20 ml-20 mt-16">
                                <InfoColourBar
                                    message={
                                        <>
                                            <span className="fw-6">{validCluster()} valid cluster. </span>
                                            <span>Select the cluster you want to add/update</span>
                                        </>
                                    }
                                    classname="info_bar cn-9 lh-20 dc__no-border-imp pl-18"
                                    Icon={Info}
                                    styles={{ borderRadius: '6px 6px 0 0' }}
                                />
                                <div className="cluster-list-row-1 cluster-env-list_table fs-12 pt-6 pb-6 fw-6 flex left lh-20 pl-20 pr-20 dc__border-top dc__border-bottom">
                                    <div data-testid="select_all_cluster_checkbox">
                                        <Checkbox
                                            rootClassName={`form__checkbox-label--ignore-cache mb-0 flex${
                                                isCheckboxDisabled() ? ' dc__opacity-0_5' : ''
                                            }`}
                                            onChange={toggleSelectAll}
                                            isChecked={selectAll}
                                            value={getAllClustersCheckBoxValue()}
                                            disabled={isCheckboxDisabled()}
                                        />
                                    </div>
                                    <div>CLUSTER</div>
                                    <div>USER</div>
                                    <div>MESSAGE</div>
                                    <div></div>
                                </div>
                                <div style={{ height: 'auto' }}>
                                    {!dataList || dataList.length === 0 ? (
                                        <NoMatchingResults />
                                    ) : (
                                        dataList.map((clusterDetail, index) => (
                                            <div
                                                key={`api_${index}`}
                                                className="cluster-list-row-1 flex-align-center fw-4 cn-9 fs-13 pr-20 pl-20"
                                                style={{
                                                    height: 'auto',
                                                    alignItems: 'start',
                                                    marginTop: '8px',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                <Checkbox
                                                    key={`app-$${index}`}
                                                    dataTestId={`checkbox_selection_of_cluster-${clusterDetail.cluster_name}`}
                                                    rootClassName={`form__checkbox-label--ignore-cache mb-0 flex${
                                                        selectedUserNameOptions[clusterDetail.cluster_name]
                                                            .errorInConnecting === 'cluster-already-exists' ||
                                                        !selectedUserNameOptions[clusterDetail.cluster_name]
                                                            .errorInConnecting
                                                            ? ''
                                                            : ' dc__opacity-0_5'
                                                    }`}
                                                    onChange={() => toggleIsSelected(clusterDetail.cluster_name)}
                                                    isChecked={isClusterSelected[clusterDetail.cluster_name]}
                                                    value={CHECKBOX_VALUE.CHECKED}
                                                    disabled={
                                                        selectedUserNameOptions[clusterDetail.cluster_name]
                                                            .errorInConnecting === 'cluster-already-exists'
                                                            ? false
                                                            : selectedUserNameOptions[clusterDetail.cluster_name]
                                                                  .errorInConnecting.length > 0
                                                    }
                                                />
                                                <div
                                                    className="flexbox"
                                                    onClick={() => toggleIsSelected(clusterDetail.cluster_name)}
                                                >
                                                    <span className="dc__ellipsis-right">
                                                        {clusterDetail.cluster_name}
                                                    </span>
                                                </div>
                                                <UserNameDropDownList
                                                    clusterDetail={clusterDetail}
                                                    selectedUserNameOptions={selectedUserNameOptions}
                                                    onChangeUserName={onChangeUserName}
                                                />
                                                <div>
                                                    {clusterDetail.id !== 0 && (
                                                        <div className="flex left top">
                                                            <ErrorIcon className="dc__app-summary__icon icon-dim-16 mr-8 mt-3" />
                                                            <span>
                                                                {isClusterSelected[clusterDetail.cluster_name]
                                                                    ? 'Cluster already exists. Cluster will be updated'
                                                                    : 'Cluster already exists.'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {selectedUserNameOptions[clusterDetail.cluster_name]
                                                        .errorInConnecting !== '' &&
                                                        selectedUserNameOptions[clusterDetail.cluster_name]
                                                            .errorInConnecting !== 'cluster-already-exists' && (
                                                            <div className="flex left top">
                                                                <div
                                                                    className={`dc__app-summary__icon icon-dim-16 mr-8 mt-3 ${
                                                                        selectedUserNameOptions[
                                                                            clusterDetail.cluster_name
                                                                        ].errorInConnecting.length !== 0
                                                                            ? 'failed'
                                                                            : ''
                                                                    }`}
                                                                />
                                                                <span>
                                                                    {selectedUserNameOptions[clusterDetail.cluster_name]
                                                                        ?.errorInConnecting || ' '}
                                                                </span>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isKubeConfigFile && (
                    <div className="w-100 dc__border-top flex right pb-12 pt-12 pl-20 pr-20 dc__position-fixed dc__position-abs bcn-0 dc__bottom-0">
                        <button
                            className="dc_edit_button cb-5"
                            type="button"
                            onClick={handleEditConfigClick}
                            style={{ marginRight: 'auto' }}
                        >
                            <span
                                data-testid="edit_kubeconfig_button_cluster_checkbox"
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Edit className="icon-dim-16 scb-5 mr-4" />
                                Edit Kubeconfig
                            </span>
                        </button>
                        <button
                            data-testid="save_cluster_list_button_after_selection"
                            className="cta"
                            type="button"
                            onClick={() => handleClusterDetailCall()}
                            disabled={!saveClusterList || !isAnyCheckboxSelected}
                        >
                            Save
                        </button>
                    </div>
                )}
                {isClusterDetails && !isKubeConfigFile && saveClusterDetails()}
            </>
        )
    }

    const clusterTitle = () => {
        if (!id) {
            return 'Add Cluster'
        } else {
            return 'Edit Cluster'
        }
    }

    const AddClusterHeader = () => {
        return (
            <div className="flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12  pl-20 ">
                <h2 data-testid="add_cluster_header" className="fs-16 fw-6 lh-1-43 m-0 title-padding">
                    <span className="fw-6 fs-16 cn-9">{clusterTitle()}</span>
                </h2>
                <button
                    data-testid="header_close_icon"
                    type="button"
                    className="dc__transparent flex icon-dim-24 mr-24"
                    onClick={handleCloseButton}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    return getClusterVar ? (
        displayClusterDetails()
    ) : (
        <>
            <div className="cluster-form dc__position-rel h-100 bcn-0" style={{ padding: 'auto 0' }}>
                <AddClusterHeader />

                <div className="p-20" style={{ overflow: 'auto', height: 'calc(100vh - 124px)' }}>
                    {!id && (
                        <div className="form__row clone-apps dc__inline-block pd-0 pt-0 pb-12">
                            <RadioGroup
                                className="radio-group-no-border"
                                value={isKubeConfigFile ? 'EXISTING' : 'BLANK'}
                                name="trigger-type"
                                onChange={() => toggleKubeConfigFile(!isKubeConfigFile)}
                            >
                                <RadioGroupItem value={AppCreationType.Blank}>
                                    Use Server URL & Bearer token
                                </RadioGroupItem>
                                <RadioGroupItem
                                    dataTestId="add_cluster_from_kubeconfig_file"
                                    value={AppCreationType.Existing}
                                >
                                    From kubeconfig
                                </RadioGroupItem>
                            </RadioGroup>
                        </div>
                    )}

                    {isKubeConfigFile ? codeEditor() : renderUrlAndBearerToken()}
                </div>

                {!isKubeConfigFile && (
                    <div className="w-100 dc__border-top flex right pb-12 pt-12 dc__position-fixed dc__position-abs dc__bottom-0">
                        {id && (
                            <button
                                data-testid="delete_cluster"
                                style={{ margin: 'auto', marginLeft: 20 }}
                                className="flex cta delete scr-5"
                                type="button"
                                onClick={() => toggleConfirmation(true)}
                            >
                                {deleting ? <Progressing /> : 'Delete'}
                            </button>
                        )}
                        <button
                            data-testid="cancel_button"
                            className="cta cancel"
                            type="button"
                            onClick={handleCloseButton}
                        >
                            Cancel
                        </button>
                        <button
                            data-testid="save_cluster_after_entering_cluster_details"
                            className="cta mr-20 ml-12"
                            onClick={handleOnSubmit}
                        >
                            {id ? 'Update cluster' : 'Save cluster'}
                        </button>
                    </div>
                )}
                {isKubeConfigFile && (
                    <div className="w-100 dc__border-top flex right pb-12 pt-12 dc__position-fixed dc__position-abs dc__bottom-0">
                        <button
                            data-testid="cancel_kubeconfig_button"
                            className="cta cancel"
                            type="button"
                            onClick={handleCloseButton}
                        >
                            Cancel
                        </button>

                        <button
                            className="cta mr-20 ml-12"
                            type="button"
                            onClick={handleGetClustersClick}
                            disabled={!saveYamlData}
                            data-testId="get_cluster_button"
                        >
                            <div className="flex">
                                Get cluster
                                <ForwardArrow className="ml-5" />
                            </div>
                        </button>
                    </div>
                )}
                {confirmation && (
                    <DeleteComponent
                        setDeleting={setDeleting}
                        deleteComponent={deleteCluster}
                        payload={payload}
                        title={cluster_name}
                        toggleConfirmation={toggleConfirmation}
                        component={DeleteComponentsName.Cluster}
                        confirmationDialogDescription={DC_CLUSTER_CONFIRMATION_MESSAGE}
                        reload={reload}
                    />
                )}
            </div>
        </>
    )
}
