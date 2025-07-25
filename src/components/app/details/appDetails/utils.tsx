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

import moment from 'moment'
import { AggregationKeys } from '../../types'
import { getVersionArr, isVersionLessThanOrEqualToTarget, DayPickerRangeControllerPresets } from '../../../common'
import { ChartTypes, AppMetricsTabType, StatusType, StatusTypes } from './appDetails.type'
import {
    ZERO_TIME_STRING,
    Nodes,
    NodeType,
    ACTION_STATE,
    ButtonStyleType,
    SelectPicker,
    SelectPickerProps,
    SelectPickerVariantType,
    prefixZeroIfSingleDigit,
    AppEnvironment,
    SelectPickerOptionType,
    IconsProps,
} from '@devtron-labs/devtron-fe-common-lib'
import { GetIFrameSrcParamsType } from './types'

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
        case Nodes.Namespace:
            return AggregationKeys.Namespaces
        case Nodes.Node:
            return AggregationKeys.Nodes
        default:
            return defaultAsOtherResources ? AggregationKeys['Other Resources'] : AggregationKeys['Custom Resource']
    }
}

export const ThroughputSelect = (props) => {
    const onCreateOption: SelectPickerProps['onCreateOption'] = (inputValue) => {
        props.handleStatusChange({ label: inputValue, value: inputValue })
    }

    return (
        <SelectPicker
            isCreatable
            inputId="throughput-select"
            placeholder="Status Code"
            value={{ label: props.status, value: props.status }}
            options={[
                { label: '2xx', value: '2xx' },
                { label: '200', value: '200' },
                { label: '201', value: '201' },
                { label: '204', value: '204' },
                { label: '4xx', value: '4xx' },
                { label: '5xx', value: '5xx' },
                { label: 'Throughput', value: 'Throughput' },
            ]}
            onChange={props.handleStatusChange}
            onCreateOption={onCreateOption}
            variant={SelectPickerVariantType.COMPACT}
            menuPosition="absolute"
        />
    )
}

export const LatencySelect = (props) => {
    const onCreateOption: SelectPickerProps['onCreateOption'] = (inputValue) => {
        props.handleLatencyChange({ label: inputValue, value: inputValue })
    }

    return (
        <SelectPicker
            isCreatable
            inputId="latency-select"
            placeholder="Latency"
            value={{ label: props.latency, value: props.latency }}
            options={[
                { label: '99.9', value: '99.9' },
                { label: '99.5', value: '99.5' },
                { label: '99', value: '99' },
                { label: '95', value: '95' },
            ]}
            onChange={props.handleLatencyChange}
            onCreateOption={onCreateOption}
            variant={SelectPickerVariantType.COMPACT}
            menuPosition="absolute"
        />
    )
}

export function getCalendarValue(startDateStr: string, endDateStr: string): string {
    let str: string = `${startDateStr} - ${endDateStr}`
    if (endDateStr === 'now' && startDateStr.includes('now')) {
        const range = DayPickerRangeControllerPresets.find((d) => d.endStr === startDateStr)
        if (range) {
            str = range.text
        } else {
            str = `${startDateStr} - ${endDateStr}`
        }
    }
    return str
}

export function isK8sVersionValid(k8sVersion: string): boolean {
    if (!k8sVersion) {
        return false
    }
    try {
        const versionNum = getVersionArr(k8sVersion)
        const sum = versionNum.reduce((sum, item) => {
            return (sum += item)
        }, 0)
        if (isNaN(sum)) {
            return false
        }
    } catch (error) {
        return false
    }
    return true
}

export function isK8sVersion115OrBelow(k8sVersion: string): boolean {
    // Comparing with v1.15.xxx
    const target = [1, 15]
    return isVersionLessThanOrEqualToTarget(k8sVersion, target)
}

export interface AppInfo {
    appId: string | number
    envId: string | number
    dataSourceName: string
    newPodHash: string
    k8sVersion: string
}

export function getIframeSrc({
    appInfo,
    chartName,
    calendarInputs,
    tab,
    isLegendRequired,
    statusCode,
    latency,
    grafanaTheme = 'light',
}: GetIFrameSrcParamsType): string {
    const baseURL = getGrafanaBaseURL(chartName)
    let grafanaURL = addChartNameExtensionToBaseURL(baseURL, appInfo.k8sVersion, chartName, statusCode)
    grafanaURL = addQueryParamToGrafanaURL(
        grafanaURL,
        appInfo.appId,
        appInfo.envId,
        appInfo.dataSourceName,
        chartName,
        appInfo.newPodHash,
        calendarInputs,
        tab,
        isLegendRequired,
        grafanaTheme,
        statusCode,
        latency,
    )
    return grafanaURL
}

export function getGrafanaBaseURL(chartName: ChartTypes): string {
    let url = '/grafana/d-solo'
    if (chartName === 'status') {
        url = `${url}/NnFpQOKGk/res_status_per_pod`
    } else {
        url = `${url}/devtron-app-metrics-`
    }
    return url
}

export function getPodNameSuffix(nodeName: string, isAppDeployment: boolean, nodesMap: any, kind: string): string {
    if (Nodes.Pod !== kind || !isAppDeployment) {
        return ''
    }
    if (!nodesMap.has(nodeName)) {
        return ''
    }
    const pod = nodesMap.get(nodeName)
    return pod.isNew ? '(new)' : '(old)'
}

interface NodeItems {
    label: string
    value: string
}

interface SelectedNodeItems {
    label: string
    value: string
}

export function getSelectedNodeItems(
    selectedNodes: string,
    nodeItems: NodeItems[],
    isAppDeployment: boolean,
    nodesMap: any,
    kind: string,
): SelectedNodeItems[] {
    let selectedNodeItems = []
    if (selectedNodes == 'All pods') {
        selectedNodeItems = nodeItems
    } else if (selectedNodes == 'All new pods') {
        const result = nodeItems.filter((item) => item.label.includes('(new)'))
        selectedNodeItems = result
    } else if (selectedNodes == 'All old pods') {
        const result = nodeItems.filter((item) => item.label.includes('(old)'))
        selectedNodeItems = result
    } else {
        const initialNode = {
            label: selectedNodes + getPodNameSuffix(selectedNodes, isAppDeployment, nodesMap, kind),
            value: selectedNodes,
        }
        selectedNodeItems.push(initialNode)
    }

    return selectedNodeItems
}

export function addChartNameExtensionToBaseURL(
    url: string,
    k8sVersion: string,
    chartName: ChartTypes,
    statusCode?: string,
): string {
    switch (chartName) {
        case 'latency':
            url += `latency/latency`
            break
        case 'ram':
            if (isK8sVersion115OrBelow(k8sVersion)) {
                url += `memory-k8s15/memory-usage-k8s15`
            } else {
                url += `memory/memory-usage`
            }
            break
        case 'cpu':
            if (isK8sVersion115OrBelow(k8sVersion)) {
                url += `cpu-k8s15/cpu-usage-k8s15`
            } else {
                url += `cpu/cpu-usage`
            }
            break
        case 'status':
            url += ``
            break
        default:
            return ''
    }
    return url
}

// Need to send either the relative time like: now-5m or the timestamp to grafana
// Assuming format is 'DD-MM-YYYY hh:mm:ss'
const getTimestampFromDateIfAvailable = (dateString: string): string => {
    try {
        const [day, month, yearAndTime] = dateString.split('-')
        const [year, time] = yearAndTime.split(' ')
        const updatedTime = time
            .split(':')
            .map((item) => (['0', '00'].includes(item) ? '00' : prefixZeroIfSingleDigit(Number(item))))
            .join(':')
        const formattedDate = `${year}-${prefixZeroIfSingleDigit(Number(month))}-${prefixZeroIfSingleDigit(Number(day))}T${updatedTime}`
        const parsedDate = new Date(formattedDate).getTime()

        return isNaN(parsedDate) ? dateString : parsedDate.toString()
    } catch {
        return dateString
    }
}

export function addQueryParamToGrafanaURL(
    url: string,
    appId: string | number,
    envId: string | number,
    dataSourceName: string,
    chartName: ChartTypes,
    newPodHash: string,
    calendarInputs,
    tab: AppMetricsTabType,
    isLegendRequired: boolean,
    grafanaTheme: GetIFrameSrcParamsType['grafanaTheme'],
    statusCode?: StatusTypes,
    latency?: number,
): string {
    const startTime: string = getTimestampFromDateIfAvailable(calendarInputs.startDate)
    const endTime: string = getTimestampFromDateIfAvailable(calendarInputs.endDate)
    url += `?orgId=${window.__GRAFANA_ORG_ID__}`
    url += `&refresh=10s`
    url += `&var-app=${appId}`
    url += `&var-env=${envId}`
    url += `&var-new_rollout_pod_template_hash=${newPodHash}`
    url += `&var-datasource=${dataSourceName}`
    if (chartName === 'status') {
        if (statusCode === StatusType.Throughput) {
            // Throughput Graph
            url += `&var-response_code_class=.*`
            url += `&var-response_code=`
        } else {
            // Status Code
            url += statusCode.includes('xx') ? `&var-response_code_class=${statusCode}` : `&var-response_code_class=`
            url += statusCode.includes('xx') ? `&var-response_code=` : `&var-response_code=${statusCode}`
        }
    }
    if (chartName === 'latency') {
        if (!isNaN(latency)) {
            latency /= 100
        }
        url += `&var-percentile=${latency}`
    }
    let panelId = tab === 'aggregate' ? 2 : 3
    if (!isLegendRequired) {
        panelId = tab === 'aggregate' ? 4 : 5
    }
    url += `&from=${startTime}&to=${endTime}`
    url += `&panelId=${panelId}&theme=${grafanaTheme}`
    return url
}

export const validateMomentDate = (date: string, format: string): string => {
    if (!date || date === ZERO_TIME_STRING) {
        return '--'
    }
    return moment(date, format).fromNow()
}

export const getDeployButtonConfig = (
    actionState: ACTION_STATE,
): { buttonStyle: ButtonStyleType; iconName: IconsProps['name'] } => {
    switch (actionState) {
        case ACTION_STATE.BLOCKED:
            return { buttonStyle: ButtonStyleType.negative, iconName: 'ic-info-outline' }
        case ACTION_STATE.PARTIAL:
            return { buttonStyle: ButtonStyleType.warning, iconName: 'ic-rocket-launch' }
        default:
            return { buttonStyle: ButtonStyleType.default, iconName: 'ic-rocket-launch' }
    }
}

export const getEnvOptions = (env: AppEnvironment): SelectPickerOptionType<number> => ({
    label: env.environmentName,
    value: env.environmentId,
})
