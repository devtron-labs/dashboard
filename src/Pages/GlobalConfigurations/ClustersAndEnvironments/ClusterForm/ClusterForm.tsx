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

import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import {
    AuthenticationType,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ClusterCostModuleConfigPayload,
    ClusterDetailListType,
    DEFAULT_SECRET_PLACEHOLDER,
    Icon,
    ModalSidebarPanel,
    ModuleNameMap,
    ModuleStatus,
    noop,
    RemoteConnectionType,
    SelectPickerOptionType,
    showError,
    ToastManager,
    ToastVariantType,
    Tooltip,
    URLS,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { getModuleInfo } from '@Components/v2/devtronStackManager/DevtronStackManager.service'

import { importComponentFromFELibrary, useForm } from '../../../../components/common'
import { saveCluster, updateCluster } from '../cluster.service'
import { ClusterFormProps, SSHAuthenticationType } from '../cluster.type'
import { getServerURLFromLocalStorage } from '../cluster.util'
import { ADD_CLUSTER_FORM_LOCAL_STORAGE_KEY } from '../constants'
import { CREATE_CLUSTER_TITLE } from '../CreateCluster/constants'
import { CreateClusterTypeEnum } from '../CreateCluster/types'
import DeleteClusterConfirmationModal from '../DeleteClusterConfirmationModal'
import ApplicationMonitoring from './ApplicationMonitoring'
import ClusterConfigurations from './ClusterConfigurations'
import { ClusterFormNavButton } from './ClusterForm.components'
import { ClusterConfigTabEnum } from './types'

import '../cluster.scss'

const RemoteConnectionRadio = importComponentFromFELibrary('RemoteConnectionRadio', null, 'function')
const getRemoteConnectionConfig = importComponentFromFELibrary('getRemoteConnectionConfig', noop, 'function')
const getCategoryPayload = importComponentFromFELibrary('getCategoryPayload', null, 'function')
const ClusterCostConfig = importComponentFromFELibrary('ClusterCostConfig', null, 'function')

const ClusterForm = ({
    id = null,
    clusterName,
    serverUrl,
    reload = noop,
    prometheusUrl = '',
    prometheusAuth,
    proxyUrl = '',
    sshUsername = '',
    sshPassword = '',
    sshAuthKey = '',
    sshServerAddress = '',
    isConnectedViaSSHTunnel = false,
    handleCloseCreateClusterForm = noop,
    isProd = false,
    handleModalClose,
    isTlsConnection: initialIsTlsConnection = false,
    installationId,
    category,
    clusterProvider,
    costModuleConfig,
}: ClusterFormProps) => {
    const location = useLocation()

    const [clusterConfigTab, setClusterConfigTab] = useState<ClusterConfigTabEnum>(
        id && location.pathname.includes(URLS.COST_VISIBILITY)
            ? ClusterConfigTabEnum.COST_VISIBILITY
            : ClusterConfigTabEnum.CLUSTER_CONFIG,
    )

    const [costModuleState, setCostModuleState] = useState<
        Pick<ClusterDetailListType['costModuleConfig'], 'enabled'> & { config: string }
    >({
        enabled: costModuleConfig?.enabled || false,
        config: costModuleConfig?.config ? JSON.stringify(costModuleConfig.config) : '',
    })
    const [costModuleConfigErrorState, setCostModuleErrorState] = useState<string>('')

    const [prometheusToggleEnabled, setPrometheusToggleEnabled] = useState(!!prometheusUrl)
    const [prometheusAuthenticationType, setPrometheusAuthenticationType] = useState({
        type: prometheusAuth?.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS,
    })
    const [isTlsConnection, setIsTlsConnection] = useState(initialIsTlsConnection)
    const [selectedCategory, setSelectedCategory] = useState<SelectPickerOptionType>(category)
    const [confirmation, setConfirmation] = useState(false)
    const [loader, setLoadingState] = useState<boolean>(false)
    const [isConnectedViaProxyTemp, setIsConnectedViaProxyTemp] = useState(!!proxyUrl)
    const [isConnectedViaSSHTunnelTemp, setIsConnectedViaSSHTunnelTemp] = useState(isConnectedViaSSHTunnel)

    const getRemoteConnectionConfigType = () => {
        if (isConnectedViaProxyTemp) {
            return RemoteConnectionType.Proxy
        }

        if (isConnectedViaSSHTunnelTemp) {
            return RemoteConnectionType.SSHTunnel
        }

        return RemoteConnectionType.Direct
    }

    const resolveSSHAuthType = () => {
        if (sshPassword && sshAuthKey) {
            return SSHAuthenticationType.Password_And_SSH_Private_Key
        }

        if (sshAuthKey) {
            return SSHAuthenticationType.SSH_Private_Key
        }

        return SSHAuthenticationType.Password
    }

    const [remoteConnectionMethod, setRemoteConnectionMethod] = useState(getRemoteConnectionConfigType)
    const [SSHConnectionType, setSSHConnectionType] = useState(resolveSSHAuthType)

    const authenTicationType = prometheusAuth?.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS

    const [, grafanaModuleStatus] = useAsync(() => getModuleInfo(ModuleNameMap.GRAFANA), [id], !window._env_.K8S_CLIENT)

    const isDefaultCluster = id === 1
    const isGrafanaModuleInstalled = grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED

    useEffect(
        () => () => {
            if (localStorage.getItem(ADD_CLUSTER_FORM_LOCAL_STORAGE_KEY)) {
                localStorage.removeItem(ADD_CLUSTER_FORM_LOCAL_STORAGE_KEY)
            }
        },
        [],
    )

    const toggleCheckTlsConnection = () => {
        setIsTlsConnection((prev) => !prev)
    }

    const setTlsConnectionFalse = () => {
        setIsTlsConnection(false)
    }

    const handleOnFocus = (e): void => {
        if (e.target.value === DEFAULT_SECRET_PLACEHOLDER) {
            e.target.value = ''
        }
    }

    const handleOnBlur = (e): void => {
        if (id && !isDefaultCluster && !e.target.value) {
            e.target.value = DEFAULT_SECRET_PLACEHOLDER
        }
    }

    const setRemoteConnectionFalse = () => {
        setIsConnectedViaProxyTemp(false)
        setIsConnectedViaSSHTunnelTemp(false)
    }

    const validateCostModuleConfig = (requiredConfig: string = costModuleState.config): string => {
        try {
            if (requiredConfig) {
                JSON.parse(requiredConfig)
            }

            return ''
        } catch (e) {
            return e.message || 'Invalid JSON'
        }
    }

    const getParsedConfigValue = (): ClusterCostModuleConfigPayload['config'] => {
        if (costModuleState.config) {
            try {
                const parsedConfig = JSON.parse(costModuleState.config)
                return parsedConfig
            } catch {
                return {}
            }
        }
        return null
    }

    const getCostModulePayload = (): ClusterCostModuleConfigPayload | null => {
        if (!costModuleState.enabled) {
            return {
                enabled: false,
            }
        }

        if (costModuleState.config) {
            return {
                enabled: true,
                config: getParsedConfigValue(),
            }
        }

        return {
            enabled: true,
        }
    }

    const getClusterPayload = (state) => ({
        id,
        insecureSkipTlsVerify: !isTlsConnection,
        cluster_name: state.cluster_name.value,
        config: {
            bearer_token:
                state.token.value && state.token.value !== DEFAULT_SECRET_PLACEHOLDER ? state.token.value.trim() : '',
            tls_key: state.tlsClientKey.value,
            cert_data: state.tlsClientCert.value,
            cert_auth_data: state.certificateAuthorityData.value,
        },
        isProd: state.isProd.value === 'true',
        active: true,
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
        server_url: '',
        ...(getCategoryPayload ? getCategoryPayload(selectedCategory) : null),
        ...(clusterProvider ? { costModuleConfig: getCostModulePayload() } : null),
    })

    const onValidation = async (state) => {
        const payload = getClusterPayload(state)
        const urlValue = state.url.value?.trim() ?? ''
        if (urlValue.endsWith('/')) {
            payload.server_url = urlValue.slice(0, -1)
        } else {
            payload.server_url = urlValue
        }

        if (costModuleState.enabled) {
            const costConfigError = validateCostModuleConfig()
            if (costConfigError) {
                setCostModuleErrorState(costConfigError)
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Invalid cost visibility configuration',
                })
                return
            }
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
            payload.prometheusAuth.userName = state.userName.value || ''
            payload.prometheusAuth.password = state.password.value || ''
            payload.prometheusAuth.tlsClientKey = state.prometheusTlsClientKey.value || ''
            payload.prometheusAuth.tlsClientCert = state.prometheusTlsClientCert.value || ''
        }
        if (isTlsConnection) {
            if (state.tlsClientKey.value || state.tlsClientCert.value || state.certificateAuthorityData.value) {
                payload.config.tls_key = state.tlsClientKey.value || ''
                payload.config.cert_data = state.tlsClientCert.value || ''
                payload.config.cert_auth_data = state.certificateAuthorityData.value || ''
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
            handleCloseCreateClusterForm()
            setRemoteConnectionFalse()
            setTlsConnectionFalse()
            reload()
            handleModalClose()
        } catch (err) {
            showError(err)
        } finally {
            setLoadingState(false)
        }
    }

    const { state, handleOnChange, handleOnSubmit } = useForm(
        {
            cluster_name: { value: clusterName, error: '' },
            url: { value: !id ? getServerURLFromLocalStorage(serverUrl) : serverUrl, error: '' },
            userName: { value: prometheusAuth?.userName, error: '' },
            password: { value: prometheusAuth?.password, error: '' },
            prometheusTlsClientKey: { value: prometheusAuth?.tlsClientKey, error: '' },
            prometheusTlsClientCert: { value: prometheusAuth?.tlsClientCert, error: '' },
            proxyUrl: { value: proxyUrl, error: '' },
            sshUsername: { value: sshUsername, error: '' },
            sshPassword: { value: sshPassword, error: '' },
            sshAuthKey: { value: sshAuthKey, error: '' },
            sshServerAddress: { value: sshServerAddress, error: '' },
            tlsClientKey: { value: undefined, error: '' },
            tlsClientCert: { value: undefined, error: '' },
            certificateAuthorityData: { value: undefined, error: '' },
            token: { value: '', error: '' },
            endpoint: { value: prometheusUrl || '', error: '' },
            authType: { value: authenTicationType, error: '' },
            isProd: { value: isProd.toString(), error: '' },
        },
        {
            cluster_name: {
                required: true,
                validators: [
                    { error: 'Name is required', regex: /^.*$/ },
                    { error: "Use only lowercase alphanumeric characters, '-', '_' or '.'", regex: /^[a-z0-9-._]+$/ },
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
                required: RemoteConnectionRadio && remoteConnectionMethod === RemoteConnectionType.Proxy,
                validator: {
                    error: 'Please provide a valid URL. URL must start with http:// or https://',
                    regex: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/,
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
                              regex: /^(http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/,
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
                isDefaultCluster || id
                    ? {}
                    : {
                          required: true,
                          validator: { error: 'token is required', regex: /[^]+/ },
                      },
            endpoint: {
                required: !!prometheusToggleEnabled,
                validator: { error: 'endpoint is required', regex: /^.*$/ },
            },
        },
        onValidation,
    )

    const setPrometheusToggle = () => {
        setPrometheusToggleEnabled(!prometheusToggleEnabled)
    }

    const onPrometheusAuthTypeChange = (e) => {
        handleOnChange(e)
        if (state.authType.value === AuthenticationType.BASIC) {
            setPrometheusAuthenticationType({ type: AuthenticationType.ANONYMOUS })
        } else {
            setPrometheusAuthenticationType({ type: AuthenticationType.BASIC })
        }
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

    const showConfirmationModal = () => setConfirmation(true)
    const hideConfirmationModal = () => setConfirmation(false)

    const getTabSwitchHandler = (tab: ClusterConfigTabEnum) => () => {
        setClusterConfigTab(tab)
    }

    const toggleCostModule = () => {
        setCostModuleState((prev) => ({
            ...prev,
            enabled: !prev.enabled,
        }))
    }

    const handleCostConfigChange = (newConfig: string) => {
        setCostModuleState((prev) => ({
            ...prev,
            config: newConfig,
        }))

        const error = validateCostModuleConfig(newConfig)
        setCostModuleErrorState(error)
    }

    const renderFooter = () => (
        <div className={`border__primary--top flexbox py-12 px-20 ${id ? 'dc__content-space' : 'dc__content-end'}`}>
            {id && (
                <Button
                    text="Delete"
                    variant={ButtonVariantType.secondary}
                    style={ButtonStyleType.negative}
                    startIcon={<Icon name="ic-delete" color={null} />}
                    disabled={isDefaultCluster || loader}
                    dataTestId="delete_cluster"
                    onClick={showConfirmationModal}
                />
            )}
            <div className="flex dc__gap-12">
                <Button
                    text="Cancel"
                    variant={ButtonVariantType.secondary}
                    style={ButtonStyleType.neutral}
                    disabled={loader}
                    dataTestId="cancel-create-cluster-button"
                    onClick={handleModalClose}
                />
                <Button
                    dataTestId="save_cluster_after_entering_cluster_details"
                    onClick={handleOnSubmit}
                    text={id ? 'Update cluster' : 'Save Cluster'}
                    isLoading={loader}
                />
            </div>
        </div>
    )

    const renderFormBody = () => {
        const prometheusConfig = {
            endpoint: state.endpoint,
            authType: state.authType,
            userName: state.userName,
            password: state.password,
            prometheusTlsClientKey: state.prometheusTlsClientKey,
            prometheusTlsClientCert: state.prometheusTlsClientCert,
        }

        switch (clusterConfigTab) {
            case 'cluster-config':
                return (
                    <div className="flexbox flex-grow-1 bg__secondary dc__overflow-auto">
                        <ClusterConfigurations
                            id={id}
                            state={state}
                            isTlsConnection={isTlsConnection}
                            handleOnBlur={handleOnBlur}
                            handleOnFocus={handleOnFocus}
                            handleOnChange={handleOnChange}
                            remoteConnectionMethod={remoteConnectionMethod}
                            toggleCheckTlsConnection={toggleCheckTlsConnection}
                            changeRemoteConnectionType={changeRemoteConnectionType}
                            changeSSHAuthenticationType={changeSSHAuthenticationType}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            SSHConnectionType={SSHConnectionType}
                            initialIsTlsConnection={initialIsTlsConnection}
                        />
                    </div>
                )
            case 'application-monitoring':
                return (
                    <div className="flexbox flex-grow-1 bg__secondary dc__overflow-auto">
                        <ApplicationMonitoring
                            prometheusConfig={prometheusConfig}
                            prometheusUrl={prometheusUrl}
                            prometheusToggleEnabled={prometheusToggleEnabled}
                            setPrometheusToggle={setPrometheusToggle}
                            handleOnChange={handleOnChange}
                            onPrometheusAuthTypeChange={onPrometheusAuthTypeChange}
                            isGrafanaModuleInstalled={isGrafanaModuleInstalled}
                        />
                    </div>
                )
            case 'cost-visibility':
                return ClusterCostConfig ? (
                    <div className="flexbox flex-grow-1 bg__secondary dc__overflow-auto">
                        <ClusterCostConfig
                            prometheusConfig={prometheusConfig}
                            handleOnChange={handleOnChange}
                            onPrometheusAuthTypeChange={onPrometheusAuthTypeChange}
                            isGrafanaModuleInstalled={isGrafanaModuleInstalled}
                            costModuleEnabled={costModuleState.enabled}
                            toggleCostModule={toggleCostModule}
                            installationStatus={costModuleConfig.installationStatus}
                            clusterProvider={clusterProvider}
                            handleCostConfigChange={handleCostConfigChange}
                            config={costModuleState.config || ''}
                            configError={costModuleConfigErrorState}
                        />
                    </div>
                ) : null
            default:
                return null
        }
    }

    const getCostNavSubtitle = () => {
        if (!costModuleState.enabled) {
            return 'Off'
        }

        if (costModuleConfig.installationStatus === 'Installing') {
            return <span className="cy-7 fs-12">Installing...</span>
        }

        if (costModuleConfig.installationStatus === 'Upgrading') {
            return <span className="cy-7 fs-12">Upgrading...</span>
        }

        if (costModuleConfig.installationStatus === 'Failed') {
            return (
                <div className="flexbox dc__gap-4 dc__align-items-center">
                    <Icon name="ic-error" size={14} color="R500" />
                    <Tooltip content={costModuleConfig.installationError}>
                        <span className="dc__truncate cr-5 fs-12">
                            Installation Error: {costModuleConfig.installationError}
                        </span>
                    </Tooltip>
                </div>
            )
        }

        return 'Enabled'
    }

    return (
        <>
            <div className="flexbox mh-0 flex-grow-1 dc__overflow-hidden">
                <ModalSidebarPanel
                    icon={<Icon name="ic-kubernetes" size={48} color={null} />}
                    heading={
                        id && clusterName ? clusterName : CREATE_CLUSTER_TITLE[CreateClusterTypeEnum.CREATE_CLUSTER]
                    }
                    documentationLink="GLOBAL_CONFIG_CLUSTER"
                    rootClassName="p-20 dc__no-shrink dc__no-background-imp"
                >
                    <div className="flexbox-col dc__gap-8">
                        <ClusterFormNavButton
                            isActive={clusterConfigTab === ClusterConfigTabEnum.CLUSTER_CONFIG}
                            title="Cluster Configurations"
                            onClick={getTabSwitchHandler(ClusterConfigTabEnum.CLUSTER_CONFIG)}
                        />
                        <div className="divider__secondary--horizontal" />
                        <div className="flexbox-col">
                            <div className="px-8 py-4 fs-12 fw-6 lh-20 cn-7">INTEGRATIONS</div>
                            <ClusterFormNavButton
                                isActive={clusterConfigTab === ClusterConfigTabEnum.APPLICATION_MONITORING}
                                title="Application Monitoring"
                                subtitle={prometheusToggleEnabled ? 'Enabled' : 'Off'}
                                onClick={getTabSwitchHandler(ClusterConfigTabEnum.APPLICATION_MONITORING)}
                            />
                            {ClusterCostConfig && id && (
                                <ClusterFormNavButton
                                    isActive={clusterConfigTab === ClusterConfigTabEnum.COST_VISIBILITY}
                                    title="Cost Visibility"
                                    subtitle={getCostNavSubtitle()}
                                    onClick={getTabSwitchHandler(ClusterConfigTabEnum.COST_VISIBILITY)}
                                />
                            )}
                        </div>
                    </div>
                </ModalSidebarPanel>
                {renderFormBody()}
            </div>
            {renderFooter()}
            {confirmation && (
                <DeleteClusterConfirmationModal
                    clusterId={String(id)}
                    clusterName={clusterName}
                    handleClose={hideConfirmationModal}
                    handleSuccess={handleModalClose}
                    reload={reload}
                    installationId={String(installationId)}
                />
            )}
        </>
    )
}

export default ClusterForm
