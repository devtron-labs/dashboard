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

export async function fetchWithFullRoute(
    fullRoute: string,
    type: string,
    data?: object,
    signal?: AbortSignal,
): Promise<any> {
    const options = {
        method: type,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': 'true',
        },
        signal,
        body: data ? JSON.stringify(data) : undefined,
    }
    options['credentials'] = 'include' as RequestCredentials
    return fetch(fullRoute, options).then((response) => {
        return response.json()
    })
}
