import React, { useState, useMemo, Component } from 'react'
import { showError, Pencil, useForm, Progressing, CustomPassword, VisibleModal, sortCallback, Toggle } from '../common';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { List, CustomInput } from '../globalConfigurations/GlobalConfiguration'
import { getClusterList, saveCluster, updateCluster, saveEnvironment, updateEnvironment, getEnvironmentList, getCluster, retryClusterInstall, deleteCluster, deleteEnvironment } from './cluster.service';
import { ResizableTextarea } from '../configMaps/ConfigMap'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Warning } from '../../assets/icons/ic-alert-triangle.svg';
import { ReactComponent as Database } from '../../assets/icons/ic-env.svg';
import { ReactComponent as ClusterIcon } from '../../assets/icons/ic-cluster.svg';
import { ReactComponent as FormError } from '../../assets/icons/ic-warning.svg';
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg';
import { ClusterComponentModal } from './ClusterComponentModal';
import { ClusterInstallStatus } from './ClusterInstallStatus';
import { POLLING_INTERVAL, ClusterListProps, AuthenticationType } from './cluster.type';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import { DOCUMENTATION, SERVER_MODE, ViewType } from '../../config';
import { getEnvName } from './cluster.util';
import Reload from '../Reload/Reload';

const PrometheusWarningInfo = () => {
    return <div className="pt-10 pb-10 pl-16 pr-16 bcy-1 br-4 bw-1 cluster-error mb-40">
        <div className="flex left align-start">
            <Warning className="icon-dim-20 fcr-7" />
            <div className="ml-8 fs-13">
                <span className="fw-6 text-capitalize">Warning: </span>Prometheus configuration will be removed and you won’t be able to see metrics for applications deployed in this cluster.
       </div>
        </div>
    </div>
}

const PrometheusRequiredFieldInfo = () => {
    return <div className="pt-10 pb-10 pl-16 pr-16 bcr-1 br-4 bw-1 er-2 mb-16">
        <div className="flex left align-start">
            <Error className="icon-dim-20" />
            <div className="ml-8 fs-13">
                Fill all the required fields OR turn off the above switch to skip configuring prometheus.
       </div>
        </div>
    </div>
}

export default class ClusterList extends Component<ClusterListProps, any> {
    timerRef;

    constructor(props) {
        super(props);
        this.state = {
            view: ViewType.LOADING,
            clusters: [],
            clusterEnvMap: {},
        }
        this.initialise = this.initialise.bind(this);
    }

    componentDidMount() {
        this.initialise();
    }

    componentDidUpdate(prevProps) {
      if(this.props.serverMode !== prevProps.serverMode)
      {
        this.initialise();
      }
    }

    initialise() {
        if (this.timerRef) clearInterval(this.timerRef);
        Promise.all([getClusterList(), (this.props.serverMode === SERVER_MODE.EA_ONLY ? { result: undefined } : getEnvironmentList())]).then(([clusterRes, envResponse]) => {
            let environments = envResponse.result || [];
            const clusterEnvMap = environments.reduce((agg, curr, idx) => {
                agg[curr.cluster_id] = agg[curr.cluster_id] || []
                agg[curr.cluster_id].push(curr);
                return agg
            }, {})
            let clusters = clusterRes.result || [];
            clusters = clusters.concat({ id: null, cluster_name: "", server_url: "", active: true, config: {}, environments: [] });
            clusters = clusters.map(c => {
                return {
                    ...c,
                    environments: clusterEnvMap[c.id]
                }
            })
            clusters = clusters.sort((a, b) => sortCallback('cluster_name', a, b));
            this.setState({
                clusters: clusters,
                clusterEnvMap,
                view: ViewType.FORM,
            }, () => {
                let cluster = this.state.clusters.find((c) => c.agentInstallationStage === 1 || c.agentInstallationStage === 3);
                if (cluster) {
                    this.timerRef = setInterval(() => {
                        this.pollClusterlist();
                    }, POLLING_INTERVAL)
                }
            })
        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.ERROR });
        })
    }

    async pollClusterlist() {
        //updates defaultComponents and agentInstallationStatus
        try {
            const { result } = await getClusterList();
            let clusters = result ? result.map(c => {
                return {
                    ...c,
                    environments: this.state.clusterEnvMap[c.id]
                }
            }) : [];
            clusters = clusters.concat({ id: null, cluster_name: "", server_url: "", active: true, config: {}, environments: [] });
            clusters = clusters.sort((a, b) => sortCallback('cluster_name', a, b));
            this.setState({ clusters: clusters });

            let cluster = this.state.clusters.find((c) => c.agentInstallationStage === 1 || c.agentInstallationStage === 3);
            if (!cluster) clearInterval(this.timerRef);

        } catch (error) {

        }
    }

    componentWillUnmount() {
        clearInterval(this.timerRef);
    }

    render() {
        if (this.state.view === ViewType.LOADING) return <Progressing pageLoader />
        else if (this.state.view === ViewType.ERROR) return <Reload />
        else {
          const moduleBasedTitle = 'Clusters' + (this.props.serverMode === SERVER_MODE.EA_ONLY ? '' : ' and Environments');
          return <section className="mt-16 mb-16 ml-20 mr-20 global-configuration__component flex-1">
              <h2 className="form__title">{moduleBasedTitle}</h2>
              <h5 className="form__subtitle">Manage your organization’s {moduleBasedTitle.toLowerCase()}. &nbsp;
                  <a className="learn-more__href" href={DOCUMENTATION.GLOBAL_CONFIG_CLUSTER} rel="noopener noreferer" target="_blank">Learn more</a>
              </h5>
              {this.state.clusters.map(cluster => <Cluster {...cluster} reload={this.initialise} key={cluster.id || Math.random().toString(36).substr(2, 5)} serverMode={this.props.serverMode} />)}
          </section>
        }
    }
}

