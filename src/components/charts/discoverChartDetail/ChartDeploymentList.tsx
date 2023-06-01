import React, { useState, useEffect, useRef } from 'react';
import { Td } from '../../common';
import moment from 'moment';
import { get, ServerErrors, showError, Progressing, ConfirmationDialog, ForceDeleteDialog, PopupMenu, ResponseType } from '@devtron-labs/devtron-fe-common-lib';
import { Routes, URLS, ViewType, SERVER_MODE, DELETE_ACTION } from '../../../config';
import { deleteInstalledChart } from '../charts.service';
import { toast } from 'react-toastify';
import AppNotDeployedIcon from '../../../assets/img/app-not-configured.png';
import dots from '../../../assets/icons/appstatus/ic-menu-dots.svg'
import trash from '../../../assets/icons/ic-delete.svg';
import deleteIcon from '../../../assets/img/warning-medium.svg';
import { getAppId } from '../../v2/appDetails/k8Resource/nodeDetail/nodeDetail.api';
import ClusrerNotReachableDailog from '../../common/ClusterNotReachableDailog/ClusterNotReachableDialog';
import { DeploymentAppType } from '../../v2/appDetails/appDetails.type';
import AppStatus from '../../app/AppStatus';

export function ChartDeploymentList({ chartId }) {
    const [installs, setInstalls] = React.useState([]);
    const [view, setView] = useState(ViewType.LOADING);
    const timerId = useRef(null)

    async function fetchDeployments() {
        let URL = `${Routes.CHART_STORE}/${Routes.CHART_STORE_DEPLOYMENT}/installed-app/${chartId}`
        try {
            const { result } = await get(URL)
            setInstalls(result || [])
            setView(ViewType.FORM)
        }
        catch (err) { }
    }

    useEffect(() => {
        fetchDeployments()
        timerId.current = setInterval(fetchDeployments, 30000)
        return () => {
            if (timerId.current) clearInterval(timerId.current)
        }
    }, [])

    if (view === ViewType.LOADING) {
        return <div className="white-card white-card--no-padding deployments flex">
            <div className="chart-store-card__header">Deployments</div>
            <Progressing pageLoader={true} />
        </div>
    }
    return <div className="white-card white-card--no-padding deployments">
        <div className="chart-store-card__header">Deployments</div>
        {installs.length !== 0 &&
            <table className="deployments-table">
                <thead className="deployment-table-header">
                    <tr>
                        <th>App name</th>
                        <th>App Status</th>
                        <th>Environment</th>
                        <th>Deployed By</th>
                        <th>Deployed at</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {installs.map((install, idx) => <DeploymentRow {...install} key={idx} setView={setView} fetchDeployments={fetchDeployments}/>)}
                </tbody>
            </table>
        }
        {installs.length === 0 && <NoDeployments imageComponent={<img src={AppNotDeployedIcon} alt="no deployed charts" style={{ width: '200px', marginBottom: '12px' }} />} />}
    </div>
}

