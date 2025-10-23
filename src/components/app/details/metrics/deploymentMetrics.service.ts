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

import { ChartColorKey, get, getUrlWithSearchParams } from '@devtron-labs/devtron-fe-common-lib'
import moment from 'moment'
import { Routes } from '../../../../config'
import { BenchmarkType } from './deploymentMetrics.types'

export async function getDeploymentMetrics(
    startTime: string,
    endTime: string,
    appId: string | number,
    envId: string | number,
): Promise<any> {
    startTime += 'Z'
    endTime += 'Z'

    const url = getUrlWithSearchParams(Routes.DEPLOYMENT_METRICS, {
        appId,
        envId,
        from: startTime,
        to: endTime,
    })

    const response = await get(url)
    return {
        ...response,
        result: {
            ...createGraphs(response.result, startTime, endTime),
            rows: createDeploymentTableRows(response.result, startTime, endTime),
        },
    }
}

export function createGraphs(responseResult, startTime: string, endTime: string) {
    const s = moment(startTime)
    const e = moment(endTime)
    if (!responseResult || !responseResult.series || responseResult.series.length === 0 || !s || !e) {
        return {
            avgFrequency: 0,
            failureRate: 0,
            meanLeadTime: '',
            meanRecoveryTime: '',
            frequencyAndLeadTimeGraph: [],
            recoveryTimeGraph: [],
        }
    }

    const allDeployments = responseResult.series.map((deployment) => {
        return {
            ...deployment,
            ts: moment(deployment.release_time).valueOf(),
        }
    })

    const startTimestamp = s.valueOf()
    const endTimestamp = e.valueOf()
    const millisecondsInDay = 86400000
    const numberOfDays = (endTimestamp - startTimestamp) / millisecondsInDay
    const numberOfWeeks = Math.ceil(numberOfDays / 7)
    const millisecondsInWeek = 7 * millisecondsInDay

    const frequencyGraph = []
    let recoveryTimeGraph = []

    if (numberOfDays <= 30) {
        for (let i = 1; i <= numberOfDays; i++) {
            const dayStartTime = moment(startTimestamp + (i - 1) * millisecondsInDay)
            const dayEndTime = moment(startTimestamp + i * millisecondsInDay)

            frequencyGraph.push({
                startTime: dayStartTime,
                endTime: dayEndTime,
                frequency: 0,
                failures: 0,
                success: 0,
                maxLeadTime: 0,
                xAxisLabel: `${dayStartTime.format('ddd, MMM DD YYYY')}`,
            })
        }
    } else {
        for (let i = 1; i <= numberOfWeeks; i++) {
            const weekStartTime = moment(startTimestamp + (i - 1) * millisecondsInWeek)
            const weekEndTime = moment(startTimestamp + i * millisecondsInWeek)
            frequencyGraph.push({
                startTime: weekStartTime,
                endTime: weekEndTime,
                frequency: 0,
                failures: 0,
                success: 0,
                maxLeadTime: 0,
                yAxisLabel: '0m',
                xAxisLabel: `${weekStartTime.format('ddd, MMM DD, YYYY')} - ${weekEndTime.format('ddd, MMM DD, YYYY')}`,
            })
        }
    }

    frequencyGraph.forEach((g, i) => {
        const deployments = allDeployments.filter((d) => d.ts >= g.startTime && d.ts < g.endTime)
        const failures = deployments.filter((d) => d.release_status === 1)
        const success = deployments.filter((d) => d.release_status === 0)
        const leadTimeArr = deployments.map((d) => Math.round(d.lead_time))
        if (!leadTimeArr || !leadTimeArr.length) {
            leadTimeArr.push(0)
        }
        g.maxLeadTime = Math.max(...leadTimeArr)
        g.yAxisLabel = createTimestamp(g.maxLeadTime)
        if (g.maxLeadTime < 0) {
            g.maxLeadTime = 0
        }
        g.frequency = deployments.length
        g.success = success.length
        g.failures = failures.length
    })

    let sumRecoveryTime = 0
    recoveryTimeGraph = allDeployments
        .filter((d) => d.release_status === 1)
        .map((d) => {
            sumRecoveryTime += d.recovery_time
            return {
                recoveryTime: d.recovery_time,
                releaseTime: moment(d.release_time),
                xAxisLabel: moment(d.release_time).format('ddd, MMM DD, YYYY'),
                yAxisLabel: createTimestamp(d.recovery_time),
            }
        })

    recoveryTimeGraph = recoveryTimeGraph.sort((a, b) => {
        if (a.releaseTime.valueOf() < b.valueOf()) {
            return 1
        }
        return -1
    })
    const avgFrequency = Math.round((100 * allDeployments.length) / numberOfDays) / 100
    const frequencies = frequencyGraph.map((f) => f.frequency)
    const frequencyBenchmark = getFrequencyBenchmark(avgFrequency)
    const maxFrequency = Math.max(...frequencies, frequencyBenchmark.targetValue)

    const meanLeadTime = responseResult.average_lead_time
    const meanTimeToRecovery = responseResult.average_recovery_time
    const changeFailureRate = responseResult.change_failure_rate
    
    const stats = {
        avgFrequency: responseResult.average_cycle_time?.toFixed(2) || 0,
        totalDeployments: allDeployments.length,
        failedDeployments: recoveryTimeGraph.length,
        maxFrequency,
        frequencyBenchmark,
        meanLeadTimeLabel: `${createTimestamp(meanLeadTime)}`,
        meanLeadTime,
        leadTimeBenchmark: getLeadTimeBenchmark(meanLeadTime),
        meanRecoveryTime: `${meanTimeToRecovery}`,
        meanRecoveryTimeLabel: `${createTimestamp(meanTimeToRecovery)}`,
        recoveryTimeBenchmark: getRecoveryTimeBenchmark(meanTimeToRecovery),
        failureRate: changeFailureRate,
        failureRateBenchmark: getFailureRateBenchmark(changeFailureRate),
    }

    return {
        recoveryTimeGraph,
        frequencyAndLeadTimeGraph: frequencyGraph,
        ...stats,
    }
}

