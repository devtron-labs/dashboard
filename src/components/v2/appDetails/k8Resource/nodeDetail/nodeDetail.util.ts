import { EnvType, LogState, NodeType, PodContainerOptions, PodMetaData } from '../../appDetails.type'
import IndexStore from '../../index.store'
import { NodeDetailTab } from './nodeDetail.type'
import { multiSelectStyles } from '../../../common/ReactSelectCustomization'

export const getNodeDetailTabs = (nodeType: NodeType) => {
    if (nodeType.toLowerCase() === NodeType.Pod.toLowerCase()) {
        return [NodeDetailTab.MANIFEST, NodeDetailTab.EVENTS, NodeDetailTab.LOGS, NodeDetailTab.TERMINAL]
    } else if (nodeType.toLowerCase() === NodeType.Containers.toLowerCase()) {
        return [NodeDetailTab.LOGS]
    } else {
        return [NodeDetailTab.MANIFEST, NodeDetailTab.EVENTS]
    }
}

export const flatContainers = (pod: PodMetaData): string[] => {
    return [...(pod?.containers || []), ...(pod?.initContainers || [])]
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
                pods = IndexStore.getAllPods().filter((_pod) => _pod.name == selectedOption)
            }
            break
    }
    return pods
}

export function getPodContainerOptions(
    isLogAnalyzer: boolean,
    params: { actionName: string; podName: string; nodeType: string },
    location: any,
    logState: LogState,
): PodContainerOptions {
    if (!isLogAnalyzer) {
        let _selectedContainerName: string = new URLSearchParams(location.search).get('container')
        const containers = IndexStore.getAllPods()
            .filter((_pod) => _pod.name == params.podName)
            .flatMap((_pod) => flatContainers(_pod))
            .sort()

        if (containers.length == 0 || (containers.length === 1 && !containers[0])) {
            return {
                containerOptions: [],
                podOptions: [],
            }
        }

        _selectedContainerName = logState.selectedContainerOption ?? _selectedContainerName ?? (containers[0] as string)

        const containerOptions = containers.map((_container) => {
            return { name: _container, selected: _container == _selectedContainerName }
        })

        return {
            containerOptions: containerOptions,
            podOptions: [{ name: params.podName, selected: true }],
        }
    } else {
        //build pod options
        const rootNamesOfPods = IndexStore.getPodsRootParentNameAndStatus().flatMap((_ps) =>
            _ps[0].split('/').splice(-1),
        )
        const additionalPodOptions = rootNamesOfPods.map((rn, index) => ({ name: 'All ' + rn, selected: index == 0 }))

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
                (_po) => (_po.selected = _po.name.toLowerCase() == logState.selectedPodOption.toLowerCase()),
            )
        }

        //build container Options
        const _allSelectedPods = getSelectedPodList(logState.selectedPodOption)
        const containers = (flatContainers(_allSelectedPods[0]) ?? []).sort()
        const containerOptions = containers.map((_container, index) => {
            return { name: _container, selected: index == 0 }
        })
        if (logState.selectedContainerOption) {
            containerOptions.forEach(
                (_co) => (_co.selected = _co.name.toLowerCase() == logState.selectedContainerOption.toLowerCase()),
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
    params: { actionName: string; podName: string; nodeType: string },
    location: any,
): LogState {
    if (!isLogAnalyzer) {
        let _selectedContainerName: string = new URLSearchParams(location.search).get('container')
        const containers = IndexStore.getAllPods()
            .filter((_pod) => _pod.name == params.podName)
            .flatMap((_pod) => flatContainers(_pod))
            .sort()

        if (containers.length == 0) {
            return {
                selectedContainerOption: '',
                selectedPodOption: '',
            }
        }

        _selectedContainerName = _selectedContainerName ?? (containers[0] as string)

        _selectedContainerName = containers.find((_co) => _co == _selectedContainerName) ?? ''

        return {
            selectedContainerOption: _selectedContainerName,
            selectedPodOption: params.podName,
        }
    } else {
        const rootNamesOfPods = IndexStore.getPodsRootParentNameAndStatus()
            .flatMap((_ps) => _ps[0].split('/').splice(-1))
            .sort()
        const additionalPodOptions = rootNamesOfPods.map((rn, index) => ({ name: 'All ' + rn, selected: index == 0 }))

        const _selectedPodOption = additionalPodOptions.find((_po) => _po.selected)?.name ?? ''

        const _allSelectedPods = getSelectedPodList(_selectedPodOption)
        if (_allSelectedPods.length == 0) {
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
            color: '#06c',
            direction: 'rtl',
            textAlign: 'left',
            marginLeft: '2px',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
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
        indicatorsContainer: (provided) => ({
            ...provided,
        }),
    }
}

export const getContainerOptions = (containers: string[]) => {
    return Array.isArray(containers) ? containers.map((container) => ({ label: container, value: container })) : []
}
