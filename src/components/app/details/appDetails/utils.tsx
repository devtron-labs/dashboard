import {
    Nodes,
    NodeType,
    AggregationKeys,
    AggregatedNodes,
    PodMetadatum,
} from '../../types';
import { getVersionArr, isVersionLessThanOrEqualToTarget, mapByKey } from '../../../common';
import React, { Component } from 'react';
import { components } from 'react-select';
import { ReactComponent as Bug } from '../../../../assets/icons/ic-bug.svg';
import { ReactComponent as ArrowDown } from '../../../../assets/icons/ic-chevron-down.svg';
import { ChartTypes, AppMetricsTabType, SecurityVulnerabilititesProps, StatusType, StatusTypes } from './appDetails.type';
import CreatableSelect from 'react-select/creatable';
import { DayPickerRangeControllerPresets } from '../../../common';

export function getAggregator(nodeType: NodeType): AggregationKeys {
    switch (nodeType) {
        case Nodes.DaemonSet:
        case Nodes.Deployment:
        case Nodes.Pod:
        case Nodes.ReplicaSet:
        case Nodes.Job:
        case Nodes.CronJob:
        case Nodes.ReplicationController:
        case Nodes.StatefulSet:
            return AggregationKeys.Workloads;
        case Nodes.Ingress:
        case Nodes.Service:
        case Nodes.Endpoints:
            return AggregationKeys.Networking;
        case Nodes.ConfigMap:
        case Nodes.Secret:
        case Nodes.PersistentVolume:
        case Nodes.PersistentVolumeClaim:
            return AggregationKeys["Config & Storage"];
        case Nodes.ServiceAccount:
        case Nodes.ClusterRoleBinding:
        case Nodes.RoleBinding:
        case Nodes.ClusterRole:
        case Nodes.Role:
            return AggregationKeys.RBAC;
        case Nodes.MutatingWebhookConfiguration:
        case Nodes.PodSecurityPolicy:
        case Nodes.ValidatingWebhookConfiguration:
            return AggregationKeys.Administration;
        case Nodes.Alertmanager:
        case Nodes.Prometheus:
        case Nodes.ServiceMonitor:
            return AggregationKeys["Custom Resource"];
        default:
            return AggregationKeys['Custom Resource'];
    }
}
export function aggregateNodes(nodes: any[], podMetadata: PodMetadatum[]): AggregatedNodes {
    const podMetadataMap = mapByKey(podMetadata, 'name');
    // group nodes
    const nodesGroup = nodes.reduce((agg, curr) => {
        agg[curr.kind] = agg[curr.kind] || new Map();
        if (curr.kind === Nodes.Pod) {
            curr.info?.forEach(({ name, value }) => {
                if (name === 'Status Reason') {
                    curr.status = value.toLowerCase()
                }
                else if (name === 'Containers') {
                    curr.ready = value
                }
            });
            const podMeta = podMetadataMap.has(curr.name) ? podMetadataMap.get(curr.name) : {};
            agg[curr.kind].set(curr.name, { ...curr, ...podMeta });
        } else if (curr.kind === Nodes.Service) {
            curr.url = `${curr.name}.${curr.namespace}: { portnumber }`;
            agg[curr.kind].set(curr.name, curr);
        } else {
            agg[curr.kind].set(curr.name, curr);
        }
        return agg;
    }, {});

    // populate parents
    return nodes.reduce(
        (agg, curr, idx) => {
            const nodeKind = curr.kind;
            const aggregator: AggregationKeys = getAggregator(nodeKind);
            agg.aggregation[aggregator] = agg.aggregation[aggregator] || {};
            agg.nodes[nodeKind] = nodesGroup[nodeKind];
            if (curr.health && curr.health.status) {
                agg.statusCount[curr.health.status] = (agg.statusCount[curr.health.status] || 0) + 1;

                agg.nodeStatusCount[curr.kind] = agg.nodeStatusCount[curr.kind] || {};
                agg.nodeStatusCount[curr.kind][curr.health.status] =
                    (agg.nodeStatusCount[curr.kind][curr.health.status] || 0) + 1;

                agg.aggregatorStatusCount[aggregator] = agg.aggregatorStatusCount[aggregator] || {};
                agg.aggregatorStatusCount[aggregator][curr.health.status] =
                    (agg.aggregatorStatusCount[aggregator][curr.health.status] || 0) + 1;
            }
            if (Array.isArray(curr.parentRefs)) {
                curr.parentRefs.forEach(({ kind, name }, idx) => {
                    if (nodesGroup[kind] && nodesGroup[kind].has(name)) {
                        const parentRef = nodesGroup[kind].get(name);
                        const children = parentRef.children || {};
                        children[nodeKind] = children[nodeKind] || [];
                        children[nodeKind] = [...children[nodeKind], curr.name];
                        if (!agg.nodes[kind]) {
                            agg.nodes[kind] = new Map();
                        }
                        agg.nodes[kind].set(name, { ...parentRef, children });
                    }
                });
            }

            agg.aggregation[aggregator][nodeKind] = agg.nodes[nodeKind];
            return agg;
        },
        { nodes: {}, aggregation: {}, statusCount: {}, nodeStatusCount: {}, aggregatorStatusCount: {} },
    );
}


