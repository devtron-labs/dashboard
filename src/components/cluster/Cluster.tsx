import React, { useState, useMemo, Component, useRef, useEffect } from 'react'
import {
    showError,
    Progressing,
    ErrorScreenNotAuthorized,
    Reload,
    Drawer,
    sortCallback,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ClusterIcon } from '../../assets/icons/ic-cluster.svg'
import { useForm, useAsync } from '../common'
import { List } from '../globalConfigurations/GlobalConfiguration'
import {
    getClusterList,
    saveCluster,
    updateCluster,
    getEnvironmentList,
    getCluster,
    retryClusterInstall,
    deleteEnvironment,
} from './cluster.service'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Database } from '../../assets/icons/ic-env.svg'
import { ReactComponent as PencilEdit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as DeleteEnvironment } from '../../assets/icons/ic-delete-interactive.svg'
import { ClusterComponentModal } from './ClusterComponentModal'
import { ClusterInstallStatus } from './ClusterInstallStatus'
import { POLLING_INTERVAL, ClusterListProps, AuthenticationType, DEFAULT_SECRET_PLACEHOLDER } from './cluster.type'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'

import {
    DOCUMENTATION,
    SERVER_MODE,
    ViewType,
    URLS,
    ModuleNameMap,
    CONFIGURATION_TYPES,
    AppCreationType,
} from '../../config'
import { getEnvName } from './cluster.util'
import DeleteComponent from '../../util/DeleteComponent'
import { DC_ENVIRONMENT_CONFIRMATION_MESSAGE, DeleteComponentsName } from '../../config/constantMessaging'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import Tippy from '@tippyjs/react/headless'
import ClusterForm from './ClusterForm'
import Environment from './Environment'

export default class ClusterList extends Component<ClusterListProps, any> {
    timerRef

