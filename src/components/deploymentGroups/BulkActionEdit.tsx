import React from 'react'
import { useParams, useHistory, useLocation } from 'react-router';
import { useCallback } from 'react';
import { useReducer } from 'react';
import { OpaqueModal, useKeyDown, Info, ConfirmationDialog, useAsync, Progressing, showError } from '../common'
import { useEffect } from 'react';
import { ReactComponent as EnvIcon } from '../../assets/icons/ic-env.svg';
import { ReactComponent as BranchIcon } from '../../assets/icons/misc/branch.svg';
import { ReactComponent as Error } from '../../assets/icons/misc/errorInfo.svg';
import WarningIcon from '../../assets/icons/ic-warning.svg';
import { ReactComponent as SearchIcon } from '../../assets/icons/ic-search.svg';
import { toast } from 'react-toastify';
import EmptyState from '../EmptyState/EmptyState'
import {getCiPipelineApps, getLinkedCiPipelines, createUpdateDeploymentGroup, getDeploymentGroupDetails} from './service'
import { useMemo } from 'react';

export function BulkActionEdit() {
    const { id } = useParams<{id: string}>();
    const location = useLocation()
    const [loading, result, error, reload] = useAsync(()=>getLinkedCiPipelines(id),[id])
    const { push } = useHistory()
    const memoisedReducer = useCallback((state, action) => {
        switch (action.type) {
            case 'editGroupName':
                return { ...state, groupName: action.value, groupNameError: null }
            case 'editGroupError':
                return { ...state, groupNameError: action.value }
            case 'setPipelines':
                return { ...state, pipelines: action.value }
            case 'setApplications':
                return { ...state, applications: action.value}
            case 'selectPipeline':
                return { ...state, ciPipelineId: action.value }
            case 'selectEnvironment':
                return { ...state, environmentId: action.value, appSearchString: "" }
            case 'appSearch':
                return { ...state, appSearchString: action.value }
            case 'selectApplication':
                const envId = state.environmentId
                return {
                    ...state, prevEnvId: envId, selectedApplications:
                        Array.isArray(state.selectedApplications[envId])
                            ? { ...state.selectedApplications, [envId]: [...state.selectedApplications[envId], ...action.value] }
                            : { ...state.selectedApplications, [envId]: action.value }
                }
            case 'unselectApplication':
                return { ...state, selectedApplications: { ...state.selectedApplications, [state.environmentId]: state.selectedApplications[state.environmentId].filter(id => id !== action.value) } }
            case 'selectAllApplications':
                return { ...state, prevEnvId: state.environmentId, selectedApplications: { ...state.selectedApplications, [state.environmentId]: state.applications.filter(app => app.envId === state.environmentId).map(app => app.id) } }
            case 'getConfirmation':
                return { ...state, confirmationDialog: true, tempValue: action.value }
            case 'closeModalDialog':
                return { ...state, confirmationDialog: false }
            case 'resetSelection':
                return {
                    ...state, confirmationDialog: false, selectedApplications: {
                        ...state.selectedApplications,
                        [state.prevEnvId]: [],
                        [state.environmentId]: state.tempValue === 0 ? state.applications.filter(app => app.envId === state.environmentId).map(app =>app.id) : [state.tempValue],
                    }, prevEnvId: state.environmentId
                }
            case 'changeStep':
                return { ...state, activeStep: action.value }
            case 'loading':
                return { ...state, loading: action.value }
            case 'loadingCIDetails':
                return {...state, loadingCIDetails: action.value}
            default:
                return state
        }
    }, [id])

    const initialState = {
        groupName: "",
        ciPipelineId: null,
        environmentId: null,
        appSearchString: "",
        applications: [],
        selectedApplications: {},
        pipelines: [],
        activeStep: 1,
    }

    const [state, dispatch] = useReducer(memoisedReducer, initialState)
    useEffect(() => {
        if (loading) return
        if (error) showError(error)
        if (result && Array.isArray(result.result)) {
            dispatch({ type: 'setPipelines', value: result.result })
        }
    }, [loading, result, error])

    useEffect(()=>{
        async function fetchCIApps(){
            dispatch({type:'loadingCIDetails', value: true})
            const {result} = await getCiPipelineApps(state.ciPipelineId)
            try{
                const applications = result.reduce((agg, curr, idx) => {
                    const { id, name, apps } = curr
                    return [...agg, ...apps.map(app => ({...app, envName: name, envId: id }))]
                }, [])
                dispatch({ type: 'setApplications', value: applications })
                if(Number(id) === 0){
                    dispatch({ type:'selectEnvironment', value: null})
                    dispatch({ type:'selectApplication', value:[] })
                }
            }
            catch(err){
                showError(err)
            }
            finally{
                dispatch({ type: 'loadingCIDetails', value: false })
            }
        }
        if(!state.ciPipelineId) return
        fetchCIApps()
    },[state.ciPipelineId])

    useEffect(() => {
        async function fetchDetails() {
            try {
                const {result} = await getDeploymentGroupDetails(id)
                const {name,ciPipelineId,environmentId, appIds} = result
                dispatch({ type: 'editGroupName', value: name })
                dispatch({ type: 'selectPipeline', value: ciPipelineId })
                dispatch({ type: 'selectEnvironment', value: environmentId })
                dispatch({ type: 'selectApplication', value: appIds})
                dispatch({ type: 'changeStep', value: 2 })
            }
            catch (err) {

            }
        }
        if (Number(id) === 0) return
        fetchDetails()
    }, [id])
    const ciPipeline = useMemo(()=>{
        if(!Array.isArray(state.pipelines) || !state.ciPipelineId){
            return null
        }
        return state.pipelines.find(p=>p.ciPipelineId===state.ciPipelineId)
    },[state.ciPipelineId, state.pipelines])

    const environments = [];
    const envMap = new Map();
    const selectedAppIds = state.environmentId && Array.isArray(state.selectedApplications[state.environmentId]) ? state.selectedApplications[state.environmentId] : []
    if (Array.isArray(state.applications)) {
        for (const item of state.applications) {
            if (!envMap.has(item.envId)) {
                envMap.set(item.envId, true);    // set any value to Map
                environments.push({
                    envId:item.envId,
                    envName: item.envName
                });
            }

        }
    }
    function handleSelectApp(id, name) {
        if (state.prevEnvId && state.environmentId !== state.prevEnvId) {
            dispatch({ type: 'getConfirmation', value: id })
        }
        else {
            if (id === 0) {
                dispatch({ type: 'selectAllApplications' })
            }
            else {
                if (Array.isArray(state.selectedApplications[state.environmentId]) && state.selectedApplications[state.environmentId].includes(id)){
                    dispatch({ type: 'unselectApplication', value: id})
                }
                else{
                    dispatch({ type: 'selectApplication', value: [ id ] })
                }
            }
        }
    }

    async function createDeploymentGroup(e) {
        if (!state.groupName) {
            dispatch({ type: 'editGroupError', value: 'Group name is mandatory.' })
            return
        }
        if (!state.ciPipelineId) {
            toast.warn('Please select CI pipeline');
            return
        }
        if (!state.environmentId) {
            toast.warn('Please select environment')
            return
        }
        if (!state.selectedApplications[state.environmentId] || state.selectedApplications[state.environmentId].length === 0) {
            toast.warn('Please select some apps')
            return
        }
        dispatch({ type: 'loading', value: true })
        try {
            const payload = {
                ...(Number(id) > 0 ? { id: Number(id) } : {}),
                name: state.groupName,
                ciPipelineId: state.ciPipelineId,
                environmentId: state.environmentId,
                appIds: state.selectedApplications[state.environmentId]
            }
            const { result } = await createUpdateDeploymentGroup(Number(id), payload )
            toast.success(`Successfully ${Number(id) > 0 ? 'updated' : 'created'}`)
            let nextLocation = location.pathname.split("/")
            nextLocation.pop()
            push(nextLocation.join("/"))
        }
        catch (err) {
            showError(err)
        }
        finally {
            dispatch({ type: 'loading', value: false })
        }
    }
    function selectSecondStep(e){
        if(state.applications.length === 0){
            if(!state.ciPipelineId){
                toast.warn('Please select CI pipeline')
            }
            else{
                toast.warn('No applications found for selected CI')
            }
            return
        }
        dispatch({ type: 'changeStep', value: 2 })
    }
    if (loading) {
        return <Progressing pageLoader />
    }
    return (
        <div className="bulk-action-page bulk-action-page--edit">
            <section className="form-section">
                <div className="form-container">
                    <h2 className="form__title">{`${Number(id) === 0 ? 'Create' : 'Update'} Deployment Group`}</h2>
                    <div className="form__label">
                        <label>Group name*</label>
                        <input autoComplete="off" disabled={Number(id) > 0} type="text" value={state.groupName} onChange={e => dispatch({ type: 'editGroupName', value: e.target.value })} placeholder="Deployment group" className="form__input" />
                        {state.groupNameError && <label className="form__error flex left"><Info color="#f33e3e" style={{height:'16px', width:'16px'}}/>{state.groupNameError}</label>}
                    </div>
                    <TitledCard
                        number={1}
                        title={ciPipeline ? `Source CI Pipeline : ${ciPipeline.name}` : 'Select Source: CI Pipeline'}
                        next={state.activeStep === 1 ?  e => { e.stopPropagation(); dispatch({ type: 'changeStep', value: 2 }) } : null}
                        completed={!!state.ciPipelineId}
                        onClick={e => dispatch({ type: 'changeStep', value: 1 })}
                    >
                        {state.activeStep === 1 && <div className="ci-pipelines">
                            {Array.isArray(state.pipelines) &&
                            <>
                                {state.pipelines.map(p => <PipelineSelect key={p.ciPipelineId} {...p} isActive={p.ciPipelineId === state.ciPipelineId} select={Number(id) === 0 ? e => dispatch({ type: 'selectPipeline', value: p.ciPipelineId }) : () => { }} />)}
                                {state.pipelines.length === 0 &&
                                <EmptyState>
                                    <div style={{height:'400px'}} className="flex column empty-pipelines">
                                        <EmptyState.Image><Error style={{width:'32px', height:'32px'}}/></EmptyState.Image>
                                        <EmptyState.Title><h3>No Linked pipelines created</h3></EmptyState.Title>
                                        <EmptyState.Subtitle>Deployment groups can only be created for applications and environments using Linked CI Pipelines.</EmptyState.Subtitle>
                                    </div>
                                </EmptyState>}
                            </>}
                        </div>}

                    </TitledCard>
                    <TitledCard
                        number={2}
                        title="Select Target: Environment & Applications "
                        next={null}
                        onClick={selectSecondStep}
                        completed={selectedAppIds.length > 0}
                    >
                        {state.activeStep === 2 && <div className="environments">
                            <div className="environments-select">
                                <h5>Environment</h5>
                                {environments.map(env =>
                                    <EnvSelect
                                        {...env}
                                        key={env.envId}
                                        active={env.envId === state.environmentId}
                                        appCount={Array.isArray(state.selectedApplications[env.envId]) ? state.selectedApplications[env.envId].length : 0}
                                        select={Number(id) === 0 ? e => dispatch({ type: 'selectEnvironment', value: env.envId }) : () => { }}
                                    />)}
                            </div>
                            {state.environmentId && !state.loadingCIDetails && <>
                                <div className="apps-select">
                                    <h5>Connected Applications</h5>
                                    {<div className="app-search flex left">
                                        <SearchIcon />
                                        <input autoComplete="off" type="text" value={state.appSearchString} onChange={e => dispatch({ type: 'appSearch', value: e.target.value })} />
                                    </div>}
                                    {!state.appSearchString && state.applications.filter(app => app.envId === state.environmentId).length !== selectedAppIds.length && <AppSelect name="Select All" selected={false} select={e => handleSelectApp(0, null)} selectedEnvId={state.environmentId} envId={state.environmentId} searchString={"Select All"} />}
                                    {Array.isArray(state.applications) && state.applications.map((app:any) => <AppSelect key={app.id} {...app} selected={Array.isArray(selectedAppIds) && selectedAppIds.includes(app.id)} select={e => handleSelectApp(app.id, app.name)} selectedEnvId={state.environmentId} searchString={state.appSearchString} />)}
                                </div>
                                <div className="selected-apps">
                                    <h5>Selected Applications</h5>
                                    {Array.isArray(state.applications) && state.applications.map((app: any) => <SelectedApp key={`${app.id}`} {...app} selected={Array.isArray(selectedAppIds) && selectedAppIds.includes(app.id)} select={e => handleSelectApp(app.id, app.name)} selectedEnvId={state.environmentId} searchString={state.appSearchString} />)}
                                </div>
                            </>
                            }
                            {state.loadingCIDetails && <Progressing pageLoader/>}
                        </div>}
                    </TitledCard>
                </div>
            </section>
            <section className="cta-section flex">
                <button className="cta" onClick={createDeploymentGroup} type="button">{state.loading ?
                    <Progressing /> : 'Save Changes'
                }
                </button>
            </section>
            {state.confirmationDialog &&
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={WarningIcon} />
                    <ConfirmationDialog.Body title="Warning" subtitle="You can create deployment groups for only one environment. Do you want to reset you previous selections?" />
                    <ConfirmationDialog.ButtonGroup>
                        <div className="flex right">
                            <button type="button" className="cta secondary" onClick={e => dispatch({ type: 'closeModalDialog' })}>Cancel</button>
                            <button type="button" className="cta" onClick={e => dispatch({ type: 'resetSelection' })}>Reset Selection</button>
                        </div>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            }
        </div>
    )
}

