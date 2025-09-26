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

import { Moment } from 'moment'

import { ChartColorKey } from '@devtron-labs/devtron-fe-common-lib'

export interface GraphType {
    xAxisLabel: string
    frequency: number
    failures: number
    startTime: any
    endTime: any
}

export interface StatisticsType {
    graphs: GraphType[]
    avgFrequency: number
    failureRate: number
    meanLeadTime: string
    meanRecoveryTime: string
}

export interface DeploymentMetricsProps {
    filteredEnvIds?: string
}

export interface Environment {
    label: string
    value: number
    deploymentAppDeleteRequest?: boolean
}

export interface BenchmarkType {
    color: ChartColorKey | ''
    name: string
    targetName: string
    targetLabel?: string
    targetValue: number
}

export interface DeploymentMetricsState {
    code: number
    view: string
    environments: Array<Environment>
    frequencyAndLeadTimeGraph: {
        startTime: number
        endTime: number
        frequency: number
        failures: number
        success: number
        maxLeadTime: number
        xAxisLabel: string
    }[]
    recoveryTimeGraph: { recoveryTime: number; xAxisLabel: string; yAxisLabel: string; releaseTime: Moment }[]
    rows: any[]
    avgFrequency: number
    maxFrequency: number
    totalDeployments: number
    failedDeployments: number
    frequencyBenchmark: BenchmarkType

    failureRate: number
    failureRateBenchmark: BenchmarkType

    meanLeadTime: number
    meanLeadTimeLabel: string
    leadTimeBenchmark: BenchmarkType

    meanRecoveryTime: number
    meanRecoveryTimeLabel: string
    recoveryTimeBenchmark: BenchmarkType

    statusFilter: number

    benchmarkModalData:
        | {
              metric: 'DEPLOYMENT_FREQUENCY' | 'LEAD_TIME' | 'RECOVERY_TIME' | 'FAILURE_RATE'
              valueLabel: string
              catgory: string
              value: number
          }
        | undefined

    startDate: Moment
    endDate: Moment
    focusedInput: any
    filterBy: {
        startDate: undefined | Moment
        endDate: undefined | Moment
    }
    deploymentTableView: string
}
export interface RecoveryAndLeadTimeGraphLegendProps {
    noFailures: boolean
    valueLabel: string
    label: string
    tooltipText: string
    benchmark: undefined | any
    setMetric: (...args) => void
}

export interface FrequencyGraphLegendProps {
    noFailures: boolean
    label: string
    frequency: string
    failureRate: string
    frequencyBenchmark: undefined | any
    failureRateBenchmark: undefined | any
    setFrequencyMetric: (...args) => void
    setFailureMetric: (...args) => void
}
