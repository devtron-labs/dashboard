/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AppType, post } from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '../../../../../config'
import { getK8sResourcePayloadAppType } from '../../k8Resource/nodeDetail/nodeDetail.util'
import { HibernateRequest, HibernateResponse } from './scaleWorkloadsModal.type'

export function hibernateApp(request: HibernateRequest, appType: AppType): Promise<HibernateResponse> {
    const url = `${Routes.HELM_APP_HIBERNATE_API}?appType=${getK8sResourcePayloadAppType(appType)}`
    return post(url, request)
}

export function unhibernateApp(request: HibernateRequest, appType: AppType): Promise<HibernateResponse> {
    const url = `${Routes.HELM_APP_UNHIBERNATE_API}?appType=${getK8sResourcePayloadAppType(appType)}`
    return post(url, request)
}
