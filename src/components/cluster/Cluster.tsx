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

import { useState, useMemo, Component, useRef } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenNotAuthorized,
    Reload,
    Drawer,
    sortCallback,
    noop,
    DEFAULT_SECRET_PLACEHOLDER,
    FeatureTitleWithInfo,
    ToastVariantType,
    ToastManager,
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ButtonStyleType,
    ComponentSizeType,
    useStickyEvent,
    getClassNameForStickyHeaderWithShadow,
} from '@devtron-labs/devtron-fe-common-lib'
import { generatePath, Route, useHistory, withRouter } from 'react-router-dom'
import { ReactComponent as ClusterIcon } from '@Icons/ic-cluster.svg'
import { importComponentFromFELibrary, useForm } from '../common'
import { List } from '../globalConfigurations/GlobalConfiguration'
import {
    getClusterList,
    getEnvironmentList,
    getCluster,
    deleteEnvironment,
} from './cluster.service'
import { ReactComponent as Add } from '@Icons/ic-add.svg'
import { ReactComponent as Database } from '@Icons/ic-env.svg'
import { ReactComponent as PencilEdit } from '@Icons/ic-pencil.svg'
import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import { ReactComponent as VirtualClusterIcon } from '@Icons/ic-virtual-cluster.svg'
import { ReactComponent as VirtualEnvIcon } from '@Icons/ic-environment-temp.svg'
import { POLLING_INTERVAL, ClusterListProps, AuthenticationType, ClusterFormProps } from './cluster.type'
import { DOCUMENTATION, ViewType, CONFIGURATION_TYPES, URLS, AppCreationType } from '../../config'
import { getEnvName } from './cluster.util'
import ClusterForm from './ClusterForm'
import { ClusterEnvironmentDrawer } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/ClusterEnvironmentDrawer'
import { EnvironmentDeleteComponent } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/EnvironmentDeleteComponent'
import CreateCluster from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/CreateCluster.component'
import { CreateClusterTypeEnum } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/types'

const getRemoteConnectionConfig = importComponentFromFELibrary('getRemoteConnectionConfig', noop, 'function')
const getSSHConfig: (
    ...props
) => Pick<ClusterFormProps, 'sshUsername' | 'sshPassword' | 'sshAuthKey' | 'sshServerAddress'> =
    importComponentFromFELibrary('getSSHConfig', noop, 'function')

