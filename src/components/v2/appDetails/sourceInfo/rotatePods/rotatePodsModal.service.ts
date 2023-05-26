import { Routes } from '../../../../../config'
import { get, post } from '@devtron-labs/devtron-fe-common-lib'
import { DeploymentStrategyResponse, RotatePodsRequest, RotatePodsResponse } from './rotatePodsModal.type'

export function RotatePods(request: RotatePodsRequest): Promise<RotatePodsResponse> {
    return post(Routes.ROTATE_PODS, request)
}

export function GetDeploymentStrategy(appId: number, envId: number): Promise<DeploymentStrategyResponse> {
    return get(Routes.DEFAULT_STRATEGY+appId+'/'+envId);
}