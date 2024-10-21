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

import { useState, useRef } from 'react'
import {
    showError,
    Progressing,
    CHECKBOX_VALUE,
    Checkbox,
    RadioGroupItem,
    RadioGroup,
    InfoColourBar,
    Toggle,
    GenericEmptyState,
    ResizableTextarea,
    useAsync,
    CustomInput,
    noop,
    DEFAULT_SECRET_PLACEHOLDER,
    GenericFilterEmptyState,
    CodeEditor,
    DeleteComponent,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import TippyHeadless from '@tippyjs/react/headless'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as ErrorIcon } from '../../assets/icons/ic-warning-y6.svg'
import { useForm, CustomPassword, importComponentFromFELibrary } from '../common'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { saveCluster, updateCluster, deleteCluster, validateCluster, saveClusters } from './cluster.service'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Warning } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as FormError } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as ForwardArrow } from '../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as MechanicalOperation } from '../../assets/img/ic-mechanical-operation.svg'
import {
    AuthenticationType,
    DataListType,
    UserDetails,
    SaveClusterPayloadType,
    DEFAULT_CLUSTER_ID,
    SSHAuthenticationType,
    RemoteConnectionTypeCluster,
} from './cluster.type'

import { CLUSTER_COMMAND, AppCreationType, MODES, ModuleNameMap } from '../../config'
import {
    DC_CLUSTER_CONFIRMATION_MESSAGE,
    DeleteComponentsName,
    EMPTY_STATE_STATUS,
} from '../../config/constantMessaging'
import { ReactComponent as ICHelpOutline } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as InfoIcon } from '../../assets/icons/info-filled.svg'
import ClusterInfoStepsModal from './ClusterInfoStepsModal'
import { UPLOAD_STATE } from '@Pages/GlobalConfigurations/DeploymentCharts/types'
import UserNameDropDownList from './UseNameListDropdown'
import { clusterId } from '../ClusterNodes/__mocks__/clusterAbout.mock'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { RemoteConnectionType } from '../dockerRegistry/dockerType'

