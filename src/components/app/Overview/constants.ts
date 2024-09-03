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

import { AppEnvironment } from '@devtron-labs/devtron-fe-common-lib'
import { DEFAULT_SHIMMER_LOADING_TABLE_ROWS } from '../../../config'

/**
 * Mock data for the shimmer loader
 */
export const loadingEnvironmentList: AppEnvironment[] = Array.from(
    Array(DEFAULT_SHIMMER_LOADING_TABLE_ROWS).keys(),
).map((index) => ({
    environmentId: index,
    environmentName: '',
    appMetrics: false,
    infraMetrics: false,
    prod: false,
    commits: [],
    ciArtifactId: 0,
}))

/**
 * Tabs for the overview of the app(s)
 */
export const OVERVIEW_TABS = {
    ABOUT: 'about',
    ENVIRONMENTS: 'environments',
    JOB_PIPELINES: 'job-pipelines',
    DEPENDENCIES: 'dependencies',
} as const

export const TAB_SEARCH_KEY = 'tab'

export const MODAL_STATE = {
    /**
     * Search param key for the modal
     */
    key: 'modal',
    /**
     * Value when the modal is open
     */
    value: 'open',
} as const

export enum EnvironmentListSortableKeys {
    environmentName = 'environment',
    deployedAt = 'deployedAt',
}
