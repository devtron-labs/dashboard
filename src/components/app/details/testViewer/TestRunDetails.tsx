import React, { useState, useEffect, useMemo } from 'react';
import { useAsync, Drawer, Progressing, useDebouncedEffect, useThrottledEffect } from '../../../common/';
import { useParams } from 'react-router';
import './TestRunDetails.scss';
import List from './List';
import { ReactComponent as Folder } from '../../../../assets/icons/ic-folder.svg';
import { ReactComponent as SuccessIcon } from '../../../../assets/icons/ic-success.svg';
import { ReactComponent as SkipIcon } from '../../../../assets/icons/ic-skip.svg';
import { ReactComponent as WarnIcon } from '../../../../assets/icons/ic-warning.svg';
import { ReactComponent as ErrorIcon } from '../../../../assets/icons/misc/errorInfo.svg';
import { ReactComponent as Briefcase } from '../../../../assets/icons/ic-briefcase.svg';
import { ReactComponent as FileIcon } from '../../../../assets/icons/ic-file.svg';
import { ReactComponent as Cross } from '../../../../assets/icons/ic-close.svg';
import { ReactComponent as Question } from '../../../../assets/icons/ic-question.svg';
import { getTestSuites, getTestCase, getSuiteDetail } from './service';
import { PieChart, Pie, Cell } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {SelectedNames} from './Test.types'
import { getBinWiseArrayData } from "./testRunDetails.util";


export const TestRunDetails:React.FC<{selectedNames: SelectedNames}>=({selectedNames})=>{
    const params = useParams<{ appId: string; pipelineId: string; triggerId: string }>();
    const [testSuiteIds, setTestSuiteIds] = useState<{
        testSuitesId: number;
        testSuiteId: number;
        testcaseId?: number;
        tab: 'properties' | 'system-output' | 'system-error' | 'testcase' | '';
    }>({ testSuitesId: 0, testSuiteId: 0, tab: '' });

    const [loading, result, error, reload] = useAsync(() => getTestSuites(params.appId, params.pipelineId, params.triggerId, selectedNames), [
        params,
    ]);

    useDebouncedEffect(reload, 2000, [selectedNames])


    const { statusAggregation, timeAggregation } = useMemo(() => {
        const testcases = result?.result?.result?.testsuites?.reduce((agg, curr) => {
            return [
                ...agg,
                ...curr?.testsuite.reduce((agg2, curr2) => {
                    return [...agg2, ...curr2.testcases];
                }, []),
            ];
        }, []);
        const initStatusAggregation = {
            testCount: 0,
            disabledCount: 0,
            errorCount: 0,
            failureCount: 0,
            skippedCount: 0,
            unknownCount: 0,
        };
        const timeAggregation = testcases?.reduce((agg, testcase) => {
            const { time } = testcase;
            if (time) {
                if (agg[time]) {
                    agg[time] += 1;
                } else {
                    agg[time] = 1;
                }
            }
            return agg;
        }, {});
        const statusAggregation = result?.result?.result?.testsuites?.reduce((agg, curr) => {
            const { testCount, disabledCount, errorCount, failureCount, skippedCount, unknownCount } = curr;
            agg['testCount'] += testCount || 0;
            agg['disabledCount'] += disabledCount || 0;
            agg['errorCount'] += errorCount || 0;
            agg['failureCount'] += failureCount || 0;
            agg['skippedCount'] += skippedCount || 0;
            agg['unknownCount'] += unknownCount || 0;
            return agg;
        }, initStatusAggregation);
        return { timeAggregation, statusAggregation };
    }, [result]);

    function showDrawer(testSuitesId:number, testSuiteId:number, tab: 'properties' | 'system-output' | 'system-error' | 'testcase', testcaseId?: number){
        setTestSuiteIds({testSuitesId, testSuiteId, testcaseId, tab})
    }

    function hideDrawer(){
        setTestSuiteIds({testSuitesId: 0, testcaseId: 0, testSuiteId: 0, tab: ''})
    }
    if(loading) return <div className="w-100" style={{height:'100%'}}><Progressing pageLoader/></div>
    return (
        <>
            <div className="app-details test-details mt-16">
                <div style={{display:'grid', gridTemplateColumns:'502px 1fr', gridColumnGap:'16px'}}>
                    <TestsChart {...statusAggregation} />
                    {timeAggregation && <TestsDuration timeAggregation={timeAggregation} />}
                </div>
                <div className="executed-tests">Executed test cases ({result?.result?.result?.testCount})</div>
                {result?.result?.result?.testsuites?.map((testSuitesData) => (
                    <TestSuites key={testSuitesData.id} {...testSuitesData} showDrawer={showDrawer} />
                ))}
            </div>
            {!!testSuiteIds.testSuitesId && !!testSuiteIds.testSuiteId && (
                <Drawer position="right" width="800px" onClose={hideDrawer}>
                    {testSuiteIds.tab === 'properties' &&  <Properties {...testSuiteIds} hideDrawer={hideDrawer} appId={params.appId}/>}
                    {testSuiteIds.tab === 'system-output' &&  <SystemOutput {...testSuiteIds} hideDrawer={hideDrawer} appId={params.appId}/>}
                    {testSuiteIds.tab === 'system-error' &&  <SystemError {...testSuiteIds} hideDrawer={hideDrawer} appId={params.appId}/>}
                    {testSuiteIds.tab === 'testcase' &&  <TestCaseStatus {...testSuiteIds} hideDrawer={hideDrawer} appId={params.appId} />}
                </Drawer>
            )}
        </>
    );
}
const TestSuites: React.FC<{
    name: string;
    testsuite: any;
    time: number;
    id: number;
    testCount: number;
    disabledCount: number;
    errorCount: number;
    failureCount: number;
    skippedCount: number;
    unknownCount: number;
    showDrawer(
        testSuitesId: number,
        testSuiteId: number,
        tab: 'properties' | 'system-output' | 'system-error' | 'testcase',
        testcaseId?: number,
    ):any;
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
    showDrawer
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
                    {testsuite?.map((testsuiteData) => 
                        (<TestSuite 
                            showDrawer={showDrawer} 
                            testsuitesId={testsuitesId} 
                            key={testsuiteData.id} 
                            data={testsuiteData} 
                        />))
                    }
                </div>
            </List.Detail>
        </List>
    );
};

