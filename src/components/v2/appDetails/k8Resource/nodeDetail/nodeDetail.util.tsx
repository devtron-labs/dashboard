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

import { Moment } from 'moment'
import {
    decode,
    DeploymentAppTypes,
    K8sResourcePayloadAppType,
    YAMLStringify,
    OptionsBase,
    SelectedResourceType
} from '@devtron-labs/devtron-fe-common-lib'
import {
    AppType,
    EnvType,
    LogState,
    Options,
    PodContainerOptions,
    PodMetaData,
    NodeType,
    K8sResourcePayloadDeploymentType,
} from '../../appDetails.type'
import IndexStore from '../../index.store'
import { EphemeralContainerOptionsType, ManifestData, NodeDetailTab } from './nodeDetail.type'
import { multiSelectStyles } from '../../../common/ReactSelectCustomization'
import { sortOptionsByLabel } from '../../../../common'
import { ALLOW_UNTIL_TIME_OPTIONS, CUSTOM_LOGS_FILTER, MANIFEST_KEY_FIELDS } from '../../../../../config'
import { DeleteEphemeralButton } from './DeleteEphemeralButton'

export const getNodeDetailTabs = (nodeType: NodeType, isResourceBrowserTab?: boolean) => {
    if (nodeType.toLowerCase() === NodeType.Pod.toLowerCase()) {
        if (isResourceBrowserTab) {
            return [NodeDetailTab.MANIFEST, NodeDetailTab.EVENTS, NodeDetailTab.LOGS, NodeDetailTab.TERMINAL]
        }
        return [NodeDetailTab.LOGS, NodeDetailTab.TERMINAL, NodeDetailTab.EVENTS, NodeDetailTab.MANIFEST]
    }
    if (nodeType.toLowerCase() === NodeType.Containers.toLowerCase()) {
        return [NodeDetailTab.LOGS]
    }
    return [NodeDetailTab.MANIFEST, NodeDetailTab.EVENTS]
}

export const flatContainers = (pod: PodMetaData): string[] => [
    ...(pod?.containers || []),
    ...(pod?.initContainers || []),
    ...(pod?.ephemeralContainers?.map((_con) => _con.name) || []),
]

export const getContainersData = (pod: PodMetaData): OptionsBase[] => [
    ...(pod?.containers?.map((_container) => ({
        name: _container,
        isInitContainer: false,
        isEphemeralContainer: false,
    })) || []),
    ...(pod?.initContainers?.map((_container) => ({
        name: _container,
        isInitContainer: true,
        isEphemeralContainer: false,
    })) || []),
    ...(pod?.ephemeralContainers?.map((_container) => ({
        name: _container.name,
        isInitContainer: false,
        isEphemeralContainer: true,
        isExternal: _container.isExternal,
    })) || []),
]

export function getSelectedPodList(selectedOption: string): PodMetaData[] {
    let pods: PodMetaData[]
    const handleDefaultForSelectedOption = (name: string): void => {
        const podNames = new Set(IndexStore.getPodsForRootNode(name).map((_po) => _po.name))
        pods = IndexStore.getAllPods().filter((_po) => podNames.has(_po.name))
    }

    switch (selectedOption) {
        case 'All pods':
            pods = IndexStore.getAllPods()
            break
        case 'All new pods':
            pods = IndexStore.getAllNewPods()
            break
        case 'All old pods':
            pods = IndexStore.getAllNewPods()
            break
        default:
            if (selectedOption.startsWith('All new ')) {
                handleDefaultForSelectedOption(selectedOption.replace('All new ', ''))
            } else if (selectedOption.startsWith('All old ')) {
                handleDefaultForSelectedOption(selectedOption.replace('All old ', ''))
            } else if (selectedOption.startsWith('All ')) {
                handleDefaultForSelectedOption(selectedOption.replace('All ', ''))
            } else {
                pods = IndexStore.getAllPods().filter((_pod) => _pod.name === selectedOption)
            }
            break
    }
    return pods
}