function EnvSelect({ envName = "", appCount, active = false, select }) {
    const { id: deploymentGroupId } = useParams<{id: string}>()
    if(Number(deploymentGroupId) > 0 && !active) return null
    return (
        <div className={`env-select-card flex left pointer ${active ? 'active' : ''}`} onClick={select}>
            <EnvIcon />
            <div className="flex column left">
                <b>{envName}</b>
                <span className="namespace">{!!appCount && appCount > 0 ? `${appCount} apps selected` : ' '}</span>
            </div>
        </div>
    )
}

function AppSelect({ name, selected, select, selectedEnvId, envId, searchString }) {
    if (envId !== selectedEnvId) return null
    if (!name.includes(searchString)) return null
    return (
        <div className="app-select-card pointer flex left" onClick={select}>
            <input type="checkbox" checked={selected} onChange={e=>{}}/>
            {name}
        </div>
    )
}

function SelectedApp({ id, name, select, selected, selectedEnvId, envId }) {
    if(!selected) return null
    if (envId !== selectedEnvId) return null
    return (
        <div className="selected-app-card pointer flex left" onClick={select}>
            <input type="checkbox" checked />
            {name}
        </div>
    )
}

function PipelineSelect({id, name, connections, isActive, select, repositories }) {
    const {id: deploymentGroupId} = useParams<{id: string}>()
    if(Number(deploymentGroupId) > 0 && !isActive){
        return null
    }
    return (
        <div className="pipeline pointer" onClick={select}>
            <div className="flex left top">
                <span className={`radio ${isActive ? 'active' : ''}`} />
                <div className="pipeline--details flex left column w-100">
                    <div className="pipeline--info"><b>{name}</b> (connected to {connections} Deployment pipelines)</div>
                    {Array.isArray(repositories) && repositories.map((r, idx) => <Repo key={idx} {...r} />)}
                </div>
            </div>
        </div>
    )
}

function Repo({ gitMaterialName, source }) {
    return (
        <div className="flex left repo w-100">
            <div className="repo-name">{gitMaterialName}</div> / <div className="branch-name"><BranchIcon />{source.value}</div>
        </div>
    )
}

function TitledCard({ number, completed = false, title, next, onClick, children }) {
    return (
        <div className="white-card--titled" onClick={onClick}>
            <div className={`title-container ${completed ? 'active' : ''}`}>
                <div className="index flex">{number}</div>
                <div className="title flex left">{title}</div>
                <div className="next flex">{completed && typeof next === 'function' && <button className="cta" onClick={next} type="button">Next</button>}</div>
            </div>
            {children}
        </div>
    )
}

export default function BulkActionEditModal() {
    const { push } = useHistory()
    const location = useLocation()
    const keys = useKeyDown()
    useEffect(() => {
        if (keys.join("") === 'Escape') {
            close()
        }
    }, [keys])

    function close() {
        let nextLocation = location.pathname.split("/")
        nextLocation.pop()
        push(nextLocation.join("/"))
    }
    return (
        <OpaqueModal onHide={close}>
            <BulkActionEdit />
        </OpaqueModal>
    )
}