import React, { useEffect, useState } from 'react'
import { ReactComponent as AddIcon } from '../../assets/icons/ic-add.svg'
import {
    ButtonWithLoader,
    ClearIndicator,
    convertToOptionsList,
    MultiValueChipContainer,
    MultiValueRemove,
    VisibleModal,
    Option,
    selectAllfunction,
    showError,
    processK8SObjects,
} from '../common'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import CreatableSelect from 'react-select/creatable'
import ReactSelect from 'react-select'
import { ActionTypes, OptionType } from './userGroups.types'
import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'
import { Option as SingleSelectOption } from '../v2/common/ReactSelect.utils'
import {
    getClusterList,
    getResourceGroupList,
    getResourceList,
    namespaceListByClusterId,
} from '../ResourceBrowser/ResourceBrowser.service'
import { ALL_NAMESPACE_OPTION, ORDERED_AGGREGATORS } from '../ResourceBrowser/Constants'
import { K8SObjectType, ResourceListPayloadType } from '../ResourceBrowser/Types'

const headerOptions = ['CLUSTER', 'API GROUP', 'KIND', 'NAMESPACE', 'OBJECT', 'ROLE']

const cluster = ['dmxkd', 'nxjnmsjxm', 'dcxnjdn', 'jndcjnxdj', 'undc']
const apiGroup = ['item', 'dcdc', 'heheh', 'sjnd']
const possibleRole = [ActionTypes.VIEW, ActionTypes.ADMIN, ActionTypes.MANAGER]

export default function KubernetesObjects({ k8sPermission, setK8sPermission }) {
    const [toggleModal, setToggleModal] = useState<boolean>()
    const [tempPermission, setTempPermission] = useState()
    const openModal = () => {
        setToggleModal(true)
    }

    const editPermission = (permissions) => {
        setToggleModal(true)
        setTempPermission(permissions)
    }

    const creatPermission = () => {
        setToggleModal(true)
        setTempPermission(null)
    }

    return (
        <>
            <div className="anchor pointer flex left mt-16 fs-13 fw-6" onClick={creatPermission}>
                <AddIcon className="add-svg mr-12" /> Add permission
            </div>
            {k8sPermission.length ? (
                <div className="mt-16">
                    <div className="kubernetes-header dc__border-bottom fw-6 pt-8 pb-8">
                        {headerOptions.map((header) => (
                            <span>{header}</span>
                        ))}
                    </div>
                    {k8sPermission?.map((element) => {
                        return (
                            <div className="kubernetes-header pt-12 pb-12 dc__border-bottom-n1">
                                <span>{element.cluster}</span>
                                <span>{element.apiGroup}</span>
                                <span>{element.kind}</span>
                                <span>{element.namespace}</span>
                                <span>
                                    {element.resource.length > 1
                                        ? element.resource.length + 'objects'
                                        : element.resource.label}
                                </span>
                                <span>{element.role}</span>
                                <span onClick={() => editPermission(element)}>edit</span>
                            </div>
                        )
                    })}
                </div>
            ) : null}
            {toggleModal && (
                <KubernetesObjectSelectionModal
                    k8sPermission={tempPermission}
                    setK8sPermission={setK8sPermission}
                    close={setToggleModal}
                />
            )}
        </>
    )
}

function KubernetesObjectSelectionModal({ k8sPermission, setK8sPermission, close }) {
    const permissionObject = {
        cluster: null,
        namespace: null,
        group: null,
        kind: null,
        resource: null,
        action: null,
    }
    const [k8PermissionList, setPermissionList] = useState([k8sPermission || permissionObject])

    const handleK8sPermission = (action, key, permission) => {
        switch (action) {
            case 'add':
                k8PermissionList.splice(0, 0, permissionObject)
                break
            case 'delete':
                k8PermissionList.splice(key, 1)
                break
            case 'clone':
                k8PermissionList.splice(0, 0, k8PermissionList[key])
                break
            case 'edit':
                k8PermissionList[key] = permission
                break
            default:
                break
        }
        
        setPermissionList([...k8PermissionList])
    }

    const stopPropogation = (e) => {
        e.stopPropagation()
    }

    const closeModal = () => {
        close(false)
    }

    const addNewPermissionCard = () => {
        handleK8sPermission('add',0,permissionObject)
    }

    const savePermission = () => {
        setK8sPermission((permissions) => [...permissions, ...k8PermissionList])
    }

    return (
        <VisibleModal className="" close={closeModal}>
            <div onClick={stopPropogation} className="modal-body--ci-material h-100 dc__overflow-hidden">
                <div className="flex pt-12 pb-12 pl-20 pr-20 dc__content-space dc__border-bottom">
                    <span className="flex left fw-6 lh-24 fs-16">Kubernetes object permission</span>
                    <span className="icon-dim-20 cursor" onClick={closeModal}>
                        <Close />
                    </span>
                </div>
                <div className="p-20 fs-13 dc__overflow-scroll dc__cluster-modal">
                    <div className="anchor pointer flex left fs-13 fw-6" onClick={addNewPermissionCard}>
                        <AddIcon className="add-svg mr-12" /> Add another
                    </div>
                    {k8PermissionList?.map((_k8sPermission, index) => {
                        return (
                            <K8sListItemCard
                                k8sPermission={_k8sPermission}
                                handleK8sPermission={handleK8sPermission}
                                index={index}
                            />
                        )
                    })}
                </div>
                <div className="w-100 pt-16 pb-16 pl-20 pr-20 flex right dc__border-top">
                    <button type="button" className="cta cancel h-36 flex mr-16" disabled={false} onClick={closeModal}>
                        Cancel
                    </button>
                    <ButtonWithLoader
                        rootClassName="cta cta--workflow"
                        onClick={savePermission}
                        isLoading={false}
                        loaderColor="white"
                    >
                        Save
                    </ButtonWithLoader>
                </div>
            </div>
        </VisibleModal>
    )
}

