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

import { get, post } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { Routes } from '../../config'
import { BulkEditVersion } from './bulkEdits.type'

const postBulkEditScript = importComponentFromFELibrary('postBulkEditScript', null, 'function')
const dryRunBulkEditScript = importComponentFromFELibrary('dryRunBulkEditScript', null, 'function')

export function updateBulkList(request): Promise<any> {
    const { apiVersion } = request ?? {}

    if (postBulkEditScript && apiVersion === BulkEditVersion.v2) {
        return postBulkEditScript(request)
    }

    return post(Routes.BULK_EDIT_V1_BASEPATH, request)
}

export function updateImpactedObjectsList(request): Promise<any> {
    const { apiVersion } = request

    if (dryRunBulkEditScript && apiVersion === BulkEditVersion.v2) {
        return dryRunBulkEditScript(request)
    }

    return post(`${Routes.BULK_EDIT_V1_BASEPATH}/dryrun`, request)
}

export function getSeeExample() {
    return get(`${Routes.BULK_EDIT_V1_BASEPATH}/readme`)
}
