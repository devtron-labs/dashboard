import { useAsync, showError, Progressing, PopupMenu, ConfirmationDialog, useInterval, ConditionalWrap, Td } from '../common'
import { trash } from '../../services/api'
import { ReactComponent as Branch } from '../../assets/icons/misc/branch.svg'
import { ReactComponent as DeployButton } from '../../assets/icons/ic-deploy.svg';
import React, { useState } from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router'
import { Switch, Route } from 'react-router-dom';
import moment from 'moment'
import BulkActionEdit from './BulkActionEdit'
import { toast } from 'react-toastify'
import { getCDMaterialList, triggerGroupDeploy, getDeploymentGroupDetail, pauseResumeDeploymentGroup } from './service';
import { CDMaterial } from '../app/details/triggerView/cdMaterial';
import { Routes, URLS, getAppTriggerURL } from '../../config';
import Trash2 from '../../assets/img/warning-medium.svg'
import warningIcon from '../../assets/icons/ic-warning.svg';
import restoreIcon from '../../assets/icons/ic-restore.svg'
import Tippy from '@tippyjs/react';
import {ReactComponent as DropDown} from '../../assets/icons/appstatus/ic-chevron-down.svg';

export default function BulkActionDetails() {
    const { id: deploymentGroupId } = useParams<{id: string}>()
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
    const [showCDModal, toggleShowCDModal] = useState(false);
    const { push } = useHistory()
    const { path } = useRouteMatch()
    const [isLoading, setIsLoading] = useState(false)
    const [materials, saveMaterials] = useState([])
    const [pausing, setPausing] = useState(false)
    const [loading, result, error, reload] = useAsync(() => getDeploymentGroupDetail(Number(deploymentGroupId)), [deploymentGroupId])
    useInterval(reload, 30000)

    async function handleDelete(e) {
        try{
            setPausing(true)
            switch (deleteConfirmation) {
                case 'delete':
                    await trash(`${Routes.DEPLOYMENT_GROUP_DELETE}/${deploymentGroupId}`)
                    toast.success('Successfully deleted.')
                    push(URLS.DEPLOYMENT_GROUPS)
                    break
                case 'hibernate':
                    await pauseResumeDeploymentGroup({deploymentGroupId, requestType: 'STOP'})
                    toast.success('Deployment initiated.')
                    reload()
                    setDeleteConfirmation('')
                    break
                case 'resume':
                    await pauseResumeDeploymentGroup({ deploymentGroupId, requestType: 'START' })
                    toast.success('Deployment initiated.')
                    reload()
                    setDeleteConfirmation('')
                    break
            }
        }
        catch(err){
            showError(err)
        }
        finally{
            setPausing(false)
        }
    }
    if (loading && !result) return <Progressing pageLoader/>
    if (error) return null

    const { result: { appContainers, appCount, deploymentGroup } } = result

    async function onClickDeploy() {
        let materials = await getCDMaterialList(deploymentGroupId)
        saveMaterials(materials.result);
        toggleShowCDModal(true);
    }

    async function triggerDeploy() {
        setIsLoading(true);
        let material = materials.find((mat) => mat.isSelected);
        let request = {
            DeploymentGroupId: +deploymentGroupId,
            CiArtifactId: material.id
        }
        try {
            await triggerGroupDeploy(request);
            toast.success("Deployment Triggerd");
            toggleShowCDModal(false)
            reload();
        }
        catch (error) {
            showError(error);
        }
        finally {
            setIsLoading(false);
        }
    }

    function toggleSourceInfo(index: number) {
        let updatedMaterials = materials.map((mat, i) => {
            return {
                ...mat,
                showSourceInfo: (i === index) ? !mat.showSourceInfo : mat.showSourceInfo
            }
        })
        saveMaterials(updatedMaterials);
    }

    function selectImage(index: number, materialType: string) {
        let updatedMaterials = materials.map((mat, i) => {
            return {
                ...mat,
                isSelected: index === i
            }
        })
        saveMaterials(updatedMaterials);
    }

    function handleMoreActions(selection){
        switch(selection){
            case 'edit':
                push(`${URLS.DEPLOYMENT_GROUPS}/${deploymentGroupId}/edit`)
                break
            case 'delete':
            case 'hibernate':
            case 'resume':
                setDeleteConfirmation(selection)
        }
    }

    function getConfirmatinDialogIcon(){
        switch(deleteConfirmation){
            case 'delete':
                return Trash2
            case 'hibernate':
                return warningIcon
            case 'resume':
                return restoreIcon
        }
    }

    function getConfirmationDialogTitles(){
        switch (deleteConfirmation) {
            case 'delete':
                return { title: `Delete ${deploymentGroup.name}`, subtitle: "Are you sure you want to delete this deployment group ?"}
            case 'hibernate':
                return {
                    title: `Hibernate all applications`, subtitle: <p>Pods for all applications in this group will be <b>scaled down to 0 on this</b> environment.</p> }
            case 'resume':
                return {
                    title: `Restore all stopped applications`, subtitle: <p>All stopped applications in this group will be <b>scaled up to their original count on this</b> environment</p> }
        }
    }

    function getCTA(){
        switch (deleteConfirmation) {
            case 'delete':
                return 'Delete'
            case 'hibernate':
                return 'Hibernate Apps'
            case 'resume':
                return 'Restore Apps'
        }
    }

    return <>
        <section className="page deployment-detail-page">
            {deploymentGroup && <article className="page-header">
                <div className="page-header__title flex left">
                    {deploymentGroup.name}
                </div>
                <div className="page-header__cta-container flex left">
                    <button className="cta-with-img cancel mr-8" onClick={(event) => {
                        onClickDeploy()
                    }}><DeployButton />Deploy</button>
                    <PopupMenu autoClose>
                        <PopupMenu.Button rootClassName="deployment-detail-page__more-actions--button flex">
                            More Actions
                            <DropDown/>
                        </PopupMenu.Button>
                        <PopupMenu.Body rootClassName="deployment-detail-page__more-actions--body">
                            <div onClick={e => handleMoreActions('hibernate')}>Scale pods to 0</div>
                            <div onClick={e => handleMoreActions('resume')}>Restore pod count</div>
                            <div onClick={e => handleMoreActions('edit')}>Edit group</div>
                            <div onClick={e => handleMoreActions('delete')}>Delete group</div>
                        </PopupMenu.Body>
                    </PopupMenu>
                </div>
            </article>
            }
            <div className="deployment-details-body">
                <article className="deployment-details-metadata white-card flex left top">
                    <div className="sources flex left column">
                        <div className="title">Source</div>
                        {(deploymentGroup?.ciMaterialDTOs || []).map(({ name, type, value }) => <MaterialList key={name} {...{ name, type, value }} />)}
                    </div>
                    <div className="targets flex left column">
                        <div className="title">Target</div>
                        <div className="count">{appCount} applications</div>
                        <div className="environment">{}</div>
                    </div>
                </article>
                {Array.isArray(appContainers) && <BulkActionsList apps={appContainers} />}
            </div>
        </section>
        {deleteConfirmation &&
            <ConfirmationDialog>
                <ConfirmationDialog.Icon src={getConfirmatinDialogIcon()} />
                <ConfirmationDialog.Body {...getConfirmationDialogTitles()} />
                <ConfirmationDialog.ButtonGroup>
                    <div className="flex right">
                        <button type="button" className="cta cancel" onClick={e => setDeleteConfirmation('')}>Cancel</button>
                        <button type="button" className={`cta ${deleteConfirmation}`} disabled={pausing} onClick={handleDelete}>{ pausing ? <Progressing/> : getCTA()}</button>
                    </div>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        }
        <Switch>
            <Route path={`${path}/edit`} component={BulkActionEdit} />
        </Switch>
        {showCDModal && <CDMaterial material={materials}
            isLoading={isLoading}
            envName={""}
            stageType="CD"
            materialType="none"
            triggerDeploy={triggerDeploy}
            toggleSourceInfo={toggleSourceInfo}
            selectImage={selectImage}
            closeCDModal={() => { toggleShowCDModal(false) }}
        />}
    </>
}

