/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { useEffect, useState } from 'react'
import ReactSelect from 'react-select'
import {
    showError,
    InfoColourBar,
    ClearIndicator,
    Option,
    MultiValueRemove,
    MultiValueChipContainer,
    OptionType,
    LoadingIndicator,
} from '@devtron-labs/devtron-fe-common-lib'
import CreatableSelect from 'react-select/creatable'
import Tippy from '@tippyjs/react'
import {
    processK8SObjects,
    convertToOptionsList,
    sortObjectArrayAlphabetically,
    sortOptionsByLabel,
    importComponentFromFELibrary,
} from '../../../../../../components/common'
import {
    getClusterList,
    getResourceGroupList,
    getResourceList,
    namespaceListByClusterId,
} from '../../../../../../components/ResourceBrowser/ResourceBrowser.service'
import { GVKType, K8SObjectType, ResourceListPayloadType } from '../../../../../../components/ResourceBrowser/Types'
import {
    CustomValueContainer,
    formatOptionLabel,
    menuComponent,
} from '../../../../../../components/v2/common/ReactSelect.utils'
import { ReactComponent as Clone } from '../../../../../../assets/icons/ic-copy.svg'
import { ReactComponent as Delete } from '../../../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as InfoIcon } from '../../../../../../assets/icons/info-filled.svg'
import { k8sRoleSelectionStyle, multiSelectAllState } from './K8sPermissions.utils'
import { resourceKindOptionLabel } from './K8sPermission.component'
import { useAuthorizationContext } from '../../../AuthorizationProvider'
import { parseData } from '../../../utils'
import { authorizationSelectStyles } from '../userGroups/UserGroup'
import { K8sPermissionActionType, K8S_PERMISSION_INFO_MESSAGE } from './constants'
import { SELECT_ALL_VALUE } from '../../../../../../config'
import { K8sItemCardLoadingState, K8sListItemCardType } from './types'
import { ALL_NAMESPACE, EntityTypes } from '../../../constants'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { K8sPermissionFilter } from '../../../types'
import { getIsStatusDropdownDisabled } from '../../../libUtils'

const UserStatusUpdate = importComponentFromFELibrary('UserStatusUpdate', null, 'function')