function K8sListItemCard({ k8sPermission, handleK8sPermission, index}) {
    const possibleRoles = convertToOptionsList(possibleRole)
    const apiGroupAll = (permission, label = false) => {
        if (permission === '') {
            return label ? 'All API groups' : '*'
        } else if (permission === 'k8sempty') {
            return label ? 'K8s core groups (eg. service, pod, etc.)' : ''
        } else return permission
    }
    const [clusterOptions, setClusterOptions] = useState<OptionType[]>()
    const [namespaceOptions, setNamespaceOptions] = useState<OptionType[]>()
    const [apiGroupList, setApiGroupList] = useState<OptionType[]>()
    const [kindList, setKindList] = useState<OptionType[]>()
    const [objectList, setObjectList] = useState<OptionType[]>()

    const [processedData, setProcessedData] = useState<any>()

    const [selectedCluster, setClusterSelection] = useState<OptionType>(
        k8sPermission?.cluster && { label: k8sPermission.cluster, value: k8sPermission.cluster },
    )
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
        // if(k8sPermission.cluster) {
        //     getNamespaceList(selectedCluster.value)
        //     getGroupKindData(selectedCluster.value,selectedNameSpace.value)
        //     createKindData(selectedApiGroup)
        //     getResourceListData(selectedKind)
        // }
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
            setNamespaceOptions(_namespaceOptions)
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
                setApiGroupList([
                    { label: 'All API groups', value: '*' },
                    { label: 'K8s core groups (eg. service, pod, etc.)', value: 'k8sempty' },
                    ..._k8SObjectList,
                ])
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
        setKindList([{ label: 'All kind', value: '*' }, ...kind])
    }

    const getResourceListData = async (selected): Promise<void> => {
        try {
            const gvk = processedData
                ?.get?.(selectedApiGroup.value === 'k8sempty' ? '' : selectedApiGroup.value)
                .child?.find((ele) => ele['Kind'] === selected.value)
            const resourceListPayload: ResourceListPayloadType = {
                clusterId: Number(selectedCluster.value),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: gvk,
                    },
                },
            }
            const { result } = await getResourceList(resourceListPayload)
            setObjectList([
                { label: 'All object', value: '*' },
                ...result.rows.map((ele) => {
                    return { label: ele['Name'], value: ele['Name'] }
                }),
            ])
        } catch (err) {
            showError(err)
        }
    }

    const onClusterChange = (selected) => {
        if (selected.value !== selectedCluster?.value) {
            setClusterSelection(selected)
            getNamespaceList(selected.value)
            setApiGroupSelection(null)
            setNameSpaceSelection(null)
            setKindSelection(null)
            setObjectSelection(null)
        }
    }

    const onNameSpaceSelection = (selected) => {
        if (selected.value !== selectedNameSpace?.value) {
            setNameSpaceSelection(selected)
            getGroupKindData(selectedCluster.value, selected.value)
        }
    }

    const onApiGroupSelect = (selected) => {
        if (selected.value !== selectedApiGroup?.value) {
            setApiGroupSelection(selected)
            createKindData(selected)
        }
    }

    const onKindSelect = (selected) => {
        if (selected.value !== selectedKind?.value) {
            setKindSelection(selected)
            if (selected.value !== '*' && selectedApiGroup.value !== '*') {
                getResourceListData(selected)
            } else {
                setObjectList([{ label: 'All object', value: '*' }])
            }
        }
    }

    const onObjectChange = (selected, actionMeta) => {
        selectAllfunction(selected, actionMeta, setObjectSelection, objectList)
    }

    return (
        <div className="mt-16 mb-16 dc__border br-4 p-16 bcn-0">
            <div className="cn-6 mb-6">Cluster</div>
            <div className="mb-16">
                <ReactSelect
                    placeholder="Select cluster"
                    options={clusterOptions}
                    value={selectedCluster}
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
            {selectedCluster && (
                <>
                    <div className="cn-6 mb-6">Namespace</div>
                    <div className="mb-16">
                        <CreatableSelect
                            placeholder="Select namespace"
                            options={namespaceOptions}
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
                                    options={apiGroupList}
                                    name="Api group"
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
                                    options={kindList}
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
                            options={objectList}
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