function createDeploymentTableRows(responseResult, startTime: string, endTime: string) {
    const s = moment(startTime)
    const e = moment(endTime)
    if (!responseResult || !responseResult.series || responseResult.series.length === 0 || !s || !e) {
        return []
    }

    let rows = responseResult.series.map((deployment) => {
        return {
            releaseTime: {
                value: moment(deployment.release_time).valueOf(),
                label: moment(deployment.release_time).format('DD MMM YYYY, hh:mm a'),
            },
            leadTime: {
                value: Math.round(deployment.lead_time),
                label: createTimestamp(deployment.lead_time),
            },
            cycleTime: {
                value: Math.round(deployment.cycle_time),
                label: createTimestamp(deployment.cycle_time),
            },
            recoveryTime: {
                value: Math.round(deployment.recovery_time),
                label: deployment.recovery_time > 0 ? createTimestamp(deployment.recovery_time) : '-',
            },
            status: deployment.release_type == 1 ? 'Failed' : 'Success',
            deploymentSize: deployment.deployment_size,
            releaseStatus: deployment.release_status,
        }
    })

    const startTimestamp = s.valueOf()
    const endTimestamp = e.valueOf()
    rows = rows.filter((r) => r.releaseTime.value < endTimestamp && r.releaseTime.value >= startTimestamp)
    return rows
}

export function getFrequencyBenchmark(frequencyInDays: number): BenchmarkType {
    if (frequencyInDays >= 0 && frequencyInDays < 0.06) {
        return {
            name: 'LOW',
            targetName: 'MEDIUM',
            targetValue: 0.06,
            color: 'GoldenYellow500' as ChartColorKey,
        }
    }
    if (frequencyInDays >= 0.06 && frequencyInDays < 0.13) {
        return {
            name: 'MEDIUM',
            targetName: 'HIGH',
            targetValue: 0.13,
            color: 'LimeGreen500' as ChartColorKey,
        }
    }
    if (frequencyInDays >= 0.13 && frequencyInDays < 1) {
        return {
            name: 'HIGH',
            targetName: 'ELITE',
            targetValue: 1,
            color: 'Lavender500' as ChartColorKey,
        }
    }

    return {
        name: 'ELITE',
        color: '',
        targetName: '',
        targetValue: 0,
    }
}