export function DeploymentRow({ installedAppId, appName, status, deploymentAppType, environmentId, environmentName, deployedBy, deployedAt, appOfferingMode, clusterId, namespace, setView, fetchDeployments }) {
    const link = _buildAppDetailUrl();
    const [confirmation, toggleConfirmation] = useState(false)
    const [deleting, setDeleting] = useState(false);
    const [showForceDeleteDialog, setForceDeleteDialog] = useState(false)
    const [forceDeleteDialogTitle, setForceDeleteDialogTitle] = useState("")
    const [forceDeleteDialogMessage, setForceDeleteDialogMessage] = useState("")
    const [nonCascadeDeleteDialog, showNonCascadeDeleteDialog] = useState<boolean>(false);
    const [clusterName, setClusterName] = useState<string>('');

    function setForceDeleteDialogData(serverError) {
        if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                setForceDeleteDialogTitle(userMessage);
                setForceDeleteDialogMessage(internalMessage);
            });
        }
    }

    function _buildAppDetailUrl() {
        if (appOfferingMode == SERVER_MODE.EA_ONLY) {
            return `${URLS.APP}/${URLS.EXTERNAL_APPS}/${getAppId(clusterId, namespace, appName)}/${appName}`;
        } else {
            return `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${installedAppId}/env/${environmentId}`;
        }
    }

    async function handleDelete(deleteAction: DELETE_ACTION) {
        setDeleting(true)
        try {
            let response: ResponseType = await deleteInstalledChart(Number(installedAppId), deploymentAppType === DeploymentAppType.argo_cd, deleteAction)
            if (response.result.deleteResponse?.deleteInitiated) {
                toast.success('Successfully deleted')
                toggleConfirmation(false)
                showNonCascadeDeleteDialog(false)
                setForceDeleteDialog(false)
                setView(ViewType.LOADING)
                fetchDeployments()
            } else if (deleteAction !== DELETE_ACTION.NONCASCADE_DELETE && !response.result.deleteResponse?.clusterReachable) {
                setClusterName(response.result.deleteResponse?.clusterName)
                toggleConfirmation(false)
                showNonCascadeDeleteDialog(true)
            }
        }
        catch (err: any) {
            if (deleteAction !== DELETE_ACTION.FORCE_DELETE && err.code != 403) {
                toggleConfirmation(false)
                showNonCascadeDeleteDialog(false)
                setForceDeleteDialog(true);
                setForceDeleteDialogData(err);
            } else {
                showError(err)
            }
        }
        finally {
            setDeleting(false);
        }
    }
    
    const onClickHideNonCascadeDeletePopup = () => {
        showNonCascadeDeleteDialog(false)
    }
    
    const onClickNonCascadeDelete = async() => {
        showNonCascadeDeleteDialog(false)
        await handleDelete(DELETE_ACTION.NONCASCADE_DELETE)
    }

    const handleForceDelete = () => {handleDelete(DELETE_ACTION.FORCE_DELETE)}
    const handleCascadeDelete = () => {handleDelete(DELETE_ACTION.DELETE)}

    return (
        <>
            <tr className="deployment-table-row">
                <Td to={link} className="app-detail">
                    <div className="deployed-app-name dc__ellipsis-right">{appName}</div>
                </Td>
                <Td to={link} className="dc__ellipsis-right">
                    <AppStatus appStatus={status} />
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
                            <div className="flex left" onClick={(e) => toggleConfirmation(true)}>
                                <img src={trash} alt="delete" />
                                Delete
                            </div>
                        </PopupMenu.Body>
                    </PopupMenu>
                </Td>
            </tr>
            {confirmation && (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={deleteIcon} />
                    <ConfirmationDialog.Body
                        title={`Delete app ‘${appName}’`}
                        subtitle={`This will delete all resources associated with this application.`}
                    >
                        <p className="mt-20">Deleted applications cannot be restored.</p>
                    </ConfirmationDialog.Body>
                    <ConfirmationDialog.ButtonGroup>
                        <button className="cta cancel" type="button" onClick={(e) => toggleConfirmation(false)}>
                            Cancel
                        </button>
                        <button
                            className="cta delete"
                            type="button"
                            onClick={handleCascadeDelete}
                            disabled={deleting}
                        >
                            {deleting ? <Progressing /> : 'Delete'}
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )}
            {showForceDeleteDialog && (
                <ForceDeleteDialog
                    onClickDelete={handleForceDelete}
                    closeDeleteModal={() => {
                        toggleConfirmation(false)
                        setForceDeleteDialog(false)
                    }}
                    forceDeleteDialogTitle={forceDeleteDialogTitle}
                    forceDeleteDialogMessage={forceDeleteDialogMessage}
                />
            )}
            {nonCascadeDeleteDialog && (
                <ClusrerNotReachableDailog
                    clusterName={clusterName}
                    onClickCancel={onClickHideNonCascadeDeletePopup}
                    onClickDelete={onClickNonCascadeDelete}
                />
            )}
        </>
    )
}

export function NoDeployments({ imageComponent, title = "No Deployments", subtitle = "You haven't deployed this chart" }) {
    return <div className="white-card--no-deployments flex column" style={{ width: '100%', height: '100%' }}>
        {imageComponent}
        <div className="title" style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--N900)' }}>{title}</div>
        <div className="subtitle" style={{ fontSize: '12px', color: 'var(--N700)' }}>{subtitle}</div>
    </div>
}