class ClusterList extends Component<ClusterListProps, any> {
    timerRef

    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            clusters: [],
            clusterEnvMap: {},
            isTlsConnection: false,
            appCreationType: AppCreationType.Blank,
            isKubeConfigFile: false,
            browseFile: false,
            isClusterDetails: false,
            showEditCluster: false,
            isConnectedViaProxy: false,
            isConnectedViaSSHTunnel: false,
        }
        this.initialise = this.initialise.bind(this)
        this.toggleCheckTlsConnection = this.toggleCheckTlsConnection.bind(this)
        this.setTlsConnectionFalse = this.setTlsConnectionFalse.bind(this)
        this.toggleKubeConfigFile = this.toggleKubeConfigFile.bind(this)
        this.toggleBrowseFile = this.toggleBrowseFile.bind(this)
        this.toggleClusterDetails = this.toggleClusterDetails.bind(this)
        this.toggleShowEditCluster = this.toggleShowEditCluster.bind(this)
    }

    componentDidMount() {
        if (this.props.isSuperAdmin) {
            this.initialise()
        }
    }

    initialise() {
        if (this.timerRef) {
            clearInterval(this.timerRef)
        }
        Promise.all([getClusterList(), window._env_.K8S_CLIENT ? { result: undefined } : getEnvironmentList()])
            .then(([clusterRes, envResponse]) => {
                const environments = envResponse.result || []
                const clusterEnvMap = environments.reduce((agg, curr, idx) => {
                    agg[curr.cluster_id] = agg[curr.cluster_id] || []
                    agg[curr.cluster_id].push(curr)
                    return agg
                }, {})
                let clusters = clusterRes.result || []
                clusters = clusters.map((c) => {
                    return {
                        ...c,
                        environments: clusterEnvMap[c.id],
                    }
                })
                clusters = clusters.sort((a, b) => sortCallback('cluster_name', a, b))
                this.setState(
                    {
                        clusters,
                        clusterEnvMap,
                        view: ViewType.FORM,
                    },
                    () => {
                        const cluster = this.state.clusters.find(
                            (c) => c.agentInstallationStage === 1 || c.agentInstallationStage === 3,
                        )
                        if (cluster) {
                            this.timerRef = setInterval(() => {
                                this.pollClusterlist()
                            }, POLLING_INTERVAL)
                        }
                    },
                )
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.ERROR })
            })
    }

    async pollClusterlist() {
        try {
            const { result } = await getClusterList()
            let clusters = result
                ? result.map((c) => {
                      return {
                          ...c,
                          environments: this.state.clusterEnvMap[c.id],
                      }
                  })
                : []

            const defaultRemoteConnectionConfig = getRemoteConnectionConfig()
            clusters = clusters.concat({
                id: null,
                cluster_name: '',
                server_url: '',
                proxyUrl: '',
                sshTunnelConfig: {
                    user: '',
                    password: '',
                    authKey: '',
                    sshServerAddress: '',
                },
                active: true,
                config: {},
                environments: [],
                insecureSkipTlsVerify: true,
                isVirtualCluster: false,
                remoteConnectionConfig: defaultRemoteConnectionConfig,
            })
            clusters = clusters.sort((a, b) => sortCallback('cluster_name', a, b))
            this.setState({ clusters })
            const cluster = this.state.clusters.find(
                (c) => c.agentInstallationStage === 1 || c.agentInstallationStage === 3,
            )
            if (!cluster) {
                clearInterval(this.timerRef)
            }
        } catch (error) {}
    }

    componentWillUnmount() {
        clearInterval(this.timerRef)
    }

    toggleCheckTlsConnection() {
        this.setState({ isTlsConnection: !this.state.isTlsConnection })
    }

    setTlsConnectionFalse() {
        this.setState({ isTlsConnection: false })
    }

    toggleClusterDetails(updateClusterDetails: boolean) {
        this.setState({ isClusterDetails: updateClusterDetails })
    }

    toggleShowEditCluster() {
        this.setState({ showEditCluster: !this.state.showEditCluster })
    }

    toggleKubeConfigFile(updateKubeConfigFile: boolean) {
        this.setState({ isKubeConfigFile: updateKubeConfigFile })
    }

    toggleBrowseFile() {
        this.setState({ browseFile: !this.state.browseFile })
    }

    handleRedirectToClusterList = () => {
        this.props.history.push(URLS.GLOBAL_CONFIG_CLUSTER)
    }

    render() {
        if (!this.props.isSuperAdmin) {
            return (
                <div className="dc__align-reload-center">
                    <ErrorScreenNotAuthorized />
                </div>
            )
        }
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        if (this.state.view === ViewType.ERROR) {
            return <Reload className="dc__align-reload-center" />
        }
        if (this.state.view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }
        if (this.state.view === ViewType.ERROR) {
            return <Reload className="dc__align-reload-center" />
        }

        const moduleBasedTitle = `Clusters${window._env_.K8S_CLIENT ? '' : ' and Environments'}`
        return (
            <section className="global-configuration__component flex-1">
                <div data-testid="cluster_and_env_header" className="flexbox dc__content-space">
                    <FeatureTitleWithInfo
                        title={moduleBasedTitle}
                        renderDescriptionContent={() => `Manage your organization’s ${moduleBasedTitle.toLowerCase()}.`}
                        docLink={DOCUMENTATION.GLOBAL_CONFIG_CLUSTER}
                        showInfoIconTippy
                        additionalContainerClasses="mb-20"
                    />
                    <Button
                        dataTestId="add_cluster_button"
                        linkProps={{
                            to: generatePath(URLS.GLOBAL_CONFIG_CREATE_CLUSTER, {
                                type: CreateClusterTypeEnum.CONNECT_CLUSTER,
                            }),
                        }}
                        component={ButtonComponentType.link}
                        startIcon={<Add />}
                        size={ComponentSizeType.medium}
                        text="Add cluster"
                    />
                </div>
                {this.state.clusters.map(
                    (cluster) =>
                        cluster.id && (
                            <Cluster
                                {...cluster}
                                reload={this.initialise}
                                key={cluster.id || Math.random().toString(36).substr(2, 5)}
                                showEditCluster={this.state.showEditCluster}
                                toggleShowAddCluster={this.toggleShowEditCluster}
                                toggleCheckTlsConnection={this.toggleCheckTlsConnection}
                                setTlsConnectionFalse={this.setTlsConnectionFalse}
                                isTlsConnection={this.state.isTlsConnection}
                                prometheus_url={cluster.prometheus_url}
                            />
                        ),
                )}

                <Route path={URLS.GLOBAL_CONFIG_CREATE_CLUSTER}>
                    <CreateCluster
                        handleReloadClusterList={this.initialise}
                        clusterFormProps={{
                            ...getSSHConfig(this.state),
                            cluster_name: this.state.cluster_name,
                            server_url: this.state.server_url,
                            active: true,
                            config: {},
                            reload: this.initialise,
                            prometheus_url: '',
                            prometheusAuth: this.state.prometheus,
                            defaultClusterComponent: this.state.defaultClusterComponent,
                            isTlsConnection: this.state.isTlsConnection,
                            isClusterDetails: this.state.isClusterDetails,
                            proxyUrl: this.state.proxyUrl,
                            isConnectedViaProxy: this.state.isConnectedViaProxy,
                            isConnectedViaSSHTunnel: this.state.isConnectedViaSSHTunnel,
                            toggleCheckTlsConnection: this.toggleCheckTlsConnection,
                            setTlsConnectionFalse: this.setTlsConnectionFalse,
                            toggleKubeConfigFile: this.toggleKubeConfigFile,
                            isKubeConfigFile: this.state.isKubeConfigFile,
                            toggleClusterDetails: this.toggleClusterDetails,
                            handleCloseCreateClusterForm: this.handleRedirectToClusterList,
                            isVirtualCluster: false,
                            isProd: false,
                        }}
                    />
                </Route>

                <Route
                    path={`${URLS.GLOBAL_CONFIG_CLUSTER}/:clusterName${URLS.CREATE_ENVIRONMENT}`}
                    render={(props) => {
                        const clusterName = props.match.params.clusterName
                        const {
                            isVirtualCluster,
                            prometheus_url,
                            id: clusterId,
                        } = this.state.clusters.find((cluster) => cluster.cluster_name === clusterName) || {}

                        return (
                            <ClusterEnvironmentDrawer
                                reload={this.initialise}
                                clusterName={clusterName}
                                id={null}
                                environmentName={null}
                                clusterId={clusterId}
                                namespace={null}
                                prometheusEndpoint={prometheus_url}
                                isProduction={null}
                                description={null}
                                hideClusterDrawer={this.handleRedirectToClusterList}
                                isVirtual={isVirtualCluster}
                            />
                        )
                    }}
                />
            </section>
        )
    }
}

