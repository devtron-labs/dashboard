import React, { useEffect, useState } from 'react'
import { generatePath, Route, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../../../config'
import { APP_GROUP_CI_DETAILS } from '../../../../config/constantMessaging'
import { EmptyView, LogResizeButton } from '../../../app/details/cicdHistory/History.components'
import Sidebar from '../../../app/details/cicdHistory/Sidebar'
import { HistoryComponentType, History, CICDSidebarFilterOptionType } from '../../../app/details/cicdHistory/types'
import { Details } from '../../../app/details/cIDetails/CIDetails'
import { CiPipeline } from '../../../app/details/triggerView/types'
import { getTriggerHistory } from '../../../app/service'
import { asyncWrap, mapByKey, Progressing, showError, sortCallback, useAsync, useInterval } from '../../../common'
import { getCIConfigList } from '../../AppGroup.service'
import { AppGroupDetailDefaultType, CIConfigListType } from '../../AppGroup.types'

export default function EnvCIDetails({ filteredApps }: AppGroupDetailDefaultType) {
    const { envId, pipelineId, buildId } = useParams<{
        pipelineId: string
        buildId: string
        envId: string
    }>()
    const [pagination, setPagination] = useState<{ offset: number; size: number }>({ offset: 0, size: 20 })
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [triggerHistory, setTriggerHistory] = useState<Map<number, History>>(new Map())
    const [fullScreenView, setFullScreenView] = useState<boolean>(false)
    const [hasMoreLoading, setHasMoreLoading] = useState<boolean>(false)
    const [initDataResults, setInitResult] = useState<CIConfigListType>()
    const [pipelineList, setPipelineList] = useState<CiPipeline[]>([])
    const [ciGroupLoading, setCiGroupLoading] = useState(false)

    useEffect(() => {
        try {
            setCiGroupLoading(true)
            getCIConfigList(envId).then((result) => {
                setInitResult(result)
                setCiGroupLoading(false)
            })
        } catch (error) {
            setInitResult(null)
            showError(error)
            setHasMoreLoading(false)
        }
        return () => {
            setInitResult(null)
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
        }
    }, [envId])

    useEffect(() => {
        if (filteredApps.length && initDataResults?.pipelineList.length) {
            const _filteredAppMap = new Map<number, string>()
            filteredApps.forEach((app) => {
                _filteredAppMap.set(+app.value, app.label)
            })
            const _filteredPipelines = []
            let nonWebhookCIExist = false
            let selectedPipelineExist = false
            initDataResults?.pipelineList.forEach((pipeline) => {
                if (_filteredAppMap.get(+pipeline.appId)) {
                    _filteredPipelines.push(pipeline)
                    nonWebhookCIExist = true
                    selectedPipelineExist = selectedPipelineExist || pipeline.id === +pipelineId
                }
            })
            _filteredPipelines.sort((a, b) => sortCallback('appName', a, b))
            if (nonWebhookCIExist) {
                if (!selectedPipelineExist) {
                    replace(generatePath(path, { envId, pipelineId: _filteredPipelines[0].id }))
                }
            } else {
                replace(generatePath(path, { envId }))
                setTriggerHistory(new Map())
                setHasMoreLoading(false)
            }
            setPipelineList(_filteredPipelines)
        }
    }, [filteredApps, initDataResults?.pipelineList])

    const [loading, triggerHistoryResult, , , , dependencyState] = useAsync(
        () => getTriggerHistory(pipelineId, pagination),
        [pipelineId, pagination],
        !!pipelineId,
    )
    const { path } = useRouteMatch()
    const { replace } = useHistory()
    useInterval(pollHistory, 30000)

    useEffect(() => {
        if (!triggerHistoryResult) {
            return
        }
        if (triggerHistoryResult.result?.length !== pagination.size) {
            setHasMore(false)
        } else {
            setHasMore(true)
            setHasMoreLoading(true)
        }
        const newTriggerHistory = (triggerHistoryResult.result || []).reduce((agg, curr) => {
            agg.set(curr.id, curr)
            return agg
        }, triggerHistory)
        setTriggerHistory(new Map(newTriggerHistory))
    }, [triggerHistoryResult])

    useEffect(() => {
        return () => {
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
        }
    }, [pipelineId])

    function synchroniseState(triggerId: number, triggerDetails: History) {
        if (triggerId === triggerDetails.id) {
            setTriggerHistory((triggerHistory) => {
                triggerHistory.set(triggerId, triggerDetails)
                return new Map(triggerHistory)
            })
        }
    }

    async function pollHistory() {
        if (!pipelineId) return
        const [error, result] = await asyncWrap(
            getTriggerHistory(pipelineId, { offset: 0, size: pagination.offset + pagination.size }),
        )
        if (error) {
            showError(error)
            return
        }
        setTriggerHistory(mapByKey(result?.result || [], 'id'))
    }

    if ((!hasMoreLoading && loading) || ciGroupLoading || (pipelineId && dependencyState[0] !== pipelineId)) {
        return <Progressing pageLoader />
    } else if (!buildId && pipelineId && triggerHistory.size > 0) {
        replace(generatePath(path, { buildId: triggerHistory.entries().next().value[0], envId, pipelineId }))
    }
    const pipelineOptions: CICDSidebarFilterOptionType[] = (pipelineList || []).map((item) => {
        return { value: `${item.id}`, label: item.appName, pipelineId: item.id }
    })
    const pipelinesMap = mapByKey(pipelineList, 'id')
    const pipeline = pipelinesMap.get(+pipelineId)

    const renderPipelineDetails = (): JSX.Element | null => {
        if (triggerHistory.size > 0) {
            return (
                <Route
                    path={`${path
                        .replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')
                        .replace(':buildId(\\d+)?', ':buildId(\\d+)')}`}
                >
                    <Details
                        fullScreenView={fullScreenView}
                        synchroniseState={synchroniseState}
                        triggerHistory={triggerHistory}
                        isSecurityModuleInstalled={initDataResults.securityModuleInstalled || false}
                        isBlobStorageConfigured={initDataResults?.blobStorageConfigured || false}
                    />
                </Route>
            )
        } else if (pipeline.parentCiPipeline || pipeline.pipelineType === 'LINKED') {
            return (
                <EmptyView
                    title={APP_GROUP_CI_DETAILS.linkedCI.title}
                    subTitle={APP_GROUP_CI_DETAILS.linkedCI.title}
                    link={`${URLS.APP}/${pipeline.parentAppId}/${URLS.APP_CI_DETAILS}/${pipeline.parentCiPipeline}/logs`}
                    linkText={APP_GROUP_CI_DETAILS.linkedCI.linkText}
                />
            )
        } else {
            if (!loading) {
                return (
                    <EmptyView
                        title={APP_GROUP_CI_DETAILS.noBuild.title}
                        subTitle={APP_GROUP_CI_DETAILS.noBuild.subTitle}
                    />
                )
            }
        }
        return null
    }

    return (
        <>
            <div className={`ci-details ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
                {!fullScreenView && (
                    <div className="ci-details__history">
                        <Sidebar
                            filterOptions={pipelineOptions}
                            type={HistoryComponentType.GROUP_CI}
                            hasMore={hasMore}
                            triggerHistory={triggerHistory}
                            setPagination={setPagination}
                        />
                    </div>
                )}
                <div className="ci-details__body">
                    {!pipelineId ? (
                        <EmptyView
                            title="No application selected"
                            subTitle="Please select an application to see build history."
                        />
                    ) : (
                        pipeline && renderPipelineDetails()
                    )}
                    <LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />
                </div>
            </div>
        </>
    )
}
