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

import {
    createTimestamp,
    getFailureRateBenchmark,
    getFrequencyBenchmark,
    getLeadTimeBenchmark,
    getRecoveryTimeBenchmark,
} from './deploymentMetrics.service'

export const defaultStats = {
    avgFrequency: 0,
    failureRate: 0,
    meanLeadTime: '',
    meanRecoveryTime: '',
    graphs: [],
}

test('Create Timestamp', () => {
    expect(createTimestamp(0 / 0)).toBe('0m')
    expect(createTimestamp(0)).toBe('0m')
    expect(createTimestamp(59)).toBe('59m')
    expect(createTimestamp(60)).toBe('1h')
    expect(createTimestamp(60)).toBe('1h')
    expect(createTimestamp(61)).toBe('1h 1m')
    expect(createTimestamp(1440)).toBe('1d')
    expect(createTimestamp(121.999)).toBe('2h 1m')
    expect(createTimestamp(1501)).toBe('1d 1h 1m')
    expect(createTimestamp(4500)).toBe('3d 3h')
})

test('Get Frequency Benchmark', () => {
    expect(getFrequencyBenchmark(0)).toStrictEqual({
        name: 'LOW',
        targetName: 'MEDIUM',
        targetValue: 0.06,
        color: 'var(--Y500)',
    })
    expect(getFrequencyBenchmark(0.06)).toStrictEqual({
        name: 'MEDIUM',
        targetName: 'HIGH',
        targetValue: 0.13,
        color: 'var(--G500)',
    })
    expect(getFrequencyBenchmark(0.13)).toStrictEqual({
        name: 'HIGH',
        targetName: 'ELITE',
        targetValue: 1,
        color: '#8930e8',
    })
    expect(getFrequencyBenchmark(0.14)).toStrictEqual({
        name: 'HIGH',
        targetName: 'ELITE',
        targetValue: 1,
        color: '#8930e8',
    })
    expect(getFrequencyBenchmark(1)).toStrictEqual({
        name: 'ELITE',
        targetName: '',
        targetValue: 0,
        color: '',
    })
})

test('Get Failure Benchmark', () => {
    expect(getFailureRateBenchmark(0)).toStrictEqual({
        name: 'ELITE',
        targetName: '',
        targetValue: 0,
        color: '',
    })
    expect(getFailureRateBenchmark(11)).toStrictEqual({
        name: 'ELITE',
        targetName: '',
        targetValue: 0,
        color: '',
    })

    expect(getFailureRateBenchmark(15)).toStrictEqual({
        name: 'ELITE',
        targetName: '',
        targetValue: 0,
        color: '',
    })
    expect(getFailureRateBenchmark(30)).toStrictEqual({
        name: 'HIGH',
        targetName: 'ELITE',
        targetValue: 15,
        color: '#8930e8',
    })
    expect(getFailureRateBenchmark(46)).toStrictEqual({
        name: 'MEDIUM',
        targetName: 'HIGH',
        targetValue: 30,
        color: 'var(--G500)',
    })
})

test('Get Lead Time Benchmark', () => {
    expect(getLeadTimeBenchmark(0)).toStrictEqual({
        name: 'ELITE',
        targetName: '',
        targetValue: 0,
        targetLabel: '',
        color: '',
    })
    expect(getLeadTimeBenchmark(2 * 60 * 24)).toStrictEqual({
        name: 'ELITE',
        targetName: '',
        targetValue: 0,
        targetLabel: '',
        color: '',
    })
    expect(getLeadTimeBenchmark(14 * 60 * 24)).toStrictEqual({
        name: 'MEDIUM',
        targetName: 'HIGH',
        targetValue: 7 * 60 * 24,
        targetLabel: '7d',
        color: 'var(--G500)',
    })
    expect(getLeadTimeBenchmark(14 * 60 * 24)).toStrictEqual({
        name: 'MEDIUM',
        targetName: 'HIGH',
        targetValue: 7 * 60 * 24,
        targetLabel: '7d',
        color: 'var(--G500)',
    })
    expect(getLeadTimeBenchmark(15 * 60 * 24)).toStrictEqual({
        name: 'LOW',
        targetName: 'MEDIUM',
        targetValue: 14 * 60 * 24,
        targetLabel: '14d',
        color: 'var(--Y500)',
    })
})

test('Get Recovery Time Benchmark', () => {
    expect(getRecoveryTimeBenchmark(0)).toStrictEqual({
        name: 'ELITE',
        targetName: '',
        targetValue: 0,
        targetLabel: '',
        color: '',
    })
    expect(getRecoveryTimeBenchmark(4 * 60)).toStrictEqual({
        name: 'HIGH',
        targetName: 'ELITE',
        targetValue: 1 * 60,
        targetLabel: '1h',
        color: '#8930e8',
    })
    expect(getRecoveryTimeBenchmark(8 * 60)).toStrictEqual({
        name: 'MEDIUM',
        targetName: 'HIGH',
        targetValue: 4 * 60,
        targetLabel: '4h',
        color: 'var(--G500)',
    })
    expect(getRecoveryTimeBenchmark(15 * 60)).toStrictEqual({
        name: 'LOW',
        targetName: 'MEDIUM',
        targetLabel: createTimestamp(8 * 60),
        targetValue: 8 * 60,
        color: 'var(--Y500)',
    })
})
