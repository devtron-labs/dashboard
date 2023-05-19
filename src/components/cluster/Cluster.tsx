import React, { useState, useMemo, Component, useRef, useEffect } from 'react'
// import { Pencil, useForm, CustomPassword, useAsync } from '../common'
import {
    showError,
    Progressing,
    ErrorScreenNotAuthorized,
    Reload,
    stopPropagation,
    CHECKBOX_VALUE,
    Drawer,
    sortCallback,
    Checkbox,
    RadioGroupItem,
    RadioGroup,
    EmptyState,
    InfoColourBar,
    Toggle,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ClusterIcon } from '../../assets/icons/ic-cluster.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as ErrorIcon } from '../../assets/icons/ic-warning.svg'
import YAML from 'yaml'
import {
    Pencil,
    useForm,
    CustomPassword,
    useAsync,
    DevtronSwitch as Switch,
    DevtronSwitchItem as SwitchItem,
    ButtonWithLoader,
    DropdownIcon,
    Info,
} from '../common'
// import { RadioGroup, RadioGroupItem } from '@devtron-labs/devtron-fe-common-lib'
import { List, CustomInput } from '../globalConfigurations/GlobalConfiguration'
import NoResults from '../../assets/img/empty-noresult@2x.png'
import {
    getClusterList,
    saveCluster,
    updateCluster,
    saveEnvironment,
    updateEnvironment,
    getEnvironmentList,
    getCluster,
    retryClusterInstall,
    deleteCluster,
    deleteEnvironment,
    validateCluster,
    saveClusters,
} from './cluster.service'
import { ResizableTextarea } from '../configMaps/ConfigMap'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Warning } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Database } from '../../assets/icons/ic-env.svg'
import { ReactComponent as PencilEdit } from '../../assets/icons/ic-pencil.svg'
import { ReactComponent as FormError } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as DeleteEnvironment } from '../../assets/icons/ic-delete-interactive.svg'
import { ClusterComponentModal } from './ClusterComponentModal'
import { ClusterInstallStatus } from './ClusterInstallStatus'
import { ReactComponent as ForwardArrow } from '../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as Exist } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as MechanicalOperation } from '../../assets/img/ic-mechanical-operation.svg'
import {
    POLLING_INTERVAL,
    ClusterListProps,
    AuthenticationType,
    DEFAULT_SECRET_PLACEHOLDER,
    DataListType,
    UserDetails,
    SaveClusterPayloadType,
    UserNameList,
} from './cluster.type'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'