export class SecurityVulnerabilitites extends Component<SecurityVulnerabilititesProps> {

    render() {
        const { critical = 0, moderate = 0, low = 0 } = this.props.severityCount;
        const total = critical + moderate + low;
        if (total !== 0) {
            return <div className="security-vulnerabilities cursor" onClick={this.props.onClick}>
                <div>
                    <Bug className="icon-dim-20 vertical-align-middle mr-8 fcy-7" />
                    {total} Security Vulnerabilities
                    <span className="security-vulnerabilities__count">
                        {critical ? `${critical} critical, ` : ``}
                        {moderate ? `${moderate} moderate, ` : ``}
                        {low ? `${low} low` : ``}
                    </span>
                </div>
                <div className="cb-5">Details</div>
            </div>
        }
        else return <span></span>
    }
}

export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 fcn-6" />
    </components.DropdownIndicator>
}

const throughputAndLatencySelectStyle = {
    container: (base, state) => ({
        ...base,
        outline: 'unset',
        height: "100%",
    }),
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        minHeight: '20px',
        height: '100%',
    }),
    menu: (base, state) => ({
        ...base,
        width: 'auto'
    }),
    valueContainer: base => ({
        ...base,
        padding: '0',
        height: '100%',
        fontWeight: 600,
    }),
    singleValue: base => ({
        ...base,
        maxWidth: '77px',
    }),
    dropdownIndicator: base => ({
        ...base,
        padding: '0',
        height: '20px'
    }),
};

export function ThroughputSelect(props) {
    return <CreatableSelect className=""
        placeholder="Status Code"
        value={{ label: props.status, value: props.status }}
        options={[
            { label: '2xx', value: '2xx' },
            { label: '200', value: '200' },
            { label: '201', value: '201' },
            { label: '204', value: '204' },
            { label: '4xx', value: '4xx' },
            { label: '5xx', value: '5xx' },
            { label: 'Throughput', value: 'Throughput' }
        ]}
        onChange={props.handleStatusChange}
        styles={throughputAndLatencySelectStyle}
        components={{
            IndicatorSeparator: null,
            DropdownIndicator: DropdownIndicator,
        }}
    />
}

export function LatencySelect(props) {
    return <CreatableSelect className="mr-5"
        placeholder="Latency"
        value={{ label: props.latency, value: props.latency }}
        options={[
            { label: '99.9', value: '99.9' },
            { label: '99.5', value: '99.5' },
            { label: '99', value: '99' },
            { label: '95', value: '95' }
        ]}
        onChange={props.handleLatencyChange}
        styles={throughputAndLatencySelectStyle}
        components={{
            IndicatorSeparator: null,
            DropdownIndicator: DropdownIndicator,
        }}
        formatCreateLabel={(inputValue) => inputValue}
    />
}

export function getCalendarValue(startDateStr: string, endDateStr: string): string {
    let str: string = `${startDateStr} - ${endDateStr}`;
    if (endDateStr === 'now' && startDateStr.includes('now')) {
        let range = DayPickerRangeControllerPresets.find(d => d.endStr === startDateStr);
        if (range) str = range.text;
        else str = `${startDateStr} - ${endDateStr}`;
    }
    return str;
}

export function isK8sVersionValid(k8sVersion: string): boolean {
    if (!k8sVersion) return false;
    try {
        let versionNum = getVersionArr(k8sVersion);
        let sum = versionNum.reduce((sum, item) => {
            return sum += item;
        }, 0)
        if (isNaN(sum)) return false;
    } catch (error) {
        return false;
    }
    return true;
}

export function isK8sVersion115OrBelow(k8sVersion: string): boolean {
    //Comparing with v1.15.xxx
    let target = [1, 15];
    return isVersionLessThanOrEqualToTarget(k8sVersion, target);
}

export interface AppInfo {
    appId: string | number;
    envId: string | number;
    environmentName: string;
    newPodHash: string,
    k8sVersion: string;
}