function Cluster({ id: clusterId, cluster_name, defaultClusterComponent, agentInstallationStage, server_url, active, config: defaultConfig, environments, reload, prometheus_url,  serverMode }) {
    const [editMode, toggleEditMode] = useState(false);
    const [environment, setEnvironment] = useState(null);
    const [config, setConfig] = useState(defaultConfig);
    const [prometheusAuth, setPrometheusAuth] = useState(undefined);
    const [showClusterComponentModal, toggleClusterComponentModal] = useState(false);
    const history = useHistory();
    const newEnvs = useMemo(() => {
        let namespacesInAll = true;
        if (Array.isArray(environments)) {
            namespacesInAll = !environments.some(env => !env.namespace)
        }
        return namespacesInAll && clusterId ? [{ id: null }].concat(environments || []) : (environments || [])
    }, [environments])

    function handleClose(isReload): void {
        setEnvironment(null)
        if (isReload) reload()
    }

    async function handleEdit(e) {
        try {
            const { result } = await getCluster(clusterId);
            setPrometheusAuth(result.prometheusAuth);
            setConfig(result.config);
            toggleEditMode(t => !t);
        }
        catch (err) {
            showError(err)
        }
    }

    function redirectToChartDeployment(appId, envId): void {
        history.push(`/chart-store/deployments/${appId}/env/${envId}`);
    }

    async function callRetryClusterInstall() {
        try {
            let payload = {};
            const { result } = await retryClusterInstall(clusterId, payload);
            if (result) toast.success("Successfully triggered")
            reload();
        } catch (error) {
            showError(error);
        }
    }

    async function clusterInstallStatusOnclick(e) {
        if (agentInstallationStage === 3) {
            callRetryClusterInstall();
        }
        else toggleClusterComponentModal(!showClusterComponentModal)
    }

    let envName: string = getEnvName(defaultClusterComponent, agentInstallationStage);

    return <>
        <article className={`cluster-list ${clusterId ? 'cluster-list--update' : 'cluster-list--create collapsed-list collapsed-list--create'}`}>
            {!editMode ? <>
                <List key={clusterId} onClick={clusterId ? () => { } : e => toggleEditMode(t => !t)}>
                    {!clusterId && <List.Logo><Add className="icon-dim-24 fcb-5 vertical-align-middle" /></List.Logo>}
                    <div className="flex left">
                        {clusterId ? <ClusterIcon className="icon-dim-24 vertical-align-middle mr-16" /> : null}
                        <List.Title title={cluster_name || "Add cluster"} subtitle={server_url} className="fw-6" />
                    </div>
                    {clusterId && <List.DropDown src={<Pencil color="#b1b7bc" onClick={handleEdit} />} />}
                </List>
                {serverMode !== SERVER_MODE.EA_ONLY  && clusterId ? <hr className="mt-0 mb-16" /> : null}
                {serverMode !== SERVER_MODE.EA_ONLY  && clusterId ? <ClusterInstallStatus agentInstallationStage={agentInstallationStage}
                    envName={envName}
                    onClick={clusterInstallStatusOnclick} /> : null}
                {showClusterComponentModal ? <ClusterComponentModal agentInstallationStage={agentInstallationStage}
                    components={defaultClusterComponent}
                    environmentName={envName}
                    callRetryClusterInstall={callRetryClusterInstall}
                    redirectToChartDeployment={redirectToChartDeployment}
                    close={(e) => { toggleClusterComponentModal(!showClusterComponentModal) }} /> : null}
                {serverMode !== SERVER_MODE.EA_ONLY  && Array.isArray(newEnvs) && newEnvs.length > 0 && <div className="environments-container">
                    {newEnvs.map(({ id, environment_name, cluster_id, cluster_name, active, prometheus_url, namespace, default: isProduction }) => (
                        <List onClick={e => setEnvironment({ id, environment_name, cluster_id: clusterId, namespace, prometheus_url, isProduction })} key={id} className={`cluster-environment cluster-environment--${id ? 'update' : 'create collapsed-list collapsed-list--create'}`}>
                            <List.Logo>{id ? <Database className="icon-dim-24" /> : <Add className="icon-dim-24 fcb-5" />}</List.Logo>
                            <div className="flex left">
                                <List.Title title={environment_name || 'Add environment'} subtitle={id ? `namespace: ${namespace}` : ''} tag={isProduction ? 'PROD' : null} />
                            </div>
                        </List>
                    ))}
                </div>}
            </>
                : <>
                    <ClusterForm {...{ id: clusterId, cluster_name, server_url, active, config, environments, toggleEditMode, reload, prometheus_url, prometheusAuth, serverMode }} /></>}
        </article>
        {environment && <Environment {...environment} handleClose={handleClose} isNamespaceMandatory={Array.isArray(environments) && environments.length > 0} />}
    </>
}

