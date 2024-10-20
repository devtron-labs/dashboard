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

export enum ChartPermissionValues {
    allCharts = 'All charts',
    deny = 'Deny',
    specificCharts = 'Specific charts',
}

export const CHART_PERMISSION_OPTIONS: Record<
    ChartPermissionValues,
    {
        label: string
        value: ChartPermissionValues
    }
> = {
    [ChartPermissionValues.allCharts]: { label: 'All Chart Groups', value: ChartPermissionValues.allCharts },
    [ChartPermissionValues.deny]: { label: 'Deny', value: ChartPermissionValues.deny },
    [ChartPermissionValues.specificCharts]: {
        label: 'Specific Chart Groups',
        value: ChartPermissionValues.specificCharts,
    },
} as const
