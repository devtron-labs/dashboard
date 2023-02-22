import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ModuleNameMap } from '../../../config'
import { getAppOtherEnvironment } from '../../../services/service'
import { getModuleConfigured } from '../../app/details/appDetails/appDetails.service'
import { getTriggerHistory } from '../../app/details/cdDetails/service'
import { useAsync } from '../../common'
import { getCDConfig, getWorkflows } from '../Environment.service'

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

    const getWorkflowsData = async (): Promise<void> => {
        try {
            const { workflows } = await getWorkflows(envId)
            
        } catch (error) {
        }
    }

    getWorkflowsData()

    const [loading, result, error] = useAsync(
        () =>
            Promise.allSettled([
                getWorkflows(envId),
                getCDConfig(appId),
                getModuleConfigured(ModuleNameMap.BLOB_STORAGE),
            ]),
        [envId],
    )

    const [loadingDeploymentHistory, deploymentHistoryResult, deploymentHistoryError, , , dependencyState] = useAsync(
        () => getTriggerHistory(+appId, +envId, pipelineId, pagination),
        [pagination, appId, envId],
        !!envId && !!pipelineId,
    )

    console.log(result?.[0]);
    

    return <div>
        hallo
    </div>
}