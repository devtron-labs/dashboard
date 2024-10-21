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

import { ChartValuesType } from '../charts.types'

export interface DeployChartProps {
    //  extends RouteComponentProps<{ chartId: string }>
    appStoreVersion: number
    chartValuesFromParent: ChartValuesType
    installedAppVersion?: number
    chartIdFromDeploymentDetail?: number
    versions?: Map<number, { id: number; version: string }>
    valuesYaml?: string
    rawValues?: string
    environmentId?: number
    teamId?: number
    installedAppId?: number
    onHide?: any
    chartName?: string
    name?: string
    readme?: string
    appName?: string
    deprecated?: boolean
    appStoreId?: number
    installedAppVersionId?: number
    deploymentAppType?: string
}

export interface TextAreaProps {
    val: string
    onChange?: any
    callbackRef?: any
}
