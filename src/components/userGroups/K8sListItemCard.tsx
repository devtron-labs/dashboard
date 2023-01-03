import React, { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import {
    ClearIndicator,
    convertToOptionsList,
    Option,
    MultiValueChipContainer,
    MultiValueRemove,
    processK8SObjects,
    selectAllfunction,
    showError,
} from '../common'
import {
    getClusterList,
    getResourceGroupList,
    getResourceList,
    namespaceListByClusterId,
} from '../ResourceBrowser/ResourceBrowser.service'
import { ResourceListPayloadType } from '../ResourceBrowser/Types'
import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'
import { Option as SingleSelectOption } from '../v2/common/ReactSelect.utils'
import { ActionTypes, OptionType } from './userGroups.types'
import CreatableSelect from 'react-select/creatable'

const possibleRole = [ActionTypes.VIEW, ActionTypes.ADMIN, ActionTypes.MANAGER]

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
    roleMapping,
    setRoleMapping,
}) {
    const possibleRoles = convertToOptionsList(possibleRole)
    const apiGroupAll = (permission, label = false) => {
        if (permission === '') {
            return label ? 'All API groups' : '*'
        } else if (permission === 'k8sempty') {
            return label ? 'K8s core groups (eg. service, pod, etc.)' : ''
        } else return permission
    }
    const [clusterOptions, setClusterOptions] = useState<OptionType[]>()
    const [processedData, setProcessedData] = useState<any>()
    const [selectedApiGroup, setApiGroupSelection] = useState<OptionType>(
        k8sPermission && { label: apiGroupAll(k8sPermission.group, true), value: apiGroupAll(k8sPermission.group) },
    )
    const [selectedNameSpace, setNameSpaceSelection] = useState<OptionType>(
        k8sPermission && {
            label: k8sPermission.namespace === '' ? 'All Namespaces / Cluster' : k8sPermission.namespace,
            value: k8sPermission.namespace || '*',
        },
    )
    const [selectedKind, setKindSelection] = useState<OptionType>(
        k8sPermission && { label: k8sPermission.kind, value: k8sPermission.kind },
    )
    const [selectedObject, setObjectSelection] = useState<OptionType[]>()
    const [selectedRole, setRoleSelection] = useState<OptionType>(
        k8sPermission && { label: k8sPermission.action, value: k8sPermission.action },
    )

    useEffect(() => {
        getClusterListData()
    }, [])

    const getClusterListData = async () => {
        try {
            const { result } = await getClusterList()
            const _clusterOptions = convertToOptionsList(result, 'cluster_name', 'id')
            setClusterOptions(_clusterOptions)
        } catch (err) {
            showError(err)
        }
    }

    const getNamespaceList = async (clusterId: string) => {
        try {
            const { result } = await namespaceListByClusterId(clusterId)
            const _namespaceOptions = [
                { label: 'All Namespaces / Cluster', value: '*' },
                ...convertToOptionsList(result),
            ]
            setNamespaceMapping((prevMapping) => ({ ...prevMapping, [k8sPermission.key]: _namespaceOptions }))
        } catch (err) {
            showError(err)
        }
    }

    const getGroupKindData = async (clusterId, namespace): Promise<void> => {
        try {
            const { result: resourceGroupList } = await getResourceGroupList(clusterId)
            if (resourceGroupList) {
                const _processedData = processK8SObjects(resourceGroupList, '', true)
                const _k8SObjectMap = _processedData.k8SObjectMap
                const _k8SObjectList: OptionType[] = []
                for (const [key, value] of _k8SObjectMap.entries()) {
                    if (key && (namespace === '*' || value.namespaced)) {
                        _k8SObjectList.push({ label: key, value: key })
                    }
                }
                setProcessedData(_k8SObjectMap)
                setApiGroupMapping((prevMapping) => ({ ...prevMapping, [k8sPermission.key]: [
                    { label: 'All API groups', value: '*' },
                    { label: 'K8s core groups (eg. service, pod, etc.)', value: 'k8sempty' },
                    ..._k8SObjectList,
                ] }))
            }
        } catch (err) {
            showError(err)
        }
    }

    const createKindData = (selected) => {
        const kind: OptionType[] = []
        if (selected.value === '*') {
            for (const [key, value] of processedData.entries()) {
                value.child?.map((ele) => kind.push({ label: ele['Kind'], value: ele['Kind'] }))
            }
        } else {
            const data = processedData.get(selected.value === 'k8sempty' ? '' : selected.value)
            data?.child?.map((ele) => kind.push({ label: ele['Kind'], value: ele['Kind'] }))
        }
        setKindMapping((prevMapping) => ({ ...prevMapping, [k8sPermission.key]: [{ label: 'All kind', value: '*' }, ...kind]}))
    }

    const getResourceListData = async (selected): Promise<void> => {
        try {
            const gvk = processedData
                ?.get?.(selectedApiGroup.value === 'k8sempty' ? '' : selectedApiGroup.value)
                .child?.find((ele) => ele['Kind'] === selected.value)
            const resourceListPayload: ResourceListPayloadType = {
                clusterId: Number(k8sPermission?.cluster?.value),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: gvk,
                    },
                },
            }
            const { result } = await getResourceList(resourceListPayload)
            console.log(result);
            
            setObjectMapping((prevMapping) => ({ ...prevMapping, [k8sPermission.key]: [
                { label: 'All object', value: '*' },
                ...result.data.map((ele) => {
                    return { label: ele['name'], value: ele['name'] }
                }),
            ]}))
        } catch (err) {
            showError(err)
        }
    }

    const onClusterChange = (selected) => {
        if (selected.value !== k8sPermission?.cluster?.value) {
            handleK8sPermission('onClusterChange', index, selected)
            getNamespaceList(selected.value)
            setApiGroupSelection(null)
            setNameSpaceSelection(null)
            setKindSelection(null)
            setObjectSelection(null)
        }
    }

    const onNameSpaceSelection = (selected) => {
        if (selected.value !== selectedNameSpace?.value) {
            handleK8sPermission('onNamespaceChange', index, selected)
            setNameSpaceSelection(selected)
            getGroupKindData(k8sPermission?.cluster?.value, selected.value)
        }
    }

    const onApiGroupSelect = (selected) => {
        if (selected.value !== selectedApiGroup?.value) {
            setApiGroupSelection(selected)
            handleK8sPermission('onApiGroupChange', index, selected)
            createKindData(selected)
        }
    }

    const onKindSelect = (selected) => {
        if (selected.value !== selectedKind?.value) {
            setKindSelection(selected)
            handleK8sPermission('onKindChange', index, selected)
            if (selected.value !== '*' && selectedApiGroup.value !== '*') {
                getResourceListData(selected)
            } else {
                setObjectMapping((prevMapping) => ({ ...prevMapping,[k8sPermission.key]: [{ label: 'All object', value: '*' }]}))
            }
        }
    }

    const onObjectChange = (selected, actionMeta) => {
        selectAllfunction(selected, actionMeta, setObjectSelection, objectMapping)
        selectAllfunction(selected, actionMeta, setObjectSelection, objectMapping)
        handleK8sPermission('onObjectChange', index, selected)
    }

    return (
        <div className="mt-16 mb-16 dc__border br-4 p-16 bcn-0">
            <div className="cn-6 mb-6">Cluster</div>
            <div className="mb-16">
                <ReactSelect
                    placeholder="Select cluster"
                    options={clusterOptions}
                    value={k8sPermission?.cluster}
                    onChange={onClusterChange}
                    name="cluster"
                    components={{
                        IndicatorSeparator: null,
                        Option: SingleSelectOption,
                    }}
                    styles={{
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
                    }}
                />
            </div>
            {k8sPermission?.cluster && (
                <>
                    <div className="cn-6 mb-6">Namespace</div>
                    <div className="mb-16">
                        <CreatableSelect
                            placeholder="Select namespace"
                            options={namespaceMapping?.[k8sPermission.key]}
                            value={selectedNameSpace}
                            name="namespace"
                            onChange={onNameSpaceSelection}
                            components={{
                                IndicatorSeparator: null,
                                Option: SingleSelectOption,
                            }}
                            styles={{
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
                            }}
                        />
                    </div>
                    <div className="flexbox w-100">
                        <div className="w-100 mr-6">
                            <div className="cn-6 mb-6">API Group</div>
                            <div className="mb-16">
                                <ReactSelect
                                    placeholder="Select API group"
                                    options={apiGroupMapping?.[k8sPermission.key]}
                                    name="Api group"
                                    value={selectedApiGroup}
                                    onChange={onApiGroupSelect}
                                    components={{
                                        IndicatorSeparator: null,
                                        Option: SingleSelectOption,
                                    }}
                                    styles={{
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
                                    }}
                                />
                            </div>
                        </div>
                        <div className="w-100 ml-6">
                            <div className="cn-6 mb-6">Kind</div>
                            <div className="mb-16">
                                <ReactSelect
                                    placeholder="Select kind"
                                    options={kindMapping?.[k8sPermission.key]}
                                    value={selectedKind}
                                    onChange={onKindSelect}
                                    name="kind"
                                    components={{
                                        IndicatorSeparator: null,
                                        Option: SingleSelectOption,
                                    }}
                                    styles={{
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
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="cn-6 mb-6">Object name</div>
                    <div className="mb-16">
                        <CreatableSelect
                            placeholder="Select object"
                            options={objectMapping?.[k8sPermission.key]}
                            value={selectedObject}
                            name="Object name"
                            onChange={onObjectChange}
                            components={{
                                IndicatorSeparator: () => null,
                                MultiValueContainer: ({ ...props }) => (
                                    <MultiValueChipContainer {...props} validator={null} />
                                ),
                                ClearIndicator,
                                MultiValueRemove,
                                Option,
                            }}
                            closeMenuOnSelect={false}
                            isMulti
                            hideSelectedOptions={false}
                            styles={{
                                ...multiSelectStyles,
                                dropdownIndicator: (base, state) => ({
                                    ...base,
                                    transition: 'all .2s ease',
                                    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    border: `1px solid var(--N200)`,
                                    borderRadius: `4px`,
                                    background: 'white',
                                    height: '30px',
                                    margin: '0 8px 0 0',
                                    padding: '1px',
                                }),
                            }}
                        />
                    </div>
                    <div className="cn-6 mb-6">Role</div>
                    <div className="mb-16 w-300">
                        <CreatableSelect
                            placeholder="Select role"
                            options={possibleRoles}
                            value={selectedRole}
                            defaultValue={possibleRoles[0]}
                            onChange={setRoleSelection}
                            components={{
                                ClearIndicator: null,
                                IndicatorSeparator: null,
                                Option: SingleSelectOption,
                            }}
                            styles={{
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
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