function ClusterForm({ id, cluster_name, server_url, active, config, environments, toggleEditMode, reload, prometheus_url, prometheusAuth, serverMode }) {
    const [loading, setLoading] = useState(false);
    const [prometheusToggleEnabled, setPrometheusToggleEnabled] = useState(prometheus_url ? true : false);
    const [prometheusAuthenticationType, setPrometheusAuthenticationType] = useState({ type: prometheusAuth && prometheusAuth.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS });
    let authenTicationType = prometheusAuth && prometheusAuth.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS;

    const isDefaultCluster = (): boolean => {
        return id == 1;
    }
    const [deleting, setDeleting] = useState(false);
    const [confirmation, toggleConfirmation] = useState(false);

    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            cluster_name: { value: cluster_name, error: "" },
            url: { value: server_url, error: "" },
            userName: { value: prometheusAuth?.userName, error: "" },
            password: { value: prometheusAuth?.password, error: "" },
            tlsClientKey: { value: prometheusAuth?.tlsClientKey, error: "" },
            tlsClientCert: { value: prometheusAuth?.tlsClientCert, error: "" },
            token: { value: config && config.bearer_token ? config.bearer_token : "", error: "" },
            endpoint: { value: prometheus_url || "", error: "" },
            authType: { value: authenTicationType, error: "" }
        },
        {
            cluster_name: {
                required: true,
                validators: [
                    { error: 'Name is required', regex: /^.*$/ },
                    { error: "Use only lowercase alphanumeric characters, '-', '_' or '.'", regex: /^[a-z0-9-\.\_]+$/ },
                    { error: "Cannot start/end with '-', '_' or '.'", regex: /^(?![-._]).*[^-._]$/ },
                    { error: "Minimum 3 and Maximum 63 characters required", regex: /^.{3,63}$/ }
                ]
            },
            url: {
                required: true,
                validator: { error: 'URL is required', regex: /^.*$/ }
            },
            authType: {
                required: false,
                validator: { error: 'Authentication Type is required', regex: /^(?!\s*$).+/ }
            },
            userName: {
                required: (prometheusToggleEnabled && (prometheusAuthenticationType.type === AuthenticationType.BASIC)) ? true : false,
                validator: { error: 'username is required', regex: /^(?!\s*$).+/ }
            },
            password: {
                required: (prometheusToggleEnabled && (prometheusAuthenticationType.type === AuthenticationType.BASIC)) ? true : false,
                validator: { error: 'password is required', regex: /^(?!\s*$).+/ }
            },
            tlsClientKey: {
                required: false,
                validator: { error: 'TLS Key is required', regex: /^(?!\s*$).+/ }
            },
            tlsClientCert: {
                required: false,
                validator: { error: 'TLS Certificate is required', regex: /^(?!\s*$).+/ }
            },
            token: isDefaultCluster() ? {} : {
                required: true,
                validator: { error: 'token is required', regex: /[^]+/ }
            },
            endpoint: {
                required: prometheusToggleEnabled ? true : false,
                validator: { error: 'endpoint is required', regex: /^.*$/ }
            }
        }, onValidation);

        async function handleDelete() {
            setDeleting(true);
            try {
                await deleteCluster();
                toast.success('Successfully deleted');
            } catch (err) {
                // if (err.code != 403) {
                //     toggleConfirmation(false);
                // } else {
                showError(err);
                // }
            } finally {
                setDeleting(false);
            }
        }

    async function onValidation() {

        let payload = {
            id,
            cluster_name: state.cluster_name.value,
            config: { bearer_token: state.token.value },
            active,
            prometheus_url: prometheusToggleEnabled ? state.endpoint.value : "",
            prometheusAuth: {
                userName: prometheusToggleEnabled ? state.userName.value : "",
                password: prometheusToggleEnabled ? state.password.value : ""
            }
        }

        if (state.url.value.endsWith("/")) {
            payload['server_url'] = state.url.value.slice(0, -1);
        } else {
            payload['server_url'] = state.url.value;
        }

        if ((state.authType.value === AuthenticationType.BASIC) && prometheusToggleEnabled) {
            let isValid = state.userName?.value && state.password?.value;
            if (!isValid) {
                toast.error("Please add both username and password");
                return;
            }
            else {
                payload.prometheusAuth['userName'] = state.userName.value || "";
                payload.prometheusAuth['password'] = state.password.value || "";
            }
        }
        if ((state.tlsClientKey.value || state.tlsClientCert.value) && prometheusToggleEnabled) {
            let isValid = state.tlsClientKey.value?.length && state.tlsClientCert.value?.length;
            if (!isValid) {
                toast.error("Please add both TLS Key and Certificate");
                return;
            }
            else {
                payload.prometheusAuth['tlsClientKey'] = state.tlsClientKey.value || "";
                payload.prometheusAuth['tlsClientCert'] = state.tlsClientCert.value || "";
            }
        }
        const api = id ? updateCluster : saveCluster
        try {
            setLoading(true)
            const { result } = await api(payload)
            toast.success(`Successfully ${id ? 'updated' : 'saved'}.`)
            reload()
            toggleEditMode(e => !e)
        }
        catch (err) { showError(err) }
        finally {
            setLoading(false)
        }
    }

    const clusterTitle = () => {
        if (!id) {
            return "Add cluster"
        }
        else {
            return "Edit cluster"
        }
    }

    const setPrometheusToggle = () => {
        setPrometheusToggleEnabled(!prometheusToggleEnabled)
    }

    const OnPrometheusAuthTypeChange = (e) => {
        handleOnChange(e);
        if (state.authType.value == AuthenticationType.BASIC) {
            setPrometheusAuthenticationType({ type: AuthenticationType.ANONYMOUS });
        } else {
            setPrometheusAuthenticationType({ type: AuthenticationType.BASIC });
        }
    }
    

    return <form action="" className="cluster-form" onSubmit={handleOnSubmit}>
        <div className="flex left mb-20">
            {id ?
                <Pencil color="#363636" className="icon-dim-24 vertical-align-middle" /> :
                <Add className="icon-dim-24 fcb-5 vertical-align-middle" />
            }
            <span className={`${!id ? 'cb-5' : ''} fw-6 fs-14 ml-8`}>{clusterTitle()}</span>
        </div>
        <div className="form__row">
            <CustomInput autoComplete="off" name="cluster_name" disabled={isDefaultCluster()} value={state.cluster_name.value} error={state.cluster_name.error} onChange={handleOnChange} label="Name*" />
        </div>
        <div className="form__row">
            <CustomInput autoComplete="off" name="url" value={state.url.value} error={state.url.error} onChange={handleOnChange} label="Server URL*" />
        </div>
        <div className="form__row form__row--bearer-token flex column left top">
            <label htmlFor="" className="form__label">Bearer token{isDefaultCluster() ? '' : '*'}</label>
            <div className="bearer-token">
                <ResizableTextarea className="resizable-textarea__with-max-height" name="token" value={config && config.bearer_token ? config.bearer_token : ""} onChange={handleOnChange} />
            </div>
            {state.token.error && <label htmlFor="" className="form__error">
                <FormError className="form__icon form__icon--error" />
                {state.token.error}</label>}
        </div>
        {serverMode !== SERVER_MODE.EA_ONLY  && (<><hr></hr><div className={`${prometheusToggleEnabled ? 'mb-20' : (prometheus_url) ? 'mb-20' : 'mb-40'} mt-20`}>
            <div className="content-space flex">
                <span className="form__input-header">See metrics for applications in this cluster</span>
                <div className="" style={{ width: "32px", height: "20px" }}>
                    <Toggle selected={prometheusToggleEnabled} onSelect={setPrometheusToggle} />
                </div>
            </div>
            <span className="cn-6 fs-12">Configure prometheus to see metrics like CPU, RAM, Throughput etc. for applications running in this cluster</span>
        </div></>)}
        {serverMode !== SERVER_MODE.EA_ONLY  && !prometheusToggleEnabled && prometheus_url &&
            <PrometheusWarningInfo />
        }
        {serverMode !== SERVER_MODE.EA_ONLY  && prometheusToggleEnabled &&
            <div className=''>
                {(state.userName.error || state.password.error || state.endpoint.error) &&
                    <PrometheusRequiredFieldInfo />
                }
                <div className="form__row">
                    <CustomInput autoComplete="off" name="endpoint" value={state.endpoint.value} error={state.endpoint.error} onChange={handleOnChange} label="Prometheus endpoint*" />
                </div>
                <div className="form__row">
                    <span className="form__label">Authentication Type*</span>
                    <RadioGroup value={state.authType.value} name={`authType`} onChange={(e) => OnPrometheusAuthTypeChange(e)}>
                        <RadioGroupItem value={AuthenticationType.BASIC}> Basic  </RadioGroupItem>
                        <RadioGroupItem value={AuthenticationType.ANONYMOUS}>  Anonymous  </RadioGroupItem>
                    </RadioGroup>
                </div>
                {state.authType.value === AuthenticationType.BASIC ?
                    <div className="form__row form__row--flex">
                        <div className="w-50 mr-8">
                            <CustomInput name="userName" value={state.userName.value} error={state.userName.error} onChange={handleOnChange} label="Username*" />
                        </div>
                        <div className="w-50 ml-8">
                            <CustomPassword name="password" value={state.password.value} error={state.userName.error} onChange={handleOnChange} label="Password*" />
                        </div>
                    </div>
                    : null}
                <div className="form__row">
                    <span className="form__label">TLS Key</span>
                    <ResizableTextarea className="resizable-textarea__with-max-height w-100" name="tlsClientKey" value={state.tlsClientKey.value} onChange={handleOnChange} />
                </div>
                <div className="form__row">
                    <span className="form__label">TLS Certificate</span>
                    <ResizableTextarea className="resizable-textarea__with-max-height w-100" name="tlsClientCert" value={state.tlsClientCert.value} onChange={handleOnChange} />
                </div> </div>}
        <div className={`form__buttons ${id ? 'content-space' : ''} `}>
           {id && <div>
                <button className="cta delete" type="button" onClick={() => handleDelete()}>
                    Delete
                </button>
            </div>
            }
            <div className='right'>
                <button className="cta cancel" type="button" onClick={e => toggleEditMode(t => !t)}>Cancel</button>
                <button className="cta">{loading ? <Progressing /> : 'Save cluster'}</button>
            </div>
        </div>
    </form>
}

