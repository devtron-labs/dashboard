import React, { useState, useEffect, useMemo } from 'react'
import { getAppOtherEnvironment, getCDConfig as getCDPipelines } from '../../../../services/service'
import { Progressing, showError, useAsync, useInterval, useScrollable, mapByKey, asyncWrap } from '../../../common'
import { ModuleNameMap, URLS } from '../../../../config'
import { AppNotConfigured } from '../appDetails/AppDetails'
import { useHistory, useRouteMatch, useParams, generatePath } from 'react-router'
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'
import Reload from '../../../Reload/Reload'
import { getTriggerHistory, getTriggerDetails, getCDBuildReport } from './service'
import DeploymentHistoryConfigList from './deploymentHistoryDiff/DeploymentHistoryConfigList.component'
import './cdDetail.scss'
import DeploymentHistoryDetailedView from './deploymentHistoryDiff/DeploymentHistoryDetailedView'
import { DeploymentTemplateList } from './cd.type'
import DeploymentDetailSteps from './DeploymentDetailSteps'
import { DeploymentAppType } from '../../../v2/appDetails/appDetails.type'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import Sidebar from '../cicdHistory/Sidebar'
import { Scroller, LogResizeButton, GitChanges, EmptyView } from '../cicdHistory/History.components'
import { TriggerDetails } from '../cicdHistory/TriggerDetails'
import Artifacts from '../cicdHistory/Artifacts'
import { CICDSidebarFilterOptionType, History, HistoryComponentType } from '../cicdHistory/types'
import LogsRenderer from '../cicdHistory/LogsRenderer'

const terminalStatus = new Set(['error', 'healthy', 'succeeded', 'cancelled', 'failed', 'aborted'])
let statusSet = new Set(['starting', 'running', 'pending'])

