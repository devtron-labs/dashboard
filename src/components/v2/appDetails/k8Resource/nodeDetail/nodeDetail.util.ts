import {
    EnvType,
    LogState,
    NodeType,
    Options,
    OptionsBase,
    PodContainerOptions,
    PodMetaData,
    SelectedResourceType,
} from '../../appDetails.type'
import IndexStore from '../../index.store'
import { NodeDetailTab } from './nodeDetail.type'
import { multiSelectStyles } from '../../../common/ReactSelectCustomization'
import { sortOptionsByLabel } from '../../../../common'

export const getNodeDetailTabs = (nodeType: NodeType, isResourceBrowserTab?: boolean) => {
    if (nodeType.toLowerCase() === NodeType.Pod.toLowerCase()) {
        if (isResourceBrowserTab) {
            return [NodeDetailTab.MANIFEST, NodeDetailTab.EVENTS, NodeDetailTab.LOGS, NodeDetailTab.TERMINAL]
        } else return [NodeDetailTab.LOGS, NodeDetailTab.TERMINAL, NodeDetailTab.EVENTS, NodeDetailTab.MANIFEST]
    } else if (nodeType.toLowerCase() === NodeType.Containers.toLowerCase()) {
        return [NodeDetailTab.LOGS]
    } else {
        return [NodeDetailTab.MANIFEST, NodeDetailTab.EVENTS]
    }
}

export const flatContainers = (pod: PodMetaData): string[] => {
    return [...(pod?.containers || []), ...(pod?.initContainers || []), ...(pod?.ephemeralContainers?.map((_con) => { return _con.name }) || [])]
}

export const getContainersData = (pod: PodMetaData): OptionsBase[] => {
    return [
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
            isExternal: _container.isExternal
        })) || []),
    ]
}

export function getSelectedPodList(selectedOption: string): PodMetaData[] {
    let pods: PodMetaData[]
    const handleDefaultForSelectedOption = (name: string): void => {
        let podNames = new Set(IndexStore.getPodsForRootNode(name).map((_po) => _po.name))
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

        const containerOptions = containers.map((_container) => {
            return { ..._container, selected: _container.name === _selectedContainerName, isEphemeralContainer: _container.isEphemeralContainer, isInitContainer:  _container.isInitContainer}
        })

        return {
            containerOptions: containerOptions,
            podOptions: [{ name: isResourceBrowserView ? params.node : params.podName, selected: true }],
        }
    } else {
        //build pod options
        const rootNamesOfPods = IndexStore.getPodsRootParentNameAndStatus().flatMap((_ps) =>
            _ps[0].split('/').splice(-1),
        )
        const additionalPodOptions = rootNamesOfPods.map((rn, index) => ({ name: 'All ' + rn, selected: index === 0 }))

        if (IndexStore.getEnvDetails().envType === EnvType.APPLICATION) {
            additionalPodOptions.concat(
                rootNamesOfPods.flatMap((rn) => [
                    { name: 'All new ' + rn, selected: false },
                    { name: 'All old ' + rn, selected: false },
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
        const podOptions = additionalPodOptions.concat(
            _allPods.map((_pod) => {
                return { name: _pod.name, selected: false }
            }),
        )
        if (logState.selectedPodOption) {
            podOptions.forEach(
                (_po) => (_po.selected = _po.name.toLowerCase() === logState.selectedPodOption.toLowerCase()),
            )
        }

        //build container Options
        const _allSelectedPods = getSelectedPodList(logState.selectedPodOption)
        const containers = (getContainersData(_allSelectedPods[0]) ?? []).sort()
        const containerOptions = containers.map((_container, index) => {
            return { ..._container, selected: index === 0 }
        })
        if (logState.selectedContainerOption) {
            containerOptions.forEach(
                (_co) => (_co.selected = _co.name.toLowerCase() === logState.selectedContainerOption.toLowerCase()),
            )
        }
        return {
            containerOptions: containerOptions,
            podOptions: podOptions,
        }
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
    } else {
        const rootNamesOfPods = IndexStore.getPodsRootParentNameAndStatus()
            .flatMap((_ps) => _ps[0].split('/').splice(-1))
            .sort()
        const additionalPodOptions = rootNamesOfPods.map((rn, index) => ({ name: 'All ' + rn, selected: index == 0 }))

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
}

export function getFirstOrNull<T>(arr: T[]): T | null {
    if (arr.length > 0) {
        return arr[0]
    }
    return null
}

export const getContainerSelectStyles = () => {
    return {
        ...multiSelectStyles,
        menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left', width: '150%' }),
        menuList: (base) => ({
            ...base,
            paddingTop: 0,
        }),
        control: (base) => ({
            ...base,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            minHeight: '24px !important',
            cursor: 'pointer',
            height: '28px',
        }),
        singleValue: (base) => ({
            ...base,
            fontWeight: 600,
            color: '#06c',
            direction: 'rtl',
            textAlign: 'left',
            marginLeft: '2px',
        }),
        valueContainer: (base, state) => ({
            ...base,
            height: '28px',
            padding: '0 6px',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '28px',
        }),
        group: (base) => ({
            ...base,
            paddingTop: 0,
            paddingBottom: 0,
        }),
        groupHeading: (base) => ({
            ...base,
            fontWeight: 600,
            fontSize: '12px',
            textTransform: 'normal',
            height: '28px',
            color: 'var(--N900)',
            backgroundColor: 'var(--N100)',
            marginBottom: 0,
            display: 'flex',
            alignItems: 'center'
        }),
    }
}

export const getShellSelectStyles = () => {
    return {
        ...multiSelectStyles,
        menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left' }),
        control: (base) => ({
            ...base,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            minHeight: '24px !important',
            cursor: 'pointer',
        }),
        singleValue: (base) => ({
            ...base,
            fontWeight: 600,
            textAlign: 'left',
            color: '#06c',
        }),
        valueContainer: (base, state) => ({
            ...base,
            height: '28px',
            padding: '0 6px',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '28px',
        })
    }
}

export const getContainerOptions = (containers: string[]) => {
    return Array.isArray(containers) ? containers.map((container) => ({ label: container, value: container })) : []
}

export const getGroupedContainerOptions = (containers: Options[], isTerminal?: boolean) => {
    const containerOptions = [],
        initContainerOptions = [],
        ephemralContainerOptions = []

    if (Array.isArray(containers) && containers.length > 0) {
        for (const _container of containers) {
            if (_container.isInitContainer) {
                initContainerOptions.push({
                    label: _container.name,
                    value: _container.name,
                })
            } else if (_container.isEphemeralContainer) {
                ephemralContainerOptions.push({
                    label: _container.name,
                    value: _container.name,
                    isEphemeralContainer: _container.isEphemeralContainer,
                    isExternal:           _container.isExternal
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

        if (ephemralContainerOptions.length > 0){
            groupedOptions.push({
                label: 'Ephemeral containers',
                options: ephemralContainerOptions.sort(sortOptionsByLabel),
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
        backgroundColor: 'var(--N50)',
        cursor: 'pointer',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '0 8px',
    }),
}
