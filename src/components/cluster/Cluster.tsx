import React, { useState, useMemo, Component } from 'react'
import { Pencil, useForm, CustomPassword, Toggle, useAsync } from '../common'
import {
    showError,
    Progressing,
    VisibleModal,
    sortCallback,
    ErrorScreenNotAuthorized,
    Reload,
    RadioGroup,
    RadioGroupItem,
} from '@devtron-labs/devtron-fe-common-lib'
import { List, CustomInput } from '../globalConfigurations/GlobalConfiguration'
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
} from './cluster.service'
import { ResizableTextarea } from '../configMaps/ConfigMap'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Warning } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Database } from '../../assets/icons/ic-env.svg'
import { ReactComponent as ClusterIcon } from '../../assets/icons/ic-cluster.svg'
import { ReactComponent as FormError } from '../../assets/icons/ic-warning.svg'
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg'
import { ClusterComponentModal } from './ClusterComponentModal'
import { ClusterInstallStatus } from './ClusterInstallStatus'
import { POLLING_INTERVAL, ClusterListProps, AuthenticationType, DEFAULT_SECRET_PLACEHOLDER } from './cluster.type'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import { DOCUMENTATION, SERVER_MODE, ViewType, URLS, ModuleNameMap, CLUSTER_COMMAND } from '../../config'
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
import Tippy from '@tippyjs/react'
import ClusterInfoStepsModal from './ClusterInfoStepsModal'
import TippyHeadless from '@tippyjs/react/headless'

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
        }
        this.initialise = this.initialise.bind(this)
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
            (this.props.serverMode === SERVER_MODE.EA_ONLY || window._env_.K8S_CLIENT) ? { result: undefined } : getEnvironmentList(),
        ])
            .then(([clusterRes, envResponse]) => {
                let environments = envResponse.result || []
                const clusterEnvMap = environments.reduce((agg, curr, idx) => {
                    agg[curr.cluster_id] = agg[curr.cluster_id] || []
                    agg[curr.cluster_id].push(curr)
                    return agg
                }, {})
                let clusters = clusterRes.result || []
                clusters = clusters.concat({
                    id: null,
                    cluster_name: '',
                    server_url: '',
                    active: true,
                    config: {},
                    environments: [],
                })
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

    render() {
        if (!this.props.isSuperAdmin) {
            return <ErrorScreenNotAuthorized />
        }
        else if (this.state.view === ViewType.LOADING) return <Progressing pageLoader />
        else if (this.state.view === ViewType.ERROR) return <Reload className="dc__align-reload-center" />
        else {
            const moduleBasedTitle =
                'Clusters' +
                (this.props.serverMode === SERVER_MODE.EA_ONLY || window._env_.K8S_CLIENT
                    ? ''
                    : ' and Environments')
            return (
                <section className="mt-16 mb-16 ml-20 mr-20 global-configuration__component flex-1">
                    <h2 className="form__title">{moduleBasedTitle}</h2>
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
                        />
                    ))}
                </section>
            )
        }
    }
}

