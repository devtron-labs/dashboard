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

import React, { useState, useEffect, useMemo } from 'react'
import { Progressing, Drawer, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useDebouncedEffect } from '../../../common'
import './TestRunDetails.scss'
import List from './List'
import { ReactComponent as Folder } from '../../../../assets/icons/ic-folder.svg'
import { ReactComponent as SuccessIcon } from '../../../../assets/icons/ic-success.svg'
import { ReactComponent as SkipIcon } from '../../../../assets/icons/ic-skip.svg'
import { ReactComponent as WarnIcon } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as ErrorIcon } from '../../../../assets/icons/misc/errorInfo.svg'
import { ReactComponent as Briefcase } from '../../../../assets/icons/ic-briefcase.svg'
import { ReactComponent as FileIcon } from '../../../../assets/icons/ic-file.svg'
import { ReactComponent as Cross } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as QuestionIcon } from '../../../../assets/icons/ic-question.svg'
import { getTestSuites, getTestCase, getSuiteDetail } from './service'
import { SelectedNames } from './Test.types'

const computeHistogram = require('compute-histogram')

export const TestRunDetails: React.FC<{ selectedNames: SelectedNames }> = ({ selectedNames }) => {
    const params = useParams<{ appId: string; pipelineId: string; triggerId: string }>()
    const [testSuiteIds, setTestSuiteIds] = useState<{
        testSuitesId: number
        testSuiteId: number
        testcaseId?: number
        tab: 'properties' | 'system-output' | 'system-error' | 'testcase' | ''
    }>({ testSuitesId: 0, testSuiteId: 0, tab: '' })
    const [loading, result, error, reload] = useAsync(
        () => getTestSuites(params.pipelineId, params.triggerId, selectedNames),
        [params],
    )

    useDebouncedEffect(reload, 2000, [selectedNames])

    const { statusAggregation, timeAggregation } = useMemo(() => {
        const testcases = result?.result?.result?.testsuites?.reduce((agg, curr) => {
            return [
                ...agg,
                ...curr?.testsuite.reduce((agg2, curr2) => {
                    return [...agg2, ...curr2.testcases]
                }, []),
            ]
        }, [])

        const initStatusAggregation = {
            testCount: 0,
            disabledCount: 0,
            errorCount: 0,
            failureCount: 0,
            skippedCount: 0,
            unknownCount: 0,
        }

        const timeAggregation = testcases?.reduce((agg, testcase) => {
            const { time } = testcase
            if (time) {
                if (agg[time]) {
                    agg[time] += 1
                } else {
                    agg[time] = 1
                }
            }
            return agg
        }, {})

        const statusAggregation = result?.result?.result?.testsuites?.reduce((agg, curr) => {
            const { testCount, disabledCount, errorCount, failureCount, skippedCount, unknownCount } = curr
            agg['testCount'] += testCount || 0
            agg['disabledCount'] += disabledCount || 0
            agg['errorCount'] += errorCount || 0
            agg['failureCount'] += failureCount || 0
            agg['skippedCount'] += skippedCount || 0
            agg['unknownCount'] += unknownCount || 0
            return agg
        }, initStatusAggregation)
        return { timeAggregation, statusAggregation }
    }, [result])

    function showDrawer(
        testSuitesId: number,
        testSuiteId: number,
        tab: 'properties' | 'system-output' | 'system-error' | 'testcase',
        testcaseId?: number,
    ) {
        setTestSuiteIds({ testSuitesId, testSuiteId, testcaseId, tab })
    }

    function hideDrawer() {
        setTestSuiteIds({ testSuitesId: 0, testcaseId: 0, testSuiteId: 0, tab: '' })
    }
    if (loading) {
        return (
            <div className="w-100" style={{ height: '100%' }}>
                <Progressing pageLoader />
            </div>
        )
    }
    return (
        <>
            <div className="app-details test-details mt-16">
                <div style={{ display: 'grid', gridTemplateColumns: '502px 1fr', gridColumnGap: '16px' }}>
                    <TestsChart {...statusAggregation} />
                    {timeAggregation && <TestsDuration timeAggregation={timeAggregation} />}
                </div>
                {result?.result?.result?.testsuites?.map((testSuitesData) => (
                    <TestSuites key={testSuitesData.id} {...testSuitesData} showDrawer={showDrawer} />
                ))}
            </div>
            {!!testSuiteIds.testSuitesId && !!testSuiteIds.testSuiteId && (
                <Drawer position="right" width="800px">
                    {testSuiteIds.tab === 'properties' && <Properties {...testSuiteIds} hideDrawer={hideDrawer} />}
                    {testSuiteIds.tab === 'system-output' && <SystemOutput {...testSuiteIds} hideDrawer={hideDrawer} />}
                    {testSuiteIds.tab === 'system-error' && <SystemError {...testSuiteIds} hideDrawer={hideDrawer} />}
                    {testSuiteIds.tab === 'testcase' && <TestCaseStatus {...testSuiteIds} hideDrawer={hideDrawer} />}
                </Drawer>
            )}
        </>
    )
}
const TestSuites: React.FC<{
    name: string
    testsuite: any
    time: number
    id: number
    testCount: number
    disabledCount: number
    errorCount: number
    failureCount: number
    skippedCount: number
    unknownCount: number
    showDrawer(
        testSuitesId: number,
        testSuiteId: number,
        tab: 'properties' | 'system-output' | 'system-error' | 'testcase',
        testcaseId?: number,
    ): any
}> = ({
    name,
    testsuite,
    time,
    id: testsuitesId,
    testCount,
    disabledCount,
    errorCount,
    failureCount,
    skippedCount,
    unknownCount,
    showDrawer,
}) => {
    return (
        <List key={testsuitesId} collapsible={testsuite?.length > 0} className="test--list testsuites">
            <List.Icon>
                <Briefcase />
            </List.Icon>
            <List.Body>
                <div className="flex column left">
                    <div>{name || 'unnamed'}</div>
                    <TestStats
                        {...{
                            testCount,
                            disabledCount,
                            errorCount,
                            failureCount,
                            skippedCount,
                            unknownCount,
                        }}
                    />
                </div>
            </List.Body>
            <span>{time ? `${time / 1000}s` : null}</span>
            <List.Detail>
                <div className="test--detail">
                    {testsuite?.map((testsuiteData) => (
                        <TestSuite
                            showDrawer={showDrawer}
                            testsuitesId={testsuitesId}
                            key={testsuiteData.id}
                            data={testsuiteData}
                        />
                    ))}
                </div>
            </List.Detail>
        </List>
    )
}