const TestSuite: React.FC<{
    data: any;
    testsuitesId: number;
    showDrawer(
        testSuitesId: number,
        testSuiteId: number,
        tab: 'properties' | 'system-output' | 'system-error' | 'testcase',
        testcaseId?: number,
    ): any;
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
    } = data;
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
                                            e.stopPropagation();
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
                                            e.stopPropagation();
                                            showDrawer(testsuitesId, testsuiteId, 'system-output');
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
                                            e.stopPropagation();
                                            showDrawer(testsuitesId, testsuiteId, 'system-error');
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
                                e.stopPropagation();
                                showDrawer(testsuitesId, testsuiteId, 'testcase', testcase.id);
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
    );
};
function Properties({testSuiteId, testSuitesId, hideDrawer, appId}) {
    const [loading, result, error, reload] = useAsync(() => getSuiteDetail(Number(appId), Number(testSuitesId), Number(testSuiteId)), [
        testSuiteId,
    ]);

    function handleClose(e) {
       hideDrawer()
    }
    if (loading) {
        return <Progressing pageLoader />;
    }
    return (
        <div className="testcase--detail" style={{ width: '800px', background: 'white', height: '100%' }}>
            {loading ? <Progressing pageLoader />
            :
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
            </>}
        </div>
    );
}

function SystemOutput({ testSuiteId, testSuitesId, hideDrawer, appId}) {
    const [loading, result, error, reload] = useAsync(() => getSuiteDetail(Number(appId), Number(testSuitesId), Number(testSuiteId)), [
        testSuiteId,
    ]);
    function handleClose(e) {
        hideDrawer()
    }
    return (
        <div className="testcase--detail testsuite" style={{ width: '800px', background: 'white', height: '100%' }}>
            {loading ? <Progressing pageLoader />
            :
            <>
            <div className="testcase--title">
                <h1>System Output</h1>
                <Cross className="pointer" onClick={handleClose} style={{ marginLeft: 'auto' }} />
            </div>
            <div className="testsuite-detail--body">
                {result?.result?.systemOut && <samp className="console">{result.result.systemOut}</samp>}
            </div>
            </>}
        </div>
    );
}

function SystemError({ testSuiteId, testSuitesId, hideDrawer, appId}) {
    const [loading, result, error, reload] = useAsync(() => getSuiteDetail(Number(appId), Number(testSuitesId), Number(testSuiteId)), [
        testSuiteId,
    ]);
    function handleClose(e) {
        hideDrawer()
    }
    return (
        <div className="testcase--detail testsuite" style={{ width: '800px', background: 'white', height: '100%' }}>
            {loading ? <Progressing pageLoader />
            :
            <>
                <div className="testcase--title">
                    <h1>System Error</h1>
                    <Cross className="pointer" onClick={handleClose} style={{ marginLeft: 'auto' }} />
                </div>
                <div className="testsuite-detail--body">
                    {result?.result?.result?.systemError && <samp className="error">{result?.result.result.systemError}</samp>}
                </div>
            </>}
        </div>
    );
}

function StatusIcon({ status, width = '24', height = '24' }) {
    switch (status?.toLowerCase()) {
        case 'success':
        case 'passed':
            return <SuccessIcon width={width} height={height} />;
        case 'failure':
        case 'failed':
            return <ErrorIcon width={width} height={height} />;
        case 'error':
        case 'errors':
            return <WarnIcon width={width} height={height} />;
        case 'unknown':
            return <Question width={width} height={height} />;
        default:
            return <SkipIcon width={width} height={height} />;
    }
}

function TestStats({ testCount, disabledCount, errorCount, failureCount, skippedCount, unknownCount }) {
    const statusMap = {
        testCount: 'tests',
        disabledCount: 'disabled',
        errorCount: 'errors',
        failureCount: 'failed',
        skippedCount: 'skipped',
        unknownCount: 'unknown',
    };
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
    );
}

