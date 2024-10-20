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

// As of now contains util to delete, append, check refetchData query param.
// These will be changed to more generic way later.

export const checkIfToRefetchData = (location): boolean => {
    const queryParams = new URLSearchParams(location.search)
    if (queryParams.has('refetchData')) {
        return true
    }
    return false
}

export const deleteRefetchDataFromUrl = (history, location): void => {
    if (checkIfToRefetchData(location)) {
        const queryParams = new URLSearchParams(location.search)
        queryParams.delete('refetchData')
        history.replace({
            search: queryParams.toString(),
        })
    }
}

export const appendRefetchDataToUrl = (history, location): void => {
    const queryParams = new URLSearchParams(location.search)
    queryParams.append('refetchData', 'true')
    history.replace({
        search: queryParams.toString(),
    })
}
