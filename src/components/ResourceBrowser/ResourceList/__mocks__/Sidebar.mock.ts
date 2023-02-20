import { Nodes } from '../../../app/types'
import { K8SObjectMapType, K8SObjectChildMapType, ApiResourceGroupType } from '../../Types'

export const PodSelectedResource: ApiResourceGroupType = {
    gvk: { Group: '', Version: 'v1', Kind: 'Pod' as Nodes },
    namespaced: true,
}

export const AppSelectedResource: ApiResourceGroupType = {
    gvk: { Group: 'catalog.cattle.io', Version: 'v1', Kind: 'App' as Nodes },
    namespaced: true,
}

const WorkloadsK8SObjectChildMap = new Map<string, K8SObjectChildMapType>([
    [
        'CronJob',
        {
            data: [
                {
                    gvk: { Group: 'batch', Version: 'v1', Kind: 'CronJob' as Nodes },
                    namespaced: true,
                },
            ],
            isExpanded: false,
        },
    ],
    [
        'DaemonSet',
        {
            data: [
                {
                    gvk: { Group: 'apps', Version: 'v1', Kind: 'DaemonSet' as Nodes },
                    namespaced: true,
                },
            ],
            isExpanded: false,
        },
    ],
    [
        'Deployment',
        {
            data: [
                {
                    gvk: { Group: 'apps', Version: 'v1', Kind: 'Deployment' as Nodes },
                    namespaced: true,
                },
            ],
            isExpanded: false,
        },
    ],
    [
        'Pod',
        {
            data: [PodSelectedResource],
            isExpanded: false,
        },
    ],
    [
        'ReplicaSet',
        {
            data: [
                {
                    gvk: { Group: 'apps', Version: 'v1', Kind: 'ReplicaSet' as Nodes },
                    namespaced: true,
                },
            ],
            isExpanded: false,
        },
    ],
])

const CustomResourceK8SObjectChildMap = new Map<string, K8SObjectChildMapType>([
    [
        'App',
        {
            data: [
                AppSelectedResource,
                {
                    gvk: { Group: 'project.cattle.io', Version: 'v3', Kind: 'App' as Nodes },
                    namespaced: true,
                },
            ],
            isExpanded: false,
        },
    ],
    [
        'Cluster',
        {
            data: [
                {
                    gvk: { Group: 'cluster.x-k8s.io', Version: 'v1beta1', Kind: 'Cluster' as Nodes },
                    namespaced: true,
                },
            ],
            isExpanded: false,
        },
    ],
])

export const K8SObjectMap = new Map<string, K8SObjectMapType>([
    [
        'Workloads',
        {
            child: WorkloadsK8SObjectChildMap,
            isExpanded: true,
            name: 'Workloads',
        },
    ],
    [
        'Custom Resource',
        {
            child: CustomResourceK8SObjectChildMap,
            isExpanded: false,
            name: 'Custom Resource',
        },
    ],
])

export const handleGroupHeadingClick = jest
    .fn()
    .mockImplementation((e: { currentTarget: { dataset: any } }, _k8SObjectMap: Map<string, K8SObjectMapType>) => {
        const splittedKey = e.currentTarget.dataset.groupName.split('/')
        if (splittedKey.length === 1) {
            const _selectedK8SObjectObj = _k8SObjectMap.get(e.currentTarget.dataset.groupName)

            if (_selectedK8SObjectObj) {
                _selectedK8SObjectObj.isExpanded = !_selectedK8SObjectObj.isExpanded
                _k8SObjectMap.set(e.currentTarget.dataset.groupName, _selectedK8SObjectObj)
            }
        } else {
            const _selectedK8SObjectObj = _k8SObjectMap.get(splittedKey[0])?.child.get(splittedKey[1])

            if (_selectedK8SObjectObj) {
                _selectedK8SObjectObj.isExpanded = !_selectedK8SObjectObj.isExpanded
                const _childObj = _k8SObjectMap.get(splittedKey[0])

                if (_childObj) {
                    _childObj.child.set(splittedKey[1], _selectedK8SObjectObj)
                    _k8SObjectMap.set(splittedKey[0], _childObj)
                }
            }
        }
    })
