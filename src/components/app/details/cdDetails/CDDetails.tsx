import React, { useRef, useState, useEffect, useMemo } from 'react'
import { getAppOtherEnvironment, getCDConfig as getCDPipelines } from '../../../../services/service'
import { AppEnvironment } from '../../../../services/service.types'
import {
    Progressing,
    Select,
    showError,
    useAsync,
    useInterval,
    useScrollable,
    useKeyDown,
    not,
    mapByKey,
    asyncWrap,
    ConditionalWrap,
    useAppContext,
} from '../../../common'
import { EVENT_STREAM_EVENTS_MAP, Host, LOGS_RETRY_COUNT, ModuleNameMap, POD_STATUS, URLS } from '../../../../config'
import { AppNotConfigured } from '../appDetails/AppDetails'
import { useHistory, useLocation, useRouteMatch, useParams, generatePath } from 'react-router'
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'
import moment from 'moment'
import EmptyImage from '../../../../assets/img/app-not-deployed.png'
import docker from '../../../../assets/icons/misc/docker.svg'
import Reload from '../../../Reload/Reload'
import { default as AnsiUp } from 'ansi_up'
import { getTriggerHistory, getTriggerDetails, getCDBuildReport } from './service'
import EmptyState from '../../../EmptyState/EmptyState'
import { cancelPrePostCdTrigger } from '../../service'
import ReactGA from 'react-ga4'
import { ReactComponent as ZoomIn } from '../../../../assets/icons/ic-fullscreen.svg'
import { ReactComponent as ZoomOut } from '../../../../assets/icons/ic-exit-fullscreen.svg'
import TippyHeadless from '@tippyjs/react/headless'
import AppNotDeployed from '../../../../assets/img/app-not-deployed.png'
import Tippy from '@tippyjs/react'
import { TriggerDetails, GitChanges, Artifacts } from '../cIDetails/CIDetails'
import { History } from '../cIDetails/types'
import { Moment12HourFormat } from '../../../../config'
import DeploymentHistoryConfigList from './deploymentHistoryDiff/DeploymentHistoryConfigList.component'
import './cdDetail.scss'
import DeploymentHistoryDetailedView from './deploymentHistoryDiff/DeploymentHistoryDetailedView'
import { DeploymentTemplateList } from './cd.type'
import DeploymentDetailSteps from './DeploymentDetailSteps'
import { DeploymentAppType } from '../../../v2/appDetails/appDetails.type'
import { renderConfigurationError } from './cd.utils'
import { getModuleConfigured } from '../appDetails/appDetails.service'
import { STAGE_TYPE } from '../triggerView/types'
import Sidebar from '../cicdHistory/Sidebar'
import { OptionType } from '../../types'
import { LogsRenderer, Scroller, LogResizeButton } from '../cicdHistory/History.components'

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
        () => Promise.all([getAppOtherEnvironment(appId), getCDPipelines(appId)]),
        [appId],
    )
    const [
        loadingDeploymentHistory,
        deploymentHistoryResult,
        deploymentHistoryError,
        reloadDeploymentHistory,
        ,
        dependencyState,
    ] = useAsync(
        () => getTriggerHistory(+appId, +envId, pipelineId, pagination),
        [pagination, appId, envId],
        !!envId && !!pipelineId,
    )
    const [, blobStorageConfiguration, ] = useAsync(() => getModuleConfigured(ModuleNameMap.BLOB_STORAGE), [appId])
    const { path } = useRouteMatch()
    const { pathname } = useLocation()
    const { replace } = useHistory()
    const pipelines = result?.length ? result[1]?.pipelines : []
    const deploymentAppType = pipelines?.find(pipeline=> pipeline.id === Number(pipelineId))?.deploymentAppType
    useInterval(pollHistory, 30000)
    const [ref, scrollToTop, scrollToBottom] = useScrollable({ autoBottomScroll: true })
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
    }, [deploymentHistoryResult, loading])

    const environment = result ? result[0].result?.find((envData) => envData.environmentId === +envId) : null

    async function pollHistory() {
        // polling
        if (!envId) return
        if (!pipelineId) return
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

    useEffect(() => {
        return () => {
            setPagination({ offset: 0, size: 20 })
            setTriggerHistory(new Map())
        }
    }, [envId])

    useEffect(() => {
        if (pipelineId || !envId || pipelines?.length === 0) return
        const cdPipelinesMap = mapByKey(pipelines, 'environmentId')
        replace(generatePath(path, { appId, envId, pipelineId: cdPipelinesMap.get(+envId).id }))
    }, [pipelineId, envId, pipelines])

    useEffect(() => {
        if (triggerId) return // no need to manually redirect
        if (!envId) return
        if (!pipelineId) return

        if (loadingDeploymentHistory) return
        if (deploymentHistoryError) {
            showError(deploymentHistoryError)
            return
        }
        if (deploymentHistoryResult?.result?.length) {
            const newUrl = generatePath(path, {
                appId,
                envId,
                pipelineId,
                triggerId: deploymentHistoryResult.result[0].id,
            })
            replace(newUrl)
        }
    }, [deploymentHistoryResult, loadingDeploymentHistory, deploymentHistoryError])

    function syncState(triggerId: number, triggerDetail: History) {
        setTriggerHistory((triggerHistory) => {
            triggerHistory.set(triggerId, triggerDetail)
            return new Map(triggerHistory)
        })
    }

    if (loading || (loadingDeploymentHistory && triggerHistory.size === 0)) return <Progressing pageLoader />
    if (result && !Array.isArray(result[0].result)) return <AppNotConfigured />
    if (result && !Array.isArray(result[1]?.pipelines)) return <AppNotConfigured />
    if (!result || (envId && dependencyState[2] !== envId)) return null
    const envOptions: OptionType[] = (result[0].result || []).map((item) => {
      return { value: `${item.environmentId}`, label: item.environmentName }
  })
    return (
        <>
            <div className={`ci-details  ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
                <div className="ci-details__history">
                    {!fullScreenView && (
                        <Sidebar
                            filterOptions={envOptions}
                            parentType={STAGE_TYPE.CD}
                            hasMore={hasMore}
                            triggerHistory={triggerHistory}
                            setPagination={setPagination}
                        />
                    )}
                </div>
                <div ref={ref} className="ci-details__body">
                    {!envId ? (
                        <>
                            <div />
                            <SelectEnvironmentView />
                        </>
                    ) : triggerHistory?.size > 0 ? (
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
                                isBlobStorageConfigured={blobStorageConfiguration?.result?.enabled || false}
                            />
                        </Route>
                    ) : (
                        <NoCDTriggersView environmentName={environment?.environmentName} />
                    )}
                    {<LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />}
                </div>
            </div>

            {/* {(scrollToTop || scrollToBottom) && (
                <Scroller
                    style={{ position: 'fixed', bottom: '25px', right: '32px' }}
                    {...{ scrollToTop, scrollToBottom }}
                />
            )} */}
        </>
    )
}

function SelectEnvironmentView() {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>No environment selected</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>Please select an environment to start seeing CD deployments.</EmptyState.Subtitle>
        </EmptyState>
    )
}

function NoCDTriggersView({ environmentName }) {
    return (
        <EmptyState>
            <EmptyState.Image>
                <img src={AppNotDeployed} alt="" />
            </EmptyState.Image>
            <EmptyState.Title>
                <h4>No deployments</h4>
            </EmptyState.Title>
            <EmptyState.Subtitle>
                No deployment history available for the {environmentName} environment.
            </EmptyState.Subtitle>
        </EmptyState>
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
    isBlobStorageConfigured
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
        if (!triggerDetails) return null // no interval
        if (
            statusSet.has(triggerDetails.status?.toLowerCase()) ||
            (triggerDetails.podStatus && statusSet.has(triggerDetails.podStatus.toLowerCase()))
        ) {
            // 10s because progressing
            return 10000
        } else if (triggerDetails.podStatus && terminalStatus.has(triggerDetails.podStatus.toLowerCase())) {
            return null
        } else if (terminalStatus.has(triggerDetails.status?.toLowerCase())) {
            return null
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
                            type="CD"
                            triggerDetails={triggerDetails}
                            abort={
                                triggerDetails.stage === 'DEPLOY'
                                    ? null
                                    : () => cancelPrePostCdTrigger(pipelineId, triggerId)
                            }
                        />
                        <ul className="pl-20 tab-list tab-list--nodes dc__border-bottom">
                            {triggerDetails.stage === 'DEPLOY' && deploymentAppType!== DeploymentAppType.helm && (
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
}> = ({ triggerDetails, loading, setFullScreenView, deploymentHistoryList, setDeploymentHistoryList, deploymentAppType, isBlobStorageConfigured }) => {
    let { path } = useRouteMatch()
    const { appId, pipelineId, triggerId, envId } = useParams<{
        appId: string
        pipelineId: string
        triggerId: string
        envId: string
    }>()

    const [ref, scrollToTop, scrollToBottom] = useScrollable({ autoBottomScroll: triggerDetails.status.toLowerCase() !== 'succeeded' })

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
                                        parentType={STAGE_TYPE.CD}
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
                        <Route
                            path={`${path}/source-code`}
                            render={(props) => <GitChanges triggerDetails={triggerDetails} />}
                        />
                        {triggerDetails.stage === 'DEPLOY' && (
                            <Route
                                path={`${path}/configuration`}
                                render={(props) => (
                                    <DeploymentHistoryConfigList
                                        setDeploymentHistoryList={setDeploymentHistoryList}
                                        deploymentHistoryList={deploymentHistoryList}
                                        setFullScreenView={setFullScreenView}
                                    />
                                )}
                                exact
                            />
                        )}
                        {triggerDetails.stage === 'DEPLOY' && (
                            <Route
                                path={`${path}${URLS.DEPLOYMENT_HISTORY_CONFIGURATIONS}/:historyComponent/:baseConfigurationId(\\d+)/:historyComponentName?`}
                                render={(props) => (
                                    <DeploymentHistoryDetailedView
                                        setDeploymentHistoryList={setDeploymentHistoryList}
                                        deploymentHistoryList={deploymentHistoryList}
                                        setFullScreenView={setFullScreenView}
                                    />
                                )}
                            />
                        )}
                        {triggerDetails.stage !== 'DEPLOY' && (
                            <Route
                                path={`${path}/artifacts`}
                                render={(props) => (
                                    <Artifacts
                                        getArtifactPromise={() => getCDBuildReport(appId, envId, pipelineId, triggerId)}
                                        triggerDetails={triggerDetails}
                                    />
                                )}
                            />
                        )}
                        <Redirect to={`${path}/${triggerDetails.stage === 'DEPLOY' ? `deployment-steps` : `logs`}`} />
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