function BulkActionsList({ apps }) {
    return (
        <div style={{ overflow: 'hidden', padding: '0' }} className="white-card">
            <table className="group-details">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th>Environment</th>
                        <th>Last Deployed Time</th>
                    </tr>
                </thead>
                <tbody>
                    {apps.map(({ appId, appName, environments }) => environments.map(({ environmentId, environmentName, cdStageStatus, lastDeployedTime, preStageStatus, postStageStatus }) =>{
                        const newRoute = getAppTriggerURL(appId);
                        return <tr key={appId} className="pointer striped-row">
                            <Td to={newRoute}>{appName}</Td>
                            <Td to={newRoute}><MultiStatus {...{ pre: preStageStatus, post: postStageStatus, deploy: cdStageStatus }} /></Td>
                            <Td to={newRoute}>{environmentName}</Td>
                            <Td to={newRoute}>{lastDeployedTime ? moment(lastDeployedTime, 'YYYY-MM-DD HH:mm:ss').add(5, 'hours').add(30, 'minutes').format('ddd, DD MMM YYYY, HH:mm a') : ''}</Td>
                        </tr>
                        }
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function joinByhyphen(status){
    try{
        return status.split(" ").join("-").toLowerCase()
    }
    catch(err){
        return ''
    }
}

function MultiStatus({ pre, post, deploy }) {
    [pre, post, deploy] = [pre, post, deploy].map(st => {
        if (st === "") return 'not-triggered'
        return st
    })
    return (
        <div className="multi-status">
            <div className="status-progress flex">
                {[pre, deploy, post].map(stage=>
                <ConditionalWrap
                    condition={!!stage}
                    wrap={children=><Tippy className="default-tt" content={stage}>{children}</Tippy>}
                >
                        <div className={`app-status__icon ${joinByhyphen(stage)}`}/>
                </ConditionalWrap>
                )}
            </div>
        </div>
    )
}

function MaterialList({ name, value, type }) {
    return (
        <div className="bulk-action-list__cell bulk-action-list__cell--source">
            <p className="deployment-group__repo-list">
                <span className="icon-dim-18 git inline-block mr-5"></span>
                <span className="deployment-group__repo-name mr-5"> {name}/</span>
                <span className="icon-dim-16 inline-block mr-5">
                    {type === 'SOURCE_TYPE_BRANCH_FIXED' ? <Branch className="hw-100" /> : null}
                </span>
                <span className="deployment-group__branch-name">{value}</span>
            </p>
        </div>
    )
}