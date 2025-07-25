import { useMemo, useState } from 'react'
import { generatePath, useHistory, useLocation } from 'react-router-dom'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DC_DELETE_SUBTITLES,
    DeleteConfirmationModal,
    ERROR_STATUS_CODE,
    GenericSectionErrorState,
    Icon,
    noop,
    SortableTableHeaderCell,
    SortingOrder,
    stringComparatorBySortOrder,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { namespaceListByClusterId } from '@Components/ResourceBrowser/ResourceBrowser.service'
import { DeleteComponentsName } from '@Config/constantMessaging'
import { URLS } from '@Config/routes'

import { deleteEnvironment } from './cluster.service'
import {
    ClusterEnvListProps,
    DeleteEnvConfigType,
    DeleteEnvProps,
    EditEnvConfigType,
    EditEnvProps,
    EnvironmentListProps,
    EnvListSortableKeys,
    EnvNamespaceRowType,
} from './cluster.type'
import { environmentNameComparator, getSelectParsedCategory } from './cluster.util'
import { ClusterEnvironmentDrawer } from './ClusterEnvironmentDrawer'
import { ClusterEnvLoader } from './ClusterList.components'
import { ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY } from './constants'

import './cluster.scss'

// This is a list of namespaces and environments mapped to a cluster
const ClustersEnvironmentsList = ({
    clusterId,
    clusterName,
    clusterType,
    environments,
    isVirtualCluster,
    filterConfig: { sortBy, searchKey, sortOrder },
    showUnmappedEnvs,
    setDeleteEnvConfig: setDeleteEnvId,
    setEditEnvConfig: setEditEnvId,
}: ClusterEnvListProps) => {
    const [namespaceListLoading, namespaceListResult, namespaceListError, reloadNamespaces] = useAsync(
        () => namespaceListByClusterId(`${clusterId}`),
        [],
        !isVirtualCluster && showUnmappedEnvs,
    )

    const { push } = useHistory()
    const { search } = useLocation()

    const mappedNamespacesMap = useMemo(
        () =>
            environments.reduce<Record<string, boolean>>((agg, curr) => {
                // eslint-disable-next-line no-param-reassign
                agg[curr.namespace] = true
                return agg
            }, {}),
        [environments],
    )

    const namespacesMap = useMemo(
        () =>
            (namespaceListResult?.result ?? []).reduce<Record<string, boolean>>((agg, curr) => {
                // eslint-disable-next-line no-param-reassign
                agg[curr] = true
                return agg
            }, {}),
        [namespaceListResult],
    )

    const namespaceEnvList: EnvNamespaceRowType[] = useMemo(
        () => [
            ...environments.map(({ id: envId, environmentName, namespace, isProd, category, description }) => ({
                clusterId,
                envId,
                environmentName,
                namespace,
                envType: isProd ? 'Production' : 'Non Production',
                category: category?.name ?? '',
                description,
                // false for virtual clusters and actual namespaces might not exist, for physical cluster showing not found if does not exist
                namespaceNotFound: isVirtualCluster || !showUnmappedEnvs ? false : !namespacesMap[namespace],
            })),
            ...(namespaceListResult?.result ?? [])
                .filter((namespace) => !mappedNamespacesMap[namespace])
                .map((namespace) => ({
                    clusterId,
                    envId: 0,
                    environmentName: '',
                    namespace,
                    envType: '',
                    category: '',
                    description: '',
                    namespaceNotFound: false,
                })),
        ],
        [environments, namespaceListResult],
    )

    const handleDeleteEnv = (envId: number) => () => {
        setDeleteEnvId({ envId, clusterId })
    }

    const handleEditEnv = (envId: number) => () => {
        setEditEnvId({ envId, clusterId, isVirtualCluster })
    }

    const getAddAsEnvHandler = (namespace: string) => () => {
        localStorage.setItem(ADD_ENVIRONMENT_FORM_LOCAL_STORAGE_KEY, JSON.stringify({ namespace }))
        push({
            pathname: generatePath(`${URLS.GLOBAL_CONFIG_CLUSTER}${URLS.CREATE_ENVIRONMENT}/:clusterId`, {
                clusterId,
            }),
            search,
        })
    }

    const renderNamespaceEnvList = () => {
        if (namespaceListLoading) {
            return <ClusterEnvLoader />
        }

        if (namespaceListError) {
            return <GenericSectionErrorState reload={reloadNamespaces} />
        }

        const sortedFilteredList = namespaceEnvList
            .filter((env) => env.environmentName.includes(searchKey))
            .sort((a, b) => {
                switch (sortBy) {
                    case EnvListSortableKeys.ENV_CATEGORY:
                        return stringComparatorBySortOrder(a.category, b.category, sortOrder)
                    case EnvListSortableKeys.ENV_NAMESPACE:
                        return stringComparatorBySortOrder(a.namespace, b.namespace, sortOrder)
                    case EnvListSortableKeys.ENV_TYPE:
                        return stringComparatorBySortOrder(a.envType, b.envType, sortOrder)
                    case EnvListSortableKeys.ENV_NAME:
                    default:
                        return environmentNameComparator(
                            a.environmentName,
                            b.environmentName,
                            sortOrder || SortingOrder.ASC,
                        )
                }
            })

        if (searchKey && !sortedFilteredList.length) {
            return (
                <div className="flex column py-20 dc__gap-12">
                    <Icon name="ic-info-outline" size={24} color={null} />
                    <div className="flexbox-col fs-13 lh-20">
                        <span className="text-center fw-6 cn-9">No matching environments</span>
                        <span className="text-center fw-4 cn-8">
                            {clusterName} does not have any matching environments for ‘{searchKey}’
                        </span>
                    </div>
                </div>
            )
        }

        if (!namespaceEnvList.length) {
            return (
                <div className="flex column py-20 dc__gap-12">
                    <Icon name="ic-info-outline" size={24} color={null} />
                    <span className="fs-13 fw-6 lh-20 cn-9">No Environment available for this cluster</span>
                    {/* TODO: Add on click */}
                    <Button
                        dataTestId={`add-env-${clusterName}`}
                        startIcon={<Icon name="ic-add" color={null} />}
                        text="Add Environment"
                        size={ComponentSizeType.small}
                        variant={ButtonVariantType.borderLess}
                    />
                </div>
            )
        }

        return sortedFilteredList.map(
            ({ namespace, namespaceNotFound, envId, envType, environmentName, category, description }) => (
                <div
                    role="button"
                    key={namespace}
                    className="px-20 py-8 dc__grid environment-row dc__align-items-center fs-13 fw-4 lh-20 dc__hover-n50 dc__opacity-hover dc__opacity-hover--parent"
                    onClick={envId ? noop : getAddAsEnvHandler(namespace)}
                    tabIndex={0}
                >
                    {envId ? (
                        <>
                            <Icon name="ic-bg-environment" size={20} color={null} />
                            <span className="cb-5">{environmentName}</span>
                            <span>{`${namespace}${namespaceNotFound ? ' (Not Found)' : ''}`}</span>
                            <span>{envType}</span>
                            <span>{category}</span>
                            <span>{description}</span>
                            <div className="dc__opacity-hover--child">
                                <div className="flexbox dc__gap-8">
                                    <Button
                                        dataTestId={`env-edit-button-${environmentName}`}
                                        icon={<Icon name="ic-pencil" color={null} />}
                                        ariaLabel="Edit Environment"
                                        variant={ButtonVariantType.borderLess}
                                        style={ButtonStyleType.neutral}
                                        size={ComponentSizeType.xs}
                                        showTooltip
                                        showAriaLabelInTippy={false}
                                        tooltipProps={{
                                            content: 'Edit environment',
                                        }}
                                        onClick={handleEditEnv(envId)}
                                    />
                                    <Button
                                        dataTestId={`env-delete-button-${environmentName}`}
                                        icon={<Icon name="ic-delete" color={null} />}
                                        variant={ButtonVariantType.borderLess}
                                        style={ButtonStyleType.negativeGrey}
                                        size={ComponentSizeType.xs}
                                        ariaLabel="Delete"
                                        showAriaLabelInTippy={false}
                                        showTooltip
                                        tooltipProps={{
                                            content: 'Delete environment',
                                        }}
                                        onClick={handleDeleteEnv(envId)}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Icon name="ic-add" size={20} color="B500" />
                            <span className="cb-5">Add as Environment</span>
                            <span>{namespace}</span>
                        </>
                    )}
                </div>
            ),
        )
    }

    return (
        <>
            {/* Cluster metadata */}
            <div
                className="px-20 py-6 bg__secondary flex dc__gap-16 dc__content-start fs-12 lh-20 cn-7 dc__position-sticky"
                style={{ top: '37px' }}
            >
                <Icon name="ic-bg-cluster" size={24} color={null} />
                <span className="fw-6">{clusterName}</span>
                <div className="flex dc__gap-4 fw-4">
                    <span>{clusterType}</span>
                    <span>·</span>
                    <span>{environments.length} Environments</span>
                    {showUnmappedEnvs && (
                        <>
                            <span>·</span>
                            {isVirtualCluster ? (
                                <span>{environments.filter(({ namespace }) => !!namespace).length} Namespaces</span>
                            ) : (
                                !namespaceListError && (
                                    <span>{(namespaceListResult?.result ?? []).length} Namespaces</span>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* Env and Namespace List */}
            {renderNamespaceEnvList()}
        </>
    )
}

const DeleteEnv = ({ envId, environments, reload, handleClose }: DeleteEnvProps) => {
    const { environmentName, clusterId, prometheusEndpoint, namespace, isProd, description } = environments.find(
        ({ id }) => id === envId,
    )

    const onDelete = async () => {
        const deletePayload = {
            id: envId,
            environment_name: environmentName,
            cluster_id: clusterId,
            prometheus_endpoint: prometheusEndpoint,
            namespace: namespace || '',
            active: true,
            default: isProd,
            description: description || '',
        }
        await deleteEnvironment(deletePayload)
        reload()
    }

    return (
        <DeleteConfirmationModal
            title={environmentName}
            component={DeleteComponentsName.Environment}
            subtitle={DC_DELETE_SUBTITLES.DELETE_ENVIRONMENT_SUBTITLE}
            onDelete={onDelete}
            closeConfirmationModal={handleClose}
            errorCodeToShowCannotDeleteDialog={ERROR_STATUS_CODE.BAD_REQUEST}
        />
    )
}

const EditEnv = ({ envId, environments, reload, handleClose, isVirtualCluster }: EditEnvProps) => {
    const { environmentName, clusterId, clusterName, namespace, isProd, description, category } = environments.find(
        ({ id }) => id === envId,
    )
    return (
        <ClusterEnvironmentDrawer
            drawerType="editEnv"
            clusterId={clusterId}
            clusterName={clusterName}
            envId={envId}
            envName={environmentName}
            description={description}
            category={getSelectParsedCategory(category)}
            namespace={namespace}
            isProduction={isProd}
            reload={reload}
            hideClusterDrawer={handleClose}
            isVirtualCluster={isVirtualCluster}
        />
    )
}

const EnvironmentList = ({
    isLoading,
    clusterList,
    filterConfig: { sortBy, sortOrder, searchKey },
    showUnmappedEnvs,
    handleSorting,
    filterClusterId,
    clusterIdVsEnvMap,
    reloadEnvironments,
}: EnvironmentListProps) => {
    const [deleteEnvConfig, setDeleteEnvConfig] = useState<DeleteEnvConfigType>(null)
    const [editEnvConfig, setEditEnvConfig] = useState<EditEnvConfigType>(null)

    const handleEnvListSorting = (sortByKey: EnvListSortableKeys) => () => handleSorting(sortByKey)

    const handleCloseDeleteDialog = () => {
        setDeleteEnvConfig(null)
    }

    const handleCloseEditEnvDialog = () => {
        setEditEnvConfig(null)
    }

    return (
        <>
            <div className="border__secondary--bottom bg__primary px-20 py-8 dc__grid environment-row dc__align-items-center dc__position-sticky dc__top-0">
                {/* Empty div for icon */}
                <div />
                <SortableTableHeaderCell
                    title="ENVIRONMENT"
                    isSortable
                    triggerSorting={handleEnvListSorting(EnvListSortableKeys.ENV_NAME)}
                    isSorted={sortBy === EnvListSortableKeys.ENV_NAME}
                    sortOrder={sortOrder}
                    disabled={isLoading}
                />
                <SortableTableHeaderCell
                    title="NAMESPACE"
                    isSortable
                    triggerSorting={handleEnvListSorting(EnvListSortableKeys.ENV_NAMESPACE)}
                    isSorted={sortBy === EnvListSortableKeys.ENV_NAMESPACE}
                    sortOrder={sortOrder}
                    disabled={isLoading}
                />
                <SortableTableHeaderCell
                    title="TYPE"
                    isSortable
                    triggerSorting={handleEnvListSorting(EnvListSortableKeys.ENV_TYPE)}
                    isSorted={sortBy === EnvListSortableKeys.ENV_TYPE}
                    sortOrder={sortOrder}
                    disabled={isLoading}
                />
                <SortableTableHeaderCell
                    title="CATEGORY"
                    isSortable
                    triggerSorting={handleEnvListSorting(EnvListSortableKeys.ENV_CATEGORY)}
                    isSorted={sortBy === EnvListSortableKeys.ENV_CATEGORY}
                    sortOrder={sortOrder}
                    disabled={isLoading}
                />
                <SortableTableHeaderCell title="DESCRIPTION" isSortable={false} />
            </div>
            {clusterList
                .filter(({ clusterId }) => !filterClusterId || filterClusterId === String(clusterId))
                .map(({ clusterId, clusterName, isProd, isVirtualCluster }) => (
                    <ClustersEnvironmentsList
                        key={`${clusterName}-${clusterId}`}
                        clusterId={clusterId}
                        clusterName={clusterName}
                        clusterType={isProd ? 'Production' : 'Non Production'}
                        environments={clusterIdVsEnvMap[clusterId] ?? []}
                        isVirtualCluster={isVirtualCluster}
                        filterConfig={{
                            sortBy,
                            sortOrder,
                            searchKey,
                        }}
                        showUnmappedEnvs={showUnmappedEnvs}
                        setDeleteEnvConfig={setDeleteEnvConfig}
                        setEditEnvConfig={setEditEnvConfig}
                    />
                ))}
            {deleteEnvConfig && (
                <DeleteEnv
                    environments={clusterIdVsEnvMap[deleteEnvConfig.clusterId]}
                    envId={deleteEnvConfig.envId}
                    reload={reloadEnvironments}
                    handleClose={handleCloseDeleteDialog}
                />
            )}
            {editEnvConfig && (
                <EditEnv
                    environments={clusterIdVsEnvMap[editEnvConfig.clusterId]}
                    envId={editEnvConfig.envId}
                    reload={reloadEnvironments}
                    handleClose={handleCloseEditEnvDialog}
                    isVirtualCluster={editEnvConfig.isVirtualCluster}
                />
            )}
        </>
    )
}

export default EnvironmentList
