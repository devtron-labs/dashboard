import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Sidebar } from '../../CIPipelineN/Sidebar'
import { useAsync } from '../../common'
import { getCIConfig } from '../Environment.service'

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

    const appList = initDataResults?.result?.map((list) => {
        return {value: '', label: '', pipelineId: ''}
    })

    console.log(initDataResults);



    return <div className={`ci-details ${fullScreenView ? 'ci-details--full-screen' : ''}`}>
                {!fullScreenView && (
                    <div className="ci-details__history">
                        {/* <Sidebar
                            filterOptions={pipelineOptions}
                            type={HistoryComponentType.CI}
                            hasMore={hasMore}
                            triggerHistory={triggerHistory}
                            setPagination={setPagination}
                        /> */}
                    </div>
                )}
            </div>
    


}