import {
    DOCUMENTATION,
    SERVER_MODE,
    ViewType,
    URLS,
    ModuleNameMap,
    CLUSTER_COMMAND,
    CONFIGURATION_TYPES,
    AppCreationType,
    MODES,
} from '../../config'
import { getEnvName } from './cluster.util'
import DeleteComponent from '../../util/DeleteComponent'
import {
    DC_CLUSTER_CONFIRMATION_MESSAGE,
    DC_ENVIRONMENT_CONFIRMATION_MESSAGE,
    DeleteComponentsName,
} from '../../config/constantMessaging'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
// import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'
import ClusterInfoStepsModal from './ClusterInfoStepsModal'
import TippyHeadless from '@tippyjs/react/headless'
import CodeEditor from '../CodeEditor/CodeEditor'
import { UPLOAD_STATE } from '../CustomChart/types'
// import { request } from 'http'
// import { ConfigCluster, UserInfos, ClusterInfo, ClusterResult } from './cluster.type'
// import { error } from 'console'
// import cluster from 'cluster'
// import { getClusterEvents } from '../ClusterNodes/clusterNodes.service'
// import { json } from 'stream/consumers'
// import { stat } from 'fs'
// import { userInfo } from 'os'
// import ReactSelect from 'react-select/creatable'
// import { SELECT_TOKEN_STYLE } from '../ciPipeline/Webhook/webhook.utils'
import UserNameDropDownList from './UseNameListDropdown'
import Tippy from '@tippyjs/react/headless'

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
        }
        this.initialise = this.initialise.bind(this)
        this.toggleCheckTlsConnection = this.toggleCheckTlsConnection.bind(this)
        this.toggleShowAddCluster = this.toggleShowAddCluster.bind(this)
        this.toggleKubeConfigFile = this.toggleKubeConfigFile.bind(this)
        this.toggleBrowseFile = this.toggleBrowseFile.bind(this)
        this.toggleClusterDetails = this.toggleClusterDetails.bind(this)
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
        //updates defaultComponents and agentInstallationStatus
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

    toggleClusterDetails(updateClusterDetails: boolean) {
        this.setState({ isClusterDetails: updateClusterDetails })
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
                                reload={true}
                                prometheus_url=""
                                prometheusAuth={this.state.prometheus}
                                defaultClusterComponent={this.state.defaultClusterComponent}
                                isGrafanaModuleInstalled={true}
                                isTlsConnection={this.state.isTlsConnection}
                                isClusterDetails={this.state.isClusterDetails}
                                toggleCheckTlsConnection={this.toggleCheckTlsConnection}
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
    toggleCheckTlsConnection,
    toggleShowAddCluster,
    toggleKubeConfigFile,
    isKubeConfigFile,
    browseFile,
    toggleBrowseFile,
    toggleClusterDetails,
    isGrafanaModuleInstalled,
    insecureSkipTlsVerify,
    isClusterDetails,
}) {
    const [editMode, toggleEditMode] = useState(false)
    const [environment, setEnvironment] = useState(null)
    const [config, setConfig] = useState(defaultConfig)
    const [prometheusAuth, setPrometheusAuth] = useState(undefined)
    const [showClusterComponentModal, toggleClusterComponentModal] = useState(false)
    const [showWindow, setShowWindow] = useState(false)
    const [envDelete, setDeleteEnv] = useState(false)
    const [confirmation, toggleConfirmation] = useState(false)
    const [deleting, setDeleting] = useState(false)
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
        // console.log(state.cluster_name.value)
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

    const setPrometheusToggle = () => {
        setPrometheusToggleEnabled(!prometheusToggleEnabled)
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

    const handleOnFocus = (e): void => {
        if (e.target.value === DEFAULT_SECRET_PLACEHOLDER) {
            e.target.value = ''
        }
    }

    const handleOnBlur = (e): void => {
        if (id && id != 1 && !e.target.value) {
            e.target.value = DEFAULT_SECRET_PLACEHOLDER
        }
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

    const clusterTitle = () => {
        if (id) {
            return 'Edit Cluster'
        }
    }

    const EditCluster = () => {
        return (
            <form action="" className="cluster-form " onSubmit={handleOnSubmit}>
                <div className="flex left mb-20">
                    {id && <Pencil color="#363636" className="icon-dim-24 dc__vertical-align-middle mr-8" />}
                    <span className="fw-6 fs-14 cn-9">{clusterTitle()}</span>
                </div>
                <div className="form__row">
                    <CustomInput
                        autoComplete="off"
                        name="cluster_name"
                        disabled={isDefaultCluster()}
                        value={state.cluster_name.value}
                        error={state.cluster_name.error}
                        onChange={handleOnChange}
                        label="Name*"
                        placeholder="Cluster name"
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
                        placeholder="Enter server URL"
                    />
                </div>
                <div className="form__row form__row--bearer-token flex column left top">
                    <div className="bearer-token">
                        <ResizableTextarea
                            className="dc__resizable-textarea__with-max-height"
                            name="token"
                            value={config && config.bearer_token ? config.bearer_token : ''}
                            onChange={handleOnChange}
                            onBlur={handleOnBlur}
                            onFocus={handleOnFocus}
                            placeholder="Enter bearer token"
                        />
                    </div>
                    {state.token.error && (
                        <label htmlFor="" className="form__error">
                            <FormError className="form__icon form__icon--error" />
                            {state.token.error}
                        </label>
                    )}
                </div>
                {isGrafanaModuleInstalled && (
                    <>
                        <hr />
                        <div
                            className={`${
                                prometheusToggleEnabled ? 'mb-20' : prometheus_url ? 'mb-20' : 'mb-40'
                            } mt-20`}
                        >
                            <div className="dc__content-space flex">
                                <span className="form__input-header">See metrics for applications in this cluster</span>
                                <div className="" style={{ width: '32px', height: '20px' }}>
                                    <Toggle selected={prometheusToggleEnabled} onSelect={setPrometheusToggle} />
                                </div>
                            </div>
                            <span className="cn-6 fs-12">
                                Configure prometheus to see metrics like CPU, RAM, Throughput etc. for applications
                                running in this cluster
                            </span>
                        </div>
                    </>
                )}
                {isGrafanaModuleInstalled && !prometheusToggleEnabled && prometheus_url && <PrometheusWarningInfo />}
                {isGrafanaModuleInstalled && prometheusToggleEnabled && (
                    <div className="">
                        {(state.userName.error || state.password.error || state.endpoint.error) && (
                            <PrometheusRequiredFieldInfo />
                        )}
                        <div className="form__row">
                            <CustomInput
                                autoComplete="off"
                                name="endpoint"
                                value={state.endpoint.value}
                                error={state.endpoint.error}
                                onChange={handleOnChange}
                                label="Prometheus endpoint*"
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
                                <div className="w-50 mr-8">
                                    <CustomInput
                                        name="userName"
                                        value={state.userName.value}
                                        error={state.userName.error}
                                        onChange={handleOnChange}
                                        label="Username*"
                                    />
                                </div>
                                <div className="w-50 ml-8">
                                    <CustomPassword
                                        name="password"
                                        value={state.password.value}
                                        error={state.userName.error}
                                        onChange={handleOnChange}
                                        label="Password*"
                                    />
                                </div>
                            </div>
                        ) : null}
                        <div className="form__row">
                            <span className="form__label">TLS Key</span>
                            <ResizableTextarea
                                className="dc__resizable-textarea__with-max-height w-100"
                                name="tlsClientKey"
                                value={state.tlsClientKey.value}
                                onChange={handleOnChange}
                            />
                        </div>
                        <div className="form__row">
                            <span className="form__label">TLS Certificate</span>
                            <ResizableTextarea
                                className="dc__resizable-textarea__with-max-height w-100"
                                name="tlsClientCert"
                                value={state.tlsClientCert.value}
                                onChange={handleOnChange}
                            />
                        </div>
                    </div>
                )}
                <div className={`form__buttons`}>
                    {id && (
                        <button
                            style={{ margin: 'auto', marginLeft: 0 }}
                            className="flex cta override-button delete scr-5 h-32"
                            type="button"
                            onClick={() => toggleConfirmation(true)}
                        >
                            {deleting ? <Progressing /> : 'Delete'}
                        </button>
                    )}
                    <button className="cta cancel" type="button" onClick={(e) => toggleEditMode((t) => !t)}>
                        Cancel
                    </button>
                    <button className="cta">{loading ? <Progressing /> : 'Save cluster'}</button>
                </div>
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
            </form>
        )
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
                                    <PencilEdit onClick={handleEdit} />
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
                    <>
                        {/* <ClusterForm
                            {...{
                                id: clusterId,
                                cluster_name,
                                server_url,
                                active,
                                config,
                                toggleEditMode,
                                reload,
                                prometheus_url,
                                isTlsConnection,
                                toggleCheckTlsConnection,
                                prometheusAuth,
                                defaultClusterComponent,
                                toggleShowAddCluster,
                                toggleKubeConfigFile,
                                isKubeConfigFile,
                                browseFile,
                                toggleBrowseFile,
                                toggleClusterDetails,
                                isClusterDetails,
                                isGrafanaModuleInstalled:
                                    grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED,
                            }}
                        /> */}
                        <EditCluster />
                    </>
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

function ClusterForm({
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
    toggleShowAddCluster,
    toggleKubeConfigFile,
    isKubeConfigFile,
    isClusterDetails,
    toggleClusterDetails,
}) {
    const [loading, setLoading] = useState(false)
    const [prometheusToggleEnabled, setPrometheusToggleEnabled] = useState(prometheus_url ? true : false)
    const [prometheusAuthenticationType, setPrometheusAuthenticationType] = useState({
        type: prometheusAuth && prometheusAuth.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS,
    })
    let authenTicationType =
        prometheusAuth && prometheusAuth.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS

    const isDefaultCluster = (): boolean => {
        return id == 1
    }
    const [deleting, setDeleting] = useState(false)
    const [confirmation, toggleConfirmation] = useState(false)
    const inputFileRef = useRef(null)
    const [uploadState, setUploadState] = useState<string>(UPLOAD_STATE.UPLOAD)
    const [saveYamlData, setSaveYamlData] = useState<string>('')
    const [dataList, setDataList] = useState<DataListType[]>([])
    const [saveClusterList, setSaveClusterList] = useState<{ clusterName: string; status: string; message: string }[]>(
        [],
    )
    const [selectedClusterName, setSelectedClusterNameOptions] = useState<{ clusterNname: string; state: boolean }>()
    const [loader, setLoadingState] = useState<boolean>(false)
    const [selectedUserNameOptions, setSelectedUserNameOptions] = useState<Record<string, any>>({})
    const [isClusterSelected, setClusterSeleceted] = useState<Record<string, boolean>>({})
    const [selectAll, setSelectAll] = useState<boolean>(false)
    const [getClusterVar, setGetClusterState] = useState<boolean>(false)
    const [disableState, setDisableState] = useState<boolean>(false)
    // const [selectedClusterState, setSelectedClusterState] = useState<boolean>(false)
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

    const toggleGetCluster = () => {
        setGetClusterState(!getClusterVar)
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

    const otherResponses = (responseKey: string): boolean => {
        const listOfResponses = [
            'cluster_name',
            'server_url',
            'active',
            'defaultClusterComponent',
            'agentInstallationStage',
            'k8sVersion',
            'userName',
            'insecureSkipTlsVerify',
            'errorInConnecting',
            'isCdArgoSetup',
        ]
        for (var responses in listOfResponses) {
            if (responseKey === responses) return false
        }
        return true
    }

    function YAMLtoJSON(saveYamlData) {
        try {
            var obj = YAML.parse(saveYamlData)
            var jsonStr = JSON.stringify(obj)
            return jsonStr
        } catch (error) {
            showError(error)
        }
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
            })
        } catch (err) {
            setLoadingState(false)
            showError(err)
        }
    }

    const handleOnFocus = (e): void => {
        if (e.target.value === DEFAULT_SECRET_PLACEHOLDER) {
            e.target.value = ''
        }
    }

    const handleOnBlur = (e): void => {
        if (id && id != 1 && !e.target.value) {
            e.target.value = DEFAULT_SECRET_PLACEHOLDER
        }
    }

    const getClusterPayload = () => {
        // console.log(state.cluster_name.value)
        return {
            id,
            insecureSkipTlsVerify : !isTlsConnection,
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
        if (isKubeConfigFile) {
            toggleKubeConfigFile(!isKubeConfigFile)
        }
        if (getClusterVar) {
            toggleGetCluster()
        }
        if (isClusterDetails) {
            toggleClusterDetails(!isClusterDetails)
        }
        toggleShowAddCluster()
        setLoadingState(false)
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
                        placeholder="Enter server URL"
                        dataTestid="enter_server_url_input"
                    />
                </div>
                <div className="form__row form__row--bearer-token flex column left top">
                    <div className="bearer-token">
                        <ResizableTextarea
                            className="dc__resizable-textarea__with-max-height dc__required-field"
                            name="token"
                            value={config && config.bearer_token ? config.bearer_token : ''}
                            onChange={handleOnChange}
                            onBlur={handleOnBlur}
                            onFocus={handleOnFocus}
                            placeholder="Enter bearer token"
                            dataTestId="enter_bearer_token_input"
                        />
                    </div>
                    {state.token.error && (
                        <label htmlFor="" className="form__error">
                            <FormError className="form__icon form__icon--error" />
                            {state.token.error}
                        </label>
                    )}
                </div>
                {isGrafanaModuleInstalled && (
                    <>
                        <hr />
                        <div className="dc__position-rel flex left cursor dc__hover mb-20">
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

                        {isTlsConnection && (
                            <>
                                <div className="form__row">
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
                                        value={state.certificateAuthorityData.value}
                                        onChange={handleOnChange}
                                        placeholder={'Enter CA Data'}
                                    />
                                </div>
                                <div className="form__row">
                                    <span data-testid="tls_client_key" className="form__label dc__required-field">
                                        TLS Key
                                    </span>
                                    <ResizableTextarea
                                        dataTestId="tls_client_key_input"
                                        className="dc__resizable-textarea__with-max-height w-100"
                                        name="tlsClientKey"
                                        value={state.tlsClientKey.value}
                                        onChange={handleOnChange}
                                        placeholder={'Enter tls Key'}
                                    />
                                </div>
                                <div className="form__row">
                                    <span data-testid="tls_certificate" className="form__label dc__required-field">
                                        TLS Certificate
                                    </span>
                                    <ResizableTextarea
                                        dataTestId="tls_certificate_input"
                                        className="dc__resizable-textarea__with-max-height w-100"
                                        name="tlsClientCert"
                                        value={state.tlsClientCert.value}
                                        onChange={handleOnChange}
                                        placeholder={'Enter tls Certificate'}
                                    />
                                </div>
                            </>
                        )}
                        <hr />
                        <div
                            className={`${
                                prometheusToggleEnabled ? 'mb-20' : prometheus_url ? 'mb-20' : 'mb-40'
                            } mt-20`}
                        >
                            <div className="dc__content-space flex">
                                <span className="form__input-header">See metrics for applications in this cluster</span>
                                <div className="" style={{ width: '32px', height: '20px' }}>
                                    <Toggle selected={prometheusToggleEnabled} onSelect={setPrometheusToggle} />
                                </div>
                            </div>
                            <span className="cn-6 fs-12">
                                Configure prometheus to see metrics like CPU, RAM, Throughput etc. for applications
                                running in this cluster
                            </span>
                        </div>
                    </>
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
                <div className={`form__buttons`}>
                    {id && (
                        <button
                            style={{ margin: 'auto', marginLeft: 0 }}
                            className="flex cta override-button delete scr-5 h-32"
                            type="button"
                            onClick={() => toggleConfirmation(true)}
                        >
                            {deleting ? <Progressing /> : 'Delete'}
                        </button>
                    )}
                </div>
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
                        height={514}
                        diffView={false}
                        onChange={onChangeEditorValue}
                        mode={MODES.YAML}
                    >
                        <CodeEditor.Header>
                            <div className="user-list__subtitle flex p-8">
                                <span className="flex left">Paste the contents of kubeconfig file here</span>
                                <div className="dc__link ml-auto cursor">
                                    {uploadState !== UPLOAD_STATE.UPLOADING && (
                                        <div
                                            data-testid="browse_file_to_upload"
                                            onClick={handleBrowseFileClick}
                                            className="flex"
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
                            <CodeEditor.ValidationError />
                        </CodeEditor.Header>
                    </CodeEditor>
                </div>
                <div className="w-100 dc__border-top flex right pb-8 pt-8 dc__position-fixed dc__position-abs dc__bottom-0">
                    <button
                        data-testid="cancel_kubeconfig_button"
                        className="cta cancel"
                        type="button"
                        onClick={handleCloseButton}
                    >
                        Cancel
                    </button>

                    <button
                        className="cta mr-32 ml-20 "
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
                <div className="w-100 dc__border-top flex right pb-8 pt-8 dc__position-fixed dc__position-abs dc__bottom-0">
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
                    <h2 className="fs-16 fw-4 c-9">No matching results</h2>
                </EmptyState.Title>
                <EmptyState.Subtitle>We couldn't find any matching cluster</EmptyState.Subtitle>
            </EmptyState>
        )
    }

    if (loader) {
        return <LoadingCluster />
    }

    const editKubeConfigState = () => {
        toggleGetCluster()
        setUploadState(UPLOAD_STATE.UPLOAD)
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
                                        <div className="flexbox">
                                            <span className="dc__ellipsis-right">{clusterListDetail.clusterName}</span>
                                        </div>
                                        <div className="flexbox dc__align-items-center">
                                            <div
                                                data-testid="status_icon_visibility"
                                                className={`dc__app-summary__icon icon-dim-16 mr-2 ${
                                                    clusterListDetail.status === 'Failed' ? 'failed' : 'succeeded'
                                                }`}
                                            ></div>
                                            <div className="dc__ellipsis-right"> {clusterListDetail.status} </div>
                                        </div>
                                        <div className="dc__ellipsis-right"> {clusterListDetail.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="w-100 dc__border-top flex right pb-8 pt-8 dc__position-fixed dc__position-abs dc__bottom-0">
                        <button
                            className="ml-20 dc_edit_button cb-5"
                            type="button"
                            onClick={toggleGetCluster}
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

        // Show checked states (checked | intermediate) for cluster selection parent checkbox if any of the value is selected
        if (Object.values(_currentSelections).some((selected) => selected)) {
            setSelectAll(true)
        } else {
            setSelectAll(false)
        }
    }

    function toggleSelectAll(event) {
        const currentSelections = { ...isClusterSelected }
        const _selectAll = event.currentTarget.checked

        Object.keys(currentSelections).forEach((selection) => {
            if (
                selectedUserNameOptions[selection].errorInConnecting !== 'cluster-already-exists' &&
                selectedUserNameOptions[selection].errorInConnecting.length > 0
            ) {
                // Skip disabled checkboxes
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

        return CHECKBOX_VALUE.INTERMEDIATE
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
                        <InfoColourBar
                            message={`${validCluster()} valid cluster. Select the cluster you want to Add/Update`}
                            classname="info_bar cn-9 mb-20 lh-20"
                            Icon={Info}
                            iconClass="icon-dim-18"
                        />
                        <div className="api-token__list en-2 bw-1 bcn-0 br-8">
                            <div className="cluster-list-row-1 cluster-env-list_table fs-12 pt-6 pb-6 fw-6 flex left lh-20 pl-20 pr-20 dc__border-top">
                                <div data-testid="select_all_cluster_checkbox">
                                    <Checkbox
                                        rootClassName="form__checkbox-label--ignore-cache mb-0 flex"
                                        onChange={toggleSelectAll}
                                        isChecked={selectAll}
                                        value={getAllClustersCheckBoxValue()}
                                    />
                                </div>
                                <div>CLUSTER</div>
                                <div>USER</div>
                                <div>MESSAGE</div>
                                <div></div>
                            </div>
                            <div className="dc__overflow-scroll" style={{ height: 'calc(100vh - 219px)' }}>
                                {!dataList || dataList.length === 0 ? (
                                    <NoMatchingResults />
                                ) : (
                                    dataList.map((clusterDetail, index) => (
                                        <div
                                            key={`api_${index}`}
                                            className="cluster-list-row-1 flex-align-center fw-4 cn-9 fs-13 pr-20 pl-20"
                                            style={{ height: '40px' }}
                                        >
                                            <Checkbox
                                                key={`app-$${index}`}
                                                dataTestId={`checkbox_selection_of_cluster-${clusterDetail.cluster_name}`}
                                                rootClassName="form__checkbox-label--ignore-cache mb-0 flex"
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
                                            <div className="flexbox">
                                                <span className="dc__ellipsis-right">{clusterDetail.cluster_name}</span>
                                            </div>
                                            <UserNameDropDownList
                                                clusterDetail={clusterDetail}
                                                selectedUserNameOptions={selectedUserNameOptions}
                                                onChangeUserName={onChangeUserName}
                                            />
                                            {selectedUserNameOptions[clusterDetail.cluster_name].errorInConnecting ===
                                            'cluster-already-exists' ? (
                                                <ErrorIcon className="dc__app-summary__icon icon-dim-16 mr-2" />
                                            ) : (
                                                <div
                                                    className={`dc__app-summary__icon icon-dim-16 mr-2 ${
                                                        selectedUserNameOptions[clusterDetail.cluster_name]
                                                            .errorInConnecting.length !== 0 &&
                                                        selectedUserNameOptions[clusterDetail.cluster_name]
                                                            .errorInConnecting !== 'cluster-already-exists'
                                                            ? 'failed'
                                                            : 'succeeded'
                                                    }`}
                                                ></div>
                                            )}
                                            <div className="flexbox">
                                                <span className="dc__ellipsis-right">
                                                    {' '}
                                                    {selectedUserNameOptions[clusterDetail.cluster_name]
                                                        ?.errorInConnecting === 'cluster-already-exists'
                                                        ? 'Cluster already exists. Cluster will be updated.'
                                                        : selectedUserNameOptions[clusterDetail.cluster_name]
                                                              ?.errorInConnecting || 'No error'}{' '}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {isKubeConfigFile && (
                    <div className="w-100 dc__border-top flex right pb-8 pt-8 dc__position-fixed dc__position-abs dc__bottom-0">
                        <button
                            className="ml-20 dc_edit_button cb-5"
                            type="button"
                            onClick={toggleGetCluster}
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
                            className="cta mr-32 ml-20"
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

    const AddClusterHeader = () => {
        return (
            <div className="flex flex-align-center dc__border-bottom flex-justify bcn-0 pb-12 pt-12 mb-20 pl-20 ">
                <h2 data-testid="add_cluster_header" className="fs-16 fw-6 lh-1-43 m-0 title-padding">
                    Add Cluster
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

    const saveClusterCall = () => {
        onValidation()
        toggleShowAddCluster()
    }

    return getClusterVar ? (
        displayClusterDetails()
    ) : (
        <>
            <div
                className="cluster-form dc__position-rel h-100 bcn-0"
                style={{ padding: 'auto 0' }}
                onSubmit={handleOnSubmit}
            >
                <AddClusterHeader />
                <div className="pl-20 pr-20" style={{ overflow: 'auto', height: 'calc(100vh - 169px)' }}>
                    <div className="form__row clone-apps dc__inline-block pd-0 pt-0 pb-12">
                        <RadioGroup
                            className="radio-group-no-border"
                            value={isKubeConfigFile ? 'EXISTING' : 'BLANK'}
                            name="trigger-type"
                            onChange={() => toggleKubeConfigFile(!isKubeConfigFile)}
                        >
                            <RadioGroupItem value={AppCreationType.Blank}>Use Server URL & Bearer token</RadioGroupItem>
                            <RadioGroupItem
                                dataTestId="add_cluster_from_kubeconfig_file"
                                value={AppCreationType.Existing}
                            >
                                From kubeconfig
                            </RadioGroupItem>
                        </RadioGroup>
                    </div>

                    {isKubeConfigFile ? codeEditor() : renderUrlAndBearerToken()}
                </div>

                {!isKubeConfigFile && (
                    <div className="w-100 dc__border-top flex right pb-8 pt-8 dc__position-fixed dc__position-abs dc__bottom-0">
                        <button
                            data-testid="cancel_button"
                            className="cta cancel"
                            type="button"
                            onClick={toggleShowAddCluster}
                        >
                            Cancel
                        </button>
                        <button
                            data-testid="save_cluster_after_entering_cluster_details"
                            className="cta mr-20 ml-20"
                            onClick={() => saveClusterCall()}
                        >
                            {'Save cluster'}
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

function Environment({
    environment_name,
    namespace,
    id,
    cluster_id,
    prometheus_endpoint,
    isProduction,
    description,
    isNamespaceMandatory = true,
    reload,
    hideClusterDrawer,
}) {
    const [loading, setLoading] = useState(false)
    const [ignore, setIngore] = useState(false)
    const [ignoreError, setIngoreError] = useState('')
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            environment_name: { value: environment_name, error: '' },
            namespace: { value: namespace, error: '' },
            isProduction: { value: isProduction ? 'true' : 'false', error: '' },
            description: { value: description, error: '' },
        },
        {
            environment_name: {
                required: true,
                validators: [
                    { error: 'Environment name is required', regex: /^.*$/ },
                    { error: "Use only lowercase alphanumeric characters or '-'", regex: /^[a-z0-9-]+$/ },
                    { error: "Cannot start/end with '-'", regex: /^(?![-]).*[^-]$/ },
                    { error: 'Minimum 1 and Maximum 16 characters required', regex: /^.{1,16}$/ },
                ],
            },
            namespace: {
                required: isNamespaceMandatory,
                validators: [
                    { error: 'Namespace is required', regex: /^.*$/ },
                    { error: "Use only lowercase alphanumeric characters or '-'", regex: /^[a-z0-9-]+$/ },
                    { error: "Cannot start/end with '-'", regex: /^(?![-]).*[^-]$/ },
                    { error: 'Maximum 63 characters required', regex: /^.{1,63}$/ },
                ],
            },
            isProduction: {
                required: true,
                validator: { error: 'token is required', regex: /[^]+/ },
            },
            description: {
                required: false,
                validators: [{ error: 'Maximum 40 characters required', regex: /^.{0,40}$/ }],
            },
        },
        onValidation,
    )
    const [deleting, setDeleting] = useState(false)
    const [confirmation, toggleConfirmation] = useState<boolean>(false)

    const getEnvironmentPayload = () => {
        return {
            id,
            environment_name: state.environment_name.value,
            cluster_id,
            prometheus_endpoint,
            namespace: state.namespace.value || '',
            active: true,
            default: state.isProduction.value === 'true',
            description: state.description.value || '',
        }
    }
    async function onValidation() {
        if (!state.namespace.value && !ignore) {
            setIngoreError('Enter a namespace or select ignore namespace')
            return
        }
        let payload = getEnvironmentPayload()

        const api = id ? updateEnvironment : saveEnvironment
        try {
            setLoading(true)
            await api(payload, id)
            toast.success(`Successfully ${id ? 'updated' : 'saved'}`)
            reload()
            hideClusterDrawer()
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    const clusterDelete = (): void => {
        setDeleting(true)
    }

    const deleteEnv = (): void => {
        hideClusterDrawer()
        reload()
    }

    return (
        <div>
            <div className="bcn-0">
                <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pt-12 pr-20 pb-12">
                    <div className="fs-16 fw-6 lh-1-43 ml-20">{id ? 'Edit Environment' : 'Add Environment'}</div>
                    <button type="button" className="dc__transparent flex icon-dim-24" onClick={hideClusterDrawer}>
                        <Close className="icon-dim-24 dc__align-right cursor" />
                    </button>
                </div>
            </div>
            <div onClick={stopPropagation}>
                <div className="dc__overflow-scroll p-20">
                    <div className="mb-16">
                        <CustomInput
                            dataTestid="environment-name"
                            labelClassName="dc__required-field"
                            autoComplete="off"
                            disabled={!!environment_name}
                            name="environment_name"
                            placeholder={id ? 'sample-env-name' : 'Eg. production'}
                            value={state.environment_name.value}
                            error={state.environment_name.error}
                            onChange={handleOnChange}
                            label="Environment Name"
                        />
                    </div>
                    <div className="mb-16">
                        <CustomInput
                            dataTestid="enter-namespace"
                            labelClassName="dc__required-field"
                            disabled={!!namespace}
                            name="namespace"
                            placeholder={id ? 'sample-namespace' : 'Eg. prod'}
                            value={state.namespace.value}
                            error={state.namespace.error}
                            onChange={handleOnChange}
                            label="Namespace"
                        />
                    </div>
                    <div className="mb-16 flex left">
                        <label className="pr-16 flex cursor">
                            <input
                                data-testid="production"
                                type="radio"
                                name="isProduction"
                                checked={state.isProduction.value === 'true'}
                                value="true"
                                onChange={handleOnChange}
                            />
                            <span className="ml-10 fw-4 mt-4 fs-13">Production</span>
                        </label>
                        <label className="flex cursor">
                            <input
                                data-testid="nonProduction"
                                type="radio"
                                name="isNonProduction"
                                checked={state.isProduction.value === 'false'}
                                value="false"
                                onChange={handleOnChange}
                            />
                            <span className="ml-10 fw-4 mt-4 fs-13">Non - Production</span>
                        </label>
                    </div>
                    <div className="mb-16">
                        <CustomInput
                            autoComplete="off"
                            name="description"
                            placeholder={'Add a description for this environment'}
                            value={state.description.value}
                            error={state.description.error}
                            onChange={handleOnChange}
                            label="Description (Maximum 40 characters allowed)"
                        />
                    </div>
                </div>
                <div className="w-100 dc__border-top flex right pb-8 pt-8 dc__position-fixed dc__position-abs dc__bottom-0 bcn-0">
                    {id && (
                        <button
                            className="cta flex override-button delete scr-5 h-36 ml-20 cluster-delete-icon"
                            type="button"
                            onClick={() => toggleConfirmation(true)}
                        >
                            <DeleteEnvironment className="icon-dim-16 mr-8" />
                            {deleting ? <Progressing /> : 'Delete'}
                        </button>
                    )}
                    <button className="cta cancel flex mt-8 mb-8 h-36" type="button" onClick={hideClusterDrawer}>
                        Cancel
                    </button>
                    <button
                        className="cta ml-8 flex mr-20 mt-8 mb-8 h-36"
                        type="submit"
                        disabled={loading}
                        onClick={handleOnSubmit}
                        data-testid="save-and-update-environment"
                    >
                        {loading ? <Progressing /> : id ? 'Update' : 'Save'}
                    </button>
                </div>

                {confirmation && (
                    <DeleteComponent
                        setDeleting={clusterDelete}
                        deleteComponent={deleteEnvironment}
                        payload={getEnvironmentPayload()}
                        title={state.environment_name.value}
                        toggleConfirmation={toggleConfirmation}
                        component={DeleteComponentsName.Environment}
                        confirmationDialogDescription={DC_ENVIRONMENT_CONFIRMATION_MESSAGE}
                        closeCustomComponent={deleteEnv}
                        reload={deleteEnv}
                    />
                )}
            </div>
        </div>
    )
}