const TestSuite: React.FC<{
    data: any
    testsuitesId: number
    showDrawer(
        testSuitesId: number,
        testSuiteId: number,
        tab: 'properties' | 'system-output' | 'system-error' | 'testcase',
        testcaseId?: number,
    ): any
}> = ({ data, testsuitesId, showDrawer }) => {
    const {
        id: testsuiteId,
        name,
        testCount,
        disabledCount,
        errorCount,
        properties,
        testcases,
        time,
        failureCount,
        skippedCount,
        unknownCount,
        systemOut,
        systemError,
    } = data
    return (
        <List key={testsuiteId} collapsible={testcases?.length > 0} className="test--list testsuite">
            <List.Icon>
                <Folder className="folder-icon" />
            </List.Icon>
            <List.Body>
                <div className="flex column left">
                    <div>{name}</div>
                    <TestStats
                        {...{
                            testCount,
                            disabledCount,
                            errorCount,
                            failureCount,
                            skippedCount,
                            unknownCount,
                        }}
                    />
                </div>
            </List.Body>
            <span>{time ? `${time / 1000}s` : null}</span>
            <List.Detail>
                <ul className="test--detail">
                    {(properties?.length > 0 || !!systemOut || !!systemError) && (
                        <li className="suite-meta">
                            <div className="suite-meta-container">
                                {properties?.length > 0 && (
                                    <div
                                        className="flex left testsuite-meta testsuite--property"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            showDrawer(testsuitesId, testsuiteId, 'properties')
                                        }}
                                    >
                                        <FileIcon />
                                        Properties
                                    </div>
                                )}
                                {systemOut && (
                                    <div
                                        className="flex left testsuite-meta testsuite--system-out"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            showDrawer(testsuitesId, testsuiteId, 'system-output')
                                        }}
                                    >
                                        <FileIcon />
                                        System output
                                    </div>
                                )}
                                {systemError && (
                                    <div
                                        className="flex left testsuite-meta testsuite--system-error"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            showDrawer(testsuitesId, testsuiteId, 'system-error')
                                        }}
                                    >
                                        <FileIcon />
                                        System error
                                    </div>
                                )}
                            </div>
                        </li>
                    )}
                    {testcases?.map((testcase) => (
                        <li
                            key={testcase.id}
                            className={`testcase testcase-status ${testcase?.status || ''}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                showDrawer(testsuitesId, testsuiteId, 'testcase', testcase.id)
                            }}
                        >
                            <StatusIcon status={testcase?.status} />
                            <List.Body>{testcase?.name || 'unnamed'}</List.Body>
                            <span>{testcase?.time ? `${testcase?.time / 1000}s` : null}</span>
                        </li>
                    ))}
                </ul>
            </List.Detail>
        </List>
    )
}
const Properties = ({ testSuiteId, testSuitesId, hideDrawer }) => {
    const [loading, result, error, reload] = useAsync(
        () => getSuiteDetail(Number(testSuitesId), Number(testSuiteId)),
        [testSuiteId],
    )

    function handleClose(e) {
        hideDrawer()
    }
    if (loading) {
        return <Progressing pageLoader />
    }
    return (
        <div className="testcase--detail" style={{ width: '800px', background: 'white', height: '100%' }}>
            {loading ? (
                <Progressing pageLoader />
            ) : (
                <>
                    <div className="testcase--title">
                        <h1>Properties</h1>
                        <Cross className="pointer" onClick={handleClose} style={{ marginLeft: 'auto' }} />
                    </div>
                    <div style={{ height: 'calc( 100% - 68px )', overflow: 'auto' }}>
                        <table className="properties-table">
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>VALUE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result?.result?.result?.properties
                                    ?.filter(({ name, value }) => name || value)
                                    ?.map(({ id, name, value }) => (
                                        <tr key={id}>
                                            <td>{name}</td>
                                            <td>{value}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}

const SystemOutput = ({ testSuiteId, testSuitesId, hideDrawer }) => {
    const [loading, result, error, reload] = useAsync(
        () => getSuiteDetail(Number(testSuitesId), Number(testSuiteId)),
        [testSuiteId],
    )
    function handleClose(e) {
        hideDrawer()
    }
    return (
        <div className="testcase--detail testsuite" style={{ width: '800px', background: 'white', height: '100%' }}>
            {loading ? (
                <Progressing pageLoader />
            ) : (
                <>
                    <div className="testcase--title">
                        <h1>System Output</h1>
                        <Cross className="pointer" onClick={handleClose} style={{ marginLeft: 'auto' }} />
                    </div>
                    <div className="testsuite-detail--body">
                        {result?.result?.systemOut && <samp className="console">{result.result.systemOut}</samp>}
                    </div>
                </>
            )}
        </div>
    )
}

const SystemError = ({ testSuiteId, testSuitesId, hideDrawer }) => {
    const [loading, result, error, reload] = useAsync(
        () => getSuiteDetail(Number(testSuitesId), Number(testSuiteId)),
        [testSuiteId],
    )
    function handleClose(e) {
        hideDrawer()
    }
    return (
        <div className="testcase--detail testsuite" style={{ width: '800px', background: 'white', height: '100%' }}>
            {loading ? (
                <Progressing pageLoader />
            ) : (
                <>
                    <div className="testcase--title">
                        <h1>System Error</h1>
                        <Cross className="pointer" onClick={handleClose} style={{ marginLeft: 'auto' }} />
                    </div>
                    <div className="testsuite-detail--body">
                        {result?.result?.result?.systemError && (
                            <samp className="error">{result?.result.result.systemError}</samp>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

const StatusIcon = ({ status, width = '24', height = '24' }) => {
    switch (status?.toLowerCase()) {
        case 'success':
        case 'passed':
            return <SuccessIcon width={width} height={height} />
        case 'failure':
        case 'failed':
            return <ErrorIcon width={width} height={height} />
        case 'error':
        case 'errors':
            return <WarnIcon width={width} height={height} />
        case 'unknown':
            return <QuestionIcon width={width} height={height} />
        default:
            return <SkipIcon width={width} height={height} />
    }
}

const TestStats = ({ testCount, disabledCount, errorCount, failureCount, skippedCount, unknownCount }) => {
    const statusMap = {
        testCount: 'tests',
        disabledCount: 'disabled',
        errorCount: 'errors',
        failureCount: 'failed',
        skippedCount: 'skipped',
        unknownCount: 'unknown',
    }
    return (
        <ul className="test-stats flex left">
            {Object.entries({ errorCount, failureCount }).map(([status, count], idx) =>
                count ? (
                    <li
                        className={`testcase-status flex left ${statusMap[status]}`}
                        style={{ textTransform: 'capitalize' }}
                    >
                        <StatusIcon status={statusMap[status]} width="14" height="14" />
                        <span>{`${count} ${statusMap[status]}`}</span>
                    </li>
                ) : null,
            )}
        </ul>
    )
}

const TestCaseStatus = ({ testcaseId = 0, testSuitesId, testSuiteId, hideDrawer }) => {
    const [testCaseDetail, setTestCaseDetail] = useState(null)
    const [loading, result, error, reload] = useAsync(() => getTestCase(Number(testcaseId)), [testcaseId])
    function handleClose(e) {
        hideDrawer()
    }
    useEffect(() => {
        if (loading) {
            return
        }
        if (result?.result?.result) {
            setTestCaseDetail(result.result?.result)
        }
    }, [loading])

    return (
        <div className="testcase--detail" style={{ width: '800px', background: 'white', height: '100%' }}>
            {loading ? (
                <Progressing pageLoader />
            ) : (
                <>
                    <div className="testcase--title">
                        <span className={`status testcase-status ${testCaseDetail?.status || ''}`}>
                            {testCaseDetail?.status}
                        </span>
                        <h1 className="dc__ellipsis-right">{testCaseDetail?.name || 'unnamed'}</h1>
                        <Cross className="pointer" onClick={handleClose} />
                    </div>
                    <div className="testcase--body">
                        <section>
                            <label className="light">Duration</label>
                            <p>{testCaseDetail?.time || 'unavailable'}</p>
                        </section>
                        <section>
                            <label className="light">Classname</label>
                            <p>{testCaseDetail?.classname || 'unavailable'}</p>
                        </section>
                        {typeof testCaseDetail?.assertionCount === 'number' && (
                            <section>
                                <label className="light">assertions</label>
                                <p>{testCaseDetail?.assertionCount}</p>
                            </section>
                        )}
                        {testCaseDetail?.errors?.map((error) => <MessageTypeViewer {...error} nodeType="Error" />)}
                        {testCaseDetail?.failures?.map((failure) => (
                            <MessageTypeViewer {...failure} nodeType="Failure" />
                        ))}
                        {testCaseDetail?.skippedMessage && testCaseDetail?.skippedType && (
                            <MessageTypeViewer
                                nodeType="Skip"
                                message={testCaseDetail.skippedMessage}
                                type={testCaseDetail.skippedType}
                                text={testCaseDetail.text}
                            />
                        )}
                        {testCaseDetail?.systemOuts?.map(({ text, id }) => (
                            <MessageTypeViewer key={id} text={text} nodeType="System Output" />
                        ))}
                        {testCaseDetail?.systemErrors?.map(({ text, id }) => (
                            <MessageTypeViewer key={id} text={text} nodeType="System Error" />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

const MessageTypeViewer = ({ nodeType, message = null, type = null, text }) => {
    return (
        <section>
            <b>{nodeType}</b>
            {type && (
                <>
                    <label htmlFor="" className="light">
                        Type
                    </label>
                    <p>{type}</p>
                </>
            )}
            {message && (
                <>
                    <label htmlFor="" className="light">
                        Message
                    </label>
                    <p>{message}</p>
                </>
            )}
            {text && <samp>{text}</samp>}
        </section>
    )
}

const TestsChart = ({ testCount, disabledCount, errorCount, failureCount, skippedCount, unknownCount }) => {
    const passedCount = testCount - disabledCount - errorCount - failureCount - skippedCount - unknownCount
    const data = [
        { label: 'disabled', value: disabledCount },
        { label: 'error', value: errorCount },
        { label: 'failures', value: failureCount },
        { label: 'skipped', value: skippedCount },
        { label: 'unknown', value: unknownCount },
        { label: 'passed', value: passedCount },
    ]

    const colorMap = {
        skipped: '#d0d4d9',
        error: '#f6573b',
        failures: '#ff9800',
        disabled: '#58508d',
        unknown: '#ff9800',
        passed: '#00be61',
    }

    const passPercentage = (passedCount * 100) / testCount
    return (
        <div className="bcn-0 br-8 en-2 bw-1 p-20 flex left top">
            <div className="flex left column top" style={{ width: '200px', height: '250px' }}>
                <span className="fs-32 cg-5">{passPercentage.toFixed(2)}%</span>
                <span className="cn-9 fw-3 fs-16">Pass percentage</span>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridColumnGap: '30px',
                        gridRowGap: '12px',
                        marginTop: 'auto',
                    }}
                >
                    {data.map(({ label, value }) => (
                        <span className="flex left">
                            <div
                                className="mr-8"
                                style={{
                                    height: '8px',
                                    width: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: colorMap[label],
                                }}
                            />
                            {label} <span className="fw-6 ml-6">{value}</span>
                        </span>
                    ))}
                </div>
            </div>

            <PieChart width={260} height={260}>
                <Pie data={data} cx={130} cy={130} innerRadius={80} outerRadius={120} fill="#8884d8" dataKey="value">
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorMap[entry.label]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </div>
    )
}

const TestsDuration: React.FC<{ timeAggregation: any }> = ({ timeAggregation }) => {
    function calculateHistogram(dist, numOfBins = 10) {
        const arr = Object.keys(dist)
            .map(Number)
            .sort((a, b) => a - b)
        const histogram = computeHistogram(arr, numOfBins).map((arr) => arr.reduce((a, b) => a + b, 0))
        return histogram
    }
    const hist = useMemo(() => calculateHistogram(timeAggregation), [timeAggregation])
    const data = Object.entries(hist).map(([timeSpent, freq]) => ({
        'time spent': timeSpent,
        'number of tests': freq,
    }))
    return (
        <div className="w-100 bcn-0 br-8 en-2 bw-1 p-20" style={{ height: '300px' }}>
            <ResponsiveContainer>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis />
                    <XAxis dataKey="time spent" unit="ms" scale="linear" />
                    <Tooltip />
                    <Bar radius={8} dataKey="number of tests" fill="var(--B500)" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
