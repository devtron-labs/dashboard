import React, { useState, useEffect, useRef, useContext } from 'react';
import { Select, Page, DropdownIcon, Progressing, showError, useJsonYaml, DeleteDialog, sortCallback, multiSelectStyles } from '../../common';
import { getEnvironmentListHelmApps, getEnvironmentListMin, getTeamListMin } from '../../../services/service';
import { toast } from 'react-toastify';
import { DeployChartProps } from './deployChart.types';
import { MarkDown } from '../discoverChartDetail/DiscoverChartDetails'
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg';
import { useHistory, useParams } from 'react-router'
import { URLS, SERVER_MODE, ACCESS_TYPE_MAP } from '../../../config'
import { installChart, updateChart, deleteInstalledChart, getChartValuesCategorizedListParsed, getChartValues, getChartVersionsMin, getChartsByKeyword } from '../charts.service'
import { ChartValuesSelect } from '../util/ChartValueSelect';
import { getChartValuesURL } from '../charts.helper';
import { styles, menuList, DropdownIndicator } from '../charts.util';
import CodeEditor from '../../CodeEditor/CodeEditor'
import AsyncSelect from 'react-select/async';
import checkIcon from '../../../assets/icons/appstatus/ic-check.svg'
import ReactGA from 'react-ga';
import ReactSelect, { components } from 'react-select';
import './DeployChart.scss';
import { ServerErrors } from '../../../modals/commonTypes';
import ForceDeleteDialog from '../../common/dialogs/ForceDeleteDialog';
import { mainContext } from '../../common/navigation/NavigationRoutes';
import HyperionEnvironmentSelect from '../../hyperion/EnvironmentSelect';
import { getAppId } from '../../v2/appDetails/k8Resource/nodeDetail/nodeDetail.api';

function mapById(arr) {
    if (!Array.isArray(arr)) {
        throw 'parameter is not an array'
    }
    return arr.reduce((agg, curr) => agg.set(curr.id || curr.Id, curr), new Map())
}

interface chartRepoOtions {
    appStoreApplicationVersionId: number,
    chartRepoName: string,
    chartId: number,
    chartName: string,
    version: string,
    deprecated: boolean,
}

