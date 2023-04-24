import React, { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import {
    processK8SObjects,
    convertToOptionsList,
    sortObjectArrayAlphabetically,
    sortOptionsByLabel,
} from '../../common'
import {
    showError,
    InfoColourBar,
    ClearIndicator,
    Option,
    MultiValueRemove,
    MultiValueChipContainer,
} from '@devtron-labs/devtron-fe-common-lib'
import {
    getClusterList,
    getResourceGroupList,
    getResourceList,
    namespaceListByClusterId,
} from '../../ResourceBrowser/ResourceBrowser.service'
import { GVKType, K8SObjectType, ResourceListPayloadType } from '../../ResourceBrowser/Types'
import {
    CustomValueContainer,
    formatOptionLabel,
    menuComponent,
    Option as SingleSelectOption,
} from '../../v2/common/ReactSelect.utils'
import { ALL_NAMESPACE, K8sListItemCardType, K8S_PERMISSION_INFO_MESSAGE, OptionType } from '../userGroups.types'
import { ReactComponent as Clone } from '../../../assets/icons/ic-copy.svg'
import { ReactComponent as Delete } from '../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import CreatableSelect from 'react-select/creatable'
import {
    k8sPermissionRoles,
    k8sPermissionStyle,
    k8sRoleSelectionStyle,
    multiSelectAllState,
    resourceMultiSelectstyles,
} from './K8sPermissions.utils'
import Tippy from '@tippyjs/react'
import { resourceKindOptionLabel } from './K8sPermission.component'

export default function K8sListItemCard({
    k8sPermission,
    handleK8sPermission,
    index,
    namespaceMapping,
    setNamespaceMapping,
    apiGroupMapping,
    setApiGroupMapping,
    kindMapping,
    setKindMapping,
    objectMapping,
    setObjectMapping,
    selectedPermissionAction,
}: K8sListItemCardType) {
    const [clusterOptions, setClusterOptions] = useState<OptionType[]>([])
    const [processedData, setProcessedData] = useState<Map<string, K8SObjectType>>()
    const [processedGvkData, setProcessedGvkData] = useState<Map<string, K8SObjectType>>()
    const [allInApiGroupMapping, setAllInApiGroupMapping] = useState<OptionType[]>([])
    const [allInKindMapping, setAllInKindMapping] = useState<OptionType[]>([])

    useEffect(() => {
        getClusterListData()
        setApiGroupMapping((prevMapping) => ({
            ...prevMapping,
            [k8sPermission.key]: [{ label: 'All API groups', value: '*' }],
        }))
    }, [])

    const getClusterListData = async () => {
        try {
            const { result } = await getClusterList()
            if (result) {
                const _clusterOptions = convertToOptionsList(
                    sortObjectArrayAlphabetically(result, 'cluster_name'),
                    'cluster_name',
                    'id',
                )
                setClusterOptions(_clusterOptions)
                if (k8sPermission?.cluster) {
                    const selectedCluster = _clusterOptions?.find((ele) => ele.label === k8sPermission.cluster.label)
                    handleK8sPermission('edit', index, selectedCluster)
                    getNamespaceList(selectedCluster.value)
                    getGroupKindData(selectedCluster.value)
                }
            }
        } catch (err) {
            showError(err)
        }
    }

    const getNamespaceList = async (clusterId: string) => {
        try {
            const { result } = await namespaceListByClusterId(clusterId)
            if (result) {
                setNamespaceMapping((prevMapping) => ({
                    ...prevMapping,
                    [clusterId]: [ALL_NAMESPACE, ...convertToOptionsList(result.sort())],
                }))
            } else {
                setNamespaceMapping((prevMapping) => ({ ...prevMapping, [clusterId]: [ALL_NAMESPACE] }))
            }
        } catch (err) {
            showError(err)
        }
    }

    const getGroupKindData = async (clusterId): Promise<void> => {
        try {
            const { result: resourceGroupList } = await getResourceGroupList(clusterId)
            if (resourceGroupList.apiResources) {
                const _processedData = processK8SObjects(resourceGroupList.apiResources, '', true)
                const _k8SObjectMap = _processedData.k8SObjectMap
                const _k8SObjectList: OptionType[] = []
                for (const [key, value] of _k8SObjectMap.entries()) {
                    if (key) {
                        _k8SObjectList.push({ label: key, value: key })
                    }
                }
                setProcessedData(_k8SObjectMap)
                const namespacedGvkList = resourceGroupList.apiResources.filter((item) => item.namespaced)
                const _processedNamespacedGvk = processK8SObjects(namespacedGvkList, '', true)
                setProcessedGvkData(_processedNamespacedGvk.k8SObjectMap)
                const _allApiGroupMapping = [],
                    _allKindMapping = []
                if (resourceGroupList.allowedAll) {
                    _allApiGroupMapping.push(
                        { label: 'All API groups', value: '*' },
                        { label: 'K8s core groups (eg. service, pod, etc.)', value: 'k8sempty' },
                    )
                    _allKindMapping.push({ label: 'All kind', value: '*' })
                }
                setAllInApiGroupMapping(_allApiGroupMapping)
                setAllInKindMapping(_allKindMapping)
                setApiGroupMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: [..._allApiGroupMapping, ..._k8SObjectList.sort(sortOptionsByLabel)],
                }))
                if (k8sPermission?.kind) {
                    createKindData(
                        k8sPermission.group,
                        _allKindMapping,
                        k8sPermission?.namespace.value === '*' ? _k8SObjectMap : _processedNamespacedGvk.k8SObjectMap,
                    )
                }
            }
        } catch (err) {
            showError(err)
        }
    }

    const createKindData = (selected, _allKindMapping, _k8SObjectMap = null) => {
        const kind: any[] = []
        let selectedGvk: GVKType
        if (_k8SObjectMap ?? processedData) {
            if (selected.value === '*') {
                for (const value of (_k8SObjectMap ?? processedData).values()) {
                    value?.child.forEach((ele) => {
                        kind.push({ value: ele.gvk['Kind'], label: ele.gvk['Kind'], gvk: ele.gvk })
                        if (!selectedGvk && ele.gvk.Kind === k8sPermission.kind?.value) {
                            selectedGvk = ele.gvk
                        }
                    })
                }
            } else {
                const data = (_k8SObjectMap ?? processedData).get(selected.value === 'k8sempty' ? '' : selected.value)
                data?.child?.forEach((ele) => {
                    if (ele.namespaced) {
                        kind.push({ label: ele.gvk['Kind'], value: ele.gvk['Kind'], gvk: ele.gvk })
                    }
                    if (!selectedGvk && ele.gvk.Kind === k8sPermission.kind?.value) {
                        selectedGvk = ele.gvk
                    }
                })
            }
        } else {
            _allKindMapping = [{ label: 'All kind', value: '*' }]
        }

        setKindMapping((prevMapping) => ({
            ...prevMapping,
            [k8sPermission.key]: [..._allKindMapping, ...kind.sort(sortOptionsByLabel)],
        }))
        if (k8sPermission?.resource) {
            if (k8sPermission.kind.value !== '*' && k8sPermission.kind.value !== 'Event') {
                getResourceListData({ ...k8sPermission.kind, gvk: selectedGvk }, _k8SObjectMap)
            } else {
                setObjectMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: [{ label: 'All resources', value: '*' }],
                }))
            }
        }
    }

    const getResourceListData = async (selected, _k8SObjectMap = null): Promise<void> => {
        try {
            const resourceListPayload: ResourceListPayloadType = {
                clusterId: Number(k8sPermission?.cluster?.value),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: selected?.gvk,
                        namespace: k8sPermission?.namespace?.value === '*' ? '' : k8sPermission?.namespace.value,
                    },
                },
            }
            const { result } = await getResourceList(resourceListPayload)
            if (result) {
                const _data =
                    result.data
                        ?.map((ele) => {
                            return { label: ele['name'], value: ele['name'] }
                        })
                        .sort(sortOptionsByLabel) ?? []
                const _optionList = [{ label: 'All resources', value: '*' }, ..._data]
                setObjectMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: _optionList,
                }))
                if (k8sPermission.resource?.[0]?.value === '*') {
                    handleK8sPermission('onObjectChange', index, _optionList)
                }
            }
        } catch (err) {
            showError(err)
        }
    }

    const onClusterChange = (selected) => {
        if (selected.value !== k8sPermission?.cluster?.value) {
            setProcessedData(null)
            setProcessedGvkData(null)
            setApiGroupMapping((prevMapping) => ({
                ...prevMapping,
                [k8sPermission.key]: [{ label: 'All API groups', value: '*' }],
            }))
            handleK8sPermission('onClusterChange', index, selected)
            getNamespaceList(selected.value)
            getGroupKindData(selected.value)
        }
    }

    const onNameSpaceSelection = (selected) => {
        if (selected.value !== k8sPermission?.namespace?.value) {
            handleK8sPermission('onNamespaceChange', index, selected)
            const _GvkObjectList: OptionType[] = []
            if (processedGvkData) {
                for (const [key] of processedGvkData.entries()) {
                    if (key) {
                        _GvkObjectList.push({ label: key, value: key })
                    }
                }
                setApiGroupMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: [...allInApiGroupMapping, ..._GvkObjectList.sort(sortOptionsByLabel)],
                }))
            }
        }
    }

    const onApiGroupSelect = (selected) => {
        if (selected.value !== k8sPermission?.group?.value) {
            handleK8sPermission('onApiGroupChange', index, selected)
            createKindData(selected, allInKindMapping)
        }
    }

    const onKindSelect = (selected) => {
        if (selected.value !== k8sPermission?.kind?.value) {
            handleK8sPermission('onKindChange', index, selected)
            if (selected.value !== '*' && selected.value !== 'Event') {
                getResourceListData(selected)
            } else {
                setObjectMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: [{ label: 'All resources', value: '*' }],
                }))
            }
        }
    }
    const setK8sPermission = (options): void => {
        handleK8sPermission('onObjectChange', index, options)
    }

    const onResourceObjectChange = (selected, actionMeta) => {
        multiSelectAllState(selected, actionMeta, setK8sPermission, objectMapping?.[k8sPermission.key])
    }

    const setRoleSelection = (selected) => {
        if (selected.value !== k8sPermission.action?.value) {
            handleK8sPermission('onRoleChange', index, selected)
        }
    }

    const editPermission = (action) => {
        handleK8sPermission(action, index)
    }

    const k8sMultiValueContainer = (): boolean => {
        let isAllSelected = false
        k8sPermission.resource.forEach((item) => {
            if (item.value === '*') {
                isAllSelected = true
            }
        })
        return isAllSelected
    }

    return (
        <div className="mt-16 mb-16 dc__border br-4 p-16 bcn-0">
            <div className="cn-6 mb-6 flex dc__content-space">
                <span>Cluster</span>
                {!selectedPermissionAction && (
                    <span className="flex">
                        <Tippy className="default-tt" arrow={false} placement="top" content="Duplicate">
                            <Clone className="icon-dim-16 mr-8 fcn-6 cursor" onClick={() => editPermission('clone')} />
                        </Tippy>
                        <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                            <Delete className="icon-dim-16 scn-6 cursor" onClick={() => editPermission('delete')} />
                        </Tippy>
                    </span>
                )}
            </div>
            <div className="mb-16">
                <ReactSelect
                    placeholder="Select cluster"
                    classNamePrefix="k8s-permission-select-cluster-dropdown"
                    options={clusterOptions}
                    value={k8sPermission?.cluster}
                    onChange={onClusterChange}
                    name="cluster"
                    components={{
                        IndicatorSeparator: null,
                        Option: SingleSelectOption,
                    }}
                    styles={k8sPermissionStyle}
                />
            </div>
            {k8sPermission?.cluster && (
                <>
                    <div className="cn-6 mb-6">Namespace</div>
                    <div className="mb-16">
                        <CreatableSelect
                            placeholder="Select namespace"
                            classNamePrefix="k8s-permission-select-namespace-dropdown"
                            options={namespaceMapping?.[k8sPermission?.cluster?.value]}
                            value={k8sPermission.namespace}
                            name="namespace"
                            isDisabled={!k8sPermission.cluster}
                            onChange={onNameSpaceSelection}
                            components={{
                                IndicatorSeparator: null,
                                Option: SingleSelectOption,
                                MenuList: (props) => menuComponent(props, 'namespaces'),
                            }}
                            styles={k8sPermissionStyle}
                        />
                    </div>
                    <div className="flexbox w-100">
                        <div className="w-100 mr-6">
                            <div className="cn-6 mb-6">API Group</div>
                            <div className="mb-16">
                                <ReactSelect
                                    placeholder="Select API group"
                                    classNamePrefix="k8s-permission-select-api-group-dropdown"
                                    options={apiGroupMapping?.[k8sPermission.key]}
                                    name="Api group"
                                    isDisabled={!k8sPermission.namespace}
                                    value={k8sPermission.group}
                                    onChange={onApiGroupSelect}
                                    components={{
                                        IndicatorSeparator: null,
                                        Option: SingleSelectOption,
                                    }}
                                    styles={k8sPermissionStyle}
                                />
                            </div>
                        </div>
                        <div className="w-100 ml-6">
                            <div className="cn-6 mb-6">Kind</div>
                            <div className="mb-16">
                                <ReactSelect
                                    placeholder="Select kind"
                                    classNamePrefix="k8s-permission-select-kind-dropdown"
                                    options={kindMapping?.[k8sPermission.key]}
                                    isDisabled={!k8sPermission.group}
                                    value={k8sPermission.kind}
                                    onChange={onKindSelect}
                                    formatOptionLabel={resourceKindOptionLabel}
                                    name="kind"
                                    components={{
                                        IndicatorSeparator: null,
                                        Option: SingleSelectOption,
                                        ValueContainer: CustomValueContainer,
                                    }}
                                    styles={k8sRoleSelectionStyle}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="cn-6 mb-6">Resource name</div>
                    <div className="mb-16">
                        <CreatableSelect
                            placeholder="Select resource"
                            classNamePrefix="k8s-permission-select-resource-dropdown"
                            options={objectMapping?.[k8sPermission.key]}
                            isDisabled={!k8sPermission.kind}
                            value={k8sPermission.resource}
                            name="Resource name"
                            onChange={onResourceObjectChange}
                            components={{
                                IndicatorSeparator: () => null,
                                MultiValueContainer: ({ ...props }) => (
                                    <MultiValueChipContainer
                                        {...props}
                                        validator={null}
                                        isAllSelected={k8sMultiValueContainer()}
                                    />
                                ),
                                ClearIndicator,
                                MultiValueRemove,
                                Option,
                                MenuList: (props) => menuComponent(props, 'resource name'),
                            }}
                            closeMenuOnSelect={false}
                            isMulti
                            hideSelectedOptions={false}
                            styles={resourceMultiSelectstyles}
                        />
                    </div>
                    {K8S_PERMISSION_INFO_MESSAGE[k8sPermission?.kind?.label] && (
                        <InfoColourBar
                            message={K8S_PERMISSION_INFO_MESSAGE[k8sPermission.kind.label]}
                            classname="info_bar mb-12"
                            Icon={InfoIcon}
                            iconClass="icon-dim-20"
                        />
                    )}
                    <div className="cn-6 mb-6">Role</div>
                    <div className="mb-16 w-300">
                        <ReactSelect
                            className="basic-multi-select"
                            classNamePrefix="k8s-permission-select-role-dropdown"
                            placeholder="Select role"
                            options={k8sPermissionRoles}
                            value={k8sPermission.action}
                            defaultValue={k8sPermissionRoles[0]}
                            onChange={setRoleSelection}
                            isSearchable={false}
                            menuPlacement="auto"
                            formatOptionLabel={formatOptionLabel}
                            components={{
                                ClearIndicator: null,
                                IndicatorSeparator: null,
                                ValueContainer: CustomValueContainer,
                            }}
                            styles={k8sRoleSelectionStyle}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
