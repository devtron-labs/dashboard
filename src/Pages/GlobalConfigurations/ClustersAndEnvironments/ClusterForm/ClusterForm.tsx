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

import { SyntheticEvent, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import {
    AuthenticationType,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ClusterCostModuleConfigPayload,
    DEFAULT_SECRET_PLACEHOLDER,
    handleAnalyticsEvent,
    Icon,
    ModalSidebarPanel,
    ModuleNameMap,
    ModuleStatus,
    noop,
    RemoteConnectionType,
    SCHEMA_07_VALIDATOR,
    SelectPickerOptionType,
    showError,
    ToastManager,
    ToastVariantType,
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
import { CLUSTER_CONFIG_TAB_TO_ERROR_KEY_MAP } from './constants'
import { ClusterConfigTabEnum, CostModuleStateType } from './types'
import { getClusterFormValidationSchema } from './utils'

import '../cluster.scss'

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
    costModuleSchema,
}: ClusterFormProps) => {
    const location = useLocation()

    const [clusterConfigTab, setClusterConfigTab] = useState<ClusterConfigTabEnum>(
        id && location.pathname.includes(URLS.COST_VISIBILITY)
            ? ClusterConfigTabEnum.COST_VISIBILITY
            : ClusterConfigTabEnum.CLUSTER_CONFIG,
    )

    const [costModuleState, setCostModuleState] = useState<CostModuleStateType>({
        enabled: costModuleConfig?.enabled || false,
        config: {
            ...costModuleConfig?.config,
            detectedProvider:
                (clusterProvider === 'Unknown' ? costModuleConfig?.config?.detectedProvider : clusterProvider) ||
                'Unknown',
        },
    })

    const validateCostModuleConfig = (targetState = costModuleState): boolean => {
        if (!costModuleSchema || !targetState.enabled) {
            return true
        }

        try {
            const validationResult = SCHEMA_07_VALIDATOR.validateFormData({ ...targetState.config }, costModuleSchema)
            return !validationResult?.errors?.length
        } catch {
            return true
        }
    }

    const [costModuleError, setCostModuleError] = useState<boolean>(!validateCostModuleConfig())

    const [isAppMetricsEnabled, setIsAppMetricsEnabled] = useState(!!prometheusUrl)
    const [isTlsConnection, setIsTlsConnection] = useState(initialIsTlsConnection)
    const [selectedCategory, setSelectedCategory] = useState<SelectPickerOptionType>(category)
    const [confirmation, setConfirmation] = useState(false)
    const [isUpdating, setIsUpdating] = useState<boolean>(false)
    const [isConnectedViaProxyTemp, setIsConnectedViaProxyTemp] = useState(!!proxyUrl)
    const [isConnectedViaSSHTunnelTemp, setIsConnectedViaSSHTunnelTemp] = useState(isConnectedViaSSHTunnel)

    const isPrometheusEnabled = costModuleState.enabled || isAppMetricsEnabled

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

    const getCostModulePayload = (): ClusterCostModuleConfigPayload | null => {
        if (!costModuleState.enabled) {
            return {
                enabled: false,
            }
        }

        if (costModuleState.config) {
            // Need to remove following keys from config if present: openCostServiceName, openCostServicePort, releaseName, namespace
            const sanitizedConfig = { ...costModuleState.config }
            delete sanitizedConfig.openCostServiceName
            delete sanitizedConfig.openCostServicePort
            delete sanitizedConfig.releaseName
            delete sanitizedConfig.namespace

            return {
                enabled: true,
                config: sanitizedConfig,
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
        prometheus_url: isPrometheusEnabled ? state.endpoint.value : '',
        prometheusAuth: {
            userName:
                isPrometheusEnabled && state.authType.value === AuthenticationType.BASIC ? state.userName.value : '',
            password:
                isPrometheusEnabled && state.authType.value === AuthenticationType.BASIC ? state.password.value : '',
            tlsClientKey: isPrometheusEnabled ? state.prometheusTlsClientKey.value : '',
            tlsClientCert: isPrometheusEnabled ? state.prometheusTlsClientCert.value : '',
            isAnonymous: state.authType.value === AuthenticationType.ANONYMOUS,
        },
        server_url: '',
        ...(getCategoryPayload ? getCategoryPayload(selectedCategory) : null),
        ...(costModuleSchema ? { costModuleConfig: getCostModulePayload() } : null),
    })

    // Could have returned validateCostModuleConfig but not doing intentionally since if we add other methods in future
    // we can just add them here
    const additionalValidations = (): boolean => {
        let hasError = false

        if (!validateCostModuleConfig()) {
            hasError = true
        }

        return hasError
    }

    const onValidation = async (state) => {
        const payload = getClusterPayload(state)
        const urlValue = state.url.value?.trim() ?? ''
        if (urlValue.endsWith('/')) {
            payload.server_url = urlValue.slice(0, -1)
        } else {
            payload.server_url = urlValue
        }

        const hasAdditionalError = additionalValidations()

        if (hasAdditionalError) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Some fields are invalid. Please correct them and try again.',
            })

            return
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

        // Not adding this block in additionalValidations since there seems to be no state its error
        // They are both required in useForm so don't know why we have checked it here
        if (state.authType.value === AuthenticationType.BASIC && isPrometheusEnabled) {
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
            setIsUpdating(true)
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
            setIsUpdating(false)
        }
    }

    const { state, handleOnChange, handleOnSubmit, validateAllAndSetErrors } = useForm(
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
        getClusterFormValidationSchema({
            isPrometheusEnabled,
            id,
            isDefaultCluster,
            isTlsConnection,
            remoteConnectionMethod,
            SSHConnectionType,
        }),
        onValidation,
        'Please resolve the errors before submitting.',
    )

    const handleSubmit = (event: SyntheticEvent) => {
        // Even though additionalValidations is called in onValidation but since we need all the errors to be visible as soon as user clicks on submit
        // We are calling them here as well
        additionalValidations()
        handleOnSubmit(event)
    }

    const toggleAppMetrics = () => {
        setIsAppMetricsEnabled((prev) => !prev)
    }

    const onPrometheusAuthTypeChange = (e) => {
        handleOnChange(e)
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
        if (tab === ClusterConfigTabEnum.COST_VISIBILITY) {
            handleAnalyticsEvent({
                category: 'cluster-config',
                action: 'CLUSTER_CONFIG_COST_VISIBILITY',
            })
        }
        validateAllAndSetErrors()
        additionalValidations()
        setClusterConfigTab(tab)
    }

    const toggleCostModule = () => {
        const enabled = !costModuleState.enabled
        handleAnalyticsEvent({
            category: 'cluster-config-cost-toggle',
            action: `CLUSTER_CONFIG_COST_VISIBILITY_${enabled ? 'ENABLED' : 'DISABLED'}`,
        })
        const newConfigState: typeof costModuleState = {
            ...costModuleState,
            enabled,
        }

        setCostModuleError(newConfigState.enabled && !validateCostModuleConfig(newConfigState))
        setCostModuleState(newConfigState)
    }

    const handleCostConfigChange = (newConfig: typeof costModuleState.config) => {
        const newConfigState: typeof costModuleState = {
            ...costModuleState,
            config: newConfig,
        }

        setCostModuleError(!validateCostModuleConfig(newConfigState))
        setCostModuleState(newConfigState)
    }

    const renderFooter = () => (
        <div className={`border__primary--top flexbox py-12 px-20 ${id ? 'dc__content-space' : 'dc__content-end'}`}>
            {id && (
                <Button
                    text="Delete"
                    variant={ButtonVariantType.secondary}
                    style={ButtonStyleType.negative}
                    startIcon={<Icon name="ic-delete" color={null} />}
                    disabled={isDefaultCluster || isUpdating}
                    dataTestId="delete_cluster"
                    onClick={showConfirmationModal}
                />
            )}
            <div className="flex dc__gap-12">
                <Button
                    text="Cancel"
                    variant={ButtonVariantType.secondary}
                    style={ButtonStyleType.neutral}
                    disabled={isUpdating}
                    dataTestId="cancel-create-cluster-button"
                    onClick={handleModalClose}
                />
                <Button
                    dataTestId="save_cluster_after_entering_cluster_details"
                    onClick={handleSubmit}
                    text={id ? 'Update cluster' : 'Save Cluster'}
                    isLoading={isUpdating}
                />
            </div>
        </div>
    )

    const getIsConnectProtocolConfigInvalid = (): boolean => {
        switch (remoteConnectionMethod) {
            case RemoteConnectionType.Proxy:
                return !state.proxyUrl?.value || state.proxyUrl?.error
            case RemoteConnectionType.SSHTunnel:
                return (
                    !state.sshUsername?.value ||
                    state.sshUsername?.error ||
                    !state.sshServerAddress?.value ||
                    state.sshServerAddress?.error ||
                    (SSHConnectionType === SSHAuthenticationType.Password ||
                    SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key
                        ? !state.sshPassword?.value || state.sshPassword?.error
                        : false) ||
                    (SSHConnectionType === SSHAuthenticationType.SSH_Private_Key ||
                    SSHConnectionType === SSHAuthenticationType.Password_And_SSH_Private_Key
                        ? !state.sshAuthKey?.value || state.sshAuthKey?.error
                        : false)
                )
            case RemoteConnectionType.Direct:
            default:
                return false
        }
    }

    const getIsTLSConfigInvalid = (): boolean => {
        const hasError = state.certificateAuthorityData.error || state.tlsClientKey.error || state.tlsClientCert.error

        const hasAllValues =
            id && initialIsTlsConnection
                ? true
                : state.certificateAuthorityData.value && state.tlsClientKey.value && state.tlsClientCert.value

        return isTlsConnection && (hasError || !hasAllValues)
    }

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
                            getIsConnectProtocolConfigInvalid={getIsConnectProtocolConfigInvalid}
                            getIsTLSConfigInvalid={getIsTLSConfigInvalid}
                        />
                    </div>
                )
            case 'application-monitoring':
                return (
                    <div className="flexbox flex-grow-1 bg__secondary dc__overflow-auto">
                        <ApplicationMonitoring
                            prometheusConfig={prometheusConfig}
                            prometheusUrl={prometheusUrl}
                            isAppMetricsEnabled={isAppMetricsEnabled}
                            toggleAppMetrics={toggleAppMetrics}
                            handleOnChange={handleOnChange}
                            onPrometheusAuthTypeChange={onPrometheusAuthTypeChange}
                            isGrafanaModuleInstalled={isGrafanaModuleInstalled}
                            isCostVisibilityEnabled={costModuleState.enabled}
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
                            costModuleConfig={costModuleConfig}
                            handleCostConfigChange={handleCostConfigChange}
                            config={costModuleState.config}
                            costModuleSchema={costModuleSchema || {}}
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

        if (
            costModuleConfig.installationStatus === 'Installing' ||
            costModuleConfig.installationStatus === 'Upgrading'
        ) {
            return <span className="cy-7 fs-12">{costModuleConfig.installationStatus} agent</span>
        }

        if (costModuleConfig.installationStatus === 'Failed') {
            return <span className="dc__truncate cr-5 fs-12">Agent unavailable</span>
        }

        if (costModuleConfig.installationStatus === 'Success') {
            return 'Enabled'
        }

        return `Agent status: ${costModuleConfig.installationStatus}`
    }

    const getIsPrometheusAuthValid = (): boolean => {
        if (isPrometheusEnabled) {
            const isBasicError =
                state.authType?.value === AuthenticationType.BASIC && (state.userName?.error || state.password?.error)

            if (isBasicError || state.endpoint?.error) {
                return false
            }
        }

        return true
    }

    const getIsClusterConfigTabValid = (tab: ClusterConfigTabEnum): boolean => {
        const tabKeys = CLUSTER_CONFIG_TAB_TO_ERROR_KEY_MAP[tab]
        const isTabValid = !tabKeys.some((key) => state[key]?.error)

        if (!isTabValid) {
            return false
        }

        switch (tab) {
            case ClusterConfigTabEnum.APPLICATION_MONITORING: {
                if (!getIsPrometheusAuthValid()) {
                    return false
                }

                return true
            }
            case ClusterConfigTabEnum.COST_VISIBILITY: {
                if (
                    (costModuleState.enabled && costModuleConfig?.installationError) ||
                    costModuleError ||
                    !getIsPrometheusAuthValid()
                ) {
                    return false
                }

                return true
            }

            case ClusterConfigTabEnum.CLUSTER_CONFIG:
                return !getIsTLSConfigInvalid() && !getIsConnectProtocolConfigInvalid()

            default:
                return true
        }
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
                            hasError={!getIsClusterConfigTabValid(ClusterConfigTabEnum.CLUSTER_CONFIG)}
                        />
                        <div className="divider__secondary--horizontal" />
                        <div className="flexbox-col">
                            <div className="px-8 py-4 fs-12 fw-6 lh-20 cn-7">INTEGRATIONS</div>
                            <ClusterFormNavButton
                                isActive={clusterConfigTab === ClusterConfigTabEnum.APPLICATION_MONITORING}
                                title="Application Monitoring"
                                subtitle={isAppMetricsEnabled ? 'Enabled' : 'Off'}
                                onClick={getTabSwitchHandler(ClusterConfigTabEnum.APPLICATION_MONITORING)}
                                hasError={!getIsClusterConfigTabValid(ClusterConfigTabEnum.APPLICATION_MONITORING)}
                            />
                            {ClusterCostConfig && id && (
                                <ClusterFormNavButton
                                    isActive={clusterConfigTab === ClusterConfigTabEnum.COST_VISIBILITY}
                                    title="Cost Visibility"
                                    subtitle={getCostNavSubtitle()}
                                    onClick={getTabSwitchHandler(ClusterConfigTabEnum.COST_VISIBILITY)}
                                    hasError={!getIsClusterConfigTabValid(ClusterConfigTabEnum.COST_VISIBILITY)}
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
