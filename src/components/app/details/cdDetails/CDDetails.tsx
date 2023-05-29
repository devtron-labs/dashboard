import React, { useState, useEffect, useMemo } from 'react'
import {
    showError,
    Progressing,
    Reload,
    UserApprovalMetadataType,
    GenericEmptyState,
} from '@devtron-labs/devtron-fe-common-lib'
import { getAppOtherEnvironmentMin, getCDConfig as getCDPipelines } from '../../../../services/service'
import { useAsync, useInterval, useScrollable, mapByKey, asyncWrap, importComponentFromFELibrary } from '../../../common'
import { ModuleNameMap, URLS } from '../../../../config'
import { AppNotConfigured } from '../appDetails/AppDetails'
import { useHistory, useRouteMatch, useParams, generatePath } from 'react-router'
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'
import { getTriggerHistory, getTriggerDetails, getCDBuildReport } from './service'
import DeploymentHistoryConfigList from './deploymentHistoryDiff/DeploymentHistoryConfigList.component'
import './cdDetail.scss'
import DeploymentHistoryDetailedView from './deploymentHistoryDiff/DeploymentHistoryDetailedView'
import { DeploymentTemplateList } from './cd.type'
import DeploymentDetailSteps from './DeploymentDetailSteps'
import { DeploymentAppType } from '../../../v2/appDetails/appDetails.type'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import Sidebar from '../cicdHistory/Sidebar'
import { Scroller, LogResizeButton, GitChanges } from '../cicdHistory/History.components'
import { TriggerDetails } from '../cicdHistory/TriggerDetails'
import Artifacts from '../cicdHistory/Artifacts'
import { CICDSidebarFilterOptionType, History, HistoryComponentType } from '../cicdHistory/types'
import LogsRenderer from '../cicdHistory/LogsRenderer'
import { AppEnvironment } from '../../../../services/service.types'
import { EMPTY_STATE_STATUS } from '../../../../config/constantMessaging'

const terminalStatus = new Set(['error', 'healthy', 'succeeded', 'cancelled', 'failed', 'aborted'])
let statusSet = new Set(['starting', 'running', 'pending'])
const VirtualHistoryArtifact = importComponentFromFELibrary('VirtualHistoryArtifact')

export default function CDDetails() {
    const { appId, envId, triggerId, pipelineId } = useParams<{
        appId: string
        envId: string
        triggerId: string
        pipelineId: string
    }>()
    const [pagination, setPagination] = useState<{ offset: number; size: number }>({ offset: 0, size: 20 })
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [hasMoreLoading, setHasMoreLoading] = useState<boolean>(false)
    const [triggerHistory, setTriggerHistory] = useState<Map<number, History>>(new Map())
    const [fullScreenView, setFullScreenView] = useState<boolean>(false)
    const [loading, result, error] = useAsync(
        () =>
            Promise.allSettled([
                getAppOtherEnvironmentMin(appId),
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
    const [envOptions, setEnvOptions] = useState<CICDSidebarFilterOptionType[]>([])
    const [selectedEnv, setSelectedEnv] = useState<AppEnvironment>(null)
    const [deploymentAppType, setDeploymentAppType] = useState<DeploymentAppType>(null)
    const { path } = useRouteMatch()
    const { replace } = useHistory()
    useInterval(pollHistory, 30000)
    const [deploymentHistoryList, setDeploymentHistoryList] = useState<DeploymentTemplateList[]>()

    useEffect(() => {
        // check for more
        if (loading || !deploymentHistoryResult) return
        if (deploymentHistoryResult.result?.length !== pagination.size) {
            setHasMore(false)
        } else {
            setHasMore(true)
            setHasMoreLoading(true)
        }
        const newTriggerHistory = (deploymentHistoryResult.result || []).reduce((agg, curr) => {
            agg.set(curr.id, curr)
            return agg
        }, triggerHistory)
        if (!triggerId && envId && pipelineId && deploymentHistoryResult.result?.length) {
            replace(
                generatePath(path, {
                    appId,
                    envId,
                    pipelineId,
                    triggerId: deploymentHistoryResult.result[0].id,
                }),
            )
        }
        setTriggerHistory(new Map(newTriggerHistory))
    }, [deploymentHistoryResult, loading])

    useEffect(() => {
        if (result && result[1]) {
            setDeploymentAppType(
                result[1]['value']?.pipelines?.find((pipeline) => pipeline.id === Number(pipelineId))
                    ?.deploymentAppType,
            )
        }

        return () => {
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
        }
    }, [envId])

    useEffect(() => {
        if (result) {
            const pipelines = result[1]['value']?.pipelines
            const _deploymentAppType = pipelines?.find(
                (pipeline) => pipeline.id === Number(pipelineId),
            )?.deploymentAppType
            const cdPipelinesMap = mapByKey(pipelines, 'environmentId')
            let _selectedEnvironment,
                isEnvDeleted = false
            const envOptions: CICDSidebarFilterOptionType[] = (result[0]['value']?.result || []).map((envData) => {
                if (envData.environmentId === +envId) {
                    _selectedEnvironment = envData
                }
                if (envData.deploymentAppDeleteRequest) {
                    isEnvDeleted = true
                }
                return {
                    value: `${envData.environmentId}`,
                    label: envData.environmentName,
                    pipelineId: cdPipelinesMap.get(envData.environmentId).id,
                    deploymentAppDeleteRequest: envData.deploymentAppDeleteRequest,
                }
            })

            if (envOptions.length === 1 && !envId && !isEnvDeleted) {
                replace(generatePath(path, { appId, envId: envOptions[0].value, pipelineId: envOptions[0].pipelineId }))
            }
            setEnvOptions(envOptions)
            setSelectedEnv(_selectedEnvironment)
            setDeploymentAppType(_deploymentAppType)
        }
    }, [result])

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

    if ((!hasMoreLoading && loading) || (loadingDeploymentHistory && triggerHistory.size === 0)) {
        return <Progressing pageLoader />
    } else if (
        result &&
        (!Array.isArray(result[0]?.['value']?.result) || !Array.isArray(result[1]?.['value']?.pipelines))
    ) {
        return <AppNotConfigured />
    } else if (!result || (envId && dependencyState[2] !== envId)) {
        return null
    }
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
                        <GenericEmptyState
                            title={EMPTY_STATE_STATUS.CD_DETAILS_NO_ENVIRONMENT.TITLE}
                            subTitle={EMPTY_STATE_STATUS.CD_DETAILS_NO_ENVIRONMENT.SUBTITLE}
                        />
                    ) : (
                        <GenericEmptyState
                            title={EMPTY_STATE_STATUS.CD_DETAILS_NO_DEPLOYMENT.TITLE}
                            subTitle={`${EMPTY_STATE_STATUS.CD_DETAILS_NO_DEPLOYMENT.SUBTITLE} ${selectedEnv?.environmentName} environment.`}
                        />
                    )}
                    {<LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />}
                </div>
            </div>
        </>
    )
}