export function getPodContainerOptions(
    isLogAnalyzer: boolean,
    params: { actionName: string; podName: string; nodeType: string; node: string },
    location: any,
    logState: LogState,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
): PodContainerOptions {
    if (!isLogAnalyzer) {
        let _selectedContainerName: string = new URLSearchParams(location.search).get('container')
        const containers = isResourceBrowserView
            ? selectedResource.containers
            : IndexStore.getAllPods()
                  .filter((_pod) => _pod.name === params.podName)
                  .flatMap((_pod) => getContainersData(_pod))

        if (containers.length === 0 || (containers.length === 1 && !containers[0].name)) {
            return {
                containerOptions: [],
                podOptions: [],
            }
        }

        _selectedContainerName =
            logState.selectedContainerOption ?? _selectedContainerName ?? (containers[0].name as string)

        const containerOptions = containers.map((_container) => ({
            ..._container,
            selected: _container.name === _selectedContainerName,
            isEphemeralContainer: _container.isEphemeralContainer,
            isInitContainer: _container.isInitContainer,
        }))

        return {
            containerOptions,
            podOptions: [{ name: isResourceBrowserView ? params.node : params.podName, selected: true }],
        }
    }
    // build pod options
    const rootNamesOfPods = IndexStore.getPodsRootParentNameAndStatus().flatMap((_ps) => _ps[0].split('/').splice(-1))
    const additionalPodOptions = rootNamesOfPods.map((rn, index) => ({ name: `All ${rn}`, selected: index === 0 }))

    if (IndexStore.getEnvDetails().envType === EnvType.APPLICATION) {
        additionalPodOptions.concat(
            rootNamesOfPods.flatMap((rn) => [
                { name: `All new ${rn}`, selected: false },
                { name: `All old ${rn}`, selected: false },
            ]),
        )
    }
    const _allPods = IndexStore.getAllPods().sort()
    if (_allPods.length == 0) {
        return {
            containerOptions: [],
            podOptions: [],
        }
    }
    const podOptions = additionalPodOptions.concat(_allPods.map((_pod) => ({ name: _pod.name, selected: false })))
    if (logState.selectedPodOption) {
        podOptions.forEach(
            (_po) => (_po.selected = _po.name.toLowerCase() === logState.selectedPodOption.toLowerCase()),
        )
    }

    // build container Options
    const _allSelectedPods = getSelectedPodList(logState.selectedPodOption)
    const containers = (getContainersData(_allSelectedPods[0]) ?? []).sort()
    const containerOptions = containers.map((_container, index) => ({ ..._container, selected: index === 0 }))
    if (logState.selectedContainerOption) {
        containerOptions.forEach(
            (_co) => (_co.selected = _co.name.toLowerCase() === logState.selectedContainerOption.toLowerCase()),
        )
    }
    return {
        containerOptions,
        podOptions,
    }
}

export function getInitialPodContainerSelection(
    isLogAnalyzer: boolean,
    params: { actionName: string; podName: string; nodeType: string; node: string },
    location: any,
    isResourceBrowserView?: boolean,
    selectedResource?: SelectedResourceType,
): LogState {
    if (!isLogAnalyzer) {
        let _selectedContainerName: string = new URLSearchParams(location.search).get('container')
        const containers = isResourceBrowserView
            ? selectedResource.containers
            : IndexStore.getAllPods()
                  .filter((_pod) => _pod.name === params.podName)
                  .flatMap((_pod) => getContainersData(_pod))

        if (containers.length === 0) {
            return {
                selectedContainerOption: '',
                selectedPodOption: '',
            }
        }

        _selectedContainerName =
            (_selectedContainerName && containers.find((_co) => _co.name === _selectedContainerName))?.name ??
            containers[0].name
        return {
            selectedContainerOption: _selectedContainerName,
            selectedPodOption: isResourceBrowserView ? params.node : params.podName,
        }
    }
    const rootNamesOfPods = IndexStore.getPodsRootParentNameAndStatus()
        .flatMap((_ps) => _ps[0].split('/').splice(-1))
        .sort()
    const additionalPodOptions = rootNamesOfPods.map((rn, index) => ({ name: `All ${rn}`, selected: index == 0 }))

    const _selectedPodOption = additionalPodOptions.find((_po) => _po.selected)?.name ?? ''

    const _allSelectedPods = getSelectedPodList(_selectedPodOption)
    if (_allSelectedPods.length === 0) {
        return {
            selectedContainerOption: '',
            selectedPodOption: '',
        }
    }

    const containers = new Set(_allSelectedPods.flatMap((_pod) => flatContainers(_pod) ?? []))
    const _selectedContainerOption = [...containers].sort().find((_container, index) => index == 0) ?? ''
    return {
        selectedContainerOption: _selectedContainerOption,
        selectedPodOption: _selectedPodOption,
    }
}

