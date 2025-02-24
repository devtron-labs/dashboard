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
import {
    showError,
    InfoColourBar,
    OptionType,
    GVKType,
    EntityTypes,
    ApiResourceGroupType,
    Button,
    ComponentSizeType,
    SelectPicker,
    ButtonVariantType,
    ButtonStyleType,
    ResourceListPayloadType,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import { K8S_EMPTY_GROUP } from '@Components/ResourceBrowser/Constants'
import {
    getUserAccessClusterList,
    getUserAccessK8sResourceList,
    getUserAccessNamespaceList,
    getUserAccessResourceGroupList,
} from '@Pages/GlobalConfigurations/Authorization/authorization.service'
import {
    processK8SObjects,
    convertToOptionsList,
    sortObjectArrayAlphabetically,
    sortOptionsByLabel,
    importComponentFromFELibrary,
} from '../../../../../../components/common'
import { K8SObjectType } from '../../../../../../components/ResourceBrowser/Types'
import { formatOptionLabel } from '../../../../../../components/v2/common/ReactSelect.utils'
import { ReactComponent as Clone } from '../../../../../../assets/icons/ic-copy.svg'
import { ReactComponent as Delete } from '../../../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as InfoIcon } from '../../../../../../assets/icons/info-filled.svg'
import { multiSelectAllState } from './utils'
import { useAuthorizationContext } from '../../../AuthorizationProvider'
import { ALL_NAMESPACE } from '../../../constants'
import { K8sPermissionActionType, K8S_PERMISSION_INFO_MESSAGE } from './constants'
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
    const [clusterOptions, setClusterOptions] = useState<SelectPickerOptionType<string>[]>([])
    const [processedData, setProcessedData] = useState<Map<string, K8SObjectType>>()
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
            const result = await getUserAccessNamespaceList({ clusterId: +clusterId })
            const options = [ALL_NAMESPACE, ...(result ? convertToOptionsList(result.sort()) : [])]
            setNamespaceMapping((prevMapping) => ({ ...prevMapping, [clusterId]: options }))
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
            const data = await getUserAccessK8sResourceList(resourceListPayload)
            if (data) {
                const _data =
                    data.data?.map((ele) => ({ label: ele.name, value: ele.name })).sort(sortOptionsByLabel) ?? []
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

    const createKindData = (selected, _allKindMapping, _k8SObjectMap = null) => {
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
            _allKindMapping = [{ label: 'All kind', value: SELECT_ALL_VALUE }]
        }

        setKindMapping((prevMapping) => ({
            ...prevMapping,
            [k8sPermission.key]: [..._allKindMapping, ...kind.sort(sortOptionsByLabel)],
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
            const resourceGroupList = await getUserAccessResourceGroupList({ clusterId })
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
                const _allKindMapping = []
                if (resourceGroupList.allowedAll) {
                    _allApiGroupMapping.push(
                        { label: 'All API groups', value: SELECT_ALL_VALUE },
                        { label: 'K8s core groups (eg. service, pod, etc.)', value: 'k8sempty' },
                    )
                    _allKindMapping.push({ label: 'All kind', value: SELECT_ALL_VALUE })
                }
                setAllInKindMapping(_allKindMapping)
                setApiGroupMapping((prevMapping) => ({
                    ...prevMapping,
                    [k8sPermission.key]: [..._allApiGroupMapping, ..._k8SObjectList.sort(sortOptionsByLabel)],
                }))

                if (k8sPermission?.kind) {
                    createKindData(
                        k8sPermission.group,
                        _allKindMapping,
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
            const result = await getUserAccessClusterList()
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
            createKindData(selected, allInKindMapping)
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

    const k8sOptions = customRoles.customRoles
        .filter((role) => role.entity === EntityTypes.CLUSTER)
        .map((role) => ({
            label: role.roleDisplayName,
            value: role.roleName,
            description: role.roleDescription,
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
        <div className="mt-16 mb-16 flexbox-col dc__gap-12 dc__border br-4 p-16 bg__primary">
            <div className="cn-7 fs-13 fw-4 lh-20 flex dc__content-space">
                <span>Cluster</span>
                {!selectedPermissionAction && (
                    <span className="flex dc__gap-4">
                        <Button
                            icon={<Clone />}
                            ariaLabel="Duplicate"
                            onClick={clonePermission}
                            size={ComponentSizeType.xs}
                            dataTestId={`clone-permission-${index}`}
                            variant={ButtonVariantType.borderLess}
                            style={ButtonStyleType.neutral}
                        />
                        <Button
                            icon={<Delete />}
                            ariaLabel="Delete"
                            onClick={deletePermission}
                            size={ComponentSizeType.xs}
                            dataTestId={`delete-permission-${index}`}
                            variant={ButtonVariantType.borderLess}
                            style={ButtonStyleType.negativeGrey}
                        />
                    </span>
                )}
            </div>
            <SelectPicker
                placeholder="Select cluster"
                inputId="k8s-permission-select-cluster-dropdown"
                options={clusterOptions}
                value={k8sPermission?.cluster}
                onChange={onClusterChange}
                name="cluster"
                isLoading={isClusterListLoading}
                isDisabled={isClusterListLoading}
                size={ComponentSizeType.large}
            />
            {k8sPermission?.cluster && (
                <>
                    <SelectPicker
                        label="Namespace"
                        placeholder="Select namespace"
                        inputId="k8s-permission-select-namespace-dropdown"
                        options={namespaceMapping?.[k8sPermission?.cluster?.value]}
                        value={k8sPermission.namespace}
                        name="namespace"
                        isDisabled={!k8sPermission.cluster || isNamespaceListLoading}
                        onChange={onNameSpaceSelection}
                        isLoading={isNamespaceListLoading}
                        closeMenuOnSelect={false}
                        isMulti
                        hideSelectedOptions={false}
                        size={ComponentSizeType.large}
                    />
                    <div className="dc__grid-row-one-half dc__gap-12 w-100">
                        <SelectPicker
                            inputId="k8s-permission-select-api-group-dropdown"
                            placeholder="Select API group"
                            options={apiGroupMapping?.[k8sPermission.key]}
                            name="Api group"
                            isDisabled={!k8sPermission.namespace?.length || isApiGroupListLoading}
                            value={k8sPermission.group}
                            onChange={onApiGroupSelect}
                            isLoading={isApiGroupListLoading}
                            label="API Group"
                            size={ComponentSizeType.large}
                        />
                        <SelectPicker
                            placeholder="Select kind"
                            inputId="k8s-permission-select-kind-dropdown"
                            options={kindMapping?.[k8sPermission.key]?.map((option) => ({
                                ...option,
                                description:
                                    option.value !== SELECT_ALL_VALUE
                                        ? ('gvk' in option && (option.gvk as GVKType)?.Group) || K8S_EMPTY_GROUP
                                        : null,
                            }))}
                            isDisabled={!k8sPermission.group}
                            value={k8sPermission.kind}
                            onChange={onKindSelect}
                            name="kind"
                            label="Kind"
                            size={ComponentSizeType.large}
                        />
                    </div>
                    <SelectPicker
                        label="Resource name"
                        placeholder="Select resource"
                        inputId="k8s-permission-select-resource-dropdown"
                        options={objectMapping?.[k8sPermission.key]}
                        isDisabled={!k8sPermission.kind || isResourceListLoading}
                        value={k8sPermission.resource}
                        name="Resource name"
                        onChange={onResourceObjectChange}
                        closeMenuOnSelect={false}
                        isMulti
                        hideSelectedOptions={false}
                        isLoading={isResourceListLoading}
                        isCreatable
                        size={ComponentSizeType.large}
                    />
                    {K8S_PERMISSION_INFO_MESSAGE[k8sPermission?.kind?.label] && (
                        <InfoColourBar
                            message={K8S_PERMISSION_INFO_MESSAGE[k8sPermission.kind.label]}
                            classname="info_bar mb-12"
                            Icon={InfoIcon}
                            iconClass="icon-dim-20"
                        />
                    )}
                    <div className="w-300">
                        <SelectPicker
                            label="Role"
                            placeholder="Select role"
                            inputId="k8s-permission-select-role-dropdown"
                            options={k8sOptions}
                            value={k8sPermission.action ?? k8sOptions[0]}
                            onChange={setRoleSelection}
                            isSearchable={false}
                            formatOptionLabel={formatOptionLabel}
                            size={ComponentSizeType.large}
                        />
                    </div>
                    {showStatus && (
                        <div className="w-300">
                            <UserStatusUpdate
                                userStatus={k8sPermission.status}
                                timeToLive={k8sPermission.timeToLive}
                                userEmail=""
                                handleChange={handleUserStatusUpdate}
                                disabled={getIsStatusDropdownDisabled(userStatus)}
                                showTooltipWhenDisabled
                                label="Status"
                                size={ComponentSizeType.large}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default K8sListItemCard
