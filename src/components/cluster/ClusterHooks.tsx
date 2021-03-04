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
import { DOCUMENTATION, ViewType } from '../../config';
import { getEnvName } from './cluster.util';
import Reload from '../Reload/Reload';
import { ClusterFormState, ClusterFormProps } from './cluster.type'
import { ClusterForm } from './ClusterForm';
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
            <a href={DOCUMENTATION.GLOBAL_CONFIG_CLUSTER} rel="noopener noreferer" target="_blank">Learn more about cluster and environments</a>
            </h5>
            {this.state.clusters.map(cluster => <Cluster {...cluster} reload={this.initialise} key={cluster.id || Math.random().toString(36).substr(2, 5)} />)}
        </section>
    }
}

function Cluster({ id: defaultClusterComponent, agentInstallationStage, server_url, active, config: defaultConfig, environments, reload, prometheus_url }) {
    const [cluster_name, setCluster_name] = useState("")
    const [clusterId, setClusterId] = useState()
    const [url, setUrl] = useState("")
    const [endpoint, setEndpoint] = useState("")
    const [authType, setAuthType] = useState("")
    const [userName, setUsername] = useState("")
    const [error, setError] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(true)
    const [tlsClientCert, setTlsClientCert]= useState("")
    const [tlsClientKey, setTlsClientKey] = useState("")
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

    //let envName: string = getEnvName(defaultClusterComponent, agentInstallationStage);
    return <form action="" className="cluster-form" //onSubmit={handleOnSubmit}
    >
        <h2 className="form__title">Edit cluster</h2>
        <div className="form__row">
            <CustomInput
                autoComplete="off"
                name="cluster_name"
                value={cluster_name}
                error={error}
                onChange={e => setCluster_name(e.target.value)}
                label="Name*" />
        </div>
        <hr></hr>
        <div className="form__input-header mb-8">Kubernetes Cluster Info</div>
        <div className="form__row">
            <CustomInput
                autoComplete="off"
                name="url"
                value={url}
                error={error}
                onChange={e => setUrl(e.target.value)}
                label="Server URL*" />
        </div>
        <div className="form__row form__row--bearer-token flex column left top">
            <label htmlFor="" className="form__label">Bearer token*</label>
            <div className="bearer-token">
                <ResizableTextarea 
                className="resizable-textarea__with-max-height" 
                name="token" 
                value={config && config.bearer_token ? config.bearer_token : ""} 
                onChange={e => setConfig(e.target.value)} />
            </div>

        </div>
        <hr></hr>
        <div className="form__input-header mb-8">Prometheus Info</div>
        <div className="form__row">
            <CustomInput
                autoComplete="off"
                name="endpoint"
                value={endpoint}
                error={error}
                onChange={e => setEndpoint(e.target.value)}
                label="Prometheus endpoint*" />
        </div>
        <div className="form__row">
            <span className="form__label">Authentication Type*</span>
            <RadioGroup value={authType} name={`authType`} onChange={e => setAuthType(e.target.value)}>
                <RadioGroupItem value={AuthenticationType.BASIC}> Basic  </RadioGroupItem>
                <RadioGroupItem value={AuthenticationType.ANONYMOUS}>  Anonymous  </RadioGroupItem>
            </RadioGroup>
        </div>
        {authType === AuthenticationType.BASIC ?
            <div className="form__row form__row--flex">
                <div className="w-50 mr-8">
                    <CustomInput 
                    name="userName" 
                    value={userName} 
                    error={error} 
                    onChange={e => setUsername(e.target.value)} 
                    label="Username*" />
                </div>
                <div className="w-50 ml-8">
                    <CustomPassword 
                    name="password" 
                    value={password} 
                    error={error} 
                    onChange={e => setPassword(e.target.value)} 
                    label="Password*" />
                </div>
            </div>
            : null}
        <div className="form__row">
            <span className="form__label">TLS Key</span>
            <ResizableTextarea 
            className="resizable-textarea__with-max-height w-100" 
            name="tlsClientKey" 
            value={tlsClientKey} 
            onChange={e => setTlsClientKey(e.target.value)} />
        </div>
        <div className="form__row">
            <span className="form__label">TLS Certificate</span>
            <ResizableTextarea 
            className="resizable-textarea__with-max-height w-100" 
            name="tlsClientCert" 
            value={tlsClientCert} 
            onChange={e => setTlsClientCert(e.target.value)} />
        </div>
        <div className="form__buttons">
            <button className="cta cancel" type="button" onClick={e => toggleEditMode(t => !t)}>Cancel</button>
            <button className="cta">{loading ? <Progressing /> : 'Save cluster'}</button>
        </div>
    </form>
}