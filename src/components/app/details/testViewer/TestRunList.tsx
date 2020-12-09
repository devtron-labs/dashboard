import React, {useState, useMemo} from 'react'
import {useAsync, Progressing, multiSelectStyles, mapByKey, Td, DropdownIcon, Option, noop, DatePicker, RadioGroup} from '../../../common'
import {useParams, useRouteMatch, generatePath, useHistory, Route, Switch} from 'react-router'
import {getCIPipelines } from '../../service'
import Select, {components} from 'react-select';
import {getTriggerList, getFilters} from './service'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {ReactComponent as EmptyTests} from '../../../../assets/img/ic-empty-tests.svg';
import filterIcon from '../../../../assets/icons/ic-filter.svg';
import noreports from '../../../../assets/img/app-not-deployed.png';
import {SelectedNames} from './Test.types'
import './TestRunDetails.scss'
import { TestRunDetails } from './TestRunDetails'
import moment from 'moment'

export default function TestRunList(){
    const params=useParams<{appId: string, pipelineId?: string}>()
    const {url, path} = useRouteMatch()
    const [ciPipelinesLoading, ciPipelinesResult, error, reload] = useAsync(()=>getCIPipelines(params.appId), [params.appId])
    const [dates, setDates] = useState({
        startDate: moment().set({ hour: 0, minute: 0, seconds: 0 }).subtract(1, 'months'),
        endDate: moment().add(1, 'days'),
    });
    const [focusedDate, setFocusedDate] = useState(null)
    
    if(ciPipelinesLoading) return <div className="w-100" style={{height:'100%'}}><Progressing pageLoader/></div>
    if(!ciPipelinesLoading && (!ciPipelinesResult?.result || ciPipelinesResult?.result?.length === 0)){
        return (
            <TestsPlaceholder 
                subtitle="Reports for executed test cases will be available here"/>
        );
    }

    function handleDatesChange({startDate, endDate}){
        setDates({startDate, endDate})
    }
    return (
        <div style={{ padding: '16px 24px', overflowY: 'auto' }}>
            <Switch>
                <Route
                    path={`${path
                        .replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')
                        .replace(':triggerId(\\d+)?', ':triggerId(\\d+)')}`}
                >   
                    {/* Dirty fix for now. Unnecessarily passing startDate and endDate here */}
                    <TestsFilter 
                        component={TestRunDetails}/>
                </Route>
                <Route path={`${path.replace(':pipelineId(\\d+)?', ':pipelineId(\\d+)')}`}>
                    <div className="flex mb-16" style={{ justifyContent: 'space-between' }}>
                        <CISelector pipelines={ciPipelinesResult?.result || []} />
                        {/* TODO Remove this when no reports are available */}
                        <DatePicker
                            startDate={dates.startDate}
                            endDate={dates.endDate}
                            focusedInput={focusedDate}
                            handleDatesChange={handleDatesChange}
                            handleFocusChange={(focused)=>setFocusedDate(focused)}
                        />
                    </div>
                    <TestsFilter 
                        component={TriggerList}
                        startDate={dates.startDate} 
                        endDate={dates.endDate}
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
    );
}

const CISelector:React.FC<{pipelines: any[]}>=({pipelines})=>{
    const params = useParams<{pipelineId: string}>()
    const history = useHistory()
    const ciPipelinesMap = mapByKey(pipelines, 'id');
    const ciPipelineName = ciPipelinesMap.has(+params.pipelineId) ? ciPipelinesMap.get(+params.pipelineId)?.name : null;
    const {url, path} = useRouteMatch()
    
    return (
        <div className="flexbox">
            <div className="pipeline-text">CI Pipeline</div>
            <div style={{ width: '150px' }}>
                <Select
                    value={params.pipelineId ? { value: +params.pipelineId, label: ciPipelineName } : null}
                    styles={multiSelectStyles}
                    placeholder="Select pipeline"
                    options={pipelines?.map((pipeline) => ({
                        value: pipeline.id,
                        label: pipeline.name,
                    }))}
                    onChange={(selected) => {
                        history.push(generatePath(path, { ...params, pipelineId: (selected as any).value }));
                    }}
                />
            </div>
        </div>
    );
}

function NoReports() {
    return <img src={noreports} className="no-reports-img"/>
}

function TestsPlaceholder({title="Test Reports", subtitle="", img=<EmptyTests/>}){
    return(
        <div className="w-100 flex column" style={{ height: '100%' }}>
            {img}
            <div className="fs-16 fw-6 cn-9">{title}</div>
            <p className="fs-12 cn-7" style={{width:'250px', textAlign:'center'}}>{subtitle}</p>
        </div>
    )
}

const TriggerList: React.FC<{selectedNames: SelectedNames, startDate, endDate}> = ({ selectedNames, startDate, endDate }) => {
    const params = useParams<{ appId: string; pipelineId: string }>();
    const chartTypeConstants = {
        relativeChart: "relativeChart",
        absoluteChart: "absoluteChart"
    }
    const [chartType, setChartType] = useState<string>(chartTypeConstants.absoluteChart);
    const { url, path } = useRouteMatch();
    const [triggerListLoading, triggerList, error, reload] = useAsync(
        () =>
            getTriggerList(
                params.appId,
                params.pipelineId,
                selectedNames,
                startDate.format('YYYY-MM-DD'),
                endDate.format('YYYY-MM-DD'),
            ),
        [params.pipelineId, selectedNames, startDate, endDate],
    );
    const absoluteChartData = (triggerList?.result?.result || []).map((triggerDetail) => {
        const {
            skippedCount,
            errorCount,
            failureCount,
            disabledCount,
            unknownCount,
            testCount,
            createdOn,
        } = triggerDetail;
        return {
            Skipped: skippedCount,
            Error: errorCount,
            Failure: failureCount,
            Disabled: disabledCount,
            Unknown: unknownCount,
            date: createdOn,
            Success: testCount - (skippedCount + errorCount + failureCount + disabledCount + unknownCount),
        };
    });

    const relativeChartData = [];
    function getRelativeCountValues (individualCountValue: number, Total: number) {
        return `${((individualCountValue/Total) * 100).toFixed(2)}`
    }
    function getTotalPercentageExceptSuccess(testsCountData) {
        const keys = Object.keys(testsCountData);
        let totalPercentage = 0;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] !== 'date') {
                totalPercentage += Number(testsCountData[keys[i]]);
            }
            
        }
        return totalPercentage;
    }
    if (triggerList && triggerList.result && triggerList.result.result) {
        for (let i = 0; i < triggerList.result.result.length; i++) {
            const testsCountData = {
                Skipped: getRelativeCountValues(triggerList.result.result[i].skippedCount, triggerList.result.result[i].testCount),
                Error: getRelativeCountValues(triggerList.result.result[i].errorCount, triggerList.result.result[i].testCount),
                Failure: getRelativeCountValues(triggerList.result.result[i].failureCount, triggerList.result.result[i].testCount),
                Disabled: getRelativeCountValues(triggerList.result.result[i].disabledCount, triggerList.result.result[i].testCount),
                Unknown: getRelativeCountValues(triggerList.result.result[i].skippedCount, triggerList.result.result[i].testCount),
                Success: "0",
                date: triggerList.result.result[i].createdOn,
            }
            const totalPercentageExceptSuccess = getTotalPercentageExceptSuccess(testsCountData)
            testsCountData.Success = (100 - totalPercentageExceptSuccess).toFixed(2);
            relativeChartData.push(testsCountData)
        }
    }
    function changeChartType(e: React.ChangeEvent<HTMLInputElement>) {
        setChartType(e.target.value);
    }
    function CustomTickRelativeChart(props) {
        return (
            <g transform={`translate(${props.x},${props.y})`}>
                <text textAnchor="end" fontSize={12}>{props.payload.value}%</text>
            </g>
        )
    }

    const colorMap = {
        Skipped: '#d0d4d9',
        Error: '#f6573b',
        Failure: '#ff9800',
        Disabled: '#58508d',
        Unknown: '#ff9800',
        Success: '#00be61',
    };
    const CustomTooltipAbsolute = (props?) => {
        if (props?.payload.length > 0) {
            const executionDate = props.payload[0].payload.date;
            if (props.active) {
            return (
                <div className="custom-tooltip-chart">
                    <div className="custom-tooltip-chart-date">
                        {moment(executionDate).format('ddd, DD MMM YYYY, HH:mma')}
                    </div>
                    <div className="custom-tooltip-chart-line"></div>
                    {Object.keys(props.payload[0].payload).map(testType => 
                        ( testType !== 'date' ?
                            <div className="custom-tooltip-chart-main">
                                <div>{testType}</div>
                                <div>{props.payload[0].payload[testType]}</div>
                            </div>
                            : null
                        )
                    )}
                </div>
                );
            }
        }
        return null;
    };

    const CustomTooltipRelative = (props?) => {
        if (props?.payload.length > 0) {
            const executionDate = props.payload[0].payload.date;
            if (props.active) {
            return (
                <div className="custom-tooltip-chart">
                    <div className="custom-tooltip-chart-date">
                        {moment(executionDate).format('ddd, DD MMM YYYY, HH:mma')}
                    </div>
                    <div className="custom-tooltip-chart-line"></div>
                    {Object.keys(props.payload[0].payload).map(testType => 
                        ( testType !== 'date' ?
                        <div className="custom-tooltip-chart-main">
                            <div>{testType}</div>
                            <div>{props.payload[0].payload[testType]}%</div>
                        </div>
                        : null
                    )
                    )}
                </div>
                );
            }
        }
        return null;
    };

    if (triggerListLoading) {
        return (
            <div className="w-100 flex" style={{ height: '100%' }}>
                <Progressing pageLoader />
            </div>
        );
    }

    if (!triggerList?.result || triggerList?.result?.result?.length === 0) {
        return (
            <div className="w-100 flex" style={{ height: '100%' }}>
                <TestsPlaceholder
                    title="No reports available"
                    subtitle="No tests have been executed for this pipeline."
                    img={NoReports()}
                />
            </div>
        );
    }
    return (
        <>
            <div className="mt-24 w-100 flex left column pt-16 pl-24 pb-16 pr-24 bcn-0 br-8 en-2 bw-1">
                <div className="flexbox flex-justify mb-24" style={{width: "100%"}}>
                    <span className="fs-14 cn-9 fw-6">Last 30 executions</span>
                    <RadioGroup 
                        name="yaml-mode" 
                        initialTab={chartTypeConstants.absoluteChart} 
                        disabled={false} 
                        className="gui-yaml-switch"
                        onChange={changeChartType}>
                        <RadioGroup.Radio value={chartTypeConstants.absoluteChart}>Absolute</RadioGroup.Radio>
                        <RadioGroup.Radio value={chartTypeConstants.relativeChart}>Relative</RadioGroup.Radio>
                    </RadioGroup>
                </div>
                <div className="w-100" style={{ height: '300px' }}>
                    {chartType === chartTypeConstants.absoluteChart ? 
                        <ResponsiveContainer>
                            <BarChart data={absoluteChartData} barSize={10}>
                                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                                <YAxis />
                                {/* <XAxis dataKey="date" /> */}
                                <Tooltip content={<CustomTooltipAbsolute />} />
                                <Legend />
                                {Object.entries(colorMap).map(([dataKey, fill]) => (
                                    <Bar key={dataKey} dataKey={dataKey} fill={fill} stackId="a" />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    : 
                        <ResponsiveContainer>
                            <BarChart data={relativeChartData} barSize={10}>
                                <YAxis 
                                    domain={[0,100]} 
                                    tickCount={6} 
                                    tick={<CustomTickRelativeChart/>}/>
                                <Tooltip content={<CustomTooltipRelative />}/>
                                <Legend />
                                {Object.entries(colorMap).map(([dataKey, fill]) => (
                                    <Bar key={dataKey} dataKey={dataKey} fill={fill} stackId="a" />
                                ))}
                            </BarChart>
                        </ResponsiveContainer> 
                    }
                    
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
                                <Td to={`${url}/${triggerDetails.triggerId}`} className="flex left cn-9 no-decor">
                                    {moment(triggerDetails?.createdOn).format('ddd, DD MMM YYYY, HH:mma')}
                                    <DropdownIcon
                                        className="hover-only rotate"
                                        style={{ ['--rotateBy' as any]: '-90deg' }}
                                    />
                                </Td>
                                <Td to={`${url}/${triggerDetails.triggerId}`} className="cn-9 no-decor">
                                    {triggerDetails.testCount}
                                </Td>
                                <Td to={`${url}/${triggerDetails.triggerId}`} className="cn-9 no-decor">
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
    );
};

interface TestsFilterOptions{
    testsuite: {id: number, name: string}[],
    package: {id: number, name: string}[],
    classname: {id: number, name: string}[],
    method: {id: number, name: string}[]
}

const TestsFilter:React.FC<{component, startDate?, endDate?}>=({component:Component, startDate, endDate})=>{
    const [selectionState, setSelectionState] = useState<'type' | 'name'>('type')
    const [selectedType, setSelectedType] = useState<'testsuite' | 'package' | 'classname' | 'method'>(null)
    const [selectedNames, setSelectedNames] = useState<SelectedNames>(
        {
            testsuite: [], 
            package: [],
            classname: [],
            method: []
        }
    )
    const params = useParams<{appId: string, pipelineId?: string}>()
    const [loading, result, error, reload] = useAsync(()=>getFilters(params.appId, params.pipelineId), [params.appId, params.pipelineId], !!params.pipelineId)
    const typeOptions = [
        { label: 'Test Suite:', value: 'testsuite'},
        { label: 'Package:', value: 'package'},
        { label: 'Classname:', value: 'classname'},
        { label: 'Method:', value: 'method'},
    ];

    const availableOptions: TestsFilterOptions = useMemo(()=>{
        const { testsuite, packageName } = (result?.result?.testsuite || []).reduce(
            (agg, curr, idx) => {
                if (curr.name) agg.testsuite.push(curr.name);
                if (curr.package) agg.packageName.push(curr.package);
                return agg;
            },
            { testsuite: [], packageName: [] },
        );

        const { classname, method } = (result?.result?.testcases || [])
            .filter((testcase) => !!testcase.name || !!testcase.classname)
            .reduce(
                (agg, curr) => {
                    if (curr.classname) {
                        agg.classname.push(curr.classname);
                    }
                    if (curr.name) {
                        agg.method.push(curr.name);
                    }
                    return agg;
                },
                { classname: [], method: [] },
            );
        return {testsuite, package: packageName, classname, method}

    }, [result])

    function getPlaceholder() {
        return (
            <div className="flex left">
                <img src={filterIcon} className="icon-dim-16 mr-8"/>
                <span className="placeholder-text-filter">Filter by test suite, packages, classname and methods</span>
            </div>
        )
    }
    

    function handleChange(selected, change){
        const {action, name, option} = change
        if(action === "select-option" && name === "type"){
            setSelectedType(option?.value)
            setSelectionState('name')
        }
        else if(action === 'remove-value'){
            const {removedValue: {label, value, type}} = change
            setSelectedNames(selectedNames=>({...selectedNames, [type]:selectedNames[type].filter(name=>name!==value)}))
        }
        else{
            setSelectedNames(selectedNames=>{
                return {...selectedNames, [selectedType]: (selected || []).filter(s=>s.type === selectedType).map(s=>s.value)}
            })
        }
    }

    function handleClose(){
        setSelectedType(null)
        setSelectionState('type')
    }
    


    const {options, value }  = useMemo(()=>{
        const availableOptionsSelect = selectedType
            ? Array.from(new Set(availableOptions[selectedType] || [])).map((t) => ({
                  value: t,
                  label: `${selectedType}: ${t}`,
                  type: selectedType,
              }))
            : [];
        
        const namesValue: any[] = Object.entries(selectedNames).reduce((agg, curr) => {
            const [category, names] = curr;
            return [...agg, ...names.map((name) => ({ label: `${category}: ${name}`, value: name, type: category }))];
        }, []);
        return {options: selectionState === 'type' ? [...typeOptions, ...namesValue] : availableOptionsSelect, value: namesValue}
    },[selectionState, selectedType, availableOptions, selectedNames])

    return (
        <>
            {/* TODO remove this when no reports are available */}
            <Select
                placeholder={getPlaceholder()}
                options={options}
                components={{
                    Menu: (props) => (
                        <CustomFilterMenu props={props} title={selectionState === 'type' ? 'FILTER BY' : 'VALUES'} />
                    ),
                    Option
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
            <Component 
                selectedNames={selectedNames}
                startDate={startDate ? startDate : undefined} 
                endDate={endDate ? endDate: undefined}/>
        </>
    );
}

const CustomFilterMenu = ({title, props})=>{
    return (
        <>
            <components.Menu {...props}>
                <>
                <span style={{ height: '32px' }} className="fs-12 fw-6 cn-4 flex left w-100 ml-12">
                    {title}
                </span>
                {props.children}
                </>
            </components.Menu>
        </>
    );
}