export const TriggerOutput: React.FC<{
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
                            artifact={triggerDetails.artifact}
                        />
                        <ul className="pl-20 tab-list tab-list--nodes dc__border-bottom">
                            {triggerDetails.stage === 'DEPLOY' && deploymentAppType !== DeploymentAppType.helm && (
                                <li className="tab-list__tab" data-testid="deployment-history-steps-link">
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
                                <li className="tab-list__tab" data-testid="deployment-history-logs-link">
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
                            <li className="tab-list__tab" data-testid="deployment-history-source-code-link">
                                <NavLink
                                    replace
                                    className="tab-list__tab-link"
                                    activeClassName="active"
                                    to={`source-code`}
                                >
                                    Source
                                </NavLink>
                            </li>
                            {triggerDetails.stage == 'DEPLOY' && (
                                <li className="tab-list__tab" data-testid="deployment-history-configuration-link">
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
                            {(triggerDetails.stage !== 'DEPLOY' || triggerDetails.IsVirtualEnvironment) && (
                                <li className="tab-list__tab" data-testid="deployment-history-artifacts-link">
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
                userApprovalMetadata={triggerDetailsResult?.result?.userApprovalMetadata}
                triggeredByEmail={triggerDetailsResult?.result?.triggeredByEmail}
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
    userApprovalMetadata: UserApprovalMetadataType
    triggeredByEmail: string
}> = ({
    triggerDetails,
    loading,
    setFullScreenView,
    deploymentHistoryList,
    setDeploymentHistoryList,
    deploymentAppType,
    isBlobStorageConfigured,
    userApprovalMetadata,
    triggeredByEmail,
}) => {
    let { path } = useRouteMatch()
    const { appId, pipelineId, triggerId, envId } = useParams<{
        appId: string
        pipelineId: string
        triggerId: string
        envId: string
    }>()

    const paramsData = {
        appId,
        envId,
        appName: triggerDetails.artifact,
        workflowId: triggerDetails.cdWorkflowId,
    }

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
                                    userApprovalMetadata={userApprovalMetadata}
                                    isGitops={
                                        deploymentAppType === DeploymentAppType.argo_cd ||
                                        deploymentAppType === DeploymentAppType.manifest_download
                                    }
                                    isHelmApps={false}
                                    isVirtualEnvironment={triggerDetails.IsVirtualEnvironment}
                                />
                            </Route>
                        )}
                        <Route path={`${path}/source-code`}>
                            <GitChanges
                                gitTriggers={triggerDetails.gitTriggers}
                                ciMaterials={triggerDetails.ciMaterials}
                                artifact={triggerDetails.artifact}
                                userApprovalMetadata={userApprovalMetadata}
                                triggeredByEmail={triggeredByEmail}
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
                        {(triggerDetails.stage !== 'DEPLOY' ||
                            triggerDetails.IsVirtualEnvironment) && (
                                <Route path={`${path}/artifacts`}>
                                    {triggerDetails.IsVirtualEnvironment && VirtualHistoryArtifact ? (
                                        <VirtualHistoryArtifact
                                            status={triggerDetails.status}
                                            titleName={triggerDetails.artifact}
                                            params={paramsData}
                                        />
                                    ) : (
                                        <Artifacts
                                            status={triggerDetails.status}
                                            artifact={triggerDetails.artifact}
                                            blobStorageEnabled={triggerDetails.blobStorageEnabled}
                                            getArtifactPromise={() =>
                                                getCDBuildReport(appId, envId, pipelineId, triggerId)
                                            }
                                            type={HistoryComponentType.CD}
                                        />
                                    )}
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
