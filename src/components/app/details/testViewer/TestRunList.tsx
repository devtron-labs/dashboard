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

import React, { useState, useMemo } from 'react'
import { useParams, useRouteMatch, generatePath, useHistory, Route, Switch } from 'react-router-dom'
import {
    Progressing,
    multiSelectStyles,
    Option,
    useAsync,
    ReactSelectInputAction,
} from '@devtron-labs/devtron-fe-common-lib'
import Select, { components } from 'react-select'
import { BarChart, Bar, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import moment from 'moment'
import { mapByKey, Td, DropdownIcon, DatePicker } from '../../../common'
import { getCIPipelines } from '../../service'
import { getTriggerList, getFilters } from './service'
import { ReactComponent as EmptyTests } from '../../../../assets/img/ic-empty-tests.svg'
import { SelectedNames } from './Test.types'
import './TestRunDetails.scss'
import { TestRunDetails } from './TestRunDetails'

export default function TestRunList() {
    const params = useParams<{ appId: string; pipelineId?: string }>()
    const { url, path } = useRouteMatch()
    const [ciPipelinesLoading, ciPipelinesResult, error, reload] = useAsync(
        () => getCIPipelines(params.appId),
        [params.appId],
    )
    const [dates, setDates] = useState({
        startDate: moment().set({ hour: 0, minute: 0, seconds: 0 }).subtract(1, 'months'),
        endDate: moment().add(1, 'days'),
    })
    const [focusedDate, setFocusedDate] = useState(null)

    if (ciPipelinesLoading) {
        return (
            <div className="w-100" style={{ height: '100%' }}>
                <Progressing pageLoader />
            </div>
        )
    }
    if (!ciPipelinesLoading && (!ciPipelinesResult?.result || ciPipelinesResult?.result?.length === 0)) {
        return <TestsPlaceholder subtitle="Reports for executed test cases will be available here" />
    }

    function handleDatesChange({ startDate, endDate }) {
        setDates({ startDate, endDate })
    }
    return (
        <div style={{ padding: '16px 24px', overflowY: 'auto' }}>
            <Switch>
                <Route
                    path={`${path
                        .replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')
                        .replace(':triggerId(\\d+)?', ':triggerId(\\d+)')}`}
                >
                    <TestsFilter component={TestRunDetails} />
                </Route>
                <Route path={`${path.replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')}`}>
                    <div className="flex" style={{ justifyContent: 'space-between' }}>
                        <CISelector pipelines={ciPipelinesResult?.result || []} />
                        <DatePicker
                            startDate={dates.startDate}
                            endDate={dates.endDate}
                            focusedInput={focusedDate}
                            handleDatesChange={handleDatesChange}
                            handleFocusChange={(focused) => setFocusedDate(focused)}
                        />
                    </div>

                    <TestsFilter
                        component={(props) => (
                            <TriggerList {...props} startDate={dates.startDate} endDate={dates.endDate} />
                        )}
                    />
                </Route>
                <Route>
                    <>
                        <CISelector pipelines={ciPipelinesResult?.result || []} />
                        <TestsPlaceholder
                            title="Select a pipeline"
                            subtitle="Please select a pipeline to view test reports"
                        />
                    </>
                </Route>
            </Switch>
        </div>
    )
}

const CISelector: React.FC<{ pipelines: any[] }> = ({ pipelines }) => {
    const params = useParams<{ pipelineId: string }>()
    const history = useHistory()
    const ciPipelinesMap = mapByKey(pipelines, 'id')
    const ciPipelineName = ciPipelinesMap.has(+params.pipelineId) ? ciPipelinesMap.get(+params.pipelineId)?.name : null
    const { url, path } = useRouteMatch()

    return (
        <div style={{ width: '250px' }} className="mb-16">
            <Select
                value={params.pipelineId ? { value: +params.pipelineId, label: ciPipelineName } : null}
                styles={multiSelectStyles}
                placeholder="Select pipeline"
                options={pipelines?.map((pipeline) => ({
                    value: pipeline.id,
                    label: pipeline.name,
                }))}
                onChange={(selected) => {
                    history.push(generatePath(path, { ...params, pipelineId: (selected as any).value }))
                }}
            />
        </div>
    )
}

const TestsPlaceholder = ({ title = 'Test Reports', subtitle = '' }) => {
    return (
        <div className="w-100 flex column" style={{ height: '100%' }}>
            <EmptyTests />
            <div className="fs-16 fw-6 cn-9">{title}</div>
            <p className="fs-12 cn-7" style={{ width: '250px', textAlign: 'center' }}>
                {subtitle}
            </p>
        </div>
    )
}

const TriggerList: React.FC<{ selectedNames: SelectedNames; startDate; endDate }> = ({
    selectedNames,
    startDate,
    endDate,
}) => {
    const params = useParams<{ appId: string; pipelineId: string }>()
    const { url, path } = useRouteMatch()
    const [triggerListLoading, triggerList, error, reload] = useAsync(
        () =>
            getTriggerList(
                params.pipelineId,
                selectedNames,
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD'),
            ),
        [params.pipelineId, selectedNames, startDate, endDate],
    )
    const data = (triggerList?.result?.result || []).slice(0, 30).map((triggerDetail) => {
        const { skippedCount, errorCount, failureCount, disabledCount, unknownCount, testCount, createdOn } =
            triggerDetail
        return {
            skippedCount,
            errorCount,
            failureCount,
            disabledCount,
            unknownCount,
            date: createdOn,
            successCount: testCount - (skippedCount + errorCount + failureCount + disabledCount + unknownCount),
        }
    })

    const colorMap = {
        skippedCount: '#d0d4d9',
        errorCount: '#f6573b',
        failureCount: '#ff9800',
        disabledCount: '#58508d',
        unknownCount: '#ff9800',
        successCount: '#00be61',
    }
    if (triggerListLoading) {
        return (
            <div className="w-100 flex" style={{ height: '100%' }}>
                <Progressing pageLoader />
            </div>
        )
    }

    if (!triggerList?.result || triggerList?.result?.result?.length === 0) {
        return (
            <div className="w-100 flex" style={{ height: '100%' }}>
                <TestsPlaceholder
                    title="No reports available"
                    subtitle="No tests have been executed for this pipeline."
                />
            </div>
        )
    }
    return (
        <>
            <div className="mt-24 w-100 flex left column pt-16 pl-24 pb-16 pr-24 bcn-0 br-8 en-2 bw-1">
                <div className="flex left mb-24">
                    <span className="fs-14 cn-9 fw-6">Last 30 executions</span>
                </div>
                <div className="w-100" style={{ height: '300px' }}>
                    <ResponsiveContainer>
                        <BarChart data={data} barSize={10}>
                            {/* <CartesianGrid strokeDasharray="3 3" /> */}
                            <YAxis />
                            {/* <XAxis dataKey="date" /> */}
                            <Tooltip />
                            <Legend />
                            {Object.entries(colorMap).map(([dataKey, fill]) => (
                                <Bar key={dataKey} radius={8} dataKey={dataKey} fill={fill} stackId="a" />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="trigger-table-container mt-16">
                <table className="trigger-table br-8">
                    <thead>
                        <tr>
                            <th>EXECUTED ON</th>
                            <th>TEST CASES</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(triggerList?.result?.result || []).map((triggerDetails) => (
                            <tr className="pointer hover-trigger" key={triggerDetails.triggerId}>
                                <Td to={`${url}/${triggerDetails.triggerId}`} className="flex left cn-9 dc__no-decor">
                                    {moment(triggerDetails?.createdOn).format('ddd, DD MMM YYYY, HH:mma')}
                                    <DropdownIcon
                                        className="hover-only rotate"
                                        style={{ ['--rotateBy' as any]: '-90deg' }}
                                    />
                                </Td>
                                <Td to={`${url}/${triggerDetails.triggerId}`} className="cn-9 dc__no-decor">
                                    {triggerDetails.testCount}
                                </Td>
                                <Td to={`${url}/${triggerDetails.triggerId}`} className="cn-9 dc__no-decor">
                                    {[
                                        'disabledCount',
                                        'errorCount',
                                        'failureCount',
                                        'skippedCount',
                                        'unknownCount',
                                        'successCount',
                                    ].map((count) => (
                                        <span className={`count ${count}`} key={count}>
                                            {count === 'successCount'
                                                ? triggerDetails.testCount -
                                                  (triggerDetails.skippedCount +
                                                      triggerDetails.errorCount +
                                                      triggerDetails.failureCount +
                                                      triggerDetails.disabledCount +
                                                      triggerDetails.unknownCount)
                                                : triggerDetails[count] || 0}
                                        </span>
                                    ))}
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

interface TestsFilterOptions {
    testsuite: { id: number; name: string }[]
    package: { id: number; name: string }[]
    classname: { id: number; name: string }[]
    method: { id: number; name: string }[]
}

const TestsFilter: React.FC<{ component }> = ({ component: Component }) => {
    const [selectionState, setSelectionState] = useState<'type' | 'name'>('type')
    const [selectedType, setSelectedType] = useState<'testsuite' | 'package' | 'classname' | 'method'>(null)
    const [selectedNames, setSelectedNames] = useState<SelectedNames>({
        testsuite: [],
        package: [],
        classname: [],
        method: [],
    })
    const params = useParams<{ appId: string; pipelineId?: string }>()
    const [loading, result, error, reload] = useAsync(
        () => getFilters(params.pipelineId),
        [params.appId, params.pipelineId],
        !!params.pipelineId,
    )
    const typeOptions = [
        { label: 'Test Suite:', value: 'testsuite' },
        { label: 'Package:', value: 'package' },
        { label: 'Classname:', value: 'classname' },
        { label: 'Method:', value: 'method' },
    ]

    const availableOptions: TestsFilterOptions = useMemo(() => {
        const { testsuite, packageName } = (result?.result?.testsuite || []).reduce(
            (agg, curr, idx) => {
                if (curr.name) {
                    agg.testsuite.push(curr.name)
                }
                if (curr.package) {
                    agg.packageName.push(curr.package)
                }
                return agg
            },
            { testsuite: [], packageName: [] },
        )

        const { classname, method } = (result?.result?.testcases || [])
            .filter((testcase) => !!testcase.name || !!testcase.classname)
            .reduce(
                (agg, curr) => {
                    if (curr.classname) {
                        agg.classname.push(curr.classname)
                    }
                    if (curr.name) {
                        agg.method.push(curr.name)
                    }
                    return agg
                },
                { classname: [], method: [] },
            )
        return { testsuite, package: packageName, classname, method }
    }, [result])

    function handleChange(selected, change) {
        const { action, name, option } = change
        if (action === ReactSelectInputAction.selectOption && name === 'type') {
            setSelectedType(option?.value)
            setSelectionState('name')
        } else if (action === ReactSelectInputAction.removeValue) {
            const {
                removedValue: { label, value, type },
            } = change
            setSelectedNames((selectedNames) => ({
                ...selectedNames,
                [type]: selectedNames[type].filter((name) => name !== value),
            }))
        } else {
            setSelectedNames((selectedNames) => {
                return {
                    ...selectedNames,
                    [selectedType]: (selected || []).filter((s) => s.type === selectedType).map((s) => s.value),
                }
            })
        }
    }

    function handleClose() {
        setSelectedType(null)
        setSelectionState('type')
    }

    const { options, value } = useMemo(() => {
        const availableOptionsSelect = selectedType
            ? Array.from(new Set(availableOptions[selectedType] || [])).map((t) => ({
                  value: t,
                  label: `${selectedType}: ${t}`,
                  type: selectedType,
              }))
            : []

        const namesValue: any[] = Object.entries(selectedNames).reduce((agg, curr) => {
            const [category, names] = curr
            return [...agg, ...names.map((name) => ({ label: `${category}: ${name}`, value: name, type: category }))]
        }, [])
        return {
            options: selectionState === 'type' ? [...typeOptions, ...namesValue] : availableOptionsSelect,
            value: namesValue,
        }
    }, [selectionState, selectedType, availableOptions, selectedNames])

    return (
        <>
            <Select
                options={options}
                components={{
                    Menu: (props) => (
                        <CustomFilterMenu props={props} title={selectionState === 'type' ? 'FILTER BY' : 'VALUES'} />
                    ),
                    Option,
                }}
                onChange={handleChange}
                closeMenuOnSelect={false}
                onMenuClose={handleClose}
                value={value}
                name={selectionState}
                isMulti
                styles={{
                    ...multiSelectStyles,
                    multiValue: (base) => ({
                        ...base,
                        border: `1px solid var(--N200)`,
                        borderRadius: `4px`,
                        background: 'white',
                        height: '30px',
                        margin: '0 8px 0 0',
                        padding: '1px',
                    }),
                }}
            />
            <Component selectedNames={selectedNames} />
        </>
    )
}

const CustomFilterMenu = ({ title, props }) => {
    return (
        <components.Menu {...props}>
            <>
                <span style={{ height: '32px' }} className="fs-12 fw-6 cn-4 flex left w-100 ml-12">
                    {title}
                </span>
                {props.children}
            </>
        </components.Menu>
    )
}
