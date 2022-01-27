import React, { useState, useEffect, useRef } from 'react';
import { showError, Progressing, PopupMenu, ConfirmationDialog, Td } from '../../common';
import moment from 'moment';
import { get } from '../../../services/api';
import { Routes, URLS, ViewType } from '../../../config';
import { deleteInstalledChart } from '../charts.service';
import { toast } from 'react-toastify';
import AppNotDeployedIcon from '../../../assets/img/app-not-configured.png';
import dots from '../../../assets/icons/appstatus/ic-menu-dots.svg'
import trash from '../../../assets/icons/ic-delete.svg';
import deleteIcon from '../../../assets/img/warning-medium.svg';
import { ServerErrors } from '../../../modals/commonTypes';
import ForceDeleteDialog from '../../common/dialogs/ForceDeleteDialog';

export function ChartDeploymentList({ chartId }) {
    const [installs, setInstalls] = React.useState([]);
    const [view, setView] = useState(ViewType.LOADING);
    const timerId = useRef(null)

    async function fetchDeployments() {
        let URL = `${Routes.CHART_INSTALLED}/${chartId}`
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
                        <th>Environment</th>
                        <th>Deployed By</th>
                        <th>Deployed at</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {installs.map((install, idx) => <DeploymentRow {...install} key={idx} />)}
                </tbody>
            </table>
        }
        {installs.length === 0 && <NoDeployments imageComponent={<img src={AppNotDeployedIcon} alt="no deployed charts" style={{ width: '200px', marginBottom: '12px' }} />} />}
    </div>
}


export function DeploymentRow({ installedAppId, appName, status, environmentId, environmentName, deployedBy, deployedAt }) {
    const link = `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${installedAppId}/env/${environmentId}`;
    const [confirmation, toggleConfirmation] = useState(false)
    const [deleting, setDeleting] = useState(false);
    const [showForceDeleteDialog, setForceDeleteDialog] = useState(false)
    const [forceDeleteDialogTitle, setForceDeleteDialogTitle] = useState("")
    const [forceDeleteDialogMessage, setForceDeleteDialogMessage] = useState("")

    function setForceDeleteDialogData(serverError) {
        if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                setForceDeleteDialogTitle(userMessage);
                setForceDeleteDialogMessage(internalMessage);
            });
        }
    }

    async function handleDelete(force) {
        setDeleting(true)
        try {
            if (force === true) {
                await deleteInstalledChart(Number(installedAppId), force)
            } else {
                await deleteInstalledChart(Number(installedAppId))
            }
            toast.success('Successfully deleted');
        }
        catch (err) {
            if (!force && err.code != 403) {
                toggleConfirmation(false);
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

    return (
        <>
            <tr className="deployment-table-row" >
                <Td to={link} className="app-detail">
                    <div className="deployed-app-name ellipsis-right" >{appName}</div>
                    <div className={`app-summary__status-name f-${status.toLowerCase()}`}>{status.toUpperCase()}</div>
                </Td>
                <Td to={link} className="ellipsis-right">{environmentName}</Td>
                <Td to={link} className="ellipsis-right">{deployedBy}</Td>
                <Td to={link} className="ellipsis-right">{moment(deployedAt).fromNow()}</Td>
                <Td>
                    <PopupMenu autoClose>
                        <PopupMenu.Button isKebab>
                            <img src={dots} alt="" />
                        </PopupMenu.Button>
                        <PopupMenu.Body rootClassName="deployment-table-row__delete">
                            <div className="flex left" onClick={e => toggleConfirmation(true)}><img src={trash} alt="delete" />Delete</div>
                        </PopupMenu.Body>
                    </PopupMenu>
                </Td>
            </tr>
            {
                confirmation && <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={deleteIcon} />
                    <ConfirmationDialog.Body title={`Delete app ‘${appName}’`} subtitle={`This will delete all resources associated with this application.`}>
                        <p className="mt-20">Deleted applications cannot be restored.</p>
                    </ConfirmationDialog.Body>
                    <ConfirmationDialog.ButtonGroup>
                        <button className="cta cancel" type="button" onClick={e => toggleConfirmation(false)}>Cancel</button>
                        <button className="cta delete" type="button" onClick={() => handleDelete(false)} disabled={deleting}>{deleting ? <Progressing /> : 'Delete'}</button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            }
            {
                showForceDeleteDialog && <ForceDeleteDialog
                    onClickDelete={() => handleDelete(true)}
                    closeDeleteModal={() => { toggleConfirmation(false); setForceDeleteDialog(false) }}
                    forceDeleteDialogTitle={forceDeleteDialogTitle}
                    forceDeleteDialogMessage={forceDeleteDialogMessage}
                />
            }
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