export default function CDDetails() {
    const { appId, envId, triggerId, pipelineId } = useParams<{
        appId: string
        envId: string
        triggerId: string
        pipelineId: string
    }>()
    const [pagination, setPagination] = useState<{ offset: number; size: number }>({ offset: 0, size: 20 })
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [triggerHistory, setTriggerHistory] = useState<Map<number, History>>(new Map())

    const [fullScreenView, setFullScreenView] = useState<boolean>(false)
    const [loading, result, error] = useAsync(
        () =>
            Promise.allSettled([
                getAppOtherEnvironment(appId),
                getCDPipelines(appId),
                getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
            ]),
        [appId],
    )
    const [loadingDeploymentHistory, deploymentHistoryResult, deploymentHistoryError, , , dependencyState] = useAsync(
        () => getTriggerHistory(+appId, +envId, pipelineId, pagination),
        [pagination, appId, envId],
        !!envId && !!pipelineId,
    )
    const { path } = useRouteMatch()
    const { replace } = useHistory()
    useInterval(pollHistory, 30000)
    const [deploymentHistoryList, setDeploymentHistoryList] = useState<DeploymentTemplateList[]>()

    useEffect(() => {
        // check for more
        if (loading || !deploymentHistoryResult) return
        if (deploymentHistoryResult?.result?.length !== pagination.size) {
            setHasMore(false)
        } else {
            setHasMore(true)
        }
        const newTriggerHistory = (deploymentHistoryResult?.result || []).reduce((agg, curr) => {
            agg.set(curr.id, curr)
            return agg
        }, triggerHistory)
        setTriggerHistory(new Map(newTriggerHistory))
        return () => {
            setTriggerHistory(new Map())
        }
    }, [deploymentHistoryResult, loading])

    async function pollHistory() {
        // polling
        if (!pipelineId || !envId) return
        const [error, result] = await asyncWrap(
            getTriggerHistory(+appId, +envId, +pipelineId, { offset: 0, size: pagination.offset + pagination.size }),
        )
        if (error) {
            showError(error)
            return
        }

        const triggerHistoryMap = mapByKey(result?.result || [], 'id')
        const newTriggerHistory = Array.from(triggerHistoryMap).reduce((agg, [triggerId, curr]) => {
            const detailedTriggerHistory = triggerHistory.has(triggerId) ? triggerHistory.get(triggerId) : {}
            agg.set(curr.id, { ...detailedTriggerHistory, ...curr })
            return agg
        }, triggerHistoryMap)
        setTriggerHistory(newTriggerHistory)
    }

    function syncState(triggerId: number, triggerDetail: History) {
        if (triggerId === triggerDetail.id) {
            setTriggerHistory((triggerHistory) => {
                triggerHistory.set(triggerId, triggerDetail)
                return new Map(triggerHistory)
            })
        }
    }

    if (loading || (loadingDeploymentHistory && triggerHistory.size === 0)) {
        return <Progressing pageLoader />
    } else if (
        result &&
        (!Array.isArray(result[0]?.['value'].result) || !Array.isArray(result[1]?.['value']?.pipelines))
    ) {
        return <AppNotConfigured />
    } else if (!result || (envId && dependencyState[2] !== envId)) {
        return null
    }

    const pipelines = result[1]['value'].pipelines
    const deploymentAppType = pipelines?.find((pipeline) => pipeline.id === Number(pipelineId))?.deploymentAppType
    const cdPipelinesMap = mapByKey(pipelines, 'environmentId')
    if (!triggerId && envId && pipelineId && deploymentHistoryResult?.result?.length) {
        replace(
            generatePath(path, {
                appId,
                envId,
                pipelineId,
                triggerId: deploymentHistoryResult.result[0].id,
            }),
        )
    }
    const environment = result[0]['value'].result.find((envData) => envData.environmentId === +envId) || null
    const envOptions: CICDSidebarFilterOptionType[] = (result[0]['value'].result || []).map((item) => {
        return {
            value: `${item.environmentId}`,
            label: item.environmentName,
            pipelineId: cdPipelinesMap.get(item.environmentId).id,
        }
    })
    return (
        <>
            <div className={`ci-details  ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
                {!fullScreenView && (
                    <div className="ci-details__history">
                        <Sidebar
                            filterOptions={envOptions}
                            type={HistoryComponentType.CD}
                            hasMore={hasMore}
                            triggerHistory={triggerHistory}
                            setPagination={setPagination}
                        />
                    </div>
                )}
                <div className="ci-details__body">
                    {triggerHistory.size > 0 ? (
                        <Route
                            path={`${path
                                .replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')
                                .replace(':envId(\\d+)?', ':envId(\\d+)')}`}
                        >
                            <TriggerOutput
                                fullScreenView={fullScreenView}
                                syncState={syncState}
                                triggerHistory={triggerHistory}
                                setFullScreenView={setFullScreenView}
                                setDeploymentHistoryList={setDeploymentHistoryList}
                                deploymentHistoryList={deploymentHistoryList}
                                deploymentAppType={deploymentAppType}
                                isBlobStorageConfigured={result[2]?.['value']?.result?.enabled || false}
                            />
                        </Route>
                    ) : !envId ? (
                        <EmptyView
                            title="No environment selected"
                            subTitle="Please select an environment to start seeing CD deployments."
                        />
                    ) : (
                        <EmptyView
                            title="No deployments"
                            subTitle={`No deployment history available for the ${environment?.environmentName} environment.`}
                        />
                    )}
                    {<LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />}
                </div>
            </div>
        </>
    )
}

const TriggerOutput: React.FC<{
    fullScreenView: boolean
    syncState: (triggerId: number, triggerDetails: History) => void
    triggerHistory: Map<number, History>
    setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
    deploymentHistoryList: DeploymentTemplateList[]
    setDeploymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
    deploymentAppType: DeploymentAppType
    isBlobStorageConfigured: boolean
}> = ({
    fullScreenView,
    syncState,
    triggerHistory,
    setFullScreenView,
    setDeploymentHistoryList,
    deploymentHistoryList,
    deploymentAppType,
    isBlobStorageConfigured,
}) => {
    const { appId, triggerId, envId, pipelineId } = useParams<{
        appId: string
        triggerId: string
        envId: string
        pipelineId: string
    }>()
    const triggerDetails = triggerHistory.get(+triggerId)
    const [triggerDetailsLoading, triggerDetailsResult, triggerDetailsError, reloadTriggerDetails] = useAsync(
        () => getTriggerDetails({ appId, envId, pipelineId, triggerId }),
        [triggerId, appId, envId],
        !!triggerId && !!pipelineId,
    )
    useEffect(() => {
        if (triggerDetailsLoading || triggerDetailsError) return

        if (triggerDetailsResult?.result) syncState(+triggerId, triggerDetailsResult?.result)
    }, [triggerDetailsLoading, triggerDetailsResult, triggerDetailsError])

    const timeout = useMemo(() => {
        if (
            !triggerDetails ||
            terminalStatus.has(triggerDetails.podStatus?.toLowerCase() || triggerDetails.status?.toLowerCase())
        )
            return null // no interval
        if (statusSet.has(triggerDetails.status?.toLowerCase() || triggerDetails.podStatus?.toLowerCase())) {
            // 10s because progressing
            return 10000
        }
        return 30000 // 30s for normal
    }, [triggerDetails])

    useInterval(reloadTriggerDetails, timeout)

    if (triggerDetailsLoading && !triggerDetails) return <Progressing pageLoader />
    if (!triggerDetailsLoading && !triggerDetails) return <Reload />
    if (triggerDetails?.id !== +triggerId) {
        return null
    }

    return (
        <>
            <div className="trigger-details-container">
                {!fullScreenView && (
                    <>
                        <TriggerDetails
                            type={HistoryComponentType.CD}
                            status={triggerDetails.status}
                            startedOn={triggerDetails.startedOn}
                            finishedOn={triggerDetails.finishedOn}
                            triggeredBy={triggerDetails.triggeredBy}
                            triggeredByEmail={triggerDetails.triggeredByEmail}
                            ciMaterials={triggerDetails.ciMaterials}
                            gitTriggers={triggerDetails.gitTriggers}
                            message={triggerDetails.message}
                            podStatus={triggerDetails.podStatus}
                            stage={triggerDetails.stage}
                        />
                        <ul className="pl-20 tab-list tab-list--nodes dc__border-bottom">
                            {triggerDetails.stage === 'DEPLOY' && deploymentAppType !== DeploymentAppType.helm && (
                                <li className="tab-list__tab">
                                    <NavLink
                                        replace
                                        className="tab-list__tab-link"
                                        activeClassName="active"
                                        to="deployment-steps"
                                    >
                                        Steps
                                    </NavLink>
                                </li>
                            )}
                            {triggerDetails.stage !== 'DEPLOY' && (
                                <li className="tab-list__tab">
                                    <NavLink
                                        replace
                                        className="tab-list__tab-link"
                                        activeClassName="active"
                                        to={`logs`}
                                    >
                                        Logs
                                    </NavLink>
                                </li>
                            )}
                            <li className="tab-list__tab">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link"
                                    activeClassName="active"
                                    to={`source-code`}
                                >
                                    Source code
                                </NavLink>
                            </li>
                            {triggerDetails.stage == 'DEPLOY' && (
                                <li className="tab-list__tab">
                                    <NavLink
                                        replace
                                        className="tab-list__tab-link"
                                        activeClassName="active"
                                        to={`configuration`}
                                    >
                                        Configuration
                                    </NavLink>
                                </li>
                            )}
                            {triggerDetails.stage !== 'DEPLOY' && (
                                <li className="tab-list__tab">
                                    <NavLink
                                        replace
                                        className="tab-list__tab-link"
                                        activeClassName="active"
                                        to={`artifacts`}
                                    >
                                        Artifacts
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    </>
                )}
            </div>
            <HistoryLogs
                key={triggerDetails.id}
                triggerDetails={triggerDetails}
                loading={triggerDetailsLoading && !triggerDetailsResult}
                setFullScreenView={setFullScreenView}
                setDeploymentHistoryList={setDeploymentHistoryList}
                deploymentHistoryList={deploymentHistoryList}
                deploymentAppType={deploymentAppType}
                isBlobStorageConfigured={isBlobStorageConfigured}
            />
        </>
    )
}

const HistoryLogs: React.FC<{
    triggerDetails: History
    loading: boolean
    setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
    deploymentHistoryList: DeploymentTemplateList[]
    setDeploymentHistoryList: React.Dispatch<React.SetStateAction<DeploymentTemplateList[]>>
    deploymentAppType: DeploymentAppType
    isBlobStorageConfigured: boolean
}> = ({
    triggerDetails,
    loading,
    setFullScreenView,
    deploymentHistoryList,
    setDeploymentHistoryList,
    deploymentAppType,
    isBlobStorageConfigured,
}) => {
    let { path } = useRouteMatch()
    const { appId, pipelineId, triggerId, envId } = useParams<{
        appId: string
        pipelineId: string
        triggerId: string
        envId: string
    }>()

    const [ref, scrollToTop, scrollToBottom] = useScrollable({
        autoBottomScroll: triggerDetails.status.toLowerCase() !== 'succeeded',
    })

    return (
        <>
            <div className="trigger-outputs-container">
                {loading ? (
                    <Progressing pageLoader />
                ) : (
                    <Switch>
                        {triggerDetails.stage !== 'DEPLOY' ? (
                            <Route path={`${path}/logs`}>
                                <div ref={ref} style={{ height: '100%', overflow: 'auto', background: '#0b0f22' }}>
                                    <LogsRenderer
                                        triggerDetails={triggerDetails}
                                        isBlobStorageConfigured={isBlobStorageConfigured}
                                        parentType={HistoryComponentType.CD}
                                    />
                                </div>
                            </Route>
                        ) : (
                            <Route path={`${path}/deployment-steps`}>
                                <DeploymentDetailSteps
                                    deploymentStatus={triggerDetails.status}
                                    deploymentAppType={deploymentAppType}
                                />
                            </Route>
                        )}
                        <Route path={`${path}/source-code`}>
                            <GitChanges
                                gitTriggers={triggerDetails.gitTriggers}
                                ciMaterials={triggerDetails.ciMaterials}
                            />
                        </Route>
                        {triggerDetails.stage === 'DEPLOY' && (
                            <Route path={`${path}/configuration`} exact>
                                <DeploymentHistoryConfigList
                                    setDeploymentHistoryList={setDeploymentHistoryList}
                                    deploymentHistoryList={deploymentHistoryList}
                                    setFullScreenView={setFullScreenView}
                                />
                            </Route>
                        )}
                        {triggerDetails.stage === 'DEPLOY' && (
                            <Route
                                path={`${path}${URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS}/:historyComponent/:baseConfigurationId(\\d+)/:historyComponentName?`}
                            >
                                <DeploymentHistoryDetailedView
                                    setDeploymentHistoryList={setDeploymentHistoryList}
                                    deploymentHistoryList={deploymentHistoryList}
                                    setFullScreenView={setFullScreenView}
                                />
                            </Route>
                        )}
                        {triggerDetails.stage !== 'DEPLOY' && (
                            <Route path={`${path}/artifacts`}>
                                <Artifacts
                                    status={triggerDetails.status}
                                    artifact={triggerDetails.artifact}
                                    blobStorageEnabled={triggerDetails.blobStorageEnabled}
                                    getArtifactPromise={() => getCDBuildReport(appId, envId, pipelineId, triggerId)}
                                />
                            </Route>
                        )}
                        <Redirect
                            to={`${path}/${
                                triggerDetails.stage === 'DEPLOY'
                                    ? `deployment-steps`
                                    : triggerDetails.status.toLowerCase() === 'succeeded'
                                    ? `artifacts`
                                    : `logs`
                            }`}
                        />
                    </Switch>
                )}
            </div>
            {(scrollToTop || scrollToBottom) && (
                <Scroller
                    style={{ position: 'fixed', bottom: '25px', right: '32px' }}
                    {...{ scrollToTop, scrollToBottom }}
                />
            )}
        </>
    )
}
