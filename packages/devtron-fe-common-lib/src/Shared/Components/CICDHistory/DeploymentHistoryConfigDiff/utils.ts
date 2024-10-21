import moment from 'moment'

import { DATE_TIME_FORMATS, ERROR_STATUS_CODE } from '@Common/Constants'
import { DeploymentStageType } from '@Shared/constants'
import { SelectPickerOptionType } from '@Shared/Components/SelectPicker'

import { History } from '../types'
import { renderPipelineDeploymentOptionDescription, renderPipelineDeploymentStatusIcon } from './helpers'
import { DeploymentHistoryConfigDiffProps } from './types'

export const getPipelineDeployments = (triggerHistory: DeploymentHistoryConfigDiffProps['triggerHistory']) =>
    Array.from(triggerHistory)
        .filter(([, value]) => value.stage === DeploymentStageType.DEPLOY)
        .map(([, value]) => value)

export const getPipelineDeploymentsWfrIds = ({
    pipelineDeployments,
    wfrId,
}: { pipelineDeployments: History[] } & Pick<DeploymentHistoryConfigDiffProps, 'wfrId'>) => {
    const currentDeploymentIndex = pipelineDeployments.findIndex(({ id }) => id === wfrId)
    const previousWfrId = currentDeploymentIndex > -1 ? pipelineDeployments[currentDeploymentIndex + 1]?.id : null

    return {
        currentWfrId: wfrId,
        previousWfrId,
    }
}

export const getPipelineDeploymentsOptions = ({
    pipelineDeployments,
    wfrId,
    renderRunSource,
    resourceId,
    runSource,
}: Required<Pick<DeploymentHistoryConfigDiffProps, 'renderRunSource' | 'runSource' | 'resourceId'>> & {
    pipelineDeployments: History[]
    wfrId: number
}) => {
    const currentDeploymentIndex = pipelineDeployments.findIndex(({ id }) => id === wfrId)
    const previousDeployments = pipelineDeployments.slice(currentDeploymentIndex + 1)

    const pipelineDeploymentsOptions: SelectPickerOptionType<number>[] = previousDeployments.map(
        ({ id, startedOn, stage, triggeredBy, triggeredByEmail, status, artifact }) => ({
            value: id,
            label: moment(startedOn).format(DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT),
            description: renderPipelineDeploymentOptionDescription({
                stage,
                triggeredByEmail,
                triggeredBy,
                artifact,
                renderRunSource,
                resourceId,
                runSource,
            }),
            startIcon: renderPipelineDeploymentStatusIcon(status),
        }),
    )
    const currentDeployment = moment(pipelineDeployments[currentDeploymentIndex].startedOn).format(
        DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT,
    )

    return { currentDeployment, pipelineDeploymentsOptions }
}

export const parseDeploymentHistoryDiffSearchParams = (compareWfrId: number) => (searchParams: URLSearchParams) => ({
    compareWfrId: +(searchParams.get('compareWfrId') || compareWfrId),
})

export const isDeploymentHistoryConfigDiffNotFoundError = <T extends unknown>(res: PromiseSettledResult<T>) =>
    res.status === 'rejected' && res.reason?.code === ERROR_STATUS_CODE.NOT_FOUND

export const getDeploymentHistoryConfigDiffError = <T extends unknown>(res: PromiseSettledResult<T>) =>
    res.status === 'rejected' && res.reason?.code !== ERROR_STATUS_CODE.NOT_FOUND ? res.reason : null