export function getFailureRateBenchmark(failureRate: number): BenchmarkType {
    if (isNaN(failureRate)) {
        return {
            name: 'UNKNOWN',
            targetName: 'UNKNOWN',
            targetValue: -1,
            color: '',
        }
    }

    if (failureRate > 46) {
        return {
            name: 'LOW',
            targetName: 'MEDIUM',
            targetValue: 46,
            color: 'GoldenYellow500' as ChartColorKey,
        }
    }
    if (failureRate <= 46 && failureRate > 30) {
        return {
            name: 'MEDIUM',
            targetName: 'HIGH',
            targetValue: 30,
            color: 'LimeGreen500' as ChartColorKey,
        }
    }
    if (failureRate <= 30 && failureRate > 15) {
        return {
            name: 'HIGH',
            targetName: 'ELITE',
            targetValue: 15,
            color: 'Lavender500' as ChartColorKey,
        }
    }

    return {
        name: 'ELITE',
        targetName: '',
        targetValue: 0,
        color: '',
    }
}

export function getLeadTimeBenchmark(leadTimeInMinutes: number): BenchmarkType {
    if (isNaN(leadTimeInMinutes)) {
        return {
            name: 'UNKNOWN',
            targetName: 'UNKNOWN',
            targetLabel: '',
            targetValue: -1,
            color: '',
        }
    }

    const leadTimeInDays = leadTimeInMinutes / (60 * 24)
    if (leadTimeInDays > 14) {
        return {
            name: 'LOW',
            targetName: 'MEDIUM',
            targetValue: 14 * 60 * 24,
            targetLabel: createTimestamp(14 * 60 * 24),
            color: 'GoldenYellow500' as ChartColorKey,
        }
    }
    if (leadTimeInDays <= 14 && leadTimeInDays > 7) {
        return {
            name: 'MEDIUM',
            targetName: 'HIGH',
            targetValue: 7 * 60 * 24,
            targetLabel: createTimestamp(7 * 60 * 24),
            color: 'LimeGreen500' as ChartColorKey,
        }
    }
    if (leadTimeInDays <= 7 && leadTimeInDays > 2) {
        return {
            name: 'HIGH',
            targetName: 'ELITE',
            targetValue: 2 * 60 * 24,
            targetLabel: createTimestamp(2 * 60 * 24),
            color: 'Lavender500' as ChartColorKey,
        }
    }

    return {
        name: 'ELITE',
        targetName: '',
        targetValue: 0,
        targetLabel: '',
        color: '',
    }
}

export function getRecoveryTimeBenchmark(recoveryTimeInMinutes: number): BenchmarkType {
    const recoveryTimeInHours = recoveryTimeInMinutes / 60
    if (recoveryTimeInHours > 8) {
        return {
            name: 'LOW',
            targetName: 'MEDIUM',
            targetLabel: createTimestamp(8 * 60),
            targetValue: 8 * 60,
            color: 'GoldenYellow500' as ChartColorKey,
        }
    }
    if (recoveryTimeInHours <= 8 && recoveryTimeInHours > 4) {
        return {
            name: 'MEDIUM',
            targetName: 'HIGH',
            targetValue: 4 * 60,
            targetLabel: createTimestamp(4 * 60),
            color: 'LimeGreen500' as ChartColorKey,
        }
    }
    if (recoveryTimeInHours <= 4 && recoveryTimeInHours > 1) {
        return {
            name: 'HIGH',
            targetName: 'ELITE',
            targetValue: 1 * 60,
            targetLabel: createTimestamp(1 * 60),
            color: 'Lavender500' as ChartColorKey,
        }
    }

    return {
        name: 'ELITE',
        targetName: '',
        targetValue: 0,
        targetLabel: '',
        color: '',
    }
}

export function createTimestamp(timeInMinutes: number): string {
    if (isNaN(timeInMinutes) || timeInMinutes === 0) {
        return `0m`
    }

    let q
    let r
    let result = ''
    let time = timeInMinutes
    q = Math.floor(time / 60)
    r = Math.floor(time) - q * 60
    if (r > 0) {
        result = `${r}m`
    }

    time = q // time is in days
    q = Math.floor(time / 24)
    r = time - q * 24
    if (r > 0) {
        result = result ? `${r}h ${result}` : `${r}h`
    }

    time = q // time is in days
    if (time > 0) {
        result = result ? `${time}d ${result}` : `${time}d`
    }

    return result
}
