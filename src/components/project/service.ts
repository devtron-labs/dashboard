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

import { get, post, stringComparatorBySortOrder, trash } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config'

export function createProject(project) {
    const URL = `${Routes.PROJECT}`
    const request = {
        name: project.name,
        active: project.active,
    }
    return post(URL, request)
}

export function getProjectList() {
    const URL = `${Routes.PROJECT_LIST}`
    return get(URL).then((response) => ({
        code: response.code,
        result: response.result
            ? response.result
                  .map((project) => ({
                      ...project,
                      isCollapsed: true,
                  }))
                  .sort((a, b) => stringComparatorBySortOrder(a.name, b.name))
            : [],
    }))
}

export function deleteProject(request) {
    return trash(Routes.PROJECT, request)
}
