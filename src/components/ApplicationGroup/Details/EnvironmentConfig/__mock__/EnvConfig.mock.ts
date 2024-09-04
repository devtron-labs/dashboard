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

import { ConfigAppListType } from '../../../AppGroup.types'

export const filteredData = [
    {
        value: '19',
        label: 'testing-app',
    },
    {
        value: '23',
        label: 'testing-4',
    },
    {
        value: '1',
        label: 'ajay-app',
    },
    {
        value: '81',
        label: 'docker-hub-test',
    },
    {
        value: '101',
        label: 'aravind-child',
    },
    {
        value: '374',
        label: 'prakash-1mar',
    },
]

const result = () => [
    {
        id: 19,
        name: 'testing-app',
    },
    {
        id: 23,
        name: 'testing-4',
    },
    {
        id: 1,
        name: 'ajay-app',
    },
    {
        id: 81,
        name: 'docker-hub-test',
    },
    {
        id: 101,
        name: 'aravind-child',
    },
    {
        id: 374,
        name: 'prakash-1mar',
    },
]

export async function mockConfigAppList(): Promise<ConfigAppListType> {
    const response = {
        code: 200,
        status: 'OK',
        result: result(),
    }
    const mockJsonPromise = response
    return mockJsonPromise
}