    constructor(props) {
        super(props)
        this.state = {
            view: ViewType.LOADING,
            clusters: [],
            clusterEnvMap: {},
            showAddCluster: false,
            isTlsConnection: false,
            appCreationType: AppCreationType.Blank,
            isKubeConfigFile: false,
            browseFile: false,
            isClusterDetails: false,
            showEditCluster: false,
        }
        this.initialise = this.initialise.bind(this)
        this.toggleCheckTlsConnection = this.toggleCheckTlsConnection.bind(this)
        this.setTlsConnectionFalse = this.setTlsConnectionFalse.bind(this)
        this.toggleShowAddCluster = this.toggleShowAddCluster.bind(this)
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

    componentDidUpdate(prevProps) {
        if (this.props.serverMode !== prevProps.serverMode) {
            this.initialise()
        }
    }

    initialise() {
        if (this.timerRef) clearInterval(this.timerRef)
        Promise.all([
            getClusterList(),
            this.props.serverMode === SERVER_MODE.EA_ONLY || window._env_.K8S_CLIENT
                ? { result: undefined }
                : getEnvironmentList(),
        ])
            .then(([clusterRes, envResponse]) => {
                let environments = envResponse.result || []
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
                        clusters: clusters,
                        clusterEnvMap,
                        view: ViewType.FORM,
                    },
                    () => {
                        let cluster = this.state.clusters.find(
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
            clusters = clusters.concat({
                id: null,
                cluster_name: '',
                server_url: '',
                active: true,
                config: {},
                environments: [],
                insecureSkipTlsVerify: true,
            })
            clusters = clusters.sort((a, b) => sortCallback('cluster_name', a, b))
            this.setState({ clusters: clusters })
            let cluster = this.state.clusters.find(
                (c) => c.agentInstallationStage === 1 || c.agentInstallationStage === 3,
            )
            if (!cluster) clearInterval(this.timerRef)
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

    toggleShowAddCluster() {
        this.setState({ showAddCluster: !this.state.showAddCluster })
    }

    toggleKubeConfigFile(updateKubeConfigFile: boolean) {
        this.setState({ isKubeConfigFile: updateKubeConfigFile })
    }

    toggleBrowseFile() {
        this.setState({ browseFile: !this.state.browseFile })
    }

    render() {
        if (!this.props.isSuperAdmin) {
            return <ErrorScreenNotAuthorized />
        } else if (this.state.view === ViewType.LOADING) return <Progressing pageLoader />
        else if (this.state.view === ViewType.ERROR) return <Reload className="dc__align-reload-center" />
        if (this.state.view === ViewType.LOADING) return <Progressing pageLoader />
        else if (this.state.view === ViewType.ERROR) return <Reload className="dc__align-reload-center" />
        else {
            const moduleBasedTitle =
                'Clusters' +
                (this.props.serverMode === SERVER_MODE.EA_ONLY || window._env_.K8S_CLIENT ? '' : ' and Environments')
            return (
                <section className="global-configuration__component flex-1">
                    <div data-testid="cluster_and_env_header" className="flex left dc__content-space">
                        <h2 className="form__title">{moduleBasedTitle}</h2>
                        <button
                            type="button"
                            className="flex cta h-32 lh-n fcb-5"
                            onClick={() =>
                                this.setState({
                                    showAddCluster: true,
                                })
                            }
                        >
                            <Add
                                data-testid="add_cluster_button"
                                className="icon-dim-24 fcb-5 dc__vertical-align-middle"
                            />
                            Add cluster
                        </button>
                    </div>
                    <p className="form__subtitle">
                        Manage your organization’s {moduleBasedTitle.toLowerCase()}. &nbsp;
                        <a
                            className="dc__link"
                            href={DOCUMENTATION.GLOBAL_CONFIG_CLUSTER}
                            rel="noopener noreferer"
                            target="_blank"
                        >
                            Learn more
                        </a>
                    </p>
                    {this.state.clusters.map((cluster) => (
                        <Cluster
                            {...cluster}
                            reload={this.initialise}
                            key={cluster.id || Math.random().toString(36).substr(2, 5)}
                            serverMode={this.props.serverMode}
                            isGrafanaModuleInstalled={true}
                            showEditCluster={this.state.showEditCluster}
                            toggleShowAddCluster={this.toggleShowEditCluster}
                            toggleCheckTlsConnection={this.toggleCheckTlsConnection}
                            setTlsConnectionFalse={this.setTlsConnectionFalse}
                            isTlsConnection={this.state.isTlsConnection}
                            toggleEditMode={() => {}}
                        />
                    ))}
                    {this.state.showAddCluster && (
                        <Drawer position="right" width="1000px" onEscape={this.toggleShowAddCluster}>
                                <ClusterForm
                                    id={null}
                                    cluster_name={this.state.cluster_name}
                                    server_url={this.state.server_url}
                                    active={true}
                                    config={{}}
                                    toggleEditMode={() => {}}
                                    reload={this.initialise}
                                    prometheus_url=""
                                    prometheusAuth={this.state.prometheus}
                                    defaultClusterComponent={this.state.defaultClusterComponent}
                                    isGrafanaModuleInstalled={true}
                                    isTlsConnection={this.state.isTlsConnection}
                                    isClusterDetails={this.state.isClusterDetails}
                                    toggleCheckTlsConnection={this.toggleCheckTlsConnection}
                                    setTlsConnectionFalse={this.setTlsConnectionFalse}
                                    toggleShowAddCluster={this.toggleShowAddCluster}
                                    toggleKubeConfigFile={this.toggleKubeConfigFile}
                                    isKubeConfigFile={this.state.isKubeConfigFile}
                                    toggleClusterDetails={this.toggleClusterDetails}
                                />
                        </Drawer>
                    )}
                </section>
            )
        }
    }
}

function Cluster({
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
    serverMode,
    isTlsConnection,
    toggleShowAddCluster,
    toggleCheckTlsConnection,
    setTlsConnectionFalse,
}) {
    const [editMode, toggleEditMode] = useState(false)
    const [environment, setEnvironment] = useState(null)
    const [config, setConfig] = useState(defaultConfig)
    const [prometheusAuth, setPrometheusAuth] = useState(undefined)
    const [showClusterComponentModal, toggleClusterComponentModal] = useState(false)
    const [showWindow, setShowWindow] = useState(false)
    const [envDelete, setDeleteEnv] = useState(false)
    const [confirmation, toggleConfirmation] = useState(false)
    const [loading, setLoading] = useState(false)
    const [prometheusToggleEnabled, setPrometheusToggleEnabled] = useState(prometheus_url ? true : false)
    const [, grafanaModuleStatus] = useAsync(
        () => getModuleInfo(ModuleNameMap.GRAFANA),
        [clusterId],
        !window._env_.K8S_CLIENT,
    )

    const [prometheusAuthenticationType, setPrometheusAuthenticationType] = useState({
        type: prometheusAuth && prometheusAuth.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS,
    })
    let authenTicationType =
        prometheusAuth && prometheusAuth.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS

    const editLabelRef = useRef(null)
    const drawerRef = useRef(null)

    const isDefaultCluster = (): boolean => {
        return id == 1
    }

    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            cluster_name: { value: cluster_name, error: '' },
            url: { value: server_url, error: '' },
            userName: { value: prometheusAuth?.userName, error: '' },
            password: { value: prometheusAuth?.password, error: '' },
            tlsClientKey: { value: prometheusAuth?.tlsClientKey, error: '' },
            tlsClientCert: { value: prometheusAuth?.tlsClientCert, error: '' },
            certificateAuthorityData: { value: prometheusAuth?.certificateAuthorityData, error: '' },
            token: { value: config && config.bearer_token ? config.bearer_token : '', error: '' },
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
                required: false,
                validator: { error: 'TLS Key is required', regex: /^(?!\s*$).+/ },
            },
            tlsClientCert: {
                required: false,
                validator: { error: 'TLS Certificate is required', regex: /^(?!\s*$).+/ },
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
                required: prometheusToggleEnabled ? true : false,
                validator: { error: 'endpoint is required', regex: /^.*$/ },
            },
        },
        onValidation,
    )

    const history = useHistory()
    const newEnvs = useMemo(() => {
        let namespacesInAll = true
        if (Array.isArray(environments)) {
            namespacesInAll = !environments.some((env) => !env.namespace)
        }
        return namespacesInAll && clusterId ? [{ id: null }].concat(environments || []) : environments || []
    }, [environments])
    const sortedNewEnvs = newEnvs.sort((a, b) => sortCallback('environment_name', a, b))

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

    function redirectToChartDeployment(appId, envId): void {
        history.push(`${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${appId}/env/${envId}`)
    }

    async function callRetryClusterInstall() {
        try {
            let payload = {}
            const { result } = await retryClusterInstall(clusterId, payload)
            if (result) toast.success('Successfully triggered')
            reload()
        } catch (error) {
            showError(error)
        }
    }

    async function clusterInstallStatusOnclick(e) {
        if (agentInstallationStage === 3) {
            callRetryClusterInstall()
        } else toggleClusterComponentModal(!showClusterComponentModal)
    }

    const hideClusterDrawer = (e) => {
        setShowWindow(false)
    }

    const getEnvironmentPayload = () => {
        return {
            id: environment.id,
            environment_name: environment.environment_name,
            cluster_id: environment.cluster_id,
            prometheus_endpoint: environment.prometheus_endpoint,
            namespace: environment.namespace || '',
            active: true,
            default: environment.isProduction,
            description: environment.description || '',
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
                    state.tlsClientKey.value?.length &&
                    state.tlsClientCert.value?.length &&
                    state.certificateAuthorityData?.length
                if (!isValid) {
                    toast.error('Please add TLS Key, Certificate and Certificate Authority Data')
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
            toast.success(`Successfully ${id ? 'updated' : 'saved'}.`)
            reload()
            toggleEditMode((e) => !e)
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
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
            },
            insecureSkipTlsVerify: !isTlsConnection,
        }
    }

    useEffect(() => {
        const handleClickOutsideDrawer = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                toggleEditMode(false)
            }
        }

        window.addEventListener('click', handleClickOutsideDrawer)

        return () => {
            window.removeEventListener('click', handleClickOutsideDrawer)
        }
    }, [])

