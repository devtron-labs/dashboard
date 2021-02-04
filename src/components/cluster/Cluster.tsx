import React, { useState, useMemo, Component } from 'react'
import { showError, Pencil, useForm, Progressing, CustomPassword, VisibleModal, sortCallback } from '../common';
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup';
import { List, CustomInput } from '../globalConfigurations/GlobalConfiguration'
import { getClusterList, saveCluster, updateCluster, saveEnvironment, updateEnvironment, getEnvironmentList, getCluster, retryClusterInstall } from './cluster.service';
import { ResizableTextarea } from '../configMaps/ConfigMap'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Database } from '../../assets/icons/ic-env.svg';
import { ReactComponent as ClusterIcon } from '../../assets/icons/ic-cluster.svg';
import { ClusterComponentModal } from './ClusterComponentModal';
import { ClusterInstallStatus } from './ClusterInstallStatus';
import { POLLING_INTERVAL, ClusterListProps, AuthenticationType } from './cluster.type';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import { ViewType } from '../../config';
import { getEnvName } from './cluster.util';
import Reload from '../Reload/Reload';

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

    initialise() {
        if (this.timerRef) clearInterval(this.timerRef);
        Promise.all([getClusterList(), getEnvironmentList()]).then(([clusterRes, envResponse]) => {
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
        else return <section className="cluster-page">
            <h2 className="form__title">Clusters and Environments</h2>
            <h5 className="form__subtitle">Manage your organization’s clusters and environments. &nbsp;
            <a href="https://docs.devtron.ai/global-configurations/cluster-and-environments"  rel="noopener noreferer" target="_blank">Learn more about cluster and environments</a>
            </h5>
            {this.state.clusters.map(cluster => <Cluster {...cluster} reload={this.initialise} key={cluster.id || Math.random().toString(36).substr(2, 5)} />)}
        </section>
    }
}

function Cluster({ id: clusterId, cluster_name, defaultClusterComponent, agentInstallationStage, server_url, active, config: defaultConfig, environments, reload, prometheus_url }) {
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
                {clusterId ? <hr className="mt-0 mb-16" /> : null}
                {clusterId ? <ClusterInstallStatus agentInstallationStage={agentInstallationStage}
                    envName={envName}
                    onClick={clusterInstallStatusOnclick} /> : null}
                {showClusterComponentModal ? <ClusterComponentModal agentInstallationStage={agentInstallationStage}
                    components={defaultClusterComponent}
                    environmentName={envName}
                    callRetryClusterInstall={callRetryClusterInstall}
                    redirectToChartDeployment={redirectToChartDeployment}
                    close={(e) => { toggleClusterComponentModal(!showClusterComponentModal) }} /> : null}
                {Array.isArray(newEnvs) && newEnvs.length > 0 && <div className="environments-container">
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
                    <ClusterForm {...{ id: clusterId, cluster_name, server_url, active, config, environments, toggleEditMode, reload, prometheus_url, prometheusAuth }} /></>}
        </article>
        {environment && <Environment {...environment} handleClose={handleClose} isNamespaceMandatory={Array.isArray(environments) && environments.length > 0} />}
    </>
}

function ClusterForm({ id, cluster_name, server_url, active, config, environments, toggleEditMode, reload, prometheus_url, prometheusAuth }) {
    const [loading, setLoading] = useState(false);
    let authenTicationType = prometheusAuth && prometheusAuth.userName ? AuthenticationType.BASIC : AuthenticationType.ANONYMOUS
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
                validator: { error: 'Name is required', regex: /^.*$/ }
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
                required: false,
                validator: { error: 'username is required', regex: /^(?!\s*$).+/ }
            },
            password: {
                required: false,
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
            token: {
                required: true,
                validator: { error: 'token is required', regex: /[^]+/ }
            },
            endpoint: {
                required: true,
                validator: { error: 'endpoint is required', regex: /^.*$/ }
            }
        }, onValidation);

    async function onValidation() {

        let payload = {
            id,
            cluster_name: state.cluster_name.value,
            server_url: state.url.value,
            config: { bearer_token: state.token.value },
            active,
            prometheus_url: state.endpoint.value,
            prometheusAuth: {
                userName: "",
                password: ""
            }
        }

        if (state.authType.value === AuthenticationType.BASIC) {
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
        if (state.tlsClientKey.value || state.tlsClientCert.value) {
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
    return <form action="" className="cluster-form" onSubmit={handleOnSubmit}>
        <h2 className="form__title">Edit cluster</h2>
        <div className="form__row">
            <CustomInput autoComplete="off" name="cluster_name" value={state.cluster_name.value} error={state.cluster_name.error} onChange={handleOnChange} label="Name*" />
        </div>
        <hr></hr>
        <div className="form__input-header mb-8">Kubernetes Cluster Info</div>
        <div className="form__row">
            <CustomInput autoComplete="off" name="url" value={state.url.value} error={state.url.error} onChange={handleOnChange} label="Server URL*" />
        </div>
        <div className="form__row form__row--bearer-token flex column left top">
            <label htmlFor="" className="form__label">Bearer token*</label>
            <div className="bearer-token">
                <ResizableTextarea className="resizable-textarea__with-max-height" name="token" value={config && config.bearer_token ? config.bearer_token : ""} onChange={handleOnChange} />
            </div>
            {state.token.error && <label htmlFor="" className="form__error">{state.token.error}</label>}
        </div>
        <hr></hr>
        <div className="form__input-header mb-8">Prometheus Info</div>
        <div className="form__row">
            <CustomInput autoComplete="off" name="endpoint" value={state.endpoint.value} error={state.endpoint.error} onChange={handleOnChange} label="Prometheus endpoint*" />
        </div>
        <div className="form__row">
            <span className="form__label">Authentication Type*</span>
            <RadioGroup value={state.authType.value} name={`authType`} onChange={handleOnChange}>
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
        </div>
        <div className="form__buttons">
            <button className="cta cancel" type="button" onClick={e => toggleEditMode(t => !t)}>Cancel</button>
            <button className="cta">{loading ? <Progressing /> : 'Save cluster'}</button>
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
                validator: { error: 'This is required field(max 16 chars).', regex: /^.{1,16}$/ }
            },
            namespace: {
                required: isNamespaceMandatory,
                validator: { error: '^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$ pattern should satisfy.', regex: /^[a-z]+[a-z0-9\-\?]*[a-z0-9]+$/ }
            },
            isProduction: {
                required: true,
                validator: { error: 'token is required', regex: /[^]+/ }
            },
        }, onValidation);

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
            <div className="form__buttons">
                <button className="cta" type="submit" disabled={loading}>{loading ? <Progressing /> : id ? 'Update' : 'Save'}</button>
            </div>
        </form>
    </VisibleModal>
}
