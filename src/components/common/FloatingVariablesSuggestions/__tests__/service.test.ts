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

import { get } from '@devtron-labs/devtron-fe-common-lib'
import { getScopedVariables } from '../service'
import { Routes } from '../../../../config'

jest.mock('@devtron-labs/devtron-fe-common-lib', () => ({
    get: jest.fn(),
}))

describe('getScopedVariables', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call get with correct params if only appId is sent', async () => {
        ;(get as jest.Mock).mockResolvedValueOnce({})
        const appId = 'appId'
        const query = `?appId=${appId}&scope={"appId":${appId}}`
        await getScopedVariables(appId, null, null)
        expect(get).toHaveBeenCalledWith(`${Routes.SCOPED_GLOBAL_VARIABLES}${query}`)
    })

    it('should call get with correct params if all the entries are sent', async () => {
        ;(get as jest.Mock).mockResolvedValueOnce({})
        const appId = 'appId'
        const envId = 'envId'
        const clusterId = 'clusterId'
        const query = `?appId=${appId}&scope={"appId":${appId},"envId":${envId},"clusterId":${clusterId}}`
        await getScopedVariables(appId, envId, clusterId)
        expect(get).toHaveBeenCalledWith(`${Routes.SCOPED_GLOBAL_VARIABLES}${query}`)
    })
})
