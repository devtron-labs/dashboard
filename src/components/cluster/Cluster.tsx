import React, { useState, useMemo, Component } from 'react'
import { showError, Pencil, Progressing, sortCallback } from '../common';
import { List } from '../globalConfigurations/GlobalConfiguration'
import { getClusterList, getEnvironmentList, getCluster, retryClusterInstall } from './cluster.service';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Database } from '../../assets/icons/ic-env.svg';
import { ReactComponent as ClusterIcon } from '../../assets/icons/ic-cluster.svg';
import { ClusterComponentModal } from './ClusterComponentModal';
import { ClusterInstallStatus } from './ClusterInstallStatus';
import { POLLING_INTERVAL, ClusterListProps } from './cluster.type';
import { useHistory } from 'react-router';
import { toast } from 'react-toastify';
import { DOCUMENTATION, ViewType } from '../../config';
import { getEnvName } from './cluster.util';
import { ClusterForm } from './ClusterForm';
import { Environment } from './Environment';
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
        else return <section className="mt-16 mb-16 ml-20 mr-20 global-configuration__component flex-1">
            <h2 className="form__title">Clusters and Environments</h2>
            <h5 className="form__subtitle">Manage your organization’s clusters and environments. &nbsp;
                <a className="learn-more__href" href={DOCUMENTATION.GLOBAL_CONFIG_CLUSTER} rel="noopener noreferer" target="_blank">Learn more about cluster and environments</a>
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
        <article className={`cluster-list ${clusterId ? '' : 'cluster-list--create collapsed-list collapsed-list--create'}`}>
            {!editMode ? <>
                {clusterId ? <List onClick={(e) => toggleEditMode(t => !t)}>
                    <div className="flex left">
                        <List.Logo><ClusterIcon className="icon-dim-24 vertical-align-middle mr-16" /></List.Logo>
                        <List.Title title={cluster_name} subtitle={server_url} className="fw-6 cb-5" />
                    </div>
                    <List.DropDown src={<Pencil color="#b1b7bc" onClick={handleEdit} />} />
                </List>
                    : <List onClick={e => toggleEditMode(t => !t)}>
                        <List.Logo><Add className="icon-dim-24 fcb-5" /></List.Logo>
                        <h3 className="fw-6 cb-5 fs-14 m-0">Add cluster</h3>
                    </List>
                }
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
                : <ClusterForm {...{ id: clusterId, cluster_name, server_url, active, config, environments, toggleEditMode, reload, prometheus_url, prometheusAuth }} />}
        </article>
        {environment && <Environment {...environment} handleClose={handleClose} isNamespaceMandatory={Array.isArray(environments) && environments.length > 0} />}
    </>
}