function Cluster({
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
}) {
    const [editMode, toggleEditMode] = useState(false)
    const [environment, setEnvironment] = useState(null)
    const [config, setConfig] = useState(defaultConfig)
    const [prometheusAuth, setPrometheusAuth] = useState(undefined)
    const [showClusterComponentModal, toggleClusterComponentModal] = useState(false)
    const [, grafanaModuleStatus] = useAsync(
        () => getModuleInfo(ModuleNameMap.GRAFANA),
        [clusterId],
        !window._env_.K8S_CLIENT,
    )
    const history = useHistory()
    const newEnvs = useMemo(() => {
        let namespacesInAll = true
        if (Array.isArray(environments)) {
            namespacesInAll = !environments.some((env) => !env.namespace)
        }
        return namespacesInAll && clusterId ? [{ id: null }].concat(environments || []) : environments || []
    }, [environments])

    function handleClose(isReload): void {
        setEnvironment(null)
        if (isReload) reload()
    }

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

    let envName: string = getEnvName(defaultClusterComponent, agentInstallationStage)

    return (
        <>
            <article
                className={`cluster-list ${
                    clusterId ? 'cluster-list--update' : 'cluster-list--create collapsed-list collapsed-list--create'
                }`}
            >
                {!editMode ? (
                    <>
                        <List key={clusterId} onClick={clusterId ? () => {} : (e) => toggleEditMode((t) => !t)}>
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
                            </div>
                            {clusterId && <List.DropDown src={<Pencil color="#b1b7bc" onClick={handleEdit} />} />}
                        </List>
                        {serverMode !== SERVER_MODE.EA_ONLY && !window._env_.K8S_CLIENT && clusterId ? (
                            <>
                                <hr className="mt-0 mb-0" />
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
                            newEnvs.length > 0 && (
                                <div className="environments-container">
                                    {newEnvs.map(
                                        ({
                                            id,
                                            environment_name,
                                            cluster_id,
                                            cluster_name,
                                            active,
                                            prometheus_url,
                                            namespace,
                                            default: isProduction,
                                        }) => (
                                            <List
                                                onClick={(e) =>
                                                    setEnvironment({
                                                        id,
                                                        environment_name,
                                                        cluster_id: clusterId,
                                                        namespace,
                                                        prometheus_url,
                                                        isProduction,
                                                    })
                                                }
                                                key={id}
                                                className={`cluster-environment cluster-environment--${
                                                    id ? 'update' : 'create collapsed-list collapsed-list--create'
                                                }`}
                                            >
                                                <List.Logo>
                                                    {id ? (
                                                        <Database className="icon-dim-24" />
                                                    ) : (
                                                        <Add className="icon-dim-24 fcb-5" />
                                                    )}
                                                </List.Logo>
                                                <div className="flex left">
                                                    <List.Title
                                                        title={environment_name || 'Add environment'}
                                                        subtitle={id ? `namespace: ${namespace}` : ''}
                                                        tag={isProduction ? 'PROD' : null}
                                                    />
                                                </div>
                                            </List>
                                        ),
                                    )}
                                </div>
                            )}
                    </>
                ) : (
                    <>
                        <ClusterForm
                            {...{
                                id: clusterId,
                                cluster_name,
                                server_url,
                                active,
                                config,
                                toggleEditMode,
                                reload,
                                prometheus_url,
                                prometheusAuth,
                                defaultClusterComponent,
                                isGrafanaModuleInstalled:
                                    grafanaModuleStatus?.result?.status === ModuleStatus.INSTALLED,
                            }}
                        />
                    </>
                )}
            </article>
            {environment && (
                <Environment
                    reload={reload}
                    cluster_name={cluster_name}
                    {...environment}
                    handleClose={handleClose}
                />
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
    isGrafanaModuleInstalled
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

    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            cluster_name: { value: cluster_name, error: '' },
            url: { value: server_url, error: '' },
            userName: { value: prometheusAuth?.userName, error: '' },
            password: { value: prometheusAuth?.password, error: '' },
            tlsClientKey: { value: prometheusAuth?.tlsClientKey, error: '' },
            tlsClientCert: { value: prometheusAuth?.tlsClientCert, error: '' },
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
            token: isDefaultCluster() || id
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
        }
    }

    async function onValidation() {
        let payload = getClusterPayload()
        const urlValue = state.url.value.trim()
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
        if ((state.tlsClientKey.value || state.tlsClientCert.value) && prometheusToggleEnabled) {
            let isValid = state.tlsClientKey.value?.length && state.tlsClientCert.value?.length
            if (!isValid) {
                toast.error('Please add both TLS Key and Certificate')
                return
            } else {
                payload.prometheusAuth['tlsClientKey'] = state.tlsClientKey.value || ''
                payload.prometheusAuth['tlsClientCert'] = state.tlsClientCert.value || ''
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

    const clusterTitle = () => {
        if (!id) {
            return 'Add cluster'
        } else {
            return 'Edit cluster'
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
                            render={() =>
                                <ClusterInfoStepsModal
                                    subTitle={cluster.title}
                                    command={cluster.command}
                                    clusterName={cluster.clusterName}
                                />
                            }
                            maxWidth="468px"
                        >
                            <span className="ml-4 mr-2 cb-5 cursor">{cluster.heading}</span>
                        </TippyHeadless>
                        {key !== k8sClusters.length -1 && <span className="cn-2">|</span>}
                    </>
                ))}
            </>
        )
    }

    const clusterLabel = () => {
        return (
            <div className="flex left">
                Server URL* & Bearer token{isDefaultCluster() ? '' : '*'}
                <span className="icon-dim-16 fcn-9 mr-4 ml-16">
                    <Question className="icon-dim-16" />
                </span>
                <span>How to find for </span>
                <ClusterInfoComponent />
            </div>
        )
    }

    return (
        <form action="" className="cluster-form" onSubmit={handleOnSubmit}>
            <div className="flex left mb-20">
                {id && (
                    <Pencil color="#363636" className="icon-dim-24 dc__vertical-align-middle mr-8" />
                )}
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
                    <hr/>
                    <div className={`${prometheusToggleEnabled ? 'mb-20' : prometheus_url ? 'mb-20' : 'mb-40'} mt-20`}>
                        <div className="dc__content-space flex">
                            <span className="form__input-header">See metrics for applications in this cluster</span>
                            <div className="" style={{ width: '32px', height: '20px' }}>
                                <Toggle selected={prometheusToggleEnabled} onSelect={setPrometheusToggle} />
                            </div>
                        </div>
                        <span className="cn-6 fs-12">
                            Configure prometheus to see metrics like CPU, RAM, Throughput etc. for applications running
                            in this cluster
                        </span>
                    </div>
                </>
            )}
            {isGrafanaModuleInstalled && !prometheusToggleEnabled && prometheus_url && (
                <PrometheusWarningInfo />
            )}
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
                        className="cta delete"
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

function Environment({
    cluster_name,
    environment_name,
    namespace,
    id,
    cluster_id,
    handleClose,
    prometheus_endpoint,
    isProduction,
    reload,
}) {
    const [loading, setLoading] = useState(false)
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            environment_name: { value: environment_name, error: '' },
            namespace: { value: namespace, error: '' },
            isProduction: { value: isProduction ? 'true' : 'false', error: '' },
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
                required: true,
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
        },
        onValidation,
    )
    const [deleting, setDeleting] = useState(false)
    const [confirmation, toggleConfirmation] = useState(false)

    const getEnvironmentPayload = () => {
        return {
            id,
            environment_name: state.environment_name.value,
            cluster_id,
            prometheus_endpoint,
            namespace: state.namespace.value || '',
            active: true,
            default: state.isProduction.value === 'true',
        }
    }
    async function onValidation() {
        let payload = getEnvironmentPayload()

        const api = id ? updateEnvironment : saveEnvironment
        try {
            setLoading(true)
            await api(payload, id)
            toast.success(`Successfully ${id ? 'updated' : 'saved'}`)
            handleClose(true)
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    const clusterDelete = (): void => {
        setDeleting(true)
        handleClose(false)
    }

    return (
        <VisibleModal className="environment-create-modal" close={handleClose}>
            <form className="environment-create-body" onClick={(e) => e.stopPropagation()} onSubmit={handleOnSubmit}>
                <div className="form__row">
                    <div className="flex left">
                        <div className="form__title">{id ? 'Update Environment' : 'New Environment'}</div>
                        <Close className="icon-dim-24 dc__align-right cursor" onClick={(e) => handleClose(false)} />
                    </div>
                </div>
                <div className="form__row">
                    <CustomInput
                        autoComplete="off"
                        disabled={!!environment_name}
                        name="environment_name"
                        value={state.environment_name.value}
                        error={state.environment_name.error}
                        onChange={handleOnChange}
                        label="Environment Name*"
                    />
                </div>
                <div className="form__row form__row--namespace">
                    <CustomInput
                        disabled={!!namespace}
                        name="namespace"
                        value={state.namespace.value}
                        error={state.namespace.error}
                        onChange={handleOnChange}
                        label="Enter Namespace*"
                    />
                </div>
                <div className="form__row">
                    <div className="form__label">Environment type*</div>
                    <div className="environment-type pointer">
                        <div className="flex left environment environment--production">
                            <label className="form__label">
                                <input
                                    type="radio"
                                    name="isProduction"
                                    checked={state.isProduction.value === 'true'}
                                    value="true"
                                    onChange={handleOnChange}
                                />
                                <span>Production</span>
                            </label>
                        </div>
                        <div className="flex left environment environment--non-production">
                            <label className="form__label">
                                <input
                                    type="radio"
                                    name="isProduction"
                                    checked={state.isProduction.value === 'false'}
                                    value="false"
                                    onChange={handleOnChange}
                                />
                                <span>Non - Production</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className={`form__buttons`}>
                    {id && (
                        <button
                            className="cta delete dc__m-auto ml-0"
                            type="button"
                            onClick={() => toggleConfirmation(true)}
                        >
                            {deleting ? <Progressing /> : 'Delete'}
                        </button>
                    )}
                    <button className="cta" type="submit" disabled={loading}>
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
                        reload={reload}
                    />
                )}
            </form>
        </VisibleModal>
    )
}
