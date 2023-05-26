import { Routes } from '../../../../../config'
import { post } from '@devtron-labs/devtron-fe-common-lib'
import { RotatePodsRequest, RotatePodsResponse } from './rotatePodsModal.type'

export function RotatePods(request: RotatePodsRequest): Promise<RotatePodsResponse> {
    return post(Routes.ROTATE_PODS, request)
}
