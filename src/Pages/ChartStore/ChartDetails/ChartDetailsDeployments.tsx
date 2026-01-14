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

import { useMemo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'

import {
    APIResponseHandler,
    ConfirmationModal,
    ConfirmationModalProps,
    ConfirmationModalVariantType,
    DeploymentAppTypes,
    ERROR_STATUS_CODE,
    FiltersTypeEnum,
    ForceDeleteConfirmationModal,
    PaginationEnum,
    ServerErrors,
    showError,
    Table,
    ToastManager,
    ToastVariantType,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import ClusterNotReachableDialog from '@Components/common/ClusterNotReachableDialog/ClusterNotReachableDialog'
import { DELETE_ACTION } from '@Config/constants'
import { ApplicationDeletionInfo } from '@Pages/Shared/ApplicationDeletionInfo/ApplicationDeletionInfo'

import { DEPLOYMENTS_TABLE_COLUMNS, DeploymentsTableViewWrapper } from './ChartDetailsTableComponents'
import { deleteChartDeployment, fetchChartDeployments } from './services'
import {
    ChartDeploymentsDTO,
    ChartDetailsDeploymentsProps,
    ChartDetailsRouteParams,
    DeploymentsTableAdditionalProps,
    DeploymentsTableProps,
} from './types'

export const ChartDetailsDeployments = ({ chartIcon }: ChartDetailsDeploymentsProps) => {
    // STATES
    const [isOpenDeleteConfirmationModal, setIsOpenDeleteConfirmationModal] = useState(false)
    const [deleteAppDetails, setDeleteAppDetails] = useState<ChartDeploymentsDTO | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [forceDeleteDialogDetails, setForceDeleteDialogDetails] = useState<Pick<
        ConfirmationModalProps,
        'title' | 'subtitle'
    > | null>(null)
    const [nonCascadeDeleteDialogClusterName, setNonCascadeDeleteDialogClusterName] = useState<string | null>(null)

    // HOOKS
    const { chartId } = useParams<ChartDetailsRouteParams>()

    // ASYNC CALLS
    const [isFetchingChartDeployments, chartDeployments, chartDeploymentsErr, reloadChartDeployments] = useAsync(
        () => fetchChartDeployments(chartId),
        [chartId],
    )

    // CONFIGS
    const rows = useMemo<DeploymentsTableProps['rows']>(
        () =>
            (chartDeployments || []).map<DeploymentsTableProps['rows'][0]>((data) => ({
                id: data.installedAppId.toString(),
                data,
            })),
        [chartDeployments],
    )

    // HANDLERS
    const filter: DeploymentsTableProps['filter'] = useCallback((rowData, filterData) =>
                                                     rowData.data.appName.includes(filterData.searchKey.toLowerCase()), [])

    const handleCloseDeleteConfirmationModal = () => setIsOpenDeleteConfirmationModal(false)

    const handleCloseForceDeleteModal = () => {
        setIsOpenDeleteConfirmationModal(false)
        setForceDeleteDialogDetails(null)
    }

    const handleCloseNonCascadeDeleteModal = () => {
        setNonCascadeDeleteDialogClusterName(null)
    }

    const handleRowDelete = (rowData: ChartDeploymentsDTO) => {
        setIsOpenDeleteConfirmationModal(true)
        setDeleteAppDetails(rowData)
    }

    const handleDelete = async (deleteAction: DELETE_ACTION) => {
        setIsDeleting(true)

        try {
            const result = await deleteChartDeployment({
                installedAppId: deleteAppDetails.installedAppId,
                isGitops: deleteAppDetails.deploymentAppType === DeploymentAppTypes.ARGO,
                deleteAction,
            })
            if (result.deleteResponse?.deleteInitiated) {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Successfully deleted',
                })
                setIsOpenDeleteConfirmationModal(false)
                setNonCascadeDeleteDialogClusterName(null)
                setForceDeleteDialogDetails(null)
                reloadChartDeployments()
            } else if (
                deleteAction !== DELETE_ACTION.NONCASCADE_DELETE &&
                !result.deleteResponse?.clusterReachable &&
                deleteAppDetails.deploymentAppType === DeploymentAppTypes.ARGO
            ) {
                setNonCascadeDeleteDialogClusterName(result.deleteResponse?.clusterName)
                setIsOpenDeleteConfirmationModal(false)
            }
        } catch (err) {
            if (deleteAction !== DELETE_ACTION.FORCE_DELETE && err.code !== ERROR_STATUS_CODE.PERMISSION_DENIED) {
                setIsOpenDeleteConfirmationModal(false)
                setNonCascadeDeleteDialogClusterName(null)
                if (err instanceof ServerErrors && Array.isArray(err.errors)) {
                    err.errors.forEach(({ userMessage, internalMessage }) => {
                        setForceDeleteDialogDetails({
                            title: userMessage,
                            subtitle: internalMessage,
                        })
                    })
                }
            } else {
                showError(err)
            }
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCascadeDelete = async () => {
        await handleDelete(DELETE_ACTION.DELETE)
    }

    const handleForceDelete = async () => {
        await handleDelete(DELETE_ACTION.FORCE_DELETE)
    }

    const handleNonCascadeDelete = async () => {
        await handleDelete(DELETE_ACTION.NONCASCADE_DELETE)
    }

    return (
        <>
            <div className="mh-500 flexbox-col bg__primary border__primary br-4 w-100 dc__overflow-auto">
                <APIResponseHandler
                    isLoading={false}
                    progressingProps={{ size: 24 }}
                    error={chartDeploymentsErr}
                    errorScreenManagerProps={{
                        code: chartDeploymentsErr?.code,
                        reload: reloadChartDeployments,
                    }}
                >
                    <Table<ChartDeploymentsDTO, FiltersTypeEnum.STATE, DeploymentsTableAdditionalProps>
                        id="table__chart-details-deployments"
                        loading={isFetchingChartDeployments}
                        columns={DEPLOYMENTS_TABLE_COLUMNS}
                        rows={rows}
                        stylesConfig={{ showSeparatorBetweenRows: false }}
                        emptyStateConfig={{
                            noRowsConfig: {
                                title: 'This chart is ready for launch',
                                subTitle:
                                    'This chart hasn’t been deployed yet. Click Deploy Chart to get started with your first deployment.',
                                imgName: 'img-man-on-rocket',
                            },
                            noRowsForFilterConfig: {
                                title: 'No results',
                                subTitle: 'We couldn’t find any matching results',
                            },
                        }}
                        paginationVariant={PaginationEnum.NOT_PAGINATED}
                        filtersVariant={FiltersTypeEnum.STATE}
                        filter={filter}
                        ViewWrapper={DeploymentsTableViewWrapper}
                        additionalProps={{
                            chartIcon,
                            onDelete: handleRowDelete,
                        }}
                        additionalFilterProps={{
                            initialSortKey: 'appName',
                        }}
                    />
                </APIResponseHandler>
            </div>
            {isOpenDeleteConfirmationModal && (
                <ConfirmationModal
                    variant={ConfirmationModalVariantType.delete}
                    title={`Delete app ‘${deleteAppDetails.appName}’`}
                    subtitle={<ApplicationDeletionInfo />}
                    buttonConfig={{
                        secondaryButtonConfig: {
                            onClick: handleCloseDeleteConfirmationModal,
                            text: 'Cancel',
                        },
                        primaryButtonConfig: {
                            isLoading: isDeleting,
                            onClick: handleCascadeDelete,
                            text: 'Delete',
                        },
                    }}
                    handleClose={handleCloseDeleteConfirmationModal}
                />
            )}
            {!!forceDeleteDialogDetails && (
                <ForceDeleteConfirmationModal
                    {...forceDeleteDialogDetails}
                    onDelete={handleForceDelete}
                    closeConfirmationModal={handleCloseForceDeleteModal}
                />
            )}
            {!!nonCascadeDeleteDialogClusterName && (
                <ClusterNotReachableDialog
                    clusterName={nonCascadeDeleteDialogClusterName}
                    onClickCancel={handleCloseNonCascadeDeleteModal}
                    onClickDelete={handleNonCascadeDelete}
                />
            )}
        </>
    )
}
