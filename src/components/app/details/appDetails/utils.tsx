import {
    Nodes,
    NodeType,
    AggregationKeys,
    AggregatedNodes,
    PodMetadatum,
} from '../../types';
import { getVersionArr, handleUTCTime, isVersionLessThanOrEqualToTarget, mapByKey } from '../../../common';
import React, { Component } from 'react';
import { components } from 'react-select';
import { ReactComponent as Bug } from '../../../../assets/icons/ic-bug.svg';
import { ReactComponent as ArrowDown } from '../../../../assets/icons/ic-chevron-down.svg';
import { ChartTypes, AppMetricsTabType, SecurityVulnerabilititesProps, StatusType, StatusTypes, DeploymentStatusDetailsBreakdownDataType, DeploymentStatusDetailsType } from './appDetails.type';
import CreatableSelect from 'react-select/creatable';
import { DayPickerRangeControllerPresets } from '../../../common';
import { DEPLOYMENT_STATUS, TIMELINE_STATUS } from '../../../../config';

export function getAggregator(nodeType: NodeType, defaultAsOtherResources?: boolean): AggregationKeys {
    switch (nodeType) {
        case Nodes.DaemonSet:
        case Nodes.Deployment:
        case Nodes.Pod:
        case Nodes.ReplicaSet:
        case Nodes.Job:
        case Nodes.CronJob:
        case Nodes.ReplicationController:
        case Nodes.StatefulSet:
            return AggregationKeys.Workloads
        case Nodes.Ingress:
        case Nodes.Service:
        case Nodes.Endpoints:
        case Nodes.EndpointSlice:
        case Nodes.NetworkPolicy:
            return AggregationKeys.Networking
        case Nodes.ConfigMap:
        case Nodes.Secret:
        case Nodes.PersistentVolume:
        case Nodes.PersistentVolumeClaim:
        case Nodes.StorageClass:
        case Nodes.VolumeSnapshot:
        case Nodes.VolumeSnapshotContent:
        case Nodes.VolumeSnapshotClass:
        case Nodes.PodDisruptionBudget:
            return AggregationKeys['Config & Storage']
        case Nodes.ServiceAccount:
        case Nodes.ClusterRoleBinding:
        case Nodes.RoleBinding:
        case Nodes.ClusterRole:
        case Nodes.Role:
        case Nodes.PodSecurityPolicy:
            return AggregationKeys.RBAC
        case Nodes.MutatingWebhookConfiguration:
        case Nodes.ValidatingWebhookConfiguration:
            return AggregationKeys.Administration
        case Nodes.Alertmanager:
        case Nodes.Prometheus:
        case Nodes.ServiceMonitor:
            return AggregationKeys['Custom Resource']
        case Nodes.Event:
            return AggregationKeys.Events
        default:
            return defaultAsOtherResources ? AggregationKeys['Other Resources'] : AggregationKeys['Custom Resource']
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
                    <Bug className="icon-dim-20 dc__vertical-align-middle mr-8 fcy-7" />
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
    return <CreatableSelect className=""
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

export const processDeploymentStatusDetailsData = (data?: DeploymentStatusDetailsType): DeploymentStatusDetailsBreakdownDataType => {
  const deploymentData = {
      deploymentStatus: 'inprogress',
      deploymentStatusText: 'In progress',
      deploymentTriggerTime: data?.deploymentStartedOn || '',
      deploymentEndTime: data?.deploymentFinishedOn || '',
      deploymentError: '',
      triggeredBy: data?.triggeredBy || '',
      nonDeploymentError: '',
      deploymentStatusBreakdown: {
          DEPLOYMENT_INITIATED: {
              icon: 'success',
              displayText: `Deployment initiated ${data?.triggeredBy ? `by ${data?.triggeredBy}` : ''}`,
              displaySubText: '',
              time: '',
          },
          GIT_COMMIT: {
              icon: '',
              displayText: 'Push manifest to Git',
              displaySubText: '',
              timelineStatus: '',
              time: '',
              isCollapsed: true,
          },
          KUBECTL_APPLY: {
              icon: '',
              displayText: 'Apply manifest to Kubernetes',
              timelineStatus: '',
              displaySubText: '',
              time: '',
              resourceDetails: [],
              isCollapsed: true,
              kubeList: []
          },
          APP_HEALTH: {
              icon: '',
              displayText: 'Propogate manifest to Kubernetes resources',
              timelineStatus: '',
              displaySubText: '',
              time: '',
              isCollapsed: true,
          },
      },
  }

  const lastFetchedTime = handleUTCTime(data?.statusLastFetchedAt,true)
  const deploymentPhases = ['PreSync', 'Sync', 'PostSync', 'Skip', 'SyncFail']
  let tableData: { currentPhase: string; currentTableData: { icon: string; phase?: string; message: string }[] } = {
      currentPhase: '',
      currentTableData: [{ icon: 'success', message: 'Started by Argo CD' }],
  }

  // data when timelines is available
  if (data?.timelines?.length) {
      for (let index = data.timelines.length - 1; index >= 0; index--) {
          const element = data.timelines[index]
          if (element['status'] === TIMELINE_STATUS.HEALTHY || element['status'] === TIMELINE_STATUS.DEGRADED) {
              deploymentData.deploymentStatus = DEPLOYMENT_STATUS.SUCCEEDED
              deploymentData.deploymentStatusText = 'Succeeded'
              deploymentData.deploymentStatusBreakdown.APP_HEALTH.displaySubText =
                  element['status'] === TIMELINE_STATUS.HEALTHY ? '' : 'Degraded'
              deploymentData.deploymentStatusBreakdown.APP_HEALTH.time = element['statusTime']
              deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'success'
              deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'success'
              deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.isCollapsed = true
              deploymentData.deploymentStatusBreakdown.APP_HEALTH.isCollapsed = true
              deploymentData.deploymentStatusBreakdown.GIT_COMMIT.icon = 'success'
          } else if (element['status'] === TIMELINE_STATUS.DEPLOYMENT_FAILED) {
              deploymentData.deploymentStatus = DEPLOYMENT_STATUS.FAILED
              deploymentData.deploymentStatusText = 'Failed'
              deploymentData.deploymentStatusBreakdown.APP_HEALTH.displaySubText = '   Failed'
              deploymentData.deploymentError = element['statusDetail']
          }  else if (element['status'] === TIMELINE_STATUS.DEPLOYMENT_SUPERSEDED) {
            deploymentData.deploymentStatus = DEPLOYMENT_STATUS.SUPERSEDED
        } else if ( index === data.timelines.length - 1 && (element['status'] === TIMELINE_STATUS.FETCH_TIMED_OUT || element['status'] === TIMELINE_STATUS.UNABLE_TO_FETCH_STATUS)){
            if(element['status'] === TIMELINE_STATUS.FETCH_TIMED_OUT) {
                deploymentData.deploymentStatus = DEPLOYMENT_STATUS.TIMED_OUT
                deploymentData.deploymentStatusText = 'Timed out'
            } else if(element['status'] === TIMELINE_STATUS.UNABLE_TO_FETCH_STATUS) {
                deploymentData.deploymentStatus = DEPLOYMENT_STATUS.UNABLE_TO_FETCH
                deploymentData.deploymentStatusText = 'Unable to fetch status'
            }
            deploymentData.deploymentError = `Below resources did not become healthy within 10 mins. Resource status shown below was last fetched ${lastFetchedTime}. ${data.statusFetchCount} retries failed.`
          } else if (element['status'].includes(TIMELINE_STATUS.KUBECTL_APPLY)) {
              if(element?.resourceDetails){
                deploymentPhases.forEach((phase) => {
                    for(let item of element.resourceDetails){
                        if(phase === item.resourcePhase){
                            tableData.currentPhase = phase
                            if(item.resourceStatus === 'failed'){

                            }
                            tableData.currentTableData.push({icon: 'success',phase: phase, message: `${phase}: Create and update resources based on manifest` })
                            return
                        }
                    }
                  })
              }
              if (
                  element['status'] === TIMELINE_STATUS.KUBECTL_APPLY_STARTED &&
                  deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.time === '' &&
                  deploymentData.deploymentStatus !== DEPLOYMENT_STATUS.SUCCEEDED
              ) {
                deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.resourceDetails = element.resourceDetails?.filter((item) => item.resourcePhase ===  tableData.currentPhase)
                  if (deploymentData.deploymentStatus === DEPLOYMENT_STATUS.FAILED) {
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'unknown'
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText = ': Unknown'
                      deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'unknown'
                      deploymentData.deploymentStatusBreakdown.APP_HEALTH.displaySubText = ': Unknown'
                  } else if (deploymentData.deploymentStatus === DEPLOYMENT_STATUS.SUCCEEDED) {
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'success'
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText = ''
                  } else if (deploymentData.deploymentStatus === DEPLOYMENT_STATUS.TIMED_OUT || deploymentData.deploymentStatus === DEPLOYMENT_STATUS.UNABLE_TO_FETCH) {
                      if(deploymentData.deploymentStatus === DEPLOYMENT_STATUS.TIMED_OUT){
                        deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'unknown'
                        deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.isCollapsed = false
                      } else {
                        deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'disconnect'
                      }
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText = 'Unknown'
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.timelineStatus =
                          deploymentData.deploymentError
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.kubeList = tableData.currentTableData.map(
                          (item) => {
                              return {
                                  icon: item.phase === tableData.currentPhase ? 'failed' : 'success',
                                  message: item.message,
                              }
                          },
                      )
                  } else {
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'inprogress'
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText = 'In progress'
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.time = element['statusTime']
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.timelineStatus = element.statusDetail
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.isCollapsed = false
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.kubeList = tableData.currentTableData.map(
                          (item) => {
                              return {
                                  icon: item.phase === tableData.currentPhase ? 'loading' : 'success',
                                  message: item.message,
                              }
                          },
                      )
                  }
              } else if (element['status'] === TIMELINE_STATUS.KUBECTL_APPLY_SYNCED) {
                  deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.resourceDetails = []
                  deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText = ''
                  deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.time = element['statusTime']
                  deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'success'
                  deploymentData.deploymentStatusBreakdown.GIT_COMMIT.icon = 'success'
                  deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.kubeList = tableData.currentTableData


                  if (deploymentData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS) {
                      deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'inprogress'
                      deploymentData.deploymentStatusBreakdown.APP_HEALTH.isCollapsed = false
                  } else if(deploymentData.deploymentStatus  === DEPLOYMENT_STATUS.FAILED){
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'failed'
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.displaySubText = 'Failed'
                  } else if (deploymentData.deploymentStatus === DEPLOYMENT_STATUS.TIMED_OUT) {
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'timed_out'
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.displaySubText = 'Unknown'
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.timelineStatus = deploymentData.deploymentError
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.isCollapsed = false
                } else if (deploymentData.deploymentStatus === DEPLOYMENT_STATUS.UNABLE_TO_FETCH) {
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'disconnect'
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.displaySubText = 'Unknown'
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.timelineStatus = deploymentData.deploymentError
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.isCollapsed = false
                }
              }
          } else if (element['status'].includes(TIMELINE_STATUS.GIT_COMMIT)) {
              deploymentData.deploymentStatusBreakdown.GIT_COMMIT.time = element['statusTime']
              if (element['status'] === TIMELINE_STATUS.GIT_COMMIT_FAILED) {
                  deploymentData.deploymentStatusBreakdown.GIT_COMMIT.displaySubText = 'Failed'
                  deploymentData.deploymentStatusBreakdown.GIT_COMMIT.icon = 'failed'
                  deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'unreachable'
                  deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'unreachable'
                  deploymentData.deploymentStatusBreakdown.GIT_COMMIT.isCollapsed = false
                  deploymentData.deploymentStatus = DEPLOYMENT_STATUS.FAILED
                  deploymentData.deploymentStatusText = 'Failed'
                  deploymentData.deploymentStatusBreakdown.GIT_COMMIT.timelineStatus = element['statusDetail']
              } else {
                  deploymentData.deploymentStatusBreakdown.GIT_COMMIT.icon = 'success'
                  if (deploymentData.deploymentStatus === DEPLOYMENT_STATUS.FAILED) {
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText = ''
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'unreachable'
                      deploymentData.deploymentStatusBreakdown.APP_HEALTH.displaySubText = ''
                      deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'unreachable'
                      deploymentData.nonDeploymentError = TIMELINE_STATUS.KUBECTL_APPLY
                  } else
                  if (
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.time === '' &&
                      deploymentData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS
                  ) {
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = ''
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText = 'Waiting'
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.kubeList = [
                          { icon: '', message: 'Waiting to be started by Argo CD' },
                          { icon: '', message: 'Create and update resources based on manifest' },
                      ]
                      deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.isCollapsed = false
                  }
              }
          } else if (element['status'] === TIMELINE_STATUS.DEPLOYMENT_INITIATED) {
              deploymentData.deploymentStatusBreakdown.DEPLOYMENT_INITIATED.time = element['statusTime']
              if (
                  deploymentData.deploymentStatusBreakdown.GIT_COMMIT.time === '' &&
                  deploymentData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS
              ) {
                  deploymentData.deploymentStatusBreakdown.GIT_COMMIT.icon = 'inprogress'
              }
              if (deploymentData.deploymentStatus === DEPLOYMENT_STATUS.FAILED) {
                if(deploymentData.deploymentStatusBreakdown.GIT_COMMIT.time === ''){
                  deploymentData.deploymentStatusBreakdown.GIT_COMMIT.displaySubText = ''
                  deploymentData.deploymentStatusBreakdown.GIT_COMMIT.icon = 'unreachable'
                  deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText = ''
                  deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'unreachable'
                  deploymentData.deploymentStatusBreakdown.APP_HEALTH.displaySubText = ''
                  deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'unreachable'
                  deploymentData.nonDeploymentError = TIMELINE_STATUS.GIT_COMMIT
                } else if(deploymentData.deploymentStatusBreakdown.GIT_COMMIT.icon !== 'failed'){
                  if(deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.time === ''){
                    deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.displaySubText = 'Unknown'
                    deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'unknown'
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.displaySubText = ': Unknown'
                    deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'unknown'
                  }
                }
              }
          }
      }
  } else if(!data?.timelines){   // data when timelines is not available in case of the previously deployed app(deployment-status/timline api) )
    if (data?.wfrStatus === 'Healthy' || data?.wfrStatus === 'Succeeded') {
        deploymentData.deploymentStatus = DEPLOYMENT_STATUS.SUCCEEDED
        deploymentData.deploymentStatusText = 'Succeeded'
        deploymentData.deploymentStatusBreakdown.APP_HEALTH.icon = 'success'
        deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.icon = 'success'
        deploymentData.deploymentStatusBreakdown.KUBECTL_APPLY.isCollapsed = true
        deploymentData.deploymentStatusBreakdown.APP_HEALTH.isCollapsed = true
        deploymentData.deploymentStatusBreakdown.GIT_COMMIT.icon = 'success'
    } else if (data?.wfrStatus === 'Failed' || data?.wfrStatus === 'Degraded') {
        deploymentData.deploymentStatus = DEPLOYMENT_STATUS.FAILED
        deploymentData.deploymentStatusText = 'Failed'
        deploymentData.deploymentStatusBreakdown.APP_HEALTH.displaySubText = 'Failed'
    }else if (data?.wfrStatus === 'Progressing'){
        deploymentData.deploymentStatus = DEPLOYMENT_STATUS.PROGRESSING
        deploymentData.deploymentStatusText = 'In progress'
    }
  }
  return deploymentData
}

export const ValueContainer = (props) => {
  const { children, ...rest } = props
  return (
      <components.ValueContainer {...rest}>
          {'' + props.getValue()[0].value}
          {React.cloneElement(children[1])}
      </components.ValueContainer>
  )
}

export const ValueContainerImage = (props) => {
    const value = props.selectProps?.value?.value
    return (
        <components.ValueContainer {...props}>
            <>
                {!props.selectProps.menuIsOpen &&
                    (value ? (
                        <div className="cn-7 fs-12 flex left">{value}</div>
                    ) : (
                        <span className="cn-5">Select or enter image</span>
                    ))}
                {React.cloneElement(props.children[1])}
            </>
        </components.ValueContainer>
    )
}