export function getFirstOrNull<T extends { label: string }>(arr: T[]): T | null {
    if (arr.length === 0) {
        return null
    }
    // remove all pods in 'ALL PODS FOR' category, to get only 'INDIVIDUAL PODS' list
    const indvPodsList: T[] = arr.filter((_pod) => !_pod.label.startsWith('All '))

    // select first pod from the 'INDIVIDUAL PODS' list
    return indvPodsList.length > 0 ? indvPodsList[0] : null
}

export const getTimeStamp = (date: Moment, time: string) => Date.parse(`${date.format('YYYY-MM-DD')} ${time}`) / 1000

export const getPodLogsOptions = () => {
    const options = [
        { label: 'Custom...', value: 'custom', type: CUSTOM_LOGS_FILTER.CUSTOM },
        { label: 'Last 15 minutes', value: '15', type: CUSTOM_LOGS_FILTER.DURATION },
        { label: 'Last 30 minutes', value: '30', type: CUSTOM_LOGS_FILTER.DURATION },
        { label: 'Last 1 hour', value: '60', type: CUSTOM_LOGS_FILTER.DURATION },
        { label: 'Last 2 hours', value: '120', type: CUSTOM_LOGS_FILTER.DURATION },
        { label: '500 lines', value: '500', type: CUSTOM_LOGS_FILTER.LINES },
        { label: '1,000 lines', value: '1000', type: CUSTOM_LOGS_FILTER.LINES },
        { label: '5,000 lines', value: '5000', type: CUSTOM_LOGS_FILTER.LINES },
        { label: '10,000 lines', value: '10000', type: CUSTOM_LOGS_FILTER.LINES },
    ]
    return options
}

export const excludeFutureTimingsOptions = (allOptions, index) => {
    const newOptions = [...allOptions]
    for (let i = index + 1; i < allOptions.length; i++) {
        newOptions[i] = { ...newOptions[i], isDisabled: true }
    }
    return newOptions
}