export function getIframeSrc(appInfo: AppInfo, chartName: ChartTypes, calendarInputs, tab: AppMetricsTabType, isLegendRequired: boolean, statusCode?: StatusTypes, latency?: number): string {
    let baseURL = getGrafanaBaseURL(chartName);
    let grafanaURL = addChartNameExtensionToBaseURL(baseURL, appInfo.k8sVersion, chartName, statusCode);
    grafanaURL = addQueryParamToGrafanaURL(grafanaURL, appInfo.appId, appInfo.envId, appInfo.environmentName, chartName, appInfo.newPodHash, calendarInputs, tab, isLegendRequired, statusCode, latency)
    return grafanaURL;
}

export function getGrafanaBaseURL(chartName: ChartTypes): string {
    let url = '/grafana/d-solo';
    if (chartName === 'status') {
        url = `${url}/NnFpQOKGk/res_status_per_pod`;
    }
    else {
        url = `${url}/devtron-app-metrics-`;
    }
    return url;
}

export function getPodNameSuffix(nodeName: string, isAppDeployment: boolean,nodesMap: any, kind: string ): string {
    if (Nodes.Pod !== kind || !isAppDeployment) return ''
    if (!nodesMap.has(nodeName)) return ''
    const pod = nodesMap.get(nodeName)
    return pod.isNew ? '(new)' : '(old)'
}

interface NodeItems {
    label : string;
    value : string;
}

interface SelectedNodeItems {
    label : string;
    value : string;
}

export function getSelectedNodeItems(selectedNodes: string, nodeItems: NodeItems[], isAppDeployment: boolean,nodesMap: any, kind: string): SelectedNodeItems[] {
    let selectedNodeItems= [];
        if(selectedNodes == "All pods"){
            selectedNodeItems = nodeItems
        } else if (selectedNodes == "All new pods"){
            const result = nodeItems.filter(item => item.label.includes("(new)"));
            selectedNodeItems = result
        } else if (selectedNodes == "All old pods"){
            const result = nodeItems.filter(item => item.label.includes("(old)"));
            selectedNodeItems = result
        } else {
            let initialNode = { label: selectedNodes + getPodNameSuffix(selectedNodes, isAppDeployment, nodesMap, kind), value: selectedNodes }
            selectedNodeItems.push(initialNode)
        }

    return selectedNodeItems;
}

export function addChartNameExtensionToBaseURL(url: string, k8sVersion: string, chartName: ChartTypes, statusCode?: string): string {
    switch (chartName) {
        case 'latency':
            url += `latency/latency`;
            break;
        case 'ram':
            if (isK8sVersion115OrBelow(k8sVersion)) {
                url += `memory-k8s15/memory-usage-k8s15`;
            }
            else url += `memory/memory-usage`;
            break;
        case 'cpu':
            if (isK8sVersion115OrBelow(k8sVersion)) {
                url += `cpu-k8s15/cpu-usage-k8s15`;
            }
            else url += `cpu/cpu-usage`;
            break;
        case 'status':
            if (statusCode.includes("xx")) url += ``;
            else url += ``;
            break;
        default:
            return '';
    }
    return url;
}

export function addQueryParamToGrafanaURL(url: string, appId: string | number, envId: string | number, environmentName: string, chartName: ChartTypes, newPodHash: string, calendarInputs, tab: AppMetricsTabType, isLegendRequired: boolean, statusCode?: StatusTypes, latency?: number): string {
    let startTime: string = calendarInputs.startDate;
    let endTime: string = calendarInputs.endDate;
    url += `?orgId=${process.env.REACT_APP_GRAFANA_ORG_ID}`;
    url += `&refresh=10s`;
    url += `&var-app=${appId}`;
    url += `&var-env=${envId}`;
    url += `&var-new_rollout_pod_template_hash=${newPodHash}`;
    url += `&var-datasource=Prometheus-${environmentName}`;
    if (chartName === "status") {
        if (statusCode === StatusType.Throughput) { //Throughput Graph
            url += `&var-response_code_class=.*`;
            url += `&var-response_code=`;
        }
        else { //Status Code
            url += (statusCode.includes("xx")) ? `&var-response_code_class=${statusCode}` : `&var-response_code_class=`;
            url += (statusCode.includes("xx")) ? `&var-response_code=` : `&var-response_code=${statusCode}`;
        }
    }
    if (chartName === 'latency') {
        if (!isNaN(latency) ) {
            latency = latency/100;
        }
        url += `&var-percentile=${latency}`
    }
    let panelId = (tab === 'aggregate') ? 2 : 3;
    if (!isLegendRequired) {
        panelId = (tab === 'aggregate') ? 4 : 5;
    }
    url += `&from=${startTime}&to=${endTime}`;
    url += `&panelId=${panelId}`;
    return url;
}