const VirtualClusterSelectionTab = importComponentFromFELibrary('VirtualClusterSelectionTab')
const RemoteConnectionRadio = importComponentFromFELibrary('RemoteConnectionRadio')
const getRemoteConnectionConfig = importComponentFromFELibrary('getRemoteConnectionConfig', noop, 'function')

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
    proxyUrl,
    sshUsername,
    sshPassword,
    sshAuthKey,
    sshServerAddress,
    isConnectedViaProxy,
    isConnectedViaSSHTunnel,
    isTlsConnection,
    toggleCheckTlsConnection,
    setTlsConnectionFalse,
    toggleShowAddCluster,
    toggleKubeConfigFile,
    isKubeConfigFile,
    isClusterDetails,
    toggleClusterDetails,
    isVirtualCluster,
}) {
    const [prometheusToggleEnabled, setPrometheusToggleEnabled] = useState(!!prometheus_url)
    const [prometheusAuthenticationType, setPrometheusAuthenticationType] = useState({
        type: prometheusAuth?.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS,
    })
    const authenTicationType = prometheusAuth?.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS

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
    const [isVirtual, setIsVirtual] = useState(isVirtualCluster)
    const [isConnectedViaProxyTemp, setIsConnectedViaProxyTemp] = useState(isConnectedViaProxy)
    const [isConnectedViaSSHTunnelTemp, setIsConnectedViaSSHTunnelTemp] = useState(isConnectedViaSSHTunnel)

    const [, grafanaModuleStatus] = useAsync(
        () => getModuleInfo(ModuleNameMap.GRAFANA),
        [clusterId],
        !window._env_.K8S_CLIENT,
    )

    const _remoteConnectionMethod = isConnectedViaProxyTemp
        ? RemoteConnectionType.Proxy
        : isConnectedViaSSHTunnelTemp
          ? RemoteConnectionType.SSHTunnel
          : RemoteConnectionType.Direct
    const [remoteConnectionMethod, setRemoteConnectionMethod] = useState(_remoteConnectionMethod)
    const initialSSHAuthenticationType =
        sshPassword && sshAuthKey
            ? SSHAuthenticationType.Password_And_SSH_Private_Key
            : sshAuthKey
              ? SSHAuthenticationType.SSH_Private_Key
              : SSHAuthenticationType.Password
    const [SSHConnectionType, setSSHConnectionType] = useState(initialSSHAuthenticationType)

    const { state, handleOnChange, handleOnSubmit } = useForm(
        {
            cluster_name: { value: cluster_name, error: '' },
            url: { value: server_url, error: '' },
            userName: { value: prometheusAuth?.userName, error: '' },
            password: { value: prometheusAuth?.password, error: '' },
            prometheusTlsClientKey: { value: prometheusAuth?.tlsClientKey, error: '' },
            prometheusTlsClientCert: { value: prometheusAuth?.tlsClientCert, error: '' },
            proxyUrl: { value: proxyUrl, error: '' },
            sshUsername: { value: sshUsername, error: '' },
            sshPassword: { value: sshPassword, error: '' },
            sshAuthKey: { value: sshAuthKey, error: '' },
            sshServerAddress: { value: sshServerAddress, error: '' },
            tlsClientKey: { value: config?.tls_key, error: '' },
            tlsClientCert: { value: config?.cert_data, error: '' },
            certificateAuthorityData: { value: config?.cert_auth_data, error: '' },
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
                required: !!(prometheusToggleEnabled && prometheusAuthenticationType.type === AuthenticationType.BASIC),
                validator: { error: 'username is required', regex: /^(?!\s*$).+/ },
            },
            password: {
                required: !!(prometheusToggleEnabled && prometheusAuthenticationType.type === AuthenticationType.BASIC),
                validator: { error: 'password is required', regex: /^(?!\s*$).+/ },
            },
            prometheusTlsClientKey: {
                required: false,
            },
            prometheusTlsClientCert: {
                required: false,
            },
            proxyUrl: {
                required: RemoteConnectionRadio && proxyUrl,
                validator: {
                    error: 'Please provide a valid URL. URL must start with http:// or https://',
                    regex: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
                },
            },
            sshUsername: {
                required: RemoteConnectionRadio && remoteConnectionMethod === RemoteConnectionType.SSHTunnel,
                validator: {
                    error: 'Username or User Identifier is required. Username cannot contain spaces or special characters other than _ and -',
                    regex: /^[A-Za-z0-9_-]+$/,
                },
            },
            sshPassword: {
                required:
                    RemoteConnectionRadio &&
                    remoteConnectionMethod === RemoteConnectionType.SSHTunnel &&
                    (SSHConnectionType === SSHAuthenticationType.Password ||
                        SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key),
                validator: { error: 'password is required', regex: /^(?!\s*$).+/ },
            },
            sshAuthKey: {
                required:
                    RemoteConnectionRadio &&
                    remoteConnectionMethod === RemoteConnectionType.SSHTunnel &&
                    (SSHConnectionType === SSHAuthenticationType.SSH_Private_Key ||
                        SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key),
                validator: { error: 'private key is required', regex: /^(?!\s*$).+/ },
            },
            sshServerAddress: {
                required: RemoteConnectionRadio && remoteConnectionMethod === RemoteConnectionType.SSHTunnel,
                validator:
                    remoteConnectionMethod === RemoteConnectionType.SSHTunnel
                        ? {
                              error: 'Please provide a valid URL. URL must start with http:// or https://',
                              regex: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
                          }
                        : { error: '', regex: /^(?!\s*$).+/ },
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
                          validator: { error: 'token is required and cannot contain spaces', regex: /^(?!\s)[^\s]+(?!\s)$/}
                      },
            endpoint: {
                required: !!prometheusToggleEnabled,
                validator: { error: 'endpoint is required', regex: /^.*$/ },
            },
        },
        onValidation,
    )

    const isGrafanaModuleInstalled = grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED

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
                    prometheusAuth: {
                        userName: '',
                        password: '',
                        tlsClientKey: '',
                        tlsClientCert: '',
                    },
                    remoteConnectionConfig: _dataList.remoteConnectionConfig,
                    server_url: _dataList.server_url,
                }
                saveClusterPayload.push(_clusterDetails)
            }
        }

        return saveClusterPayload
    }

    async function saveClustersDetails() {
        try {
            const payload = getSaveClusterPayload(dataList)
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
                        status,
                        message,
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
            const obj = YAML.parse(saveYamlData)
            const jsonStr = JSON.stringify(obj)
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
            const payload = { config: YAMLtoJSON(saveYamlData) }
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
                            remoteConnectionConfig: _cluster['remoteConnectionConfig'],
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
            const error = err?.errors?.[0]
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
        else if (e.target.name === "token") {
            e.target.value = e.target.value.trim()
        }
    }

    const getClusterPayload = () => {
        return {
            id,
            insecureSkipTlsVerify: !isTlsConnection,
            cluster_name: state.cluster_name.value,
            config: {
                bearer_token:
                    state.token.value && state.token.value !== DEFAULT_SECRET_PLACEHOLDER ? state.token.value?.trim() : '',
                tls_key: state.tlsClientKey.value,
                cert_data: state.tlsClientCert.value,
                cert_auth_data: state.certificateAuthorityData.value,
            },
            active,
            remoteConnectionConfig: getRemoteConnectionConfig(state, remoteConnectionMethod, SSHConnectionType),
            prometheus_url: prometheusToggleEnabled ? state.endpoint.value : '',
            prometheusAuth: {
                userName:
                    prometheusToggleEnabled && state.authType.value === AuthenticationType.BASIC
                        ? state.userName.value
                        : '',
                password:
                    prometheusToggleEnabled && state.authType.value === AuthenticationType.BASIC
                        ? state.password.value
                        : '',
                tlsClientKey: prometheusToggleEnabled ? state.prometheusTlsClientKey.value : '',
                tlsClientCert: prometheusToggleEnabled ? state.prometheusTlsClientCert.value : '',
                isAnonymous: state.authType.value === AuthenticationType.ANONYMOUS,
            },
        }
    }

    async function onValidation() {
        const payload = getClusterPayload()
        const urlValue = state.url.value?.trim() ?? ''
        if (urlValue.endsWith('/')) {
            payload['server_url'] = urlValue.slice(0, -1)
        } else {
            payload['server_url'] = urlValue
        }
        if (remoteConnectionMethod === RemoteConnectionType.Proxy) {
            let proxyUrlValue = state.proxyUrl?.value?.trim() ?? ''
            if (proxyUrlValue.endsWith('/')) {
                proxyUrlValue = proxyUrlValue.slice(0, -1)
            }
            payload.remoteConnectionConfig.proxyConfig = {
                proxyUrl: proxyUrlValue,
            }
        }

        if (state.authType.value === AuthenticationType.BASIC && prometheusToggleEnabled) {
            const isValid = state.userName?.value && state.password?.value
            if (!isValid) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Please add both username and password',
                })
                return
            }
            payload.prometheusAuth['userName'] = state.userName.value || ''
            payload.prometheusAuth['password'] = state.password.value || ''
            payload.prometheusAuth['tlsClientKey'] = state.prometheusTlsClientKey.value || ''
            payload.prometheusAuth['tlsClientCert'] = state.prometheusTlsClientCert.value || ''
        }
        if (isTlsConnection) {
            if (state.tlsClientKey.value || state.tlsClientCert.value || state.certificateAuthorityData.value) {
                payload.config['tls_key'] = state.tlsClientKey.value || ''
                payload.config['cert_data'] = state.tlsClientCert.value || ''
                payload.config['cert_auth_data'] = state.certificateAuthorityData.value || ''
            }
        }

        const api = id ? updateCluster : saveCluster
        try {
            setLoadingState(true)
            await api(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: `Successfully ${id ? 'updated' : 'saved'}`,
            })
            toggleShowAddCluster()
            setRemoteConnectionFalse()
            setTlsConnectionFalse()
            reload()
            toggleEditMode((e) => !e)
        } catch (err) {
            showError(err)
        } finally {
            setLoadingState(false)
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

    const payload = {
        id,
        cluster_name,
        config: { bearer_token: state.token.value },
        active,
        prometheus_url: prometheusToggleEnabled ? state.endpoint.value : '',
        prometheusAuth: {
            userName: prometheusToggleEnabled ? state.userName.value : '',
            password: prometheusToggleEnabled ? state.password.value : '',
            tlsClientCert: prometheusToggleEnabled ? state.prometheusTlsClientKey.value : '',
            tlsClientKey: prometheusToggleEnabled ? state.prometheusTlsClientCert.value : '',
        },
        remoteConnectionConfig: getRemoteConnectionConfig(state, remoteConnectionMethod),
        server_url,
        defaultClusterComponent,
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
                            interactive
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
                    <ICHelpOutline className="icon-dim-16" />
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
            setRemoteConnectionFalse()
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
        setRemoteConnectionFalse()
        setTlsConnectionFalse()
        toggleShowAddCluster()

        setLoadingState(false)
        reload()
    }

    const changeRemoteConnectionType = (connectionType) => {
        setRemoteConnectionMethod(connectionType)
        if (connectionType === RemoteConnectionType.Proxy) {
            setIsConnectedViaProxyTemp(true)
            setIsConnectedViaSSHTunnelTemp(false)
        }
        if (connectionType === RemoteConnectionType.SSHTunnel) {
            setIsConnectedViaProxyTemp(false)
            setIsConnectedViaSSHTunnelTemp(true)
        }
    }

    const changeSSHAuthenticationType = (authType) => {
        setSSHConnectionType(authType)
    }

    const setRemoteConnectionFalse = () => {
        setIsConnectedViaProxyTemp(false)
        setIsConnectedViaSSHTunnelTemp(false)
    }

    const renderUrlAndBearerToken = () => {
        let proxyConfig
        let sshConfig
        if (remoteConnectionMethod === RemoteConnectionType.Proxy) {
            proxyConfig = {
                proxyUrl: { value: state.proxyUrl?.value, error: state.proxyUrl?.error },
            }
        }
        if (remoteConnectionMethod === RemoteConnectionType.SSHTunnel) {
            sshConfig = {
                sshUsername: { value: state.sshUsername?.value, error: state.sshUsername?.error },
                sshPassword:
                    SSHConnectionType === SSHAuthenticationType.Password ||
                    SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key
                        ? { value: state.sshPassword?.value, error: state.sshPassword?.error }
                        : { value: '', error: '' },
                sshAuthKey:
                    SSHConnectionType === SSHAuthenticationType.SSH_Private_Key ||
                    SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key
                        ? { value: state.sshAuthKey?.value, error: state.sshAuthKey?.error }
                        : { value: '', error: '' },
                sshServerAddress: { value: state.sshServerAddress?.value, error: state.sshServerAddress?.error },
            }
        }
        const passedRemoteConnectionMethod = { value: remoteConnectionMethod, error: '' }
        return (
            <>
                <div className="form__row">
                    <CustomInput
                        labelClassName="dc__required-field"
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
                    {id !== DEFAULT_CLUSTER_ID && (
                        <div className="bearer-token">
                            <ResizableTextarea
                                className="dc__resizable-textarea__with-max-height dc__required-field"
                                name="token"
                                value={
                                    id
                                        ? id !== 1
                                            ? DEFAULT_SECRET_PLACEHOLDER
                                            : config?.bearer_token
                                              ? config.bearer_token
                                              : ''
                                        : state.token.value
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
                {id !== DEFAULT_CLUSTER_ID && RemoteConnectionRadio && (
                    <>
                        <hr />
                        <div className="dc__position-rel dc__hover mb-20">
                            <span className="form__input-header pb-20">
                                How do you want Devtron to connect with this cluster?
                            </span>
                            <span className="pb-20">
                                <RemoteConnectionRadio
                                    resourceType={RemoteConnectionTypeCluster}
                                    connectionMethod={passedRemoteConnectionMethod}
                                    proxyConfig={proxyConfig}
                                    sshConfig={sshConfig}
                                    changeRemoteConnectionType={changeRemoteConnectionType}
                                    changeSSHAuthenticationType={changeSSHAuthenticationType}
                                    handleOnChange={handleOnChange}
                                />
                            </span>
                        </div>
                    </>
                )}
                {id !== DEFAULT_CLUSTER_ID && (
                    <>
                        <hr />
                        <div className="dc__position-rel flex left dc__hover mb-20">
                            <Checkbox
                                isChecked={isTlsConnection}
                                rootClassName="form__checkbox-label--ignore-cache mb-0"
                                value={CHECKBOX_VALUE.CHECKED}
                                onChange={toggleCheckTlsConnection}
                            >
                                <div data-testid="use_secure_tls_connection_checkbox" className="mr-4 flex center">
                                    Use secure TLS connection {isTlsConnection}
                                </div>
                            </Checkbox>
                        </div>
                        {!isTlsConnection && <hr />}
                        {isTlsConnection && (
                            <>
                                <div className="form__row ml-24">
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
                                        placeholder="Enter CA Data"
                                    />
                                    {state.certificateAuthorityData.error && (
                                        <label htmlFor="" className="form__error">
                                            <FormError className="form__icon form__icon--error" />
                                            {state.certificateAuthorityData.error}
                                        </label>
                                    )}
                                </div>
                                <div className="form__row ml-24">
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
                                        placeholder="Enter tls Key"
                                    />
                                    {state.tlsClientKey.error && (
                                        <label htmlFor="" className="form__error">
                                            <FormError className="form__icon form__icon--error" />
                                            {state.tlsClientKey.error}
                                        </label>
                                    )}
                                </div>
                                <div className="form__row ml-24">
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
                                        placeholder="Enter tls Certificate"
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
                {isGrafanaModuleInstalled && (
                    <div className={`${prometheusToggleEnabled ? 'mb-20' : prometheus_url ? 'mb-20' : 'mb-40'} mt-20`}>
                        <div className="dc__content-space flex">
                            <span className="form__input-header">See metrics for applications in this cluster</span>
                            <div className="w-32 h-20">
                                <Toggle selected={prometheusToggleEnabled} onSelect={setPrometheusToggle} />
                            </div>
                        </div>
                        <span className="cn-6 fs-12">
                            Configure prometheus to see metrics like CPU, RAM, Throughput etc. for applications running
                            in this cluster
                        </span>
                    </div>
                )}
                {isGrafanaModuleInstalled && !prometheusToggleEnabled && prometheus_url && <PrometheusWarningInfo />}
                {isGrafanaModuleInstalled && prometheusToggleEnabled && (
                    <div className="">
                        {(state.userName.error || state.password.error || state.endpoint.error) && (
                            <PrometheusRequiredFieldInfo />
                        )}
                        <div className="form__row">
                            <CustomInput
                                labelClassName="dc__required-field"
                                name="endpoint"
                                value={state.endpoint.value}
                                error={state.endpoint.error}
                                onChange={handleOnChange}
                                label="Prometheus endpoint"
                            />
                        </div>
                        <div className="form__row">
                            <span className="form__label dc__required-field">Authentication Type</span>
                            <RadioGroup
                                value={state.authType.value}
                                name="authType"
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
                        <div className="form__row">
                            <span className="form__label">TLS Key</span>
                            <ResizableTextarea
                                className="dc__resizable-textarea__with-max-height w-100"
                                name="prometheusTlsClientKey"
                                value={state.prometheusTlsClientKey.value}
                                onChange={handleOnChange}
                            />
                        </div>
                        <div className="form__row">
                            <span className="form__label">TLS Certificate</span>
                            <ResizableTextarea
                                className="dc__resizable-textarea__with-max-height w-100"
                                name="prometheusTlsClientCert"
                                value={state.prometheusTlsClientCert.value}
                                onChange={handleOnChange}
                            />
                        </div>
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
            <div className="code-editor-container">
                <CodeEditor
                    value={saveYamlData}
                    height="calc(100vh - 236px)"
                    diffView={false}
                    onChange={onChangeEditorValue}
                    mode={MODES.YAML}
                >
                    <CodeEditor.Header>
                        <div className="user-list__subtitle flex fs-13 lh-20 w-100">
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
        )
    }

    const LoadingCluster = (): JSX.Element => {
        return (
            <div className="cluster-form dc__position-rel h-100 bcn-0">
                <div className="flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Add Cluster</h2>
                    <button type="button" className="dc__transparent flex icon-dim-24 " onClick={handleCloseButton}>
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="dc__position-rel" style={{ height: 'calc(100vh - 110px)' }}>
                    <GenericEmptyState
                        SvgImage={MechanicalOperation}
                        title={EMPTY_STATE_STATUS.LOADING_CLUSTER.TITLE}
                        subTitle={EMPTY_STATE_STATUS.LOADING_CLUSTER.SUBTITLE}
                    />
                </div>
                <div className="w-100 dc__border-top flex right pb-12 pt-12 pr-20 pl-20 dc__position-fixed dc__position-abs ">
                    <button className="cta cancel h-36 lh-36" type="button" onClick={handleCloseButton} disabled>
                        Cancel
                    </button>
                    <button className="cta ml-12 h-36 lh-36" disabled>
                        <Progressing />
                    </button>
                </div>
            </div>
        )
    }

    const NoMatchingResults = (): JSX.Element => {
        return <GenericFilterEmptyState />
    }

    if (loader) {
        return <LoadingCluster />
    }

    const saveClusterDetails = (): JSX.Element => {
        return (
            <div className="cluster-form dc__position-rel h-100 bcn-0">
                <AddClusterHeader />
                <div className="api-token__list en-2 bw-0 bcn-0 br-8">
                    <div
                        data-testid="cluster_list_page_after_selection"
                        className="saved-cluster-list-row cluster-env-list_table fs-12 pt-6 pb-6 fw-6 flex left lh-20 pl-20 pr-20  dc__border-bottom-n1"
                    >
                        <div />
                        <div data-testid="cluster_validate">CLUSTER</div>
                        <div data-testid="status_validate">STATUS</div>
                        <div data-testid="message_validate">MESSAGE</div>
                        <div />
                    </div>
                    <div className="dc__overflow-scroll" style={{ height: 'calc(100vh - 161px)' }}>
                        {!saveClusterList || saveClusterList.length === 0 ? (
                            <NoMatchingResults />
                        ) : (
                            saveClusterList.map((clusterListDetail, index) => (
                                <div
                                    key={`api_${index}`}
                                    className="saved-cluster-list-row cluster-env-list_table flex-align-center fw-4 cn-9 fs-13 pr-16 pl-16 pt-6 pb-6"
                                >
                                    <div />
                                    <div
                                        data-testid={`validate-cluster-${clusterListDetail.clusterName}`}
                                        className="flexbox dc__align-items-center ml-2"
                                    >
                                        <span className="dc__ellipsis-right">{clusterListDetail.clusterName}</span>
                                    </div>
                                    <div className="flexbox dc__align-items-center">
                                        <div
                                            data-testid="status_icon_visibility"
                                            className={`dc__app-summary__icon icon-dim-16 mr-2 ${
                                                clusterListDetail.status === 'Failed' ? 'failed' : 'succeeded'
                                            }`}
                                        />
                                        <div
                                            data-testid={`validate-cluster-${clusterListDetail.status}`}
                                            className="dc__ellipsis-right"
                                        >
                                            {clusterListDetail.status}{' '}
                                        </div>
                                    </div>
                                    <div className="dc__ellipsis-right"> {clusterListDetail.message}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="w-100 dc__border-top flex right pb-12 pt-12 pr-20 pl-20 dc__position-fixed dc__position-abs dc__bottom-0">
                    <button
                        className="dc__edit_button cb-5 h-36 lh-36"
                        type="button"
                        onClick={handleEditConfigClick}
                        style={{ marginRight: 'auto' }}
                    >
                        <span className="flex dc__align-items-center">
                            <Edit className="icon-dim-16 scb-5 mr-4" />
                            Edit Kubeconfig
                        </span>
                    </button>
                    <button
                        data-testid="close_after_cluster_list_display"
                        className="cta  h-36 lh-36"
                        type="button"
                        onClick={handleCloseButton}
                        style={{ marginLeft: 'auto' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        )
    }

    const handleClusterDetailCall = async () => {
        setLoadingState(true)
        await saveClustersDetails()
        toggleKubeConfigFile(false)
        toggleClusterDetails(true)
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
        }
        if (Object.values(isClusterSelected).some((_selected) => _selected)) {
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

    if (loader) {
        return <LoadingCluster />
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
                        <div className="dc__overflow-scroll" style={{ height: 'calc(100vh - 110px)' }}>
                            <div className="api-token__list en-2 bw-1 bcn-0 br-4 mr-20 ml-20 mt-16">
                                <InfoColourBar
                                    message={
                                        <>
                                            <span className="fw-6">{validCluster()} valid cluster(s). </span>
                                            <span>Select the cluster you want to add/update</span>
                                        </>
                                    }
                                    classname="info_bar cn-9 lh-20 dc__no-border-imp pl-16"
                                    Icon={InfoIcon}
                                    styles={{ borderRadius: '3px 3px 0 0' }}
                                />
                                <div className="cluster-list-row-1 cluster-env-list_table fs-12 pt-6 pb-6 fw-6 flex left lh-20 pl-16 pr-16 dc__border-top dc__border-bottom">
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
                                    <div />
                                </div>
                                <div style={{ height: 'auto' }}>
                                    {!dataList || dataList.length === 0 ? (
                                        <NoMatchingResults />
                                    ) : (
                                        dataList.map((clusterDetail, index) => (
                                            <div
                                                key={`api_${index}`}
                                                className="cluster-list-row-1 flex-align-center fw-4 cn-9 fs-13 pr-16 pl-16 pt-6 pb-6"
                                                style={{
                                                    height: 'auto',
                                                    alignItems: 'start',
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
                                                    onClick={() => {
                                                        if (
                                                            selectedUserNameOptions[clusterDetail.cluster_name]
                                                                .errorInConnecting !== 'cluster-already-exists' &&
                                                            selectedUserNameOptions[clusterDetail.cluster_name]
                                                                .errorInConnecting.length > 0
                                                        ) {
                                                            return
                                                        }
                                                        toggleIsSelected(clusterDetail.cluster_name)
                                                    }}
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
                                                        <div
                                                            className="flex left top"
                                                            style={{
                                                                columnGap: '6px',
                                                            }}
                                                        >
                                                            <ErrorIcon className="dc__app-summary__icon icon-dim-16 m-2" />
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
                                                            <div
                                                                className="flex left top"
                                                                style={{
                                                                    columnGap: '6px',
                                                                }}
                                                            >
                                                                <div
                                                                    className={`dc__app-summary__icon icon-dim-16 m-2 ${
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
                            className="dc__edit_button cb-5"
                            type="button"
                            onClick={handleEditConfigClick}
                            style={{ marginRight: 'auto' }}
                        >
                            <span
                                data-testid="edit_kubeconfig_button_cluster_checkbox"
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Edit className="icon-dim-16 scb-5 mr-4 h-36 lh-36" />
                                Edit Kubeconfig
                            </span>
                        </button>
                        <button
                            data-testid="save_cluster_list_button_after_selection"
                            className="cta h-36 lh-36"
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
        }
        return 'Edit Cluster'
    }

    const AddClusterHeader = () => {
        return (
            <div className="flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 pl-20 pr-20">
                <h2 data-testid="add_cluster_header" className="fs-16 fw-6 lh-1-43 m-0 title-padding">
                    <span className="fw-6 fs-16 cn-9">{clusterTitle()}</span>
                </h2>
                <button
                    data-testid="header_close_icon"
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    onClick={handleCloseButton}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const handleVirtualCloseButton = (e) => {
        toggleEditMode(e)
        setLoadingState(false)
        reload()
        toggleShowAddCluster()
    }

    return getClusterVar ? (
        displayClusterDetails()
    ) : (
        <div className="cluster-form dc__position-rel h-100 bcn-0" style={{ padding: 'auto 0' }}>
            <AddClusterHeader />
            <div style={{ overflow: 'auto', height: 'calc(100vh - 110px)' }}>
                {VirtualClusterSelectionTab && (
                    <VirtualClusterSelectionTab
                        id={id}
                        clusterName={cluster_name}
                        isVirtual={isVirtual}
                        setIsVirtual={setIsVirtual}
                        reload={reload}
                        toggleEditMode={handleVirtualCloseButton}
                    />
                )}
                {!isVirtual && (
                    <>
                        <div className="p-20">
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
                            <div className="w-100 dc__border-top flex right pb-12 pt-12 pr-20 pl-20 dc__position-fixed dc__position-abs dc__bottom-0">
                                {id && (
                                    <button
                                        data-testid="delete_cluster"
                                        style={{ margin: 'auto', marginLeft: 20 }}
                                        className="flex cta delete scr-5 h-36 lh-36"
                                        type="button"
                                        onClick={() => toggleConfirmation(true)}
                                        disabled={isDefaultCluster()}
                                    >
                                        {deleting ? <Progressing /> : 'Delete'}
                                    </button>
                                )}
                                <button
                                    data-testid="cancel_button"
                                    className="cta cancel h-36 lh-36"
                                    type="button"
                                    onClick={handleCloseButton}
                                >
                                    Cancel
                                </button>
                                <button
                                    data-testid="save_cluster_after_entering_cluster_details"
                                    className="cta ml-12 h-36 lh-36"
                                    onClick={handleOnSubmit}
                                >
                                    {id ? 'Update cluster' : 'Save cluster'}
                                </button>
                            </div>
                        )}
                        {isKubeConfigFile && (
                            <div className="w-100 dc__border-top flex right pb-12 pt-12 pr-20 pl-20 dc__position-fixed dc__position-abs dc__bottom-0">
                                <button
                                    data-testid="cancel_kubeconfig_button"
                                    className="cta cancel h-36 lh-36"
                                    type="button"
                                    onClick={handleCloseButton}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="cta ml-12 h-36 lh-36"
                                    type="button"
                                    onClick={handleGetClustersClick}
                                    disabled={!saveYamlData}
                                    data-testId="get_cluster_button"
                                >
                                    <div className="flex">
                                        Get cluster
                                        <ForwardArrow className={`ml-5 ${!saveYamlData ? 'scn-4' : ''}`} />
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
                    </>
                )}
            </div>
        </div>
    )
}
