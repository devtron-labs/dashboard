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

import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import {
    get,
    ServerErrors,
    showError,
    Progressing,
    ConfirmationDialog,
    PopupMenu,
    ResponseType,
    DeploymentAppTypes,
    AppStatus,
    ToastManager,
    ToastVariantType,
    ForceDeleteConfirmationModal,
    ConfirmationModal,
    ConfirmationModalVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { Td } from '../../common'
import { Routes, URLS, ViewType, SERVER_MODE, DELETE_ACTION } from '../../../config'
import { deleteInstalledChart } from '../charts.service'
import AppNotDeployedIcon from '../../../assets/img/app-not-configured.png'
import dots from '../../../assets/icons/appstatus/ic-menu-dots.svg'
import trash from '../../../assets/icons/ic-delete.svg'
import { getAppId } from '../../v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'
import ClusterNotReachableDialog from '../../common/ClusterNotReachableDialog/ClusterNotReachableDialog'
import { ApplicationDeletionInfo } from '@Pages/Shared/ApplicationDeletionInfo/ApplicationDeletionInfo'

export const ChartDeploymentList = ({ chartId }) => {
    const [installs, setInstalls] = React.useState([])
    const [view, setView] = useState(ViewType.LOADING)
    const timerId = useRef(null)

    async function fetchDeployments() {
        const URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_DEPLOYMENT}/installed-app/${chartId}`
        try {
            const { result } = await get(URL)
            setInstalls(result || [])
            setView(ViewType.FORM)
        } catch (err) {}
    }

    useEffect(() => {
        fetchDeployments()
        timerId.current = setInterval(fetchDeployments, 30000)
        return () => {
            if (timerId.current) {
                clearInterval(timerId.current)
            }
        }
    }, [])

    if (view === ViewType.LOADING) {
        return (
            <div className="white-card white-card--no-padding deployments flex">
                <div className="chart-store-card__header">Deployments</div>
                <Progressing pageLoader />
            </div>
        )
    }
    return (
        <div className="white-card white-card--no-padding deployments">
            <div className="chart-store-card__header" data-testid="deployments-heading">
                Deployments
            </div>
            {installs.length !== 0 && (
                <table className="deployments-table" data-testid="deployments-table">
                    <thead className="deployment-table-header">
                        <tr>
                            <th>App name</th>
                            <th>App Status</th>
                            <th>Environment</th>
                            <th>Deployed By</th>
                            <th>Deployed at</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {installs.map((install, idx) => (
                            <DeploymentRow
                                {...install}
                                key={idx}
                                setView={setView}
                                fetchDeployments={fetchDeployments}
                            />
                        ))}
                    </tbody>
                </table>
            )}
            {installs.length === 0 && (
                <NoDeployments
                    imageComponent={
                        <img
                            src={AppNotDeployedIcon}
                            alt="no deployed charts"
                            style={{ width: '200px', marginBottom: '12px' }}
                        />
                    }
                />
            )}
        </div>
    )
}

export const DeploymentRow = ({
    installedAppId,
    appName,
    status,
    deploymentAppType,
    environmentId,
    environmentName,
    deployedBy,
    deployedAt,
    appOfferingMode,
    clusterId,
    namespace,
    setView,
    fetchDeployments,
}) => {
    const link = _buildAppDetailUrl()
    const [confirmation, setConfirmation] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showForceDeleteDialog, setForceDeleteDialog] = useState(false)
    const [forceDeleteDialogTitle, setForceDeleteDialogTitle] = useState('')
    const [forceDeleteDialogMessage, setForceDeleteDialogMessage] = useState('')
    const [nonCascadeDeleteDialog, showNonCascadeDeleteDialog] = useState<boolean>(false)
    const [clusterName, setClusterName] = useState<string>('')

    function setForceDeleteDialogData(serverError) {
        if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                setForceDeleteDialogTitle(userMessage)
                setForceDeleteDialogMessage(internalMessage)
            })
        }
    }

    function _buildAppDetailUrl() {
        if (appOfferingMode == SERVER_MODE.EA_ONLY) {
            return `${URLS.APP}/${URLS.EXTERNAL_APPS}/${getAppId({ clusterId, namespace, appName })}/${appName}`
        }
        return `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${installedAppId}/env/${environmentId}`
    }

    const onCloseConfirmationModal = () => setConfirmation(false)

    async function handleDelete(deleteAction: DELETE_ACTION) {
        setDeleting(true)
        try {
            const response: ResponseType = await deleteInstalledChart(
                Number(installedAppId),
                deploymentAppType === DeploymentAppTypes.GITOPS,
                deleteAction,
            )
            if (response.result.deleteResponse?.deleteInitiated) {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Successfully deleted',
                })
                setConfirmation(false)
                showNonCascadeDeleteDialog(false)
                setForceDeleteDialog(false)
                setView(ViewType.LOADING)
                fetchDeployments()
            } else if (
                deleteAction !== DELETE_ACTION.NONCASCADE_DELETE &&
                !response.result.deleteResponse?.clusterReachable &&
                deploymentAppType === DeploymentAppTypes.GITOPS
            ) {
                setClusterName(response.result.deleteResponse?.clusterName)
                setConfirmation(false)
                showNonCascadeDeleteDialog(true)
            }
        } catch (err: any) {
            if (deleteAction !== DELETE_ACTION.FORCE_DELETE && err.code != 403) {
                setConfirmation(false)
                showNonCascadeDeleteDialog(false)
                setForceDeleteDialog(true)
                setForceDeleteDialogData(err)
            } else {
                showError(err)
            }
        } finally {
            setDeleting(false)
        }
    }

    const onClickHideNonCascadeDeletePopup = () => {
        showNonCascadeDeleteDialog(false)
    }

    const onClickNonCascadeDelete = async () => {
        showNonCascadeDeleteDialog(false)
        await handleDelete(DELETE_ACTION.NONCASCADE_DELETE)
    }

    const handleForceDelete = () => {
        handleDelete(DELETE_ACTION.FORCE_DELETE)
    }

    const handleCascadeDelete = () => {
        handleDelete(DELETE_ACTION.DELETE)
    }

    const closeForceDeleteModal = () => {
        setConfirmation(false)
        setForceDeleteDialog(false)
    }

    return (
        <>
            <tr className="deployment-table-row">
                <Td to={link} className="app-detail">
                    <div className="deployed-app-name dc__ellipsis-right">{appName}</div>
                </Td>
                <Td to={link} className="dc__ellipsis-right">
                    <AppStatus status={status} />
                </Td>
                <Td to={link} className="dc__ellipsis-right">
                    {environmentName}
                </Td>
                <Td to={link} className="dc__ellipsis-right">
                    {deployedBy}
                </Td>
                <Td to={link} className="dc__ellipsis-right">
                    {moment(deployedAt).fromNow()}
                </Td>
                <Td>
                    <PopupMenu autoClose>
                        <PopupMenu.Button isKebab>
                            <img src={dots} alt="" />
                        </PopupMenu.Button>
                        <PopupMenu.Body rootClassName="deployment-table-row__delete">
                            <div className="flex left" onClick={(e) => setConfirmation(true)}>
                                <img src={trash} alt="delete" />
                                Delete
                            </div>
                        </PopupMenu.Body>
                    </PopupMenu>
                </Td>
            </tr>
            <ConfirmationModal
                variant={ConfirmationModalVariantType.delete}
                title={`Delete app ‘${appName}’`}
                subtitle={<ApplicationDeletionInfo />}
                showConfirmationModal={confirmation}
                buttonConfig={{
                    secondaryButtonConfig: {
                        onClick: onCloseConfirmationModal,
                        text: 'Cancel',
                    },
                    primaryButtonConfig: {
                        isLoading: deleting,
                        onClick: handleCascadeDelete,
                        text: 'Delete',
                    },
                }}
                handleClose={onCloseConfirmationModal}
            />

            <ForceDeleteConfirmationModal
                title={forceDeleteDialogTitle}
                subtitle={forceDeleteDialogMessage}
                onDelete={handleForceDelete}
                showConfirmationModal={showForceDeleteDialog}
                closeConfirmationModal={closeForceDeleteModal}
            />

            <ClusterNotReachableDialog
                clusterName={clusterName}
                onClickCancel={onClickHideNonCascadeDeletePopup}
                onClickDelete={onClickNonCascadeDelete}
                showConfirmationModal={nonCascadeDeleteDialog}
            />
        </>
    )
}

export const NoDeployments = ({
    imageComponent,
    title = 'No Deployments',
    subtitle = "You haven't deployed this chart",
}) => {
    return (
        <div className="white-card--no-deployments flex column" style={{ width: '100%', height: '100%' }}>
            {imageComponent}
            <div className="title" style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--N900)' }}>
                {title}
            </div>
            <div className="subtitle" style={{ fontSize: '12px', color: 'var(--N700)' }}>
                {subtitle}
            </div>
        </div>
    )
}
