import React, { useState, useEffect, useMemo } from 'react'
import { Progressing, showError, useAsync, useInterval, useScrollable, mapByKey, asyncWrap } from '../../../common'
import { ModuleNameMap } from '../../../../config'
import { useHistory, useRouteMatch, useParams, generatePath } from 'react-router'
import '../../../app/details/cdDetails/cdDetail.scss'
import { TriggerOutput } from '../../../app/details/cdDetails/CDDetails'
import { getModuleConfigured } from '../../../app/details/appDetails/appDetails.service'
import { getCDConfig } from '../../AppGroup.service'
import Sidebar from '../../../app/details/cicdHistory/Sidebar'
import { EmptyView, LogResizeButton } from '../../../app/details/cicdHistory/History.components'
import { getTriggerHistory } from '../../../app/details/cdDetails/service'
import { CICDSidebarFilterOptionType, History, HistoryComponentType } from '../../../app/details/cicdHistory/types'
import { DeploymentTemplateList } from '../../../app/details/cdDetails/cd.type'
import { AppNotConfigured } from '../../../app/details/appDetails/AppDetails'
import { Route } from 'react-router-dom'

export default function EnvCDDetails() {
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
                getCDConfig(envId),
                getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
            ]),
        [envId],
    )
    const [loadingDeploymentHistory, deploymentHistoryResult, deploymentHistoryError, , , dependencyState] = useAsync(
        () => getTriggerHistory(+appId, +envId, pipelineId, pagination),
        [pagination, appId, envId],
        !!appId && !!pipelineId,
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
            setHasMoreLoading(true)
        }
        const newTriggerHistory = (deploymentHistoryResult?.result || []).reduce((agg, curr) => {
            agg.set(curr.id, curr)
            return agg
        }, triggerHistory)
        setTriggerHistory(new Map(newTriggerHistory))
    }, [deploymentHistoryResult, loading])

    useEffect(() => {
      return () => {
          setTriggerHistory(new Map())
          setHasMoreLoading(false)
      }
  }, [appId])

    async function pollHistory() {
        // polling
        if (!pipelineId || !appId) return
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
        !Array.isArray(result[0]?.['value']?.result?.pipelines)
    ) {
        return <AppNotConfigured />
    } else if (!result || (appId && dependencyState[1] !== appId)) {
        return null
    }

    const pipelines = result[0]['value'].result.pipelines.filter((pipeline) => pipeline.environmentId === +envId)
    const deploymentAppType = pipelines?.find((pipeline) => pipeline.id === Number(pipelineId))?.deploymentAppType

    if (!triggerId && appId && pipelineId && deploymentHistoryResult?.result?.length) {
        replace(
            generatePath(path, {
                appId,
                envId,
                pipelineId,
                triggerId: deploymentHistoryResult.result[0].id,
            }),
        )
    }
    const selectedApp = pipelines.find((envData) => envData.appId === +appId)
    
    const envOptions: CICDSidebarFilterOptionType[] = pipelines.map((item) => {
        return {
            value: `${item.appId}`,
            label: item.appName,
            pipelineId: item.id,
        }
    })

    if(result[0]['value'].result.length === 1 && !appId){
      replace(generatePath(path, { envId, appId: envOptions[0].value, pipelineId: envOptions[0].pipelineId }))
    }
    return (
        <>
            <div className={`ci-details  ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
                {!fullScreenView && (
                    <div className="ci-details__history">
                        <Sidebar
                            filterOptions={envOptions}
                            type={HistoryComponentType.GROUP_CD}
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
                                .replace(':appId(\\d+)?', ':appId(\\d+)')}`}
                        >
                            <TriggerOutput
                                fullScreenView={fullScreenView}
                                syncState={syncState}
                                triggerHistory={triggerHistory}
                                setFullScreenView={setFullScreenView}
                                setDeploymentHistoryList={setDeploymentHistoryList}
                                deploymentHistoryList={deploymentHistoryList}
                                deploymentAppType={deploymentAppType}
                                isBlobStorageConfigured={result[1]?.['value']?.result?.enabled || false}
                            />
                        </Route>
                    ) : !envId ? (
                        <EmptyView
                            title="No application selected"
                            subTitle="Please select an application to see deployment history."
                        />
                    ) : (
                        <EmptyView
                            title="No deployments"
                            subTitle={`No deployment history available for the ${selectedApp?.appName} application.`}
                        />
                    )}
                    {<LogResizeButton fullScreenView={fullScreenView} setFullScreenView={setFullScreenView} />}
                </div>
            </div>
        </>
    )
}