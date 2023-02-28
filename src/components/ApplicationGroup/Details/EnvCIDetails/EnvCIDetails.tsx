import React, { useEffect, useState } from 'react'
import { generatePath, Route, useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../../../config'
import { EmptyView, LogResizeButton } from '../../../app/details/cicdHistory/History.components'
import Sidebar from '../../../app/details/cicdHistory/Sidebar'
import { HistoryComponentType, History, CICDSidebarFilterOptionType } from '../../../app/details/cicdHistory/types'
import { Details } from '../../../app/details/cIDetails/CIDetails'
import { getTriggerHistory } from '../../../app/service'
import { asyncWrap, mapByKey, Progressing, showError, useAsync, useInterval } from '../../../common'
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type'
import { getCIConfigList } from '../../AppGroup.service'

export default function EnvCIDetails() {
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
    const [initDataResults, setInitResult] = useState<any[]>()
    const [ciGroupLoading, setCiGroupLoading] = useState(false)

    useEffect(() => {
        try {
            setCiGroupLoading(true)
            getCIConfigList(envId).then((result) => {
                setInitResult(result)
                setCiGroupLoading(false)
                if (result?.[0].length === 1 && !pipelineId) {
                    replace(generatePath(path, { envId, pipelineId: result[0][0].id }))
                }
            })
        } catch (error) {}
        return () => {
            setInitResult([])
            setTriggerHistory(new Map())
            setHasMoreLoading(false)
        }
    }, [envId])

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
    const pipelineOptions: CICDSidebarFilterOptionType[] = (initDataResults?.[0] || []).map((item) => {
        return { value: `${item.id}`, label: item.appName, pipelineId: item.id }
    })
    const pipelinesMap = mapByKey(initDataResults?.[0], 'id')
    const pipeline = pipelinesMap.get(+pipelineId)

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
                        pipeline && (
                            <>
                                {triggerHistory.size > 0 ? (
                                    <Route
                                        path={`${path
                                            .replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')
                                            .replace(':buildId(\\d+)?', ':buildId(\\d+)')}`}
                                    >
                                        <Details
                                            fullScreenView={fullScreenView}
                                            synchroniseState={synchroniseState}
                                            triggerHistory={triggerHistory}
                                            isSecurityModuleInstalled={
                                                initDataResults[1]?.['value']?.['result']?.status ===
                                                    ModuleStatus.INSTALLED || false
                                            }
                                            isBlobStorageConfigured={
                                                initDataResults?.[2]?.['value']?.['result']?.enabled || false
                                            }
                                        />
                                    </Route>
                                ) : pipeline.parentCiPipeline || pipeline.pipelineType === 'LINKED' ? (
                                    <EmptyView
                                        title="This is a Linked CI Pipeline"
                                        subTitle="This is a Linked CI Pipeline"
                                        link={`${URLS.APP}/${pipeline.parentAppId}/${URLS.APP_CI_DETAILS}/${pipeline.parentCiPipeline}/logs`}
                                        linkText="View Source Pipeline"
                                    />
                                ) : (
                                    !loading && (
                                        <EmptyView
                                            title="Build pipeline not triggered"
                                            subTitle="Pipeline trigger history, details and logs will be available here."
                                        />
                                    )
                                )}
                            </>
                        )
                    )}
                    <LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />
                </div>
            </div>
        </>
    )
}