export const getTimeFromTimestamp = (timestamp) => {
    const date = new Date(+timestamp * 1000)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    const value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`
    return ALLOW_UNTIL_TIME_OPTIONS.filter((option) => option.value == value)
}

export const getDurationUnits = () => [
    { label: 'Minutes', value: 'minutes' },
    { label: 'Hours', value: 'hours' },
]

export const getGroupedContainerOptions = (containers: Options[],isTerminal?, isResourceBrowserView?, setContainers?, selectedNamespace?, selectedClusterId?, selectedPodName?, switchSelectedContainer?, params?) => {
    const containerOptions = []
    const initContainerOptions = []
    const ephemeralContainerOptions = [] as EphemeralContainerOptionsType[]

    if (Array.isArray(containers) && containers.length > 0) {
        for (const _container of containers) {
            if (_container.isInitContainer) {
                initContainerOptions.push({
                    label: _container.name,
                    value: _container.name,
                })
            } else if (_container.isEphemeralContainer) {
                ephemeralContainerOptions.push({
                    label: _container.name,
                    value: _container.name,
                    isEphemeralContainer: _container.isEphemeralContainer,
                    isExternal: _container.isExternal,
                    endIcon: (
                        <DeleteEphemeralButton
                            containerName={_container.name}
                            isResourceBrowserView={isResourceBrowserView}
                            setContainers={setContainers}
                            selectedNamespace={selectedNamespace}
                            selectedClusterId={selectedClusterId}
                            selectedPodName={selectedPodName}
                            switchSelectedContainer={switchSelectedContainer}
                            containers={containers}
                            isExternal={_container.isExternal}
                        />
                    ),
                })
            } else {
                containerOptions.push({
                    label: _container.name,
                    value: _container.name,
                })
            }
        }

        const groupedOptions = [
            {
                label: 'Main containers',
                options: containerOptions.sort(sortOptionsByLabel),
            },
        ]

        if (initContainerOptions.length > 0) {
            groupedOptions.push({
                label: 'Init containers',
                options: initContainerOptions.sort(sortOptionsByLabel),
            })
        }

        if (ephemeralContainerOptions.length > 0) {
            groupedOptions.push({
                label: 'Ephemeral containers',
                options: ephemeralContainerOptions.sort(sortOptionsByLabel),
            })
        }

        return groupedOptions
    }

    return []
}

export const selectStyles = {
    ...multiSelectStyles,
    control: (base) => ({
        ...base,
        minHeight: '36px',
        fontWeight: '400',
        backgroundColor: 'var(--bg-secondary)',
        cursor: 'pointer',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '0 8px',
    }),
}

/**
 * @description This function is used to trim the manifest data by removing the managed fields from the manifest data
 */
export const getTrimmedManifestData = (
    manifestData: ManifestData,
    returnAsString: boolean = false,
): ManifestData | string => {
    if (manifestData[MANIFEST_KEY_FIELDS.METADATA]) {
        const { [MANIFEST_KEY_FIELDS.MANAGED_FIELDS]: _, ...metadata } = manifestData[MANIFEST_KEY_FIELDS.METADATA]
        const trimmedManifestData = { ...manifestData, [MANIFEST_KEY_FIELDS.METADATA]: metadata }

        return returnAsString ? YAMLStringify(trimmedManifestData) : trimmedManifestData
    }

    return returnAsString ? YAMLStringify(manifestData) : manifestData
}

export const getK8sResourcePayloadAppType = (appType: string): K8sResourcePayloadAppType => {
    if (appType === AppType.DEVTRON_APP) {
        return K8sResourcePayloadAppType.DEVTRON_APP
    }
    if (appType === AppType.EXTERNAL_ARGO_APP) {
        return K8sResourcePayloadAppType.EXTERNAL_ARGO_APP
    }
    if (appType === AppType.EXTERNAL_FLUX_APP) {
        return K8sResourcePayloadAppType.EXTERNAL_FLUX_APP
    }
    return K8sResourcePayloadAppType.HELM_APP
}
export const getDecodedEncodedSecretManifestData = (
    manifestData: ManifestData,
    returnAsString: boolean = false,
    isEncoded?: boolean,
): ManifestData | string => {
    const encodedData = {
        ...manifestData,
        [MANIFEST_KEY_FIELDS.DATA]: decode(manifestData[MANIFEST_KEY_FIELDS.DATA], isEncoded),
    }
    return returnAsString ? YAMLStringify(encodedData) : manifestData
}

export const getDeploymentType = (deploymentAppType: DeploymentAppTypes): K8sResourcePayloadDeploymentType => {
    if (deploymentAppType === DeploymentAppTypes.HELM) {
        return K8sResourcePayloadDeploymentType.HELM_INSTALLED
    }
    if (deploymentAppType === DeploymentAppTypes.GITOPS) {
        return K8sResourcePayloadDeploymentType.ARGOCD_INSTALLED
    }
    return K8sResourcePayloadDeploymentType.FLUXCD_INSTALLED
}