const DeployChart: React.FC<DeployChartProps> = ({
    installedAppId,
    installedAppVersion,
    appStoreVersion,
    appName: originalName,
    versions,
    valuesYaml = JSON.stringify({}),
    rawValues = "",
    environmentId = null,
    teamId = null,
    onHide,
    chartName = "",
    name = "",
    readme = "",
    deprecated = false,
    appStoreId = 0,
    chartIdFromDeploymentDetail = 0,
    installedAppVersionId = 0,
    chartValuesFromParent = { id: 0, name: '', chartVersion: '', kind: null, environmentName: "" },
    ...rest }) => {
    const {serverMode} = useContext(mainContext);
    const [environments, setEnvironments] = useState([])
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(false);
    const [selectedVersion, selectVersion] = useState(appStoreVersion)
    const [selectedVersionUpdatePage, setSelectedVersionUpdatePage] = useState(versions.get(selectedVersion))
    const [selectedProject, selectProject] = useState<{ label: string; value: number }>()
    const [chartVersionsData, setChartVersionsData] = useState<{ version: string, id: number }[]>([]);
    const [selectedEnvironment, selectEnvironment] = useState<{ label: string; value: string | number, namespace?: string; clusterName?: string; clusterId?: number }>(undefined)
    const [appName, setAppName] = useState(originalName)
    const [readmeCollapsed, toggleReadmeCollapsed] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const [confirmation, toggleConfirmation] = useState(false)
    const [showForceDeleteDialog, setForceDeleteDialog] = useState(false)
    const [forceDeleteDialogMessage, setForceDeleteErrorMessage] = useState("")
    const [forceDeleteDialogTitle, setForceDeleteErroTitle] = useState("")
    const [textRef, setTextRef] = useState(rawValues)
    const [repoChartAPIMade, setRepoChartAPIMade] = useState(false);
    const [repoChartOptions, setRepoChartOptions] = useState<chartRepoOtions[] | null>([
        {
            appStoreApplicationVersionId: appStoreVersion,
            chartRepoName: chartName,
            chartId: appStoreId,
            chartName: name,
            version: versions.get(selectedVersion)?.version,
            deprecated: deprecated,
        }
    ]);
    const [repoChartValue, setRepoChartValue] = useState<chartRepoOtions>(
        {
            appStoreApplicationVersionId: appStoreVersion,
            chartRepoName: chartName,
            chartId: appStoreId,
            chartName: name,
            version: versions.get(selectedVersion)?.version,
            deprecated: deprecated,
        },
    );
    const [obj, json, yaml, error] = useJsonYaml(textRef, 4, 'yaml', true)
    const [chartValuesList, setChartValuesList] = useState([])
    const initialChartValuesFromParent = chartValuesFromParent;
    const [chartValues, setChartValues] = useState(chartValuesFromParent);
    const { push } = useHistory()
    const { chartId, envId } = useParams<{ chartId, envId }>()
    const [showCodeEditorError, setCodeEditorError] = useState(false);
    const deployChartForm = useRef(null);
    const deployChartEditor = useRef(null);

    const fetchProjects = async () => {
        let { result } = await getTeamListMin();
        let projectList = result.map((p) => { return { value: p.id, label: p.name } });
        projectList = projectList.sort((a, b) => sortCallback('label', a, b, true));
        setProjects(projectList);
    }

    const fetchEnvironments = async () => {
        if(serverMode == SERVER_MODE.FULL){
            let response = await getEnvironmentListMin();
            let envList = response.result ? response.result : [];
            envList = envList.map((env) => { return { value: env.id, label: env.environment_name, active: env.active } });
            envList = envList.sort((a, b) => sortCallback('label', a, b, true));
            setEnvironments(envList);
        }else{
            // for hyperion
            let response = await getEnvironmentListHelmApps();
            const envList = (response.result ? response.result : [])?.map((cluster) => ({
                label: cluster.clusterName,
                options: [
                    ...cluster.environments?.map((env) => ({
                        label: env.environmentName,
                        value: env.environmentIdentifier,
                        namespace: env.namespace,
                        clusterName: cluster.clusterName,
                        clusterId: cluster.clusterId,
                    })),
                ],
            }));
            setEnvironments(envList);
        }

    }

    function closeMe(event = null) {
        if (event.keyCode === 27 && typeof onHide === 'function') {
            onHide(false);
        }
    }

    async function getChartValuesList(id: number, installedAppVersionId = null) {
        setLoading(true)
        try {
            const { result } = await getChartValuesCategorizedListParsed(id, installedAppVersionId);
            setChartValuesList(result);
            if (installedAppVersionId) {
                setChartValues({
                    id: initialChartValuesFromParent.id,
                    kind: "EXISTING",
                })
            }
        }
        catch (err) { }
        finally {
            setLoading(false)
        }
    }

    function hasChartChanged(): boolean {
        return appStoreId !== repoChartValue.chartId;
    }

    const deploy = async (e) => {
        if (!((serverMode == SERVER_MODE.EA_ONLY || selectedProject) && selectedEnvironment)) {
            return
        }
        if (!environmentId && (serverMode == SERVER_MODE.FULL && !teamId) && !appName) {
            toast.warn('App name should not be empty and spaces are not allowed.')
            return
        }
        if (!obj) {
            toast.error(error)
            return
        }
        try {
            setLoading(true)
            if (installedAppVersion) {
                let payload = {
                    // if chart has changed send 0
                    id: hasChartChanged() ? 0 : installedAppVersion,
                    referenceValueId: chartValues.id,
                    referenceValueKind: chartValues.kind,
                    // valuesOverride: obj,
                    valuesOverrideYaml: textRef,
                    installedAppId: installedAppId,
                    appStoreVersion: selectedVersionUpdatePage.id,
                }
                await updateChart(payload)
                toast.success('Deployment initiated')
                setLoading(false)
                onHide(true)
            }

            else {
                let payload = {
                    teamId: serverMode == SERVER_MODE.FULL ? selectedProject.value : 0 ,
                    referenceValueId: chartValues.id,
                    referenceValueKind: chartValues.kind,
                    environmentId: serverMode == SERVER_MODE.FULL ? selectedEnvironment.value : 0,
                    clusterId: selectedEnvironment.clusterId,
                    namespace: selectedEnvironment.namespace,
                    appStoreVersion: selectedVersion,
                    valuesOverride: obj,
                    valuesOverrideYaml: textRef,
                    appName,
                };
                const { result: { environmentId: newEnvironmentId, installedAppId: newInstalledAppId } } = await installChart(payload);
                toast.success('Deployment initiated');
                push(_buildAppDetailUrl(newInstalledAppId, newEnvironmentId))
            }
        }
        catch (err: any) {
            if (Array.isArray(err.errors)) {
                err.errors.map(({ userMessage }, idx) => toast.error(userMessage, { autoClose: false }))
            }
            setLoading(false)
        }
    }
    useEffect(() => {
        // scroll to the editor view with animation for only update-chart
        if (envId) {
            setTimeout(() => {
                deployChartForm.current.scrollTo({
                    top: deployChartEditor.current.offsetTop,
                    behavior: 'smooth',
                });
            }, 1000);
        }
    }, []);

    useEffect(() => {
        if (chartId) {
            getChartValuesList(chartId);
        }
        document.addEventListener("keydown", closeMe);
        if (versions) {
            fetchProjects();
            fetchEnvironments();
        }
        return () => { document.removeEventListener("keydown", closeMe); }
    }, [])

    useEffect(() => {
        let cv = versions.get(selectedVersion);
        if (chartValues && cv && cv.version !== chartValues.chartVersion) {
            setCodeEditorError(true);
        }
        else setCodeEditorError(false);
    }, [selectedVersion])

    useEffect(() => {
        if (chartIdFromDeploymentDetail) {
            if (chartIdFromDeploymentDetail) getChartValuesCategorizedListParsed(chartIdFromDeploymentDetail).then((response) => {
                setChartValuesList(response.result);
            }).catch((error) => {
                showError(error);
            })
        }
    }, [chartIdFromDeploymentDetail])

    useEffect(() => {
        if (environmentId && environments.length) {
            let environment = environments.find(e => e.value.toString() === environmentId.toString());
            selectEnvironment(environment);
        }
    }, [environmentId, environments])

    useEffect(() => {
        if (teamId && projects.length) {
            let project = projects.find(e => e.value.toString() === teamId.toString());
            selectProject(project);
        }
    }, [teamId, projects])

    useEffect(() => {
        if (chartValues.id && chartValues.chartVersion) {
            getChartValues(chartValues.id, chartValues.kind).then((response) => {
                let values = response.result.values || "";
                setTextRef(values);
                let cv = versions.get(selectedVersion);
                if (chartValues && cv && cv.version !== chartValues.chartVersion) {
                    setCodeEditorError(true);
                }
                else setCodeEditorError(false);
            }).catch((error) => {
                showError(error);
            })
        }
    }, [chartValues])

    useEffect(() => {
        if (chartValuesFromParent.id) {
            setChartValues(chartValuesFromParent);
        }
    }, [chartValuesFromParent])

    function _buildAppDetailUrl(newInstalledAppId : number, newEnvironmentId: number) {
        if (serverMode == SERVER_MODE.EA_ONLY) {
            return `${URLS.APP}/${URLS.EXTERNAL_APPS}/${getAppId(selectedEnvironment.clusterId, selectedEnvironment.namespace, appName)}/${appName}`;
        } else {
            return `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${newInstalledAppId}/env/${newEnvironmentId}/${URLS.APP_DETAILS}`;
        }
    }

    function setForceDeleteDialogData(serverError) {
        if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                setForceDeleteErroTitle(userMessage)
                setForceDeleteErrorMessage(internalMessage);
            });
        }
    }

    async function handleDelete(force) {
        setDeleting(true)
        try {
            if (force === true) {
                await deleteInstalledChart(installedAppId, force)
            } else {
                await deleteInstalledChart(installedAppId)
            }
            toast.success('Successfully deleted.')
            push(URLS.CHARTS)
        }
        catch (err: any) {
            if (!force && err.code != 403) {
                setForceDeleteDialog(true)
                setForceDeleteDialogData(err)
            } else {
                showError(err)
            }
        }
        finally {
            setDeleting(false)
        }
    }

    async function redirectToChartValues() {
        let id = chartId || chartIdFromDeploymentDetail;
        let url = getChartValuesURL(id);
        push(url);
    }

    async function fetchChartVersionsData(id: number, valueUpdateRequired = false) {
        try {
            setLoading(true)
            const { result } = await getChartVersionsMin(id);
            setChartVersionsData(result);
            if (valueUpdateRequired) {
                setSelectedVersionUpdatePage(result[0])
            }
        }
        catch (err) {
            showError(err)
        }
        finally {
            setLoading(false)
        }
    }

    async function handlerepoChartFocus() {
        if (!repoChartAPIMade) {
            setRepoChartAPIMade(true)
            const matchedCharts = (await getChartsByKeyword(name)).result;
            filterMatchedCharts(matchedCharts);
        }
    }

    function filterMatchedCharts(matchedCharts) {
        if (repoChartOptions !== null) {
            const deprecatedCharts = [];
            const nonDeprecatedCharts = [];
            for (let i = 0; i < matchedCharts.length; i++) {
                if (matchedCharts[i].deprecated) {
                    deprecatedCharts.push(matchedCharts[i]);
                }
                else {
                    nonDeprecatedCharts.push(matchedCharts[i])
                }
            }
            setRepoChartOptions(nonDeprecatedCharts.concat(deprecatedCharts))
            return nonDeprecatedCharts.concat(deprecatedCharts)
        }
        return [];
    }

    async function repoChartLoadOptions(inputValue: string, callback) {
        const matchedCharts = (await getChartsByKeyword(inputValue)).result;
        callback(filterMatchedCharts(matchedCharts));
    }

    function repoChartOptionLabel(props) {
        const { innerProps, innerRef } = props;
        const isCurrentlySelected = props.data.chartId === repoChartValue.chartId;
        return (
            <div ref={innerRef} {...innerProps} className="repochart-dropdown-wrap">
                <div className="flex left">
                    {isCurrentlySelected && <img src={checkIcon} className="select__check-icon"></img>}
                    <span>
                        {props.data.chartRepoName}/{props.data.chartName}
                    </span>
                </div>
                {props.data.deprecated && <div className="dropdown__deprecated-text">Chart deprecated</div>}
            </div>
        )
    }

    function repoChartSelectOptionLabel({ chartRepoName, chartName }) {
        return <div>{chartRepoName}/{chartName}</div>
    }

    function handleRepoChartValueChange(event) {
        setRepoChartValue(event);
        fetchChartVersionsData(event.chartId, true);
        getChartValuesList(event.chartId, installedAppVersionId);
    }

    let isUpdate = environmentId && teamId;
    let isDisabled = isUpdate ? false : !(selectedEnvironment && (serverMode == SERVER_MODE.EA_ONLY || selectedProject) && selectedVersion && appName?.length);
    let chartVersionObj = versions.get(selectedVersion);
    // fetch chart versions for update route
    useEffect(() => {
        if (isUpdate !== null) {
            fetchChartVersionsData(chartIdFromDeploymentDetail)
        }
    }, []);
    return (<>
        <div className={`deploy-chart-container ${readmeCollapsed ? 'readmeCollapsed' : 'readmeOpen'} ${isUpdate ? '' : 'update_deploy-chart-container_header'}`}>
            <div className="header-container flex column">
                <div className="title">{chartName}/ {name}</div>
                <div className="border" />
            </div>
            <ReadmeColumn readmeCollapsed={readmeCollapsed} toggleReadmeCollapsed={toggleReadmeCollapsed} readme={readme} />
            <div className="deploy-chart-body">
                <div className="overflown" ref={deployChartForm}>
                    <div className="hide-scroll">
                        <label className="form__row form__row--w-100">
                            <span className="form__label">App Name</span>
                            <input autoComplete="off" tabIndex={1} placeholder="App name" className="form__input" value={appName} autoFocus disabled={!!isUpdate} onChange={e => setAppName(e.target.value)} />
                        </label>
                        {
                            serverMode == SERVER_MODE.FULL &&
                            <label className="form__row form__row--w-100">
                                <span className="form__label">Project</span>
                                <ReactSelect
                                    components={{
                                        IndicatorSeparator: null,
                                        DropdownIndicator
                                    }}
                                    isDisabled={!!isUpdate}
                                    placeholder="Select Project"
                                    value={selectedProject}
                                    styles={{
                                        ...styles,
                                        ...menuList,
                                    }}
                                    onChange={selectProject}
                                    options={projects}
                                />
                            </label>
                        }
                        <div className="form__row form__row--w-100">
                            <span className="form__label">Environment</span>
                            {
                                serverMode == SERVER_MODE.FULL &&
                                <ReactSelect
                                    components={{
                                        IndicatorSeparator: null,
                                        DropdownIndicator
                                    }}
                                    isDisabled={!!isUpdate}
                                    placeholder="Select Environment"
                                    value={selectedEnvironment}
                                    styles={{
                                        ...styles,
                                        ...menuList,
                                    }}
                                    onChange={selectEnvironment}
                                    options={environments}
                                />
                            }
                            {
                                serverMode == SERVER_MODE.EA_ONLY &&
                                <HyperionEnvironmentSelect
                                    selectEnvironment={selectEnvironment}
                                    environments={environments}
                                    selectedEnvironment={selectedEnvironment}
                                />
                            }

                        </div>
                        {isUpdate && deprecated &&
                            <div className="info__container--update-chart">
                                <div className="flex left">
                                    <AlertTriangle className="icon-dim-24 update-chart" />
                                    <div className="info__container--update-chart-text">{chartName}/{name} is deprecated</div>
                                </div>
                                <div className="info__container--update-chart-disclaimer">
                                    Selected chart has been deprecated. Please select another chart to continue receiving updates in future.
                                </div>
                            </div>
                        }

                        {
                            isUpdate &&
                            <div className="form__row form__row--w-100">
                                <span className="form__label">Repo/Chart</span>
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions={repoChartOptions}
                                    formatOptionLabel={repoChartSelectOptionLabel}
                                    value={repoChartValue}
                                    loadOptions={repoChartLoadOptions}
                                    onFocus={handlerepoChartFocus}
                                    onChange={handleRepoChartValueChange}
                                    components={{
                                        IndicatorSeparator: () => null,
                                        Option: repoChartOptionLabel
                                    }}
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            boxShadow: 'none',
                                            border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N500)',
                                            cursor: 'pointer'
                                        }),
                                        option: (base, state) => {
                                            return ({
                                                ...base,
                                                color: 'var(--N900)',
                                                backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                                padding: '10px 12px'
                                            })
                                        },
                                    }}
                                />
                                {
                                    repoChartValue.deprecated &&
                                    <div className="deprecated-text-image flex left">
                                        <AlertTriangle className="icon-dim-16 update-chart" />
                                        <span className="deprecated-text">This chart has been deprecated. Select another chart.</span>
                                    </div>
                                }
                            </div>
                        }
                        <div className="form__row form__row--flex form__row--w-100">
                            {
                                isUpdate === null ?
                                    <div className="w-50">
                                        <span className="form__label">Chart Version</span>
                                        <ReactSelect
                                         tabIndex={4}
                                    components={{
                                        IndicatorSeparator: null,
                                        DropdownIndicator
                                    }}
                                    isDisabled={!!isUpdate}
                                    getOptionLabel={(option) => `${option.id}`}
                                    getOptionValue={(option) => `${option.version}`}
                                    placeholder="Select Version"
                                    value={versions.get(selectedVersion)}
                                    styles={{
                                        ...styles,
                                        ...menuList,
                                    }}
                                    onChange={selected => setSelectedVersionUpdatePage(selected)}
                                    options={chartVersionsData}
                                />
                                        <Select tabIndex={4} rootClassName="select-button--default" value={selectedVersion} onChange={event => selectVersion(event.target.value)}>
                                            <Select.Button>{chartVersionObj ? chartVersionObj.version : 'Select Version'}</Select.Button>
                                            {Array.from(versions).map(([versionId, versionData], idx) => <Select.Option key={versionId} value={versionId}>{versionData.version}</Select.Option>)}
                                        </Select>
                                    </div>
                                    :
                                    <div className="w-50">
                                        <span className="form__label">Chart Version</span>
                                        <Select tabIndex={4} rootClassName="select-button--default" value={selectedVersionUpdatePage.id} onChange={event => setSelectedVersionUpdatePage({ id: event.target.value, version: event.target.innerText })}>
                                            <Select.Button>{selectedVersionUpdatePage.version}</Select.Button>
                                            {chartVersionsData.map(({ version, id }) => <Select.Option key={id} value={id}>{version}</Select.Option>)}
                                        </Select>
                                    </div>
                            }
                            <span className="mr-16"></span>
                            <div className="w-50">
                                <span className="form__label">Chart Values*</span>
                                <ChartValuesSelect chartValuesList={chartValuesList} chartValues={chartValues} redirectToChartValues={redirectToChartValues}
                                    onChange={(event) => { setChartValues(event) }} />
                            </div>
                        </div>
                        <div className="code-editor-container" ref={deployChartEditor}>
                            <CodeEditor
                                value={textRef}
                                noParsing
                                mode="yaml"
                                onChange={value => { setTextRef(value) }}>
                                <CodeEditor.Header>
                                    <span className="bold">values.yaml</span>
                                </CodeEditor.Header>
                                {hasChartChanged() &&
                                    <CodeEditor.Information
                                        text={`Please ensure that the values are compatible with "${repoChartValue.chartRepoName}/${repoChartValue.chartName}"`} />}
                            </CodeEditor>
                        </div>
                    </div>
                </div>
            </div>
            <div className="cta-container">
                {isUpdate && <button className="cta delete" onClick={e => toggleConfirmation(true)}>Delete Application</button>}
                <button type="button" tabIndex={6}
                    disabled={isDisabled || loading}
                    className={`cta flex-1 ml-16 mr-16 ${isDisabled ? 'disabled' : ''}`}
                    onClick={deploy}>
                    {loading ? <Progressing /> : isUpdate ? 'update and deploy' : 'deploy chart'}
                </button>
            </div>
            {confirmation && <DeleteDialog title={`Delete '${originalName}' ?`}
                delete={() => handleDelete(false)}
                closeDelete={() => toggleConfirmation(false)}
            >
                <DeleteDialog.Description >
                    <p>This will delete all resources associated with this application.</p>
                    <p>Deleted applications cannot be restored.</p>
                </DeleteDialog.Description>
            </DeleteDialog>
            }
            {
                showForceDeleteDialog && <ForceDeleteDialog
                    forceDeleteDialogTitle={forceDeleteDialogTitle}
                    onClickDelete={() => handleDelete(true)}
                    closeDeleteModal={() => { toggleConfirmation(false); setForceDeleteDialog(false) }}
                    forceDeleteDialogMessage={forceDeleteDialogMessage}
                />
            }
        </div>
    </>
    )
}

function ReadmeColumn({ readmeCollapsed, toggleReadmeCollapsed, readme, ...props }) {

    return (
        <div className="deploy-chart__readme-column">
            <MarkDown markdown={readme} className="deploy-chart__readme-markdown" />
            <aside className="flex column" onClick={readme ? (e) => {
                if (readmeCollapsed) {
                    ReactGA.event({
                        category: 'DeployChart',
                        action: 'Readme Expands',
                        label: ''
                    });
                }
                toggleReadmeCollapsed(t => !t)
            } : e => { }}>
                {readme && <DropdownIcon className={`rotate ${readme ? '' : 'not-available'}`} style={{ ['--rotateBy' as any]: `${readmeCollapsed ? -90 : 90}deg` }} color={readmeCollapsed ? '#06c' : 'white'} />}
                {readmeCollapsed && <div className={`rotate ${readme ? '' : 'not-available'}`} style={{ ['--rotateBy' as any]: `-90deg`, width: '106px', margin: '70px' }}>{readme ? 'View Readme.md' : 'README.md not available'}</div>}
                {readmeCollapsed && <Page className="rotate" style={{ ['--rotateBy' as any]: `0deg` }} />}
            </aside>
        </div>
    )
}

export default DeployChart