function TestCaseStatus({ testcaseId=0, testSuitesId, testSuiteId, hideDrawer, appId }) {
    const [testCaseDetail, setTestCaseDetail] = useState(null);
    const [loading, result, error, reload] = useAsync(() => getTestCase(Number(appId), Number(testcaseId)), [testcaseId]);
    function handleClose(e) {
        hideDrawer()
    }
    useEffect(() => {
        if (loading) return;
        if (result?.result?.result) setTestCaseDetail(result.result?.result);
    }, [loading]);

    return (
        <div className="testcase--detail" style={{ width: '800px', background: 'white', height: '100%' }}>
            {loading ? <Progressing pageLoader />
            :
            <>
            <div className="testcase--title">
                <span className={`status testcase-status ${testCaseDetail?.status || ''}`}>
                    {testCaseDetail?.status}
                </span>
                <h1 className="ellipsis-right">{testCaseDetail?.name || 'unnamed'}</h1>
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
                {testCaseDetail?.errors?.map((error) => (
                    <MessageTypeViewer {...error} nodeType="Error" />
                ))}
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
            </>}
        </div>
    );
}

function MessageTypeViewer({ nodeType, message = null, type = null, text }) {
    return (
        <section>
            <span className="node-type-heading">{nodeType}</span>
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
    );
}

function TestsChart({ testCount, disabledCount, errorCount, failureCount, skippedCount, unknownCount }) {
    const passedCount = testCount - disabledCount - errorCount - failureCount - skippedCount - unknownCount;
    const data = [
        { label: 'disabled', value: disabledCount },
        { label: 'error', value: errorCount },
        { label: 'failures', value: failureCount },
        { label: 'skipped', value: skippedCount },
        { label: 'unknown', value: unknownCount },
        { label: 'passed', value: passedCount },
    ];

    const colorMap = {
        skipped: '#d0d4d9',
        error: '#f6573b',
        failures: '#ff9800',
        disabled: '#58508d',
        unknown: '#ff9800',
        passed: '#00be61',
    };

    const passPercentage = passedCount * 100 / testCount

    const CustomTooltip = (props?) => {
        if (props?.payload.length > 0) {
            if (props.active) {
                return <div className="custom-tooltip-chart" style={{'width': 'auto'}}>
                    <div className="custom-tooltip-chart-main">
                        {((props.payload[0].payload.value / testCount) * 100).toFixed(2)} % {props.payload[0].payload.payload.label}
                    </div>
                </div>
            }
        }
        return null;
    }

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
                        gridRowGap:'12px',
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
                            ></div>
                            {label} <span className="fw-6 ml-6">{value}</span>
                        </span>
                    ))}
                </div>
            </div>

            <PieChart width={260} height={260}>
                <Pie
                    data={data}
                    cx={130}
                    cy={130}
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorMap[entry.label]} />
                    ))}
                </Pie>
                    <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </div>
    );
}

const TestsDuration: React.FC<{ timeAggregation: any }> = ({ timeAggregation }) => {
    function calculateHistogram(dist, numOfBins=10){
        let testTimeData = [];
        const uniqueTimeKeys = Object.keys(dist);
        for (let i = 0; i < uniqueTimeKeys.length; i++) {
            // create an array with values filled equal to the times the key is repeated
            const dataToConcat = Array(dist[uniqueTimeKeys[i]]).fill(uniqueTimeKeys[i]);
            testTimeData = testTimeData.concat(dataToConcat);
        }
        testTimeData.sort((a,b) => a - b);
        const binWidth = testTimeData[testTimeData.length - 1] / 10;
        const binWiseArrayData = getBinWiseArrayData(testTimeData, numOfBins, binWidth);
        const chartData = [];
        for (let i = 0; i < binWiseArrayData.length; i++) {
            chartData.push({
                'number of tests':  binWiseArrayData[i],
                'time spent': `${Number((i * binWidth).toFixed(2))}ms - ${Number(((i + 1) * binWidth).toFixed(2))}ms`
            })
        }
        return {
            chartData,
            testCases: uniqueTimeKeys.length,
        };
    }
    const CustomTooltip = (props?) => {
        if (props?.payload.length > 0) {
            if (props.active) {
                return <div className="custom-tooltip-chart" style={{'width': 'auto'}}>
                    <div className="custom-tooltip-chart-main" style={{'display': 'block'}}>
                        <div>{props?.payload[0].payload["time spent"]}</div>
                        <div>{props?.payload[0].payload["number of tests"]} test cases</div>
                    </div>
                </div>
            }
        }
        return null;
    }
    const hist = useMemo(()=>calculateHistogram(timeAggregation), [timeAggregation]);

    return (
        <div className="w-100 bcn-0 br-8 en-2 bw-1 p-20" style={{ height: '300px' }}>
            <div className="execution-details-header">
                Execution duration for {hist.testCases} test cases
            </div>
            <ResponsiveContainer>
                <BarChart data={hist.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis allowDecimals={false}/>
                    <XAxis dataKey="time spent"/>
                    <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />}/>
                    <Bar radius={[4, 4, 0, 0]} dataKey={'number of tests'} fill={'var(--B500)'} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