const K8sListItemCard = ({
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
}: K8sListItemCardType) => {
    const { customRoles } = useAuthorizationContext()
    const { showStatus, userStatus } = usePermissionConfiguration()
    const [clusterOptions, setClusterOptions] = useState<OptionType[]>([])
    const [processedData, setProcessedData] = useState<Map<string, K8SObjectType>>()
    const [processedGvkData, setProcessedGvkData] = useState<Map<string, K8SObjectType>>()
    const [allInApiGroupMapping, setAllInApiGroupMapping] = useState<OptionType[]>([])
    const [allInKindMapping, setAllInKindMapping] = useState<OptionType[]>([])
    const [
        { isClusterListLoading, isNamespaceListLoading, isApiGroupListLoading, isResourceListLoading },
        setLoadingState,
    ] = useState<K8sItemCardLoadingState>({
        isClusterListLoading: false,
        isNamespaceListLoading: false,
        isApiGroupListLoading: false,
        isResourceListLoading: false,
    })

    const handleLoadingStateChange = (updatedLoadingState: Partial<K8sItemCardLoadingState>) => {
        setLoadingState((prevLoadingState) => ({
            ...prevLoadingState,
            ...updatedLoadingState,
        }))
    }

    const getNamespaceList = async (clusterId: string) => {
        handleLoadingStateChange({
            isNamespaceListLoading: true,
        })
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
        } finally {
            handleLoadingStateChange({
                isNamespaceListLoading: false,
            })
        }
    }

    const createKindData = (selected, _allKindMapping, _k8SObjectMap = null) => {
        const kind = []
        let selectedGvk: GVKType
        if (_k8SObjectMap ?? processedData) {
            if (selected.value === SELECT_ALL_VALUE) {
                // eslint-disable-next-line no-restricted-syntax
                for (const value of (_k8SObjectMap ?? processedData).values()) {
                    // eslint-disable-next-line no-loop-func
                    value?.child.forEach((ele: { gvk: GVKType }) => {
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
            _allKindMapping = [{ label: 'All kind', value: SELECT_ALL_VALUE }]
        }

        setKindMapping((prevMapping) => ({
            ...prevMapping,
            [k8sPermission.key]: [..._allKindMapping, ...kind.sort(sortOptionsByLabel)],
        }))
        if (k8sPermission?.resource) {
            if (k8sPermission.kind.value !== SELECT_ALL_VALUE && k8sPermission.kind.value !== 'Event') {
                // eslint-disable-next-line no-use-before-define
                getResourceListData({ ...k8sPermission.kind, gvk: selectedGvk })
            } else {
                setObjectMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: [{ label: 'All resources', value: SELECT_ALL_VALUE }],
                }))
            }
        }
    }

    const getGroupKindData = async (clusterId): Promise<void> => {
        handleLoadingStateChange({
            isApiGroupListLoading: true,
        })
        try {
            const { result: resourceGroupList } = await getResourceGroupList(clusterId)
            if (resourceGroupList.apiResources) {
                const _processedData = processK8SObjects(resourceGroupList.apiResources, '', true)
                const _k8SObjectMap = _processedData.k8SObjectMap
                const _k8SObjectList: OptionType[] = [..._k8SObjectMap.keys()].map((key) => ({
                    label: key,
                    value: key,
                }))
                setProcessedData(_k8SObjectMap)

                const namespacedGvkList = resourceGroupList.apiResources.filter((item) => item.namespaced)
                const _processedNamespacedGvk = processK8SObjects(namespacedGvkList, '', true)
                setProcessedGvkData(_processedNamespacedGvk.k8SObjectMap)

                const _allApiGroupMapping = []
                const _allKindMapping = []
                if (resourceGroupList.allowedAll) {
                    _allApiGroupMapping.push(
                        { label: 'All API groups', value: SELECT_ALL_VALUE },
                        { label: 'K8s core groups (eg. service, pod, etc.)', value: 'k8sempty' },
                    )
                    _allKindMapping.push({ label: 'All kind', value: SELECT_ALL_VALUE })
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
                        k8sPermission?.namespace.value === SELECT_ALL_VALUE
                            ? _k8SObjectMap
                            : _processedNamespacedGvk.k8SObjectMap,
                    )
                }
            }
        } catch (err) {
            showError(err)
        } finally {
            handleLoadingStateChange({
                isApiGroupListLoading: false,
            })
        }
    }

    const getClusterListData = async () => {
        handleLoadingStateChange({
            isClusterListLoading: true,
        })
        try {
            const { result } = await getClusterList()
            if (result) {
                const filteredClusterList = result.filter((item) => !item?.isVirtualCluster)
                const _clusterOptions = convertToOptionsList(
                    sortObjectArrayAlphabetically(filteredClusterList, 'cluster_name'),
                    'cluster_name',
                    'id',
                )
                setClusterOptions(_clusterOptions)
                if (k8sPermission?.cluster) {
                    const selectedCluster = _clusterOptions?.find((ele) => ele.label === k8sPermission.cluster.label)
                    handleK8sPermission(K8sPermissionActionType.edit, index, selectedCluster)
                    getNamespaceList(selectedCluster.value)
                    getGroupKindData(selectedCluster.value)
                }
            }
        } catch (err) {
            showError(err)
        } finally {
            handleLoadingStateChange({
                isClusterListLoading: false,
            })
        }
    }

    useEffect(() => {
        getClusterListData()
        setApiGroupMapping((prevMapping) => ({
            ...prevMapping,
            [k8sPermission.key]: [{ label: 'All API groups', value: SELECT_ALL_VALUE }],
        }))
    }, [])

    const getResourceListData = async (selected): Promise<void> => {
        handleLoadingStateChange({
            isResourceListLoading: true,
        })
        try {
            const resourceListPayload: ResourceListPayloadType = {
                clusterId: Number(k8sPermission?.cluster?.value),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: selected?.gvk,
                        namespace:
                            k8sPermission?.namespace?.value === SELECT_ALL_VALUE ? '' : k8sPermission?.namespace.value,
                    },
                },
            }
            const { result } = await getResourceList(resourceListPayload)
            if (result) {
                const _data =
                    result.data?.map((ele) => ({ label: ele.name, value: ele.name })).sort(sortOptionsByLabel) ?? []
                const _optionList = [{ label: 'All resources', value: SELECT_ALL_VALUE }, ..._data]
                setObjectMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: _optionList,
                }))
                if (k8sPermission.resource?.[0]?.value === SELECT_ALL_VALUE) {
                    handleK8sPermission(K8sPermissionActionType.onObjectChange, index, _optionList)
                }
            }
        } catch (err) {
            showError(err)
        } finally {
            handleLoadingStateChange({
                isResourceListLoading: false,
            })
        }
    }

    const onClusterChange = (selected) => {
        if (selected.value !== k8sPermission?.cluster?.value) {
            setProcessedData(null)
            setProcessedGvkData(null)
            setApiGroupMapping((prevMapping) => ({
                ...prevMapping,
                [k8sPermission.key]: [{ label: 'All API groups', value: SELECT_ALL_VALUE }],
            }))
            handleK8sPermission(K8sPermissionActionType.onClusterChange, index, selected)
            getNamespaceList(selected.value)
            getGroupKindData(selected.value)
        }
    }

    const onNameSpaceSelection = (selected) => {
        if (selected.value !== k8sPermission?.namespace?.value) {
            handleK8sPermission(K8sPermissionActionType.onNamespaceChange, index, selected)
            const _GvkObjectList: OptionType[] = []
            if (processedGvkData) {
                // eslint-disable-next-line no-restricted-syntax
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
            handleK8sPermission(K8sPermissionActionType.onApiGroupChange, index, selected)
            createKindData(selected, allInKindMapping)
        }
    }

    const onKindSelect = (selected) => {
        if (selected.value !== k8sPermission?.kind?.value) {
            handleK8sPermission(K8sPermissionActionType.onKindChange, index, selected)
            if (selected.value !== SELECT_ALL_VALUE && selected.value !== 'Event') {
                getResourceListData(selected)
            } else {
                setObjectMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: [{ label: 'All resources', value: SELECT_ALL_VALUE }],
                }))
            }
        }
    }
    const setK8sPermission = (options): void => {
        handleK8sPermission(K8sPermissionActionType.onObjectChange, index, options)
    }

    const onResourceObjectChange = (selected, actionMeta) => {
        multiSelectAllState(selected, actionMeta, setK8sPermission, objectMapping?.[k8sPermission.key])
    }

    const setRoleSelection = (selected) => {
        if (selected.value !== k8sPermission.action?.value) {
            handleK8sPermission(K8sPermissionActionType.onRoleChange, index, selected)
        }
    }

    const editPermission = (action) => {
        handleK8sPermission(action, index)
    }

    const getIsK8sMultiValueContainer = () => k8sPermission.resource.some((item) => item.value === SELECT_ALL_VALUE)

    const k8sOptions = parseData(customRoles.customRoles, EntityTypes.CLUSTER).map((role) => ({
        label: role.roleDisplayName,
        value: role.roleName,
        infoText: role.roleDescription,
    }))

    const handleUserStatusUpdate = (
        status: K8sPermissionFilter['status'],
        timeToLive: K8sPermissionFilter['timeToLive'],
    ) => {
        handleK8sPermission(K8sPermissionActionType.onStatusChange, index, {
            status,
            timeToLive,
        })
    }

    const clonePermission = () => {
        editPermission(K8sPermissionActionType.clone)
    }

    const deletePermission = () => {
        editPermission(K8sPermissionActionType.delete)
    }

    return (
        <div className="mt-16 mb-16 dc__border br-4 p-16 bcn-0">
            <div className="cn-7 fs-13 fw-4 lh-20 mb-6 flex dc__content-space">
                <span>Cluster</span>
                {!selectedPermissionAction && (
                    <span className="flex">
                        <Tippy className="default-tt" arrow={false} placement="top" content="Duplicate">
                            <div className="flex">
                                <Clone className="icon-dim-16 mr-8 fcn-6 cursor" onClick={clonePermission} />
                            </div>
                        </Tippy>
                        <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                            <div className="flex">
                                <Delete className="icon-dim-16 scn-6 cursor" onClick={deletePermission} />
                            </div>
                        </Tippy>
                    </span>
                )}
            </div>
            <div className="mb-16">
                <ReactSelect
                    placeholder="Select cluster"
                    options={clusterOptions}
                    value={k8sPermission?.cluster}
                    onChange={onClusterChange}
                    name="cluster"
                    components={{
                        IndicatorSeparator: null,
                        LoadingIndicator,
                    }}
                    styles={authorizationSelectStyles}
                    isLoading={isClusterListLoading}
                    isDisabled={isClusterListLoading}
                    menuPlacement="auto"
                    menuPosition="fixed"
                />
            </div>
            {k8sPermission?.cluster && (
                <>
                    <div className="cn-7 fs-13 fw-4 lh-20 mb-6">Namespace</div>
                    <div className="mb-16">
                        <CreatableSelect
                            placeholder="Select namespace"
                            options={namespaceMapping?.[k8sPermission?.cluster?.value]}
                            value={k8sPermission.namespace}
                            name="namespace"
                            isDisabled={!k8sPermission.cluster || isNamespaceListLoading}
                            onChange={onNameSpaceSelection}
                            components={{
                                IndicatorSeparator: null,
                                MenuList: (props) => menuComponent(props, 'namespaces'),
                                LoadingIndicator,
                            }}
                            styles={authorizationSelectStyles}
                            isLoading={isNamespaceListLoading}
                            menuPlacement="auto"
                            menuPosition="fixed"
                        />
                    </div>
                    <div className="flexbox w-100">
                        <div className="w-100 mr-6">
                            <div className="cn-7 fs-13 fw-4 lh-20 mb-6">API Group</div>
                            <div className="mb-16">
                                <ReactSelect
                                    placeholder="Select API group"
                                    options={apiGroupMapping?.[k8sPermission.key]}
                                    name="Api group"
                                    isDisabled={!k8sPermission.namespace || isApiGroupListLoading}
                                    value={k8sPermission.group}
                                    onChange={onApiGroupSelect}
                                    components={{
                                        IndicatorSeparator: null,
                                        LoadingIndicator,
                                    }}
                                    styles={authorizationSelectStyles}
                                    isLoading={isApiGroupListLoading}
                                    menuPlacement="auto"
                                    menuPosition="fixed"
                                />
                            </div>
                        </div>
                        <div className="w-100 ml-6">
                            <div className="cn-7 fs-13 fw-4 lh-20 mb-6">Kind</div>
                            <div className="mb-16">
                                <ReactSelect
                                    placeholder="Select kind"
                                    options={kindMapping?.[k8sPermission.key]}
                                    isDisabled={!k8sPermission.group}
                                    value={k8sPermission.kind}
                                    onChange={onKindSelect}
                                    formatOptionLabel={resourceKindOptionLabel}
                                    name="kind"
                                    components={{
                                        IndicatorSeparator: null,
                                        ValueContainer: CustomValueContainer,
                                        LoadingIndicator,
                                    }}
                                    styles={k8sRoleSelectionStyle}
                                    menuPlacement="auto"
                                    menuPosition="fixed"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="cn-7 fs-13 fw-4 lh-20 mb-6">Resource name</div>
                    <div className="mb-16">
                        <CreatableSelect
                            placeholder="Select resource"
                            classNamePrefix="k8s-permission-select-resource-dropdown"
                            options={objectMapping?.[k8sPermission.key]}
                            isDisabled={!k8sPermission.kind || isResourceListLoading}
                            value={k8sPermission.resource}
                            name="Resource name"
                            onChange={onResourceObjectChange}
                            components={{
                                IndicatorSeparator: () => null,
                                // eslint-disable-next-line react/no-unstable-nested-components
                                MultiValueContainer: ({ ...props }) => (
                                    <MultiValueChipContainer
                                        {...props}
                                        validator={null}
                                        isAllSelected={getIsK8sMultiValueContainer()}
                                    />
                                ),
                                ClearIndicator,
                                MultiValueRemove,
                                Option,
                                MenuList: (props) => menuComponent(props, 'resource name'),
                                LoadingIndicator,
                            }}
                            closeMenuOnSelect={false}
                            isMulti
                            hideSelectedOptions={false}
                            styles={{
                                ...authorizationSelectStyles,
                                control: (base, state) => ({
                                    ...authorizationSelectStyles.control(base, state),
                                    height: 'auto',
                                    minHeight: '36px',
                                }),
                                valueContainer: (base) => ({
                                    ...authorizationSelectStyles.valueContainer(base),
                                    display: 'flex',
                                    columnGap: '8px',
                                    rowGap: '4px',
                                }),
                                multiValue: (base) => ({
                                    ...base,
                                    border: '1px solid var(--N200)',
                                    borderRadius: '4px',
                                    background: 'white',
                                    height: '24px',
                                    padding: '2px 6px',
                                    fontSize: '12px',
                                    lineHeight: '20px',
                                }),
                                clearIndicator: (base) => ({
                                    ...base,
                                    padding: 0,
                                }),
                            }}
                            isLoading={isResourceListLoading}
                            menuPlacement="auto"
                            menuPosition="fixed"
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
                    <div className="cn-7 fs-13 fw-4 lh-20 mb-6">Role</div>
                    <div className="mb-16 w-300">
                        <ReactSelect
                            placeholder="Select role"
                            options={k8sOptions}
                            value={k8sPermission.action}
                            defaultValue={k8sOptions[0]}
                            onChange={setRoleSelection}
                            isSearchable={false}
                            formatOptionLabel={formatOptionLabel}
                            components={{
                                ClearIndicator: null,
                                IndicatorSeparator: null,
                                ValueContainer: CustomValueContainer,
                            }}
                            styles={k8sRoleSelectionStyle}
                            menuPlacement="auto"
                            menuPosition="fixed"
                        />
                    </div>
                    {showStatus && (
                        <>
                            <div className="cn-7 fs-13 fw-4 lh-20 mb-6">Status</div>
                            <div className="mb-16 w-300">
                                <UserStatusUpdate
                                    userStatus={k8sPermission.status}
                                    timeToLive={k8sPermission.timeToLive}
                                    userEmail=""
                                    handleChange={handleUserStatusUpdate}
                                    disabled={getIsStatusDropdownDisabled(userStatus)}
                                />
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default K8sListItemCard