export default withRouter(ClusterList)

const Cluster = ({
    id,
    id: clusterId,
    cluster_name,
    insecureSkipTlsVerify,
    defaultClusterComponent,
    agentInstallationStage,
    server_url,
    active,
    config: defaultConfig,
    environments,
    reload,
    prometheus_url,
    proxyUrl,
    toConnectWithSSHTunnel,
    sshTunnelConfig,
    isTlsConnection,
    toggleShowAddCluster,
    toggleCheckTlsConnection,
    setTlsConnectionFalse,
    isVirtualCluster,
    isProd,
}) => {
    const [editMode, toggleEditMode] = useState(false)
    const [environment, setEnvironment] = useState(null)
    const [config, setConfig] = useState(defaultConfig)
    const [prometheusAuth, setPrometheusAuth] = useState(undefined)
    const [showWindow, setShowWindow] = useState(false)
    const [confirmation, setConfirmation] = useState(false)
    const [prometheusToggleEnabled] = useState(!!prometheus_url)

    const [prometheusAuthenticationType] = useState({
        type: prometheusAuth?.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS,
    })
    const authenticationType = prometheusAuth?.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS

    const drawerRef = useRef(null)

    const { stickyElementRef, isStuck: isHeaderStuck } = useStickyEvent({
        containerSelector: '.global-configuration__component-wrapper',
        identifier: `cluster-list__${cluster_name}`,
    })

    const isDefaultCluster = (): boolean => {
        return id == 1
    }

    const { state } = useForm(
        {
            cluster_name: { value: cluster_name, error: '' },
            url: { value: server_url, error: '' },
            userName: { value: prometheusAuth?.userName, error: '' },
            password: { value: prometheusAuth?.password, error: '' },
            prometheusTlsClientKey: { value: prometheusAuth?.tlsClientKey, error: '' },
            prometheusTlsClientCert: { value: prometheusAuth?.tlsClientCert, error: '' },
            proxyUrl: { value: proxyUrl, error: '' },
            sshUsername: { value: sshTunnelConfig?.user, error: '' },
            sshPassword: { value: sshTunnelConfig?.password, error: '' },
            sshAuthKey: { value: sshTunnelConfig?.authKey, error: '' },
            sshServerAddress: { value: sshTunnelConfig?.sshServerAddress, error: '' },
            isConnectedViaProxy: !!proxyUrl?.length,
            isConnectedViaSSHTunnel: toConnectWithSSHTunnel,
            tlsClientKey: { value: config.tls_key, error: '' },
            tlsClientCert: { value: config.cert_data, error: '' },
            certificateAuthorityData: { value: config.cert_auth_data, error: '' },
            token: { value: config?.bearer_token ? config.bearer_token : '', error: '' },
            endpoint: { value: prometheus_url || '', error: '' },
            authType: { value: authenticationType, error: '' },
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
            proxyUrl: {
                required: false,
                validator: { error: 'Incorrect Url', regex: /^.*$/ },
            },
            toConnectWithSSHTunnel: {
                required: false,
            },
            sshUsername: {
                required: false,
                validator: {
                    error: 'Username or User Identifier is required. Username cannot contain spaces or special characters other than _ and -',
                    regex: /^[A-Za-z0-9_-]+$/,
                },
            },
            sshPassword: {
                required: false,
                validator: { error: 'password is required', regex: /^(?!\s*$).+/ },
            },
            sshAuthKey: {
                required: false,
                validator: { error: 'ssh private key is required', regex: /^(?!\s*$).+/ },
            },
            sshServerAddress: {
                required: false,
                validator: { error: 'URL is required', regex: /^.*$/ },
            },
            isConnectedViaProxy: {
                required: false,
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
            tlsClientKey: {
                required: false,
                validator: { error: 'TLS Key is required', regex: /^(?!\s*$).+/ },
            },
            tlsClientCert: {
                required: false,
                validator: { error: 'TLS Certificate is required', regex: /^(?!\s*$).+/ },
            },
            prometheusTlsClientKey: {
                required: false,
            },
            prometheusTlsClientCert: {
                required: false,
            },
            certificateAuthorityData: {
                required: false,
                validator: { error: 'Certificate authority data is required', regex: /^(?!\s*$).+/ },
            },
            token:
                isDefaultCluster() || id
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

    const history = useHistory()
    const newEnvs = useMemo(() => {
        return clusterId ? [{ id: null }].concat(environments || []) : environments || []
    }, [environments])

    async function handleEdit(e) {
        try {
            const { result } = await getCluster(clusterId)
            setPrometheusAuth(result.prometheusAuth)
            setConfig({ ...result.config, ...(clusterId != 1 ? { bearer_token: DEFAULT_SECRET_PLACEHOLDER } : null) })
            toggleEditMode((t) => !t)
        } catch (err) {
            showError(err)
        }
    }

    const hideClusterDrawer = (e) => {
        setShowWindow(false)
    }

    async function onValidation() {
        const payload = getClusterPayload()
        const urlValue = state.url.value?.trim() ?? ''
        if (urlValue.endsWith('/')) {
            payload['server_url'] = urlValue.slice(0, -1)
        } else {
            payload['server_url'] = urlValue
        }
        const proxyUrlValue = state.proxyUrl.value?.trim() ?? ''
        if (proxyUrlValue.endsWith('/')) {
            payload.remoteConnectionConfig.proxyConfig['proxyUrl'] = proxyUrlValue.slice(0, -1)
        }
        if (state.authType.value === AuthenticationType.BASIC && prometheusToggleEnabled) {
            const isValid = state.userName?.value && state.password?.value
            if (!isValid) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: 'Please add both username and password',
                })
            } else {
                payload.prometheusAuth['userName'] = state.userName.value || ''
                payload.prometheusAuth['password'] = state.password.value || ''
            }
        }
    }

    const getClusterPayload = () => {
        return {
            id,
            cluster_name: state.cluster_name.value,
            config: {
                bearer_token:
                    state.token.value && state.token.value !== DEFAULT_SECRET_PLACEHOLDER ? state.token.value : '',
            },
            active,
            prometheus_url: prometheusToggleEnabled ? state.endpoint.value : '',
            prometheusAuth: {
                userName: prometheusToggleEnabled ? state.userName.value : '',
                password: prometheusToggleEnabled ? state.password.value : '',
                tlsClientKey: prometheusToggleEnabled ? state.tlsClientKey.value : '',
                tlsClientCert: prometheusToggleEnabled ? state.tlsClientCert.value : '',
            },
            remoteConnectionConfig: getRemoteConnectionConfig(state),
            insecureSkipTlsVerify: !isTlsConnection,
        }
    }

    const envName: string = getEnvName(defaultClusterComponent, agentInstallationStage)

    const renderNoEnvironmentTab = () => {
        return (
            <div className="br-4 dashed dc__border flex bg__secondary pb-16 pt-16 m-16 fs-12 fw-4">
                <div className="dc__align-center">
                    <div className="fw-6">No Environments Added</div>
                    <div>This cluster doesn't have any environments yet</div>
                </div>
            </div>
        )
    }

    const showToggleConfirmation = () => setConfirmation(true)

    const hideConfirmationModal = () => setConfirmation(false)

    const showWindowModal = (): void => {
        setShowWindow(true)
    }

    const editModeToggle = (): void => {
        if (!clusterId) {
            toggleEditMode((t) => !t)
        }
        if (isTlsConnection === insecureSkipTlsVerify) {
            toggleCheckTlsConnection()
        }
    }

    const clusterIcon = () => {
        if (isVirtualCluster) {
            return <VirtualClusterIcon className="fcb-5 icon-dim-24 dc__vertical-align-middle mr-16" />
        }
        return <ClusterIcon className="cluster-icon icon-dim-24 dc__vertical-align-middle mr-16" />
    }

    const envIcon = () => {
        if (isVirtualCluster) {
            return <VirtualEnvIcon className="fcb-5 icon-dim-20" />
        }
        return <Database className="icon-dim-20" />
    }

    const handleToggleEditMode = (): void => {
        toggleEditMode((t) => !t)
    }

    const subTitle: string = isVirtualCluster ? 'Isolated cluster' : server_url

    const onDelete = async () => {
        const deletePayload = {
            id: environment.id,
            environment_name: environment.environmentName,
            cluster_id: environment.clusterId,
            prometheus_endpoint: environment.prometheusEndpoint,
            namespace: environment.namespace || '',
            active: true,
            default: environment.isProduction,
            description: environment.description || '',
        }
        await deleteEnvironment(deletePayload)
        reload()
    }

    return (
        <>
            <article
                data-testid={`${cluster_name ?? 'create'}-cluster-container`}
                className={`cluster-list ${
                    // FIXME: clusterId is always truthy, so the below condition is always true
                    clusterId ? 'cluster-list--update' : 'cluster-list--create collapsed-list'
                }`}
            >
                <List internalRef={stickyElementRef} className={`dc__border dc__zi-1 ${getClassNameForStickyHeaderWithShadow(isHeaderStuck)} ${
                    isHeaderStuck ? 'dc__no-border-radius' : ''
                }`} key={clusterId} onClick={editModeToggle}>
                    {!clusterId && (
                        <List.Logo>
                            <Add className="icon-dim-24 fcb-5 dc__vertical-align-middle" />
                        </List.Logo>
                    )}
                    <div className="flex left">
                        {clusterId ? clusterIcon() : null}
                        <List.Title
                            title={cluster_name || 'Add cluster'}
                            subtitle={subTitle}
                            className="fw-6 dc__mxw-400 dc__truncate-text"
                            tag={isProd ? 'Prod' : null}
                        />
                        {cluster_name && (
                            <div className="flex dc__align-right dc__gap-16">
                                <Button
                                    dataTestId={`add-environment-button-${cluster_name}`}
                                    component={ButtonComponentType.link}
                                    linkProps={{
                                        to: `${URLS.GLOBAL_CONFIG_CLUSTER}/${cluster_name}${URLS.CREATE_ENVIRONMENT}`,
                                    }}
                                    startIcon={<Add />}
                                    text="Add Environment"
                                    variant={ButtonVariantType.text}
                                    size={ComponentSizeType.small}
                                />

                                <div className="dc__divider" />
                            </div>
                        )}
                    </div>
                    {clusterId && (
                        <Button
                            dataTestId={`edit_cluster_pencil-${cluster_name}`}
                            ariaLabel="Edit Cluster"
                            icon={<PencilEdit />}
                            size={ComponentSizeType.small}
                            variant={ButtonVariantType.borderLess}
                            style={ButtonStyleType.neutral}
                            onClick={handleEdit}
                        />
                    )}
                </List>
                {!window._env_.K8S_CLIENT && Array.isArray(newEnvs) && newEnvs.length > 1 ? (
                    <div className="pb-8">
                        <div className="cluster-env-list_table fs-12 pt-6 pb-6 fw-6 flex left lh-20 pl-20 pr-20 dc__border-top dc__border-bottom-n1">
                            <div />
                            <div>{CONFIGURATION_TYPES.ENVIRONMENT}</div>
                            <div>{CONFIGURATION_TYPES.NAMESPACE}</div>
                            <div>{CONFIGURATION_TYPES.DESCRIPTION}</div>
                            <div />
                        </div>
                        {newEnvs
                            .sort((a, b) => sortCallback('environment_name', a, b))
                            .map(
                                ({
                                    id,
                                    environment_name,
                                    prometheus_url,
                                    namespace,
                                    default: isProduction,
                                    description,
                                }) =>
                                    environment_name ? (
                                        <div
                                            data-testid={`env-container-${environment_name}`}
                                            className="cluster-env-list_table dc__hover-n50 flex left lh-20 pt-8 pb-8 fs-13 fw-4 pl-16 pr-16 h-44 dc__visible-hover dc__visible-hover--parent"
                                            key={id}
                                            onClick={() =>
                                                setEnvironment({
                                                    id,
                                                    environmentName: environment_name,
                                                    clusterId,
                                                    namespace,
                                                    prometheusEndpoint: prometheus_url,
                                                    isProduction,
                                                    description,
                                                })
                                            }
                                        >
                                            <span className="cursor flex w-100">{environment_name && envIcon()}</span>

                                            <div
                                                className="dc__truncate-text flex left cb-5 cursor"
                                                onClick={showWindowModal}
                                                data-testid={`env-${environment_name}`}
                                            >
                                                {environment_name}

                                                {isProduction && (
                                                    <div className="bg__secondary dc__border pr-6 pl-6 fs-12 h-20 ml-8 flex cn-7 br-4 ">
                                                        Prod
                                                    </div>
                                                )}
                                            </div>
                                            <div className="dc__truncate-text">{namespace}</div>
                                            <div className="cluster-list__description dc__truncate-text">
                                                {description}
                                            </div>
                                            <div className="dc__visible-hover--child">
                                                <div className="flex dc__gap-4">
                                                    <Button
                                                        dataTestId={`env-edit-button-${environment_name}`}
                                                        icon={<PencilEdit />}
                                                        ariaLabel="Edit Environment"
                                                        variant={ButtonVariantType.borderLess}
                                                        style={ButtonStyleType.neutral}
                                                        size={ComponentSizeType.xs}
                                                        onClick={showWindowModal}
                                                    />
                                                    <Button
                                                        dataTestId={`env-delete-button-${environment_name}`}
                                                        icon={<Trash />}
                                                        onClick={showToggleConfirmation}
                                                        variant={ButtonVariantType.borderLess}
                                                        style={ButtonStyleType.negativeGrey}
                                                        size={ComponentSizeType.xs}
                                                        ariaLabel="Delete"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : null,
                            )}

                        {confirmation && (
                            <EnvironmentDeleteComponent
                                environmentName={environment?.environmentName}
                                onDelete={onDelete}
                                closeConfirmationModal={hideConfirmationModal}
                            />
                        )}
                    </div>
                ) : (
                    clusterId && renderNoEnvironmentTab()
                )}
                {editMode && (
                    <Drawer position="right" width="1000px" onEscape={handleToggleEditMode}>
                        <div className="h-100 bg__primary" ref={drawerRef}>
                            <ClusterForm
                                {...getSSHConfig(sshTunnelConfig)}
                                id={clusterId}
                                cluster_name={cluster_name}
                                server_url={server_url}
                                active
                                config={{}}
                                reload={reload}
                                prometheus_url={prometheus_url}
                                prometheusAuth={prometheusAuth}
                                defaultClusterComponent={state.defaultClusterComponent}
                                isTlsConnection={isTlsConnection}
                                isClusterDetails={state.isClusterDetails}
                                proxyUrl={proxyUrl}
                                isConnectedViaProxy={!!proxyUrl}
                                isConnectedViaSSHTunnel={toConnectWithSSHTunnel}
                                toggleCheckTlsConnection={toggleCheckTlsConnection}
                                setTlsConnectionFalse={setTlsConnectionFalse}
                                toggleKubeConfigFile
                                isKubeConfigFile={state.isKubeConfigFile}
                                toggleEditMode={toggleEditMode}
                                toggleClusterDetails
                                isVirtualCluster={isVirtualCluster}
                                isProd={isProd}
                            />
                        </div>
                    </Drawer>
                )}
            </article>
            {showWindow && (
                <ClusterEnvironmentDrawer
                    reload={reload}
                    clusterName={cluster_name}
                    {...environment}
                    hideClusterDrawer={hideClusterDrawer}
                    isVirtual={isVirtualCluster}
                />
            )}
        </>
    )
}
