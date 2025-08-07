import { useRef } from 'react'

import { DEFAULT_ENV, getEnvironmentListMinPublic, useQuery, useQueryClient } from '@devtron-labs/devtron-fe-common-lib'

import { getWorkflowStatus } from '@Components/app/service'
import { processWorkflowStatuses } from '@Components/ApplicationGroup/AppGroup.utils'
import { sortObjectArrayAlphabetically } from '@Components/common'
import { getHostURLConfiguration } from '@Services/service'

import { UseTriggerViewServicesParams } from './types'
import { getTriggerWorkflows } from './workflow.service'

const DEFAULT_POLLING_INTERVAL = 30000
const PROGRESSING_POLLING_INTERVAL = 10000

export const useTriggerViewServices = ({ appId, isJobView, filteredEnvIds }: UseTriggerViewServicesParams) => {
    const queryClient = useQueryClient()
    const refetchIntervalRef = useRef<number>(DEFAULT_POLLING_INTERVAL)

    const { data: hostUrlConfig } = useQuery({
        queryKey: ['hostUrlConfig'],
        queryFn: () => getHostURLConfiguration(),
        select: (response) => response.result,
    })

    const { isFetching: isEnvListLoading, data: environmentList } = useQuery({
        queryKey: ['triggerViewEnvList'],
        queryFn: ({ signal }) => getEnvironmentListMinPublic(false, { signal }),
        select: (response) => {
            const list = []
            list.push({
                id: 0,
                clusterName: '',
                name: DEFAULT_ENV,
                active: false,
                isClusterActive: false,
                description: 'System default',
            })
            response.result?.forEach((env) => {
                if (env.cluster_name !== 'default_cluster' && env.isClusterCdActive) {
                    list.push({
                        id: env.id,
                        clusterName: env.cluster_name,
                        name: env.environment_name,
                        active: false,
                        isClusterActive: env.isClusterActive,
                        description: env.description,
                    })
                }
            })
            sortObjectArrayAlphabetically(list, 'name')
            return list
        },
    })

    const {
        isFetching: isWorkflowsLoading,
        data: wfData,
        error: workflowsError,
    } = useQuery({
        queryKey: [appId, isJobView, filteredEnvIds, 'triggerViewWorkflowList'],
        queryFn: async () => {
            const result = await getTriggerWorkflows(appId, !isJobView, isJobView, filteredEnvIds)
            return {
                code: 200,
                status: 'OK',
                result,
            }
        },
        select: (response) => ({
            appName: response.result?.appName || '',
            workflows: response.result?.workflows || [],
            filteredCIPipelines: response.result?.filteredCIPipelines || [],
        }),
    })

    const { workflows, filteredCIPipelines } = wfData ?? { workflows: [], filteredCIPipelines: [] }

    const { data: updatedWfWithStatus } = useQuery({
        queryKey: [appId, 'triggerViewWorkflowStatus'],
        queryFn: ({ signal }) => getWorkflowStatus(+appId, { signal }),
        select: (response) => {
            const processedWorkflowsData = processWorkflowStatuses(
                response.result?.ciWorkflowStatus ?? [],
                response.result?.cdWorkflowStatus ?? [],
                workflows,
            )
            refetchIntervalRef.current = processedWorkflowsData.cicdInProgress
                ? PROGRESSING_POLLING_INTERVAL
                : DEFAULT_POLLING_INTERVAL

            return processedWorkflowsData.workflows || []
        },
        refetchInterval: refetchIntervalRef.current,
        enabled: !!appId && !!workflows.length,
    })

    const isLoading = isEnvListLoading || isWorkflowsLoading

    const reloadWorkflowStatus = async () => {
        await queryClient.invalidateQueries({ queryKey: [appId, 'triggerViewWorkflowStatus'] })
    }

    const reloadWorkflows = async () => {
        await queryClient.invalidateQueries({ queryKey: [appId, isJobView, filteredEnvIds, 'triggerViewWorkflowList'] })
        // Invalidate status query to refetch workflow status
        await reloadWorkflowStatus()
    }

    return {
        isLoading,
        hostUrlConfig,
        environmentList,
        workflows: updatedWfWithStatus ?? workflows,
        filteredCIPipelines,
        workflowsError,
        reloadWorkflows,
        reloadWorkflowStatus,
    }
}
