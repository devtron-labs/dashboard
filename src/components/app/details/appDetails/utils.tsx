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
import React from 'react'
import { components } from 'react-select'
import { AggregationKeys } from '../../types'
import { getVersionArr, isVersionLessThanOrEqualToTarget, DayPickerRangeControllerPresets } from '../../../common'
import { ReactComponent as ArrowDown } from '../../../../assets/icons/ic-chevron-down.svg'
import { ChartTypes, AppMetricsTabType, StatusType, StatusTypes } from './appDetails.type'
import { ZERO_TIME_STRING, Nodes, NodeType, ACTION_STATE, ButtonStyleType } from '@devtron-labs/devtron-fe-common-lib'
import CreatableSelect from 'react-select/creatable'

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
        default:
            return defaultAsOtherResources ? AggregationKeys['Other Resources'] : AggregationKeys['Custom Resource']
    }
}

export const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className="icon-dim-20 fcn-6" />
        </components.DropdownIndicator>
    )
}

const throughputAndLatencySelectStyle = {
    container: (base, state) => ({
        ...base,
        outline: 'unset',
        height: '100%',
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
        width: 'auto',
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0',
        height: '100%',
        fontWeight: 600,
    }),
    singleValue: (base) => ({
        ...base,
        maxWidth: '77px',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '0',
        height: '20px',
    }),
}

export const ThroughputSelect = (props) => {
    return (
        <CreatableSelect
            className=""
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
            styles={throughputAndLatencySelectStyle}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator,
            }}
        />
    )
}

export const LatencySelect = (props) => {
    return (
        <CreatableSelect
            className=""
            placeholder="Latency"
            value={{ label: props.latency, value: props.latency }}
            options={[
                { label: '99.9', value: '99.9' },
                { label: '99.5', value: '99.5' },
                { label: '99', value: '99' },
                { label: '95', value: '95' },
            ]}
            onChange={props.handleLatencyChange}
            styles={throughputAndLatencySelectStyle}
            components={{
                IndicatorSeparator: null,
                DropdownIndicator,
            }}
            formatCreateLabel={(inputValue) => inputValue}
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
    environmentName: string
    newPodHash: string
    k8sVersion: string
}

export function getIframeSrc(
    appInfo: AppInfo,
    chartName: ChartTypes,
    calendarInputs,
    tab: AppMetricsTabType,
    isLegendRequired: boolean,
    statusCode?: StatusTypes,
    latency?: number,
): string {
    const baseURL = getGrafanaBaseURL(chartName)
    let grafanaURL = addChartNameExtensionToBaseURL(baseURL, appInfo.k8sVersion, chartName, statusCode)
    grafanaURL = addQueryParamToGrafanaURL(
        grafanaURL,
        appInfo.appId,
        appInfo.envId,
        appInfo.environmentName,
        chartName,
        appInfo.newPodHash,
        calendarInputs,
        tab,
        isLegendRequired,
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

export function addQueryParamToGrafanaURL(
    url: string,
    appId: string | number,
    envId: string | number,
    environmentName: string,
    chartName: ChartTypes,
    newPodHash: string,
    calendarInputs,
    tab: AppMetricsTabType,
    isLegendRequired: boolean,
    statusCode?: StatusTypes,
    latency?: number,
): string {
    const startTime: string = calendarInputs.startDate
    const endTime: string = calendarInputs.endDate
    url += `?orgId=${window.__GRAFANA_ORG_ID__}`
    url += `&refresh=10s`
    url += `&var-app=${appId}`
    url += `&var-env=${envId}`
    url += `&var-new_rollout_pod_template_hash=${newPodHash}`
    url += `&var-datasource=Prometheus-${environmentName}`
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
    url += `&panelId=${panelId}`
    return url
}

export const ValueContainer = (props) => {
    const { children, ...rest } = props
    return (
        <components.ValueContainer {...rest}>
            {`${props.getValue()[0].value}`}
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

export const validateMomentDate = (date: string, format: string): string => {
    if (!date || date === ZERO_TIME_STRING) {
        return '--'
    }
    return moment(date, format).fromNow()
}

class EnvironmentSelection {
    resolveEnvironmentId(params, environmentId, _envList, setEnvironmentId) {
        throw new Error('This method should be overridden by concrete classes.')
    }
}

export class NoParamsNoEnvContext extends EnvironmentSelection {
    resolveEnvironmentId(params, environmentId, _envList, setEnvironmentId) {
        return _envList[0].environmentId
    }
}

export class NoParamsWithEnvContext extends EnvironmentSelection {
    resolveEnvironmentId(params, environmentId, _envList, setEnvironmentId) {
        if (environmentId && _envList.map((env) => env.environmentId).includes(environmentId)) {
            return environmentId
        }
        return _envList[0].environmentId
    }
}

export class ParamsNoEnvContext extends EnvironmentSelection {
    resolveEnvironmentId(params, environmentId, _envList, setEnvironmentId) {
        if (params.envId && _envList.map((env) => env.environmentId).includes(+params.envId)) {
            return +params.envId
        }
        return _envList[0].environmentId
    }
}

export class ParamsAndEnvContext extends EnvironmentSelection {
    resolveEnvironmentId(params, environmentId, _envList, setEnvironmentId) {
        if (params.envId && _envList.map((env) => env.environmentId).includes(+params.envId)) {
            // If environmentId is present and different from params.envContext, set environmentId
            if (environmentId && +environmentId !== +params.envId) {
                setEnvironmentId(+params.envId)
            }
            return +params.envId
        }
        return _envList[0].environmentId
    }
}

export const getDeployButtonStyle = (actionState: ACTION_STATE): ButtonStyleType => {
    switch (actionState) {
        case ACTION_STATE.BLOCKED:
            return ButtonStyleType.negative
        case ACTION_STATE.PARTIAL:
            return ButtonStyleType.warning
        default:
            return ButtonStyleType.default
    }
}