    const outsideClickHandler = (evt): void => {
        if (editLabelRef.current && !editLabelRef.current.contains(evt.target) && showWindow) {
            setShowWindow(false)
        }
    }
    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

    let envName: string = getEnvName(defaultClusterComponent, agentInstallationStage)

    const renderNoEnvironmentTab = () => {
        return (
            <div className="br-4 dashed dc__border flex bc-n50 pb-16 pt-16 m-16 fs-12 fw-4">
                <div className="dc__align-center">
                    <div className="fw-6">No Environments Added</div>
                    <div>This cluster doesn't have any environments yet</div>
                </div>
            </div>
        )
    }

    const showToggleConfirmation = (): void => {
        toggleConfirmation(true)
    }

    const showWindowModal = (): void => {
        setShowWindow(true)
    }

    const clusterDelete = (): void => {
        setDeleteEnv(false)
    }

    const addCluster = () => {
        setEnvironment({
            id: null,
            environment_name: null,
            cluster_id: clusterId,
            namespace: null,
            prometheus_url,
            isProduction: null,
            description: null,
        })
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

    const DisableEditMode = (): void => {
        toggleEditMode((t) => !t)
    }

    return (
        <>
            <article
                className={`cluster-list ${
                    clusterId ? 'cluster-list--update' : 'cluster-list--create collapsed-list collapsed-list--create'
                }`}
            >
                {!editMode ? (
                    <>
                        <List className="dc__border" key={clusterId} onClick={editModeToggle}>
                            {!clusterId && (
                                <List.Logo>
                                    <Add className="icon-dim-24 fcb-5 dc__vertical-align-middle" />
                                </List.Logo>
                            )}
                            <div className="flex left">
                                {clusterId ? (
                                    <ClusterIcon className="cluster-icon icon-dim-24 dc__vertical-align-middle mr-16" />
                                ) : null}
                                <List.Title
                                    title={cluster_name || 'Add cluster'}
                                    subtitle={server_url}
                                    className="fw-6"
                                />
                                {clusterId && (
                                    <div className="flex dc__align-right">
                                        <div
                                            className="flex mr-16"
                                            data-testid={`add-environment-button-${cluster_name}`}
                                            onClick={addCluster}
                                        >
                                            <List.Logo>
                                                <Add className="icon-dim-20 fcb-5 mr-8" />
                                            </List.Logo>
                                            <div className="fw-6 fs-13 cb-5">Add Environment</div>
                                        </div>
                                        <div className="dc__divider" />
                                    </div>
                                )}
                            </div>
                            {clusterId && (
                                <Tippy className="default-tt cursor" arrow={false} content="Edit Cluster">
                                    <div data-testid={`edit_cluster_pencil-${cluster_name}`}>
                                        <PencilEdit onClick={handleEdit} />
                                    </div>
                                </Tippy>
                            )}
                        </List>
                        {serverMode !== SERVER_MODE.EA_ONLY && !window._env_.K8S_CLIENT && clusterId ? (
                            <>
                                <ClusterInstallStatus
                                    agentInstallationStage={agentInstallationStage}
                                    envName={envName}
                                    onClick={clusterInstallStatusOnclick}
                                />
                            </>
                        ) : null}
                        {showClusterComponentModal ? (
                            <ClusterComponentModal
                                agentInstallationStage={agentInstallationStage}
                                components={defaultClusterComponent}
                                environmentName={envName}
                                callRetryClusterInstall={callRetryClusterInstall}
                                redirectToChartDeployment={redirectToChartDeployment}
                                close={(e) => {
                                    toggleClusterComponentModal(!showClusterComponentModal)
                                }}
                            />
                        ) : null}
                        {serverMode !== SERVER_MODE.EA_ONLY &&
                        !window._env_.K8S_CLIENT &&
                        Array.isArray(newEnvs) &&
                        newEnvs.length > 1 ? (
                            <div className="pb-8">
                                <div className="cluster-env-list_table fs-12 pt-6 pb-6 fw-6 flex left lh-20 pl-20 pr-20 dc__border-top dc__border-bottom-n1">
                                    <div></div>
                                    <div>{CONFIGURATION_TYPES.ENVIRONMENT}</div>
                                    <div>{CONFIGURATION_TYPES.NAMESPACE}</div>
                                    <div>{CONFIGURATION_TYPES.DESCRIPTION}</div>
                                    <div></div>
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
                                                    className="cluster-env-list_table dc__hover-n50 flex left lh-20 pt-12 pb-12 fs-13 fw-4 pl-20 pr-20 dc__visible-hover dc__visible-hover--parent"
                                                    key={id}
                                                    onClick={() =>
                                                        setEnvironment({
                                                            id,
                                                            environment_name,
                                                            cluster_id: clusterId,
                                                            namespace,
                                                            prometheus_url,
                                                            isProduction,
                                                            description,
                                                        })
                                                    }
                                                >
                                                    <span className="cursor flex w-100">
                                                        {environment_name && <Database className="icon-dim-20" />}
                                                    </span>

                                                    <div
                                                        className="dc__truncate-text flex left cb-5 cursor"
                                                        onClick={showWindowModal}
                                                        data-testid={`env-${environment_name}`}
                                                    >
                                                        {environment_name}

                                                        {isProduction && (
                                                            <div className="bc-n50 dc__border pr-6 pl-6 fs-12 h-20 ml-8 flex cn-7 br-4 ">
                                                                Prod
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="dc__truncate-text">{namespace}</div>
                                                    <div className="cluster-list__description dc__truncate-text">
                                                        {description}
                                                    </div>
                                                    <div className="dc__visible-hover--child">
                                                        <div className="flex">
                                                            <Tippy
                                                                className="default-tt cursor"
                                                                arrow={false}
                                                                content={'Edit Environment'}
                                                            >
                                                                <PencilEdit
                                                                    className="cursor icon-dim-20 mr-12"
                                                                    onClick={showWindowModal}
                                                                />
                                                            </Tippy>
                                                            {envDelete ? (
                                                                <Progressing size={20} />
                                                            ) : (
                                                                <Tippy
                                                                    className="default-tt cursor"
                                                                    arrow={false}
                                                                    content={'Delete Environment'}
                                                                >
                                                                    <DeleteEnvironment
                                                                        data-testid={`env-delete-button-${environment_name}`}
                                                                        className="icon-dim-20 cursor"
                                                                        onClick={showToggleConfirmation}
                                                                    />
                                                                </Tippy>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null,
                                    )}
                                {confirmation && (
                                    <DeleteComponent
                                        setDeleting={clusterDelete}
                                        deleteComponent={deleteEnvironment}
                                        payload={getEnvironmentPayload()}
                                        title={environment.environment_name}
                                        toggleConfirmation={toggleConfirmation}
                                        component={DeleteComponentsName.Environment}
                                        confirmationDialogDescription={DC_ENVIRONMENT_CONFIRMATION_MESSAGE}
                                        reload={reload}
                                    />
                                )}
                            </div>
                        ) : (
                            clusterId && renderNoEnvironmentTab()
                        )}
                    </>
                ) : (
                    <Drawer position="right" width="1000px" onEscape={DisableEditMode}>
                        <div className="h-100 bcn-0" ref={drawerRef}>
                            <ClusterForm
                                id={clusterId}
                                cluster_name={cluster_name}
                                server_url={server_url}
                                active={true}
                                config={{}}
                                reload={reload}
                                prometheus_url=""
                                prometheusAuth={state.prometheus}
                                defaultClusterComponent={state.defaultClusterComponent}
                                isGrafanaModuleInstalled={true}
                                isTlsConnection={isTlsConnection}
                                isClusterDetails={state.isClusterDetails}
                                toggleCheckTlsConnection={toggleCheckTlsConnection}
                                setTlsConnectionFalse={setTlsConnectionFalse}
                                toggleShowAddCluster={toggleShowAddCluster}
                                toggleKubeConfigFile={true}
                                isKubeConfigFile={state.isKubeConfigFile}
                                toggleEditMode={toggleEditMode}
                                toggleClusterDetails={true}
                            />
                        </div>
                    </Drawer>
                )}
            </article>
            {showWindow && (
                <Drawer position="right" width="800px" onEscape={hideClusterDrawer}>
                    <div className="h-100 bcn-0" ref={editLabelRef}>
                        <Environment
                            reload={reload}
                            cluster_name={cluster_name}
                            {...environment}
                            hideClusterDrawer={hideClusterDrawer}
                            isNamespaceMandatory={Array.isArray(environments) && environments.length > 0}
                        />
                    </div>
                </Drawer>
            )}
        </>
    )
}
