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

/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { useEffect, useState } from 'react'
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
    GVKType,
    getK8sResourceList,
    EntityTypes,
    ApiResourceGroupType,
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
    namespaceListByClusterId,
} from '../../../../../../components/ResourceBrowser/ResourceBrowser.service'
import { K8SObjectType, ResourceListPayloadType } from '../../../../../../components/ResourceBrowser/Types'
import {
    CustomValueContainer,
    formatOptionLabel,
    menuComponent,
} from '../../../../../../components/v2/common/ReactSelect.utils'
import { ReactComponent as Clone } from '../../../../../../assets/icons/ic-copy.svg'
import { ReactComponent as Delete } from '../../../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as InfoIcon } from '../../../../../../assets/icons/info-filled.svg'
import { formatResourceKindOptionLabel, k8sRoleSelectionStyle, multiSelectAllState } from './utils'
import { useAuthorizationContext } from '../../../AuthorizationProvider'
import { parseData } from '../../../utils'
import { authorizationSelectStyles, ALL_NAMESPACE } from '../../../constants'
import { K8sPermissionActionType, K8S_PERMISSION_INFO_MESSAGE, resourceSelectStyles } from './constants'
import { SELECT_ALL_VALUE } from '../../../../../../config'
import { K8sItemCardLoadingState, K8sListItemCardType } from './types'
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
    const allInKindMapping = { label: 'All kind', value: SELECT_ALL_VALUE }
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
            const options = [ALL_NAMESPACE, ...(result ? convertToOptionsList(result.sort()) : [])]
            setNamespaceMapping((prevMapping) => ({ ...prevMapping, [clusterId]: options }))
            if (k8sPermission.namespace?.some((el) => el.value === SELECT_ALL_VALUE)) {
                handleK8sPermission(K8sPermissionActionType.setNamespace, index, options)
            }
        } catch (err) {
            showError(err)
        } finally {
            handleLoadingStateChange({
                isNamespaceListLoading: false,
            })
        }
    }

    const populateResourceListWithAllOption = () =>
        setObjectMapping((prevMapping) => ({
            ...prevMapping,
            [k8sPermission.key]: [{ label: 'All resources', value: SELECT_ALL_VALUE }],
        }))

    const getResourceListData = async (selected): Promise<void> => {
        handleLoadingStateChange({
            isResourceListLoading: true,
        })
        try {
            /* NOTE: namespace is of type OptionType[];
             * if multiple namespaces are selected only show 'All Resource' option */
            if (k8sPermission.namespace.length > 1) {
                populateResourceListWithAllOption()
                return
            }
            const resourceListPayload: ResourceListPayloadType = {
                clusterId: Number(k8sPermission?.cluster?.value),
                k8sRequest: {
                    resourceIdentifier: {
                        groupVersionKind: selected?.gvk,
                        namespace:
                            k8sPermission.namespace[0].value === SELECT_ALL_VALUE
                                ? ''
                                : k8sPermission.namespace[0].value,
                    },
                },
            }
            const { result } = await getK8sResourceList(resourceListPayload)
            if (result) {
                const _data =
                    result.data?.map((ele) => ({ label: ele.name, value: ele.name })).sort(sortOptionsByLabel) ?? []
                const _optionList = [{ label: 'All resources', value: SELECT_ALL_VALUE }, ..._data]
                setObjectMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: _optionList as OptionType[],
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

    const createKindData = (selected, _k8SObjectMap = null) => {
        const kind = []
        let selectedGvk: GVKType
        const isAllNamespaceSelected = k8sPermission.namespace.some((option) => option.value === SELECT_ALL_VALUE)
        if (_k8SObjectMap ?? processedData) {
            if (selected.value === SELECT_ALL_VALUE) {
                // eslint-disable-next-line no-restricted-syntax
                for (const value of (_k8SObjectMap ?? processedData).values()) {
                    // eslint-disable-next-line no-loop-func
                    value?.child.forEach((ele: ApiResourceGroupType) => {
                        if (isAllNamespaceSelected || ele.namespaced) {
                            kind.push({ label: ele.gvk.Kind, value: ele.gvk.Kind, gvk: ele.gvk })
                        }
                        if (!selectedGvk && ele.gvk.Kind === k8sPermission.kind?.value) {
                            selectedGvk = ele.gvk
                        }
                    })
                }
            } else {
                const data = (_k8SObjectMap ?? processedData).get(selected.value === 'k8sempty' ? '' : selected.value)

                data?.child?.forEach((ele) => {
                    if (isAllNamespaceSelected || ele.namespaced) {
                        kind.push({ label: ele.gvk.Kind, value: ele.gvk.Kind, gvk: ele.gvk })
                    }
                    if (!selectedGvk && ele.gvk.Kind === k8sPermission.kind?.value) {
                        selectedGvk = ele.gvk
                    }
                })
            }
        } else {
            kind.push(allInKindMapping[0])
        }

        setKindMapping((prevMapping) => ({
            ...prevMapping,
            [k8sPermission.key]: [...kind.sort(sortOptionsByLabel)],
        }))
        if (k8sPermission?.resource) {
            if (k8sPermission.kind.value !== SELECT_ALL_VALUE && k8sPermission.kind.value !== 'Event') {
                getResourceListData({ ...k8sPermission.kind, gvk: selectedGvk })
            } else {
                populateResourceListWithAllOption()
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
                const _k8SObjectList: OptionType[] = [..._k8SObjectMap.keys()]
                    .filter((key) => !!key)
                    .map((key) => ({
                        label: key,
                        value: key,
                    }))
                setProcessedData(_k8SObjectMap)

                const namespacedGvkList = resourceGroupList.apiResources.filter((item) => item.namespaced)
                const _processedNamespacedGvk = processK8SObjects(namespacedGvkList, '', true)

                const _allApiGroupMapping = []
                if (resourceGroupList.allowedAll) {
                    _allApiGroupMapping.push(
                        { label: 'All API groups', value: SELECT_ALL_VALUE },
                        { label: 'K8s core groups (eg. service, pod, etc.)', value: 'k8sempty' },
                    )
                }
                setApiGroupMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: [..._allApiGroupMapping, ..._k8SObjectList.sort(sortOptionsByLabel)],
                }))

                if (k8sPermission?.kind) {
                    createKindData(
                        k8sPermission.group,
                        k8sPermission?.namespace.some((el) => el.value === SELECT_ALL_VALUE)
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

    const onClusterChange = (selected) => {
        if (selected.value !== k8sPermission?.cluster?.value) {
            setProcessedData(null)
            setApiGroupMapping((prevMapping) => ({
                ...prevMapping,
                [k8sPermission.key]: [{ label: 'All API groups', value: SELECT_ALL_VALUE }],
            }))
            handleK8sPermission(K8sPermissionActionType.onClusterChange, index, selected)
            getNamespaceList(selected.value)
            getGroupKindData(selected.value)
        }
    }

    const setK8sPermission = (actionType) => (options) =>
        handleK8sPermission(K8sPermissionActionType[actionType], index, options)

    const onNameSpaceSelection = (selected, actionMeta) =>
        multiSelectAllState(
            selected,
            actionMeta,
            setK8sPermission('onNamespaceChange'),
            namespaceMapping?.[k8sPermission?.cluster?.value],
        )

    const onApiGroupSelect = (selected) => {
        if (selected.value !== k8sPermission?.group?.value) {
            handleK8sPermission(K8sPermissionActionType.onApiGroupChange, index, selected)
            createKindData(selected)
        }
    }

    const onKindSelect = (selected) => {
        if (selected.value !== k8sPermission?.kind?.value) {
            handleK8sPermission(K8sPermissionActionType.onKindChange, index, selected)
            if (selected.value !== SELECT_ALL_VALUE && selected.value !== 'Event') {
                getResourceListData(selected)
            } else {
                populateResourceListWithAllOption()
            }
        }
    }

    const onResourceObjectChange = (selected, actionMeta) =>
        multiSelectAllState(
            selected,
            actionMeta,
            setK8sPermission('onObjectChange'),
            objectMapping?.[k8sPermission.key],
        )

    const setRoleSelection = (selected) => {
        if (selected.value !== k8sPermission.action?.value) {
            handleK8sPermission(K8sPermissionActionType.onRoleChange, index, selected)
        }
    }

    const editPermission = (action) => {
        handleK8sPermission(action, index)
    }

    const getIsK8sMultiValueContainer = (type: string) =>
        k8sPermission[type].some((item) => item.value === SELECT_ALL_VALUE)

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
                    classNamePrefix="k8s-permission-select-cluster-dropdown"
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
                            classNamePrefix="k8s-permission-select-namespace-dropdown"
                            options={namespaceMapping?.[k8sPermission?.cluster?.value]}
                            value={k8sPermission.namespace}
                            name="namespace"
                            isDisabled={!k8sPermission.cluster || isNamespaceListLoading}
                            onChange={onNameSpaceSelection}
                            components={{
                                IndicatorSeparator: null,
                                // eslint-disable-next-line react/no-unstable-nested-components
                                MultiValueContainer: ({ ...props }) => (
                                    <MultiValueChipContainer
                                        {...props}
                                        validator={null}
                                        isAllSelected={getIsK8sMultiValueContainer('namespace')}
                                    />
                                ),
                                ClearIndicator,
                                MultiValueRemove,
                                Option,
                                MenuList: menuComponent,
                                LoadingIndicator,
                            }}
                            isLoading={isNamespaceListLoading}
                            menuPlacement="auto"
                            menuPosition="fixed"
                            closeMenuOnSelect={false}
                            isMulti
                            hideSelectedOptions={false}
                            styles={resourceSelectStyles}
                            // @ts-expect-error fix this with custom typing or custom select
                            text="namespace"
                        />
                    </div>
                    <div className="flexbox w-100">
                        <div className="w-100 mr-6">
                            <div className="cn-7 fs-13 fw-4 lh-20 mb-6">API Group</div>
                            <div className="mb-16">
                                <ReactSelect
                                    placeholder="Select API group"
                                    classNamePrefix="k8s-permission-select-api-group-dropdown"
                                    options={apiGroupMapping?.[k8sPermission.key]}
                                    name="Api group"
                                    isDisabled={!k8sPermission.namespace?.length || isApiGroupListLoading}
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
                                    classNamePrefix="k8s-permission-select-kind-dropdown"
                                    options={kindMapping?.[k8sPermission.key]}
                                    isDisabled={!k8sPermission.group}
                                    value={k8sPermission.kind}
                                    onChange={onKindSelect}
                                    formatOptionLabel={formatResourceKindOptionLabel}
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
                                IndicatorSeparator: null,
                                // FIXME: creating new chips when All Resource, fails (UI doesn't show chip)
                                // but the update went through
                                // eslint-disable-next-line react/no-unstable-nested-components
                                MultiValueContainer: ({ ...props }) => (
                                    <MultiValueChipContainer
                                        {...props}
                                        validator={null}
                                        isAllSelected={getIsK8sMultiValueContainer('resource')}
                                    />
                                ),
                                ClearIndicator,
                                MultiValueRemove,
                                Option,
                                MenuList: menuComponent,
                                LoadingIndicator,
                            }}
                            closeMenuOnSelect={false}
                            isMulti
                            hideSelectedOptions={false}
                            styles={resourceSelectStyles}
                            isLoading={isResourceListLoading}
                            menuPlacement="auto"
                            menuPosition="fixed"
                            // @ts-expect-error fix this with custom typing or custom select
                            text="resource name"
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
                            classNamePrefix="k8s-permission-select-role-dropdown"
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
                                    showTooltipWhenDisabled
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
