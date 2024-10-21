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

export const clusterId = '1'
export const mockSuccessResponseWithOutNote = {
    code: 200,
    status: 'Ok',
    result: {
        clusterName: 'default_cluster_with_out_note',
        clusterId,
        clusterCreatedOn: new Date().toISOString(),
        clusterCreatedBy: 'System',
    },
}
export const mockSuccessResponseWithNote = {
    code: 200,
    status: 'Ok',
    result: {
        clusterName: 'default_cluster_with_note',
        clusterId,
        clusterCreatedOn: new Date().toISOString(),
        clusterCreatedBy: 'System',
        clusterNote: {
            id: 1,
            description: 'This is a test note',
            updatedBy: 'Admin',
            updatedOn: new Date().toISOString(),
        },
    },
}
export const mockFailedResponse = {
    code: 404,
    status: 'Not Found',
    errors: [
        { code: '000', internalMessage: '[{pg: no rows in result set}]', userMessage: 'pg: no rows in result set' },
    ],
}

export const mockMarkDownEditorComponent: JSX.Element = (
    <div data-testid="mark-down-test-response">Mark Down Test Response</div>
)