function Environment({ environment_name, namespace, id, cluster_id, handleClose, prometheus_endpoint, isProduction, isNamespaceMandatory = true }) {
    const [loading, setLoading] = useState(false)
    const [ignore, setIngore] = useState(false)
    const [ignoreError, setIngoreError] = useState("")
    const { state, disable, handleOnChange, handleOnSubmit } = useForm(
        {
            environment_name: { value: environment_name, error: "" },
            namespace: { value: namespace, error: "" },
            isProduction: { value: isProduction ? "true" : "false", error: "" },
        },
        {
            environment_name: {
                required: true,
                validators: [
                    { error: 'Environment name is required', regex: /^.*$/ },
                    { error: "Use only lowercase alphanumeric characters or '-'", regex: /^[a-z0-9-]+$/ },
                    { error: "Cannot start/end with '-'", regex: /^(?![-]).*[^-]$/ },
                    { error: "Minimum 3 and Maximum 16 characters required", regex: /^.{3,16}$/ }
                ]
            },
            namespace: {
                required: isNamespaceMandatory,
                validators: [
                    { error: 'Namespace is required', regex: /^.*$/ },
                    { error: "Use only lowercase alphanumeric characters or '-'", regex: /^[a-z0-9-]+$/ },
                    { error: "Cannot start/end with '-'", regex: /^(?![-]).*[^-]$/ },
                    { error: "Maximum 63 characters required", regex: /^.{1,63}$/ }
                ]
            },
            isProduction: {
                required: true,
                validator: { error: 'token is required', regex: /[^]+/ }
            },
        }, onValidation);
        const [deleting, setDeleting] = useState(false);
        const [confirmation, toggleConfirmation] = useState(false);

    async function onValidation() {
        if (!state.namespace.value && !ignore) {
            setIngoreError("Enter a namespace or select ignore namespace")
            return
        }
        let payload = {
            id,
            environment_name: state.environment_name.value,
            cluster_id,
            prometheus_endpoint,
            namespace: state.namespace.value || "",
            active: true,
            default: state.isProduction.value === 'true',
        }

        const api = id ? updateEnvironment : saveEnvironment
        try {
            setLoading(true)
            await api(payload, id)
            toast.success(`Successfully ${id ? 'updated' : 'saved'}`)
            handleClose(true)
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        let payload = {
            id,
            environment_name: state.environment_name.value,
            cluster_id,
            prometheus_endpoint,
            namespace: state.namespace.value || "",
            active: true,
            default: state.isProduction.value === 'true',
        }
        setDeleting(true);
        try {
            await deleteEnvironment(payload);
            toast.success('Successfully deleted');
        } catch (err) {
            // if (err.code != 403) {
            //     toggleConfirmation(false);
            // } else {
            showError(err);
            // }
        } finally {
            setDeleting(false);
        }
    }

    return <VisibleModal className="environment-create-modal" close={handleClose}>
        <form className="environment-create-body" onClick={(e) => e.stopPropagation()} onSubmit={handleOnSubmit} >
            <div className="form__row">
                <div className="flex left">
                    <div className="form__title">{id ? 'Update Environment' : 'New Environment'}</div>
                    <Close className="icon-dim-24 align-right cursor" onClick={e => handleClose(false)} />
                </div>
            </div>
            <div className="form__row">
                <CustomInput autoComplete="off" disabled={!!environment_name} name="environment_name" value={state.environment_name.value} error={state.environment_name.error} onChange={handleOnChange} label="Environment Name*" />
            </div>
            <div className="form__row form__row--namespace">
                <CustomInput disabled={!!namespace || ignore} name="namespace" value={state.namespace.value} error={state.namespace.error} onChange={handleOnChange} label={`Enter Namespace ${isNamespaceMandatory ? '*' : ''}`} />
            </div>
            {!isNamespaceMandatory && <><div className="form__row form__row--ignore-namespace">
                <input type="checkbox" onChange={e => { setIngore(t => !t); setIngoreError("") }} checked={ignore} />
                <div className="form__label bold">Ignore namespace</div>
            </div>
                <div className="form__row form__row--warn">
                    If left empty, you won't be able to add more
                    environments to this cluster
                </div>
                {ignoreError && <div className="form__row form__error">{ignoreError}</div>}
            </>}
            <div className="form__row">
                <div className="form__label">Environment type*</div>
                <div className="environment-type pointer">
                    <div className="flex left environment environment--production">
                        <label className="form__label"><input type="radio" name="isProduction" checked={state.isProduction.value === 'true'} value="true" onChange={handleOnChange} /><span>Production</span></label>
                    </div>
                    <div className="flex left environment environment--non-production">
                        <label className="form__label"><input type="radio" name="isProduction" checked={state.isProduction.value === 'false'} value="false" onChange={handleOnChange} /><span>Non - Production</span></label>
                    </div>
                </div>
            </div>
            <div className={`form__buttons ${id ? 'content-space' : ''}`}>
            {id && <div>
                <button className="cta delete" type="button" onClick={() => handleDelete()}>
                    Delete
                </button>
            </div>
            }
                <button className="cta" type="submit" disabled={loading}>{loading ? <Progressing /> : id ? 'Update' : 'Save'}</button>
            </div>
        </form>
    </VisibleModal>
}
