import React, { useEffect, useState } from 'react'
import { Route, useParams, useRouteMatch } from 'react-router-dom'
import Sidebar from '../../../app/details/cicdHistory/Sidebar'
import { HistoryComponentType, History } from '../../../app/details/cicdHistory/types'
import { Details } from '../../../app/details/cIDetails/CIDetails'
import { getTriggerHistory } from '../../../app/service'
import { useAsync } from '../../../common'
import { ModuleStatus } from '../../../v2/devtronStackManager/DevtronStackManager.type'
import { getCIConfig } from '../../AppGroup.service'

export default function EnvCIDetails() {
    const { appId, envId, pipelineId, buildId } = useParams<{
        appId: string
        pipelineId: string
        buildId: string
        envId: string
    }>()

    const [pagination, setPagination] = useState<{ offset: number; size: number }>({ offset: 0, size: 20 })
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [triggerHistory, setTriggerHistory] = useState<Map<number, History>>(new Map())
    const [fullScreenView, setFullScreenView] = useState<boolean>(false)
    const [hasMoreLoading, setHasMoreLoading] = useState<boolean>(false)
    const [initDataLoading, initDataResults] = useAsync(() => getCIConfig(envId),[envId])
    const { path } = useRouteMatch()
    const [loading, triggerHistoryResult, , , , dependencyState] = useAsync(
        () => getTriggerHistory(+pipelineId, pagination),
        [pipelineId, pagination],
        !!pipelineId,
    )

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

    const appList = initDataResults?.result?.map((item) => {
        return {value: `${item.appId}`, label: item.appName, pipelineId: item.id}
    })

    return <div className={`ci-details ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
                {!fullScreenView && (
                    <><div className="ci-details__history">
                        <Sidebar
                            filterOptions={appList}
                            type={HistoryComponentType.GROUP_CI}
                            hasMore={hasMore}
                            triggerHistory={triggerHistory}
                            setPagination={setPagination}
                        />
                    </div>
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
                                                false
                                            }
                                            isBlobStorageConfigured={
                                                false
                                            }
                                        />
                                    </Route>
                    </>
                    
                )}
            </div>
    


}