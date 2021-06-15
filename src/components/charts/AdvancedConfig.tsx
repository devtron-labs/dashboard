import React, { useState, useEffect, useMemo } from 'react'
import { Select, showError, mapByKey, Progressing, VisibleModal, useAsync, useKeyDown, Info, Pencil, useSize, sortCallback } from '../common'
import CodeEditor from '../CodeEditor/CodeEditor'
import { getEnvironmentListMin } from '../../services/service'
import { ChartGroupEntry, AdvancedConfigHelpers, ChartValuesNativeType, ChartVersionType } from './charts.types'
import { MarkDown } from './discoverChartDetail/DiscoverChartDetails'
import { getReadme, getChartValues } from './charts.service'
import { ValuesYamlConfirmDialog } from './dialogs/ValuesYamlConfirmDialog'
import { ReactComponent as LockIcon } from '../../assets/icons/ic-locked.svg'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-alert-triangle.svg';
import ManageValues from './modal/ManageValues'
import ReactSelect from 'react-select';
import { Option, multiSelectStyles } from '../common';
import { DropdownIndicator } from './charts.util';
import { useRouteMatch } from 'react-router'

interface AdvancedConfig extends AdvancedConfigHelpers {
    chart: ChartGroupEntry;
    index: number;
}

interface Environment {
    id: number;
    name: string;
    namespace: string;
    active: boolean;
    isClusterCdActive: boolean;

}
const AdvancedConfig: React.FC<AdvancedConfig> = ({ chart, index, fetchChartValues, getChartVersionsAndValues, handleEnvironmentChange, handleChartValueChange, handleChartVersionChange, handleValuesYaml, handleNameChange, discardValuesYamlChanges }) => {
    const { environment, loading, chartMetaData: { chartName }, valuesYaml, id, appStoreValuesChartVersion, appStoreApplicationVersionId, appStoreValuesVersionId, appStoreValuesVersionName, kind, name: appName, availableChartVersions, availableChartValues, appStoreApplicationVersion } = chart;
    // const [environments, setEnvironments] = useState(new Map())
    const [environments, setEnvironments] = useState([])
    const [environmentId, setEnvironmentId] = useState(0)
    const [showReadme, setReadme] = useState(false)
    const [showDiff, setDiff] = useState(false);
    const [chartValuesLoading, setChartValuesLoading] = useState(false)
    const [showValuesYamlDialog, toggleValuesYamlDialog] = useState(false);
    const [valuesYamlSelection, setValuesYamlSelection] = useState({ valuesId: appStoreApplicationVersionId, kind: kind });
    const [readmeLoading, readmeResult, error, reload] = useAsync(() => getReadme(appStoreApplicationVersionId), [appStoreApplicationVersionId])
    const [showManageValuesModal, toggleManagaValuesModal] = useState(false)
    const [namespace, setNamespace] = useState<string>("")

    useEffect(() => {
        async function getEnvironments() {
            try {
                let response = await getEnvironmentListMin();
                let envList = response.result ? response.result : [];
                envList = envList.map((env) => {
                    return {
                        value: env.id,
                        label: env.environment_name,
                        namespace: env.namespace || "",
                        active: false,
                        isClusterCdActive: env.isClusterCdActive,
                    }
                });
                envList = envList.sort((a, b) => sortCallback('label', a, b, true));
                setEnvironments(envList);
            }
            catch (err) {
                showError(err)
            }
        }
        getEnvironments()
    }, [])

    function handleChartVersionChangeAdvancedConfig(index, value) {
        if (chart.originalValuesYaml !== chart.valuesYaml) {
            toggleValuesYamlDialog(true);
        }
        else handleChartVersionChange(index, value);
    }

    function handleChartValueChangeAdvancedConfig(e) {
        const [kind, valuesId] = e.target.value.split("..");
        setValuesYamlSelection({ valuesId, kind });
        if (chart.originalValuesYaml !== chart.valuesYaml) {
            toggleValuesYamlDialog(true);
        }
        else {
            setValuesYamlSelection({ valuesId, kind });
            handleChartValueChange(index, kind, Number(valuesId));
        }
    }

    function discardValuesYamlChangesAdvancedConfig(e) {
        discardValuesYamlChanges(index);
        toggleValuesYamlDialog(false);
    }

    function copyValuesYamlToClipBoard(e) {
        let textarea = document.createElement("textarea");
        let main = document.getElementsByClassName("main")[0];
        main.appendChild(textarea)
        textarea.value = chart.valuesYaml;
        textarea.select();
        document.execCommand("copy");
        main.removeChild(textarea);
        toggleValuesYamlDialog(false);
        handleChartValueChange(index, valuesYamlSelection.kind, Number(valuesYamlSelection.valuesId));
    }

    async function handleDiff(e) {
        if (!chart.availableChartValues) {
            setChartValuesLoading(true)
            try {
                await fetchChartValues(chart.id, index)
                setDiff(true)
            }
            catch (err) {
                showError(err)
            }
            finally {
                setChartValuesLoading(false)
            }
        }
        else {
            setDiff(true)
        }
    }

    let selectedChartValue: ChartValuesNativeType = {
        id: appStoreValuesVersionId || appStoreApplicationVersionId,
        name: appStoreValuesVersionName || "Default",
        chartVersion: appStoreValuesChartVersion,
    };

    let selectedChartVersion: ChartVersionType = {
        id: appStoreApplicationVersionId,
        version: appStoreApplicationVersion
    };

    // NOTE: appStoreValuesVersionId does not exist in case of default chart value version.
    if (appStoreValuesVersionId && availableChartValues.length) {
        let values = availableChartValues?.find(({ kind: k }) => (kind === k))
        selectedChartValue = values.values?.find(({ id }) => (id === appStoreValuesVersionId));
    }

    if (availableChartVersions.length) {
        selectedChartVersion = availableChartVersions.find(({ id }) => (id === appStoreApplicationVersionId))
    }

    let availableChartValuesCopy = JSON.parse(JSON.stringify(availableChartValues || []))
    let chartValuesDropDown = availableChartValuesCopy.map((chartValuesObj) => {
        if (chartValuesObj.kind === "DEFAULT") {
            chartValuesObj.values = chartValuesObj.values.filter(e => e.id === chart.appStoreApplicationVersionId)
        }
        return chartValuesObj;
    })
    // chart group create flow, do not show deployed values
    if (!handleEnvironmentChange) {
        chartValuesDropDown = chartValuesDropDown.filter(arr => arr.kind !== "DEPLOYED");
    }

    //TODO: use default state for variables, so that you don't have to apply ?. before every object. 
    let warning: boolean = selectedChartValue.chartVersion !== selectedChartVersion.version;

    function selectEnvironment(selection: Environment): void {
        if (selection) {
            setEnvironmentId(selection.id);
            setNamespace(selection.namespace);
        }
        else {
            setEnvironmentId(0)
            setNamespace("")
        }
    }

    function renderEnvAndNamespace() {

        let selectedEnv: Environment = environments.find(env => env.value === environmentId);
        let namespaceEditable = false;

        return (<>
            <div className="flex column half left top">
                <label htmlFor="" className="form__label">Deploy to environment*</label>
                <ReactSelect className="fs-13 w-100 pt-1 pb-1"
                    closeMenuOnScroll={true}
                    placeholder="Select Environment"
                    options={environments}
                    value={selectedEnv}
                    isMulti={false}
                    onChange={(selected: any) => selectEnvironment(selected)}
                    components={{
                        IndicatorSeparator: null,
                        DropdownIndicator,
                        Option
                    }}
                    styles={{ ...multiSelectStyles }}
                />
                {environment?.error && <span className="form__error flex left "><WarningIcon className="mr-5" />{environment?.error || ""}</span>}
            </div>
            <div className="flex column half left top">
                <label htmlFor="" className="form__label">Namespace*</label>
                <input className="form__input" autoComplete="off" placeholder="Namespace" type="text"
                    disabled={!namespaceEditable}
                    value={selectedEnv && selectedEnv.namespace ? selectedEnv.namespace : namespace}
                    onChange={(event) => {
                        setNamespace(event.target.value)
                    }} />
            </div> </>)
    }
    return (
        <>
            <div className="advanced-config flex">
                <form action="" className="advanced-config__form">
                    <h1 className="form__title form__title--mb-24">{chartName}</h1>
                    {handleNameChange && <div className="flex column left top mb-16">
                        <label htmlFor="" className="form__label">App name*</label>
                        <input type="text" autoComplete="off" className={`form__input ${appName?.error ? 'form__input--error' : ''}`} value={appName.value} onChange={e => handleNameChange(index, e.target.value)} />
                        {appName?.error &&
                            <span className="form__error flex left">
                                <WarningIcon className="mr-5" />{appName?.error || ""}
                                {appName.suggestedName && <span>. Suggested name: <span className="anchor pointer" onClick={e => handleNameChange(index, appName.suggestedName)}>{appName.suggestedName}</span></span>}
                            </span>}
                    </div>}

                    {handleEnvironmentChange && <div className="flex top mb-16">
                        {renderEnvAndNamespace()}
                    </div>}

                    <div className="flex top mb-16">
                        <div className="flex column left top half">
                            <label htmlFor="" className="form__label">Chart version</label>
                            <Select rootClassName="select-button--default" value={appStoreApplicationVersionId} onChange={e => handleChartVersionChangeAdvancedConfig(index, e.target.value)}>
                                {!availableChartVersions?.length && <Select.Async api={() => getChartVersionsAndValues(chart.id, index)} />}
                                <Select.Button>{`v${selectedChartVersion.version}`}</Select.Button>
                                {availableChartVersions.map(({ id, version }) => <Select.Option key={id} value={id}>{version}</Select.Option>)}
                            </Select>
                        </div>

                        <div className="flex column left top half">
                            <label className="form__label form__label--manage-values">
                                <span>Values</span>
                                <button type="button" className="text-button p-0" onClick={(event) => {
                                    event.stopPropagation();
                                    toggleManagaValuesModal(!showManageValuesModal);
                                }}>Manage</button>
                            </label>
                            <Select onChange={handleChartValueChangeAdvancedConfig} value={`${kind}..${appStoreValuesVersionId}`}>
                                {!chartValuesDropDown?.length && <Select.Async api={() => getChartVersionsAndValues(chart.id, index)} />}
                                <Select.Button rootClassName="select-button--default">
                                    <span className="ml-5 select-button__selected-option ellipsis-right" style={{ "width": "100%" }}>
                                        {`${selectedChartValue.name} (v${selectedChartValue.chartVersion})`}
                                    </span>
                                </Select.Button>
                                {chartValuesDropDown?.map(({ kind, values }) => <Select.OptGroup key={kind} label={kind === 'TEMPLATE' ? 'CUSTOM' : kind}>
                                    {values?.map(({ chartVersion, id, name, environmentName }) => <Select.Option key={`${kind}..${id}`} value={`${kind}..${id}..${name}`}>
                                        <div className="flex left column">
                                            <span style={{ color: 'var(--N900)', fontSize: '14px' }}>{name} ({chartVersion})</span>
                                            {environmentName && <span style={{ color: '#404040', fontSize: '12px' }}>{environmentName}</span>}
                                        </div>

                                    </Select.Option>)}
                                    {(!values || values?.length === 0) && <div onClick={e => e.stopPropagation()} className="select__option-with-subtitle select__option-with-subtitle--empty-state">No Results</div>}
                                </Select.OptGroup>)}
                            </Select>
                        </div>
                    </div>
                    {!handleNameChange && <div className="tips">
                        {/* only chart group create and update flow */}
                        <Info className="tips__icon" />
                        <div className="column">
                            <b className="tips__title">Tips</b>
                            <ul className="tips__container">
                                <li className="tips__tip">Only default & custom values can be used in a chart group. Read how to create custom values.</li>
                                <li className="tips__tip">Selected values can be edited during deployment.</li>
                                <li className="tips__tip">You can select other deployed values during deployment.</li>
                            </ul>
                        </div>
                    </div>}
                    <div className="code-editor-container">
                        <CodeEditor
                            value={valuesYaml}
                            noParsing
                            loading={loading}
                            readOnly={!handleValuesYaml}
                            onChange={handleValuesYaml ? valuesYaml => { handleValuesYaml(index, valuesYaml) } : () => { }}
                            mode="yaml"
                        >
                            <CodeEditor.Header>
                                <div className="flex" style={{ justifyContent: 'space-between', width: '100%' }}>
                                    <span>{appName.value}.yaml</span>
                                    <div className="flex">
                                        {!handleValuesYaml && <LockIcon className="mr-5" />}
                                        {handleValuesYaml && <button className="cta small  cancel mr-16" type="button" onClick={handleDiff}>{chartValuesLoading ? <Progressing /> : 'Check diff'}</button>}
                                        <button className="cta small  cancel" type="button" onClick={e => setReadme(true)}>Readme</button>
                                    </div>
                                </div>
                            </CodeEditor.Header>
                            {warning ? <CodeEditor.Warning text="The values configuration was created for a different chart version. Review the diff before continuing." />
                                : null}
                        </CodeEditor>
                    </div>
                </form>
            </div>
            {showReadme && <VisibleModal className="">
                <ReadmeCharts
                    readme={readmeResult.result.readme}
                    valuesYaml={valuesYaml}
                    handleClose={e => setReadme(false)}
                    chart={chart}
                    onChange={handleValuesYaml ? valuesYaml => handleValuesYaml(index, valuesYaml) : null}
                />
            </VisibleModal>}
            {showDiff && <VisibleModal className="">
                <ValuesDiffViewer
                    chartName={chart?.chartMetaData?.chartName || ""}
                    appName={chart?.name?.value || ""}
                    valuesYaml={valuesYaml}
                    kind={kind}
                    selectedChartValue={selectedChartValue}
                    availableChartValues={chart.availableChartValues || []}
                    handleClose={e => setDiff(false)}
                    onChange={handleValuesYaml ? valuesYaml => handleValuesYaml(index, valuesYaml) : null}
                    fetchChartValues={() => fetchChartValues(chart.id, index)}
                />
            </VisibleModal>}
            {showValuesYamlDialog ? <ValuesYamlConfirmDialog className=""
                title="Discard values yaml changes?"
                description="Selecting a different value will discard changes made to yaml"
                closeOnESC={true}
                close={() => toggleValuesYamlDialog(false)}
                copyYamlToClipboard={copyValuesYamlToClipBoard}
                discardYamlChanges={discardValuesYamlChangesAdvancedConfig} />
                : null}
            {showManageValuesModal ? <ManageValues chartId={String(chart.id)}
                close={() => { toggleManagaValuesModal(!showManageValuesModal) }}
                onDeleteChartValue={() => { }} /> : null}
        </>
    )
}

export default AdvancedConfig

function ReadmeCharts({ readme, valuesYaml, onChange, handleClose, chart }) {
    const key = useKeyDown()
    const { target, height, width } = useSize()
    useEffect(() => {
        if (key.join().includes('Escape')) {
            handleClose()
        }
    }, [key.join()])
    return (
        <div className="advanced-config__readme">
            <h3>{chart.chartMetaData.chartName}</h3>
            <div ref={target} className="readme-config-container">
                <div className="readme-config--header">
                    <h5 className="flex left">Readme.md</h5>
                    <h5 className="flex left">
                        {chart?.name?.value}.yaml
                        <Pencil style={{ marginLeft: 'auto' }} />
                    </h5>
                </div>
                <div className="readme-config--body">
                    <div className="left column">
                        <MarkDown markdown={readme} />
                    </div>
                    <div className="right column">
                        <CodeEditor
                            value={valuesYaml}
                            mode="yaml"
                            noParsing
                            readOnly={!onChange}
                            height={height}
                            onChange={onChange ? valuesYaml => onChange(valuesYaml) : () => { }}
                        />
                    </div>
                </div>
            </div>
            <div className="flex right">
                <button className="cta secondary" onClick={handleClose}>Done</button>
            </div>
        </div>
    )
}

function ValuesDiffViewer({ chartName, appName, valuesYaml, selectedChartValue, kind: originalKind, availableChartValues, fetchChartValues, onChange, handleClose, }) {
    const [versionId, setVersionId] = useState(selectedChartValue.id);
    const [kind, setKind] = useState(originalKind);
    const [originalValuesYaml, setOriginalValuesYaml] = useState("");
    const { target, height, width } = useSize();

    const { DEFAULT, TEMPLATE, DEPLOYED } = availableChartValues.reduce((agg, { kind, values }) => {
        agg[kind] = values
        return agg
    }, { DEFAULT: [], TEMPLATE: [], DEPLOYED: [] })
    const valuesMap = useMemo(() => {
        if (kind === 'DEFAULT') return mapByKey(DEFAULT, 'id')
        if (kind === 'DEPLOYED') return mapByKey(DEPLOYED, 'id')
        if (kind === 'TEMPLATE') return mapByKey(TEMPLATE, 'id')
    }, [DEPLOYED, DEFAULT, TEMPLATE, kind, versionId])

    const [loading, result, error, reload] = useAsync(() => getChartValues(versionId, kind), [versionId, kind])
    useEffect(() => {
        if (!result) return
        setOriginalValuesYaml(result?.result?.values)
    }, [result])

    const key = useKeyDown()
    useEffect(() => {
        if (key.join().includes('Escape')) {
            handleClose()
        }
    }, [key.join()])

    function handleValuesChange(e) {
        const [kind, id] = e.target.value.split("--")
        setVersionId(Number(id))
        setKind(kind)
    }

    let chartVersion = valuesMap?.get(versionId)?.chartVersion || selectedChartValue.chartVersion;

    return (
        <div className="advanced-config__diff">
            <h3>{chartName}</h3>
            <div className="readme-config-container">
                {/* TODO: use code editor header */}
                <div className="readme-config--header">
                    <h5 className="flex left">
                        <Select rootClassName="values-select" onChange={handleValuesChange} value={kind + "--" + versionId} autoWidth={false}>
                            {availableChartValues?.length === 0 && <Select.Async api={fetchChartValues} />}
                            <Select.Button>{kind} {chartVersion}</Select.Button>
                            <Select.OptGroup className="select__option-group" label="DEPLOYED VALUES">
                                {DEPLOYED?.map(value =>
                                    <Select.Option key={value.id} value={"DEPLOYED" + "--" + value.id} id={value.id}>
                                        <div className="flex column left">
                                            <div className="ellipsis-right">{value.name}{value.chartVersion}</div>
                                            <div>ENV: {value.environmentName}</div>
                                        </div>
                                    </Select.Option>
                                )}
                                {DEPLOYED?.length === 0 && <div className="select__option-with-subtitle select__option-with-subtitle--empty-state">No Results</div>}
                            </Select.OptGroup>
                            <Select.OptGroup className="select__option-group" label="CUSTOM VALUES">
                                {TEMPLATE?.map(value => <Select.Option key={value.id} value={"TEMPLATE" + "--" + value.id} id={value.id}>{value.name} (v{value.chartVersion})</Select.Option>)}
                                {TEMPLATE?.length === 0 && <div className="select__option-with-subtitle select__option-with-subtitle--empty-state">No Results</div>}
                            </Select.OptGroup>
                            <Select.OptGroup className="select__option-group" label="DEFAULT VALUES">
                                {DEFAULT?.map(value => <Select.Option key={value.id} value={"DEFAULT" + "--" + value.id} id={value.id}>Default (v{value.chartVersion})</Select.Option>)}
                                {DEFAULT?.length === 0 && <div className="select__option-with-subtitle select__option-with-subtitle--empty-state">No Results</div>}
                            </Select.OptGroup>
                        </Select>
                        <LockIcon style={{ marginLeft: 'auto' }} />
                    </h5>
                    <h5 className="flex left">
                        {appName}.yaml
                        <Pencil style={{ marginLeft: 'auto' }} />
                    </h5>
                </div>
                <div ref={target} className="readme-config--body" style={{ gridTemplateColumns: '1fr' }}>
                    <CodeEditor
                        defaultValue={originalValuesYaml}
                        value={valuesYaml}
                        mode="yaml"
                        noParsing
                        loading={loading && !originalValuesYaml}
                        readOnly={!onChange}
                        height={height}
                        diffView
                        onChange={onChange ? valuesYaml => onChange(valuesYaml) : () => { }}
                    >
                    </CodeEditor>
                </div>
            </div>
            <div className="flex right">
                <button className="cta secondary" onClick={handleClose}>Done</button>
            </div>
        </div>
    )
}
