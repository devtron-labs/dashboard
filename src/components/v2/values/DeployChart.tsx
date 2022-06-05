import React, { useState, useEffect, useRef } from 'react';
import { Progressing, showError, useJsonYaml, sortCallback } from '../../common';
import { getEnvironmentListMin, getTeamListMin } from '../../../services/service';
import { toast } from 'react-toastify';
import { useHistory, useParams, useRouteMatch } from 'react-router';
import { URLS } from '../../../config';
import ReactSelect from 'react-select';
import '../../charts/modal/DeployChart.scss';
import { ServerErrors } from '../../../modals/commonTypes';
import ForceDeleteDialog from '../../common/dialogs/ForceDeleteDialog';
import { getChartValuesURL } from '../../charts/charts.helper';
import { menuList } from '../../charts/charts.util';
import { DeployChartProps } from '../../charts/modal/deployChart.types';
import { DropdownIndicator, styles } from '../common/ReactSelect.utils';
import {
    getChartValuesCategorizedListParsed,
    updateChart,
    installChart,
    getChartValues,
    deleteInstalledChart,
} from '../../charts/charts.service';
import {
    ChartDeprecated,
    ChartEnvironmentSelector,
    ChartRepoSelector,
    ChartVersionValuesSelector,
    ActiveReadmeColumn,
    DeleteChartDialog,
    ChartValuesEditor,
} from './common/ChartValuesSelectors';
import { fetchChartVersionsData, getChartValuesList } from './common/chartValues.api';

function mapById(arr) {
    if (!Array.isArray(arr)) {
        throw 'parameter is not an array';
    }
    return arr.reduce((agg, curr) => agg.set(curr.id || curr.Id, curr), new Map());
}

export interface ChartRepoOtions {
    appStoreApplicationVersionId: number;
    chartRepoName: string;
    chartId: number;
    chartName: string;
    version: string;
    deprecated: boolean;
}

const DeployChart: React.FC<DeployChartProps> = ({
    installedAppId,
    installedAppVersion,
    appStoreVersion,
    appName: originalName,
    versions,
    valuesYaml = JSON.stringify({}),
    rawValues = '',
    environmentId = null,
    teamId = null,
    onHide,
    chartName = '',
    name = '',
    readme = '',
    deprecated = false,
    appStoreId = 0,
    chartIdFromDeploymentDetail = 0,
    installedAppVersionId = 0,
    chartValuesFromParent = { id: 0, name: '', chartVersion: '', kind: null, environmentName: '' },
    ...rest
}: DeployChartProps) => {
    const [environments, setEnvironments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVersion, selectVersion] = useState(appStoreVersion);
    const [selectedVersionUpdatePage, setSelectedVersionUpdatePage] = useState(versions.get(selectedVersion));
    const [selectedProject, selectProject] = useState<{ label: string; value: number }>();
    const [chartVersionsData, setChartVersionsData] = useState<{ version: string; id: number }[]>([]);
    const [selectedEnvironment, selectEnvironment] = useState<{ label: string; value: number }>(undefined);
    const [appName, setAppName] = useState(originalName);
    const [readmeCollapsed, toggleReadmeCollapsed] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [confirmation, toggleConfirmation] = useState(false);
    const [showForceDeleteDialog, setForceDeleteDialog] = useState(false);
    const [forceDeleteDialogMessage, setForceDeleteErrorMessage] = useState('');
    const [forceDeleteDialogTitle, setForceDeleteErroTitle] = useState('');
    const [textRef, setTextRef] = useState(rawValues);
    const [fetchingValuesYaml, setFetchingValuesYaml] = useState(false);
    const [repoChartValue, setRepoChartValue] = useState<ChartRepoOtions>({
        appStoreApplicationVersionId: appStoreVersion,
        chartRepoName: chartName,
        chartId: appStoreId,
        chartName: name,
        version: versions.get(selectedVersion).version,
        deprecated: deprecated,
    });
    const [obj, json, yaml, error] = useJsonYaml(textRef, 4, 'yaml', true);
    const [chartValuesList, setChartValuesList] = useState([]);
    const initialChartValuesFromParent = chartValuesFromParent;
    const [chartValues, setChartValues] = useState(chartValuesFromParent);
    const { push } = useHistory();
    const { chartId, envId } = useParams<{ chartId; envId }>();
    const [showCodeEditorError, setCodeEditorError] = useState(false);
    const deployChartForm = useRef<HTMLDivElement>(null);
    const history = useHistory();
    const { url } = useRouteMatch();

    const fetchProjects = async () => {
        let { result } = await getTeamListMin();
        let projectList = result.map((p) => {
            return { value: p.id, label: p.name };
        });
        projectList = projectList.sort((a, b) => sortCallback('label', a, b, true));
        setProjects(projectList);
    };

    const fetchEnvironments = async () => {
        let response = await getEnvironmentListMin();
        let envList = response.result ? response.result : [];
        envList = envList.map((env) => {
            return { value: env.id, label: env.environment_name, active: env.active };
        });
        envList = envList.sort((a, b) => sortCallback('label', a, b, true));
        setEnvironments(envList);
    };

    function closeMe(event = null) {
        if (event.keyCode === 27 && typeof onHide === 'function') {
            onHide(false);
        }
    }

    function hasChartChanged(): boolean {
        return appStoreId !== repoChartValue.chartId;
    }

    const deploy = async (e) => {
        if (!(selectedProject && selectedEnvironment)) {
            return;
        }
        if (!environmentId && !teamId && !appName) {
            toast.warn('App name should not be empty and spaces are not allowed.');
            return;
        }
        if (!obj) {
            toast.error(error);
            return;
        }
        try {
            setLoading(true);
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
                };
                await updateChart(payload);
                toast.success('Deployment initiated');
                setLoading(false);
                let _url = `${url.split('/').slice(0, -1).join('/')}/${URLS.APP_DETAILS}?refetchData=true`;
                history.push(_url);
                onHide(true);
            } else {
                let payload = {
                    teamId: selectedProject.value,
                    referenceValueId: chartValues.id,
                    referenceValueKind: chartValues.kind,
                    environmentId: selectedEnvironment.value,
                    appStoreVersion: selectedVersion,
                    valuesOverride: obj,
                    valuesOverrideYaml: textRef,
                    appName,
                };
                const {
                    result: { environmentId: newEnvironmentId, installedAppId: newInstalledAppId },
                } = await installChart(payload);
                toast.success('Deployment initiated');
                push(
                    `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${newInstalledAppId}/env/${newEnvironmentId}/${URLS.APP_DETAILS}?refetchData=true`,
                );
            }
        } catch (err) {
            // if (Array.isArray(err.errors)) {
            //     err.errors.map(({ userMessage }, idx) => toast.error(userMessage, { autoClose: false }))
            // }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chartId) {
            getChartValuesList(chartId, setChartValuesList, setChartValues, setLoading);
        }
        document.addEventListener('keydown', closeMe);
        if (versions) {
            fetchProjects();
            fetchEnvironments();
        }
        return () => {
            document.removeEventListener('keydown', closeMe);
        };
    }, []);

    useEffect(() => {
        let cv = versions.get(selectedVersion);
        if (chartValues && cv && cv.version !== chartValues.chartVersion) {
            setCodeEditorError(true);
        } else setCodeEditorError(false);
    }, [selectedVersion]);

    useEffect(() => {
        if (chartIdFromDeploymentDetail) {
            if (chartIdFromDeploymentDetail)
                getChartValuesCategorizedListParsed(chartIdFromDeploymentDetail)
                    .then((response) => {
                        setChartValuesList(response.result);
                    })
                    .catch((error) => {
                        showError(error);
                    });
        }
    }, [chartIdFromDeploymentDetail]);

    useEffect(() => {
        if (environmentId && environments.length) {
            let environment = environments.find((e) => e.value.toString() === environmentId.toString());
            selectEnvironment(environment);
        }
    }, [environmentId, environments]);

    useEffect(() => {
        if (teamId && projects.length) {
            let project = projects.find((e) => e.value.toString() === teamId.toString());
            selectProject(project);
        }
    }, [teamId, projects]);

    useEffect(() => {
        if (chartValues.id && chartValues.chartVersion) {
            setFetchingValuesYaml(true);
            getChartValues(chartValues.id, chartValues.kind)
                .then((response) => {
                    let values = response.result.values || '';
                    setTextRef(values);
                    let cv = versions.get(selectedVersion);
                    if (chartValues && cv && cv.version !== chartValues.chartVersion) {
                        setCodeEditorError(true);
                    } else setCodeEditorError(false);

                    setFetchingValuesYaml(false);
                })
                .catch((error) => {
                    showError(error);
                    setFetchingValuesYaml(false);
                });
        }
    }, [chartValues]);

    useEffect(() => {
        if (chartValuesFromParent.id) {
            setChartValues(chartValuesFromParent);
        }
    }, [chartValuesFromParent]);

    function setForceDeleteDialogData(serverError) {
        if (serverError instanceof ServerErrors && Array.isArray(serverError.errors)) {
            serverError.errors.map(({ userMessage, internalMessage }) => {
                setForceDeleteErroTitle(userMessage);
                setForceDeleteErrorMessage(internalMessage);
            });
        }
    }

    async function handleDelete(force) {
        setDeleting(true);
        try {
            if (force === true) {
                await deleteInstalledChart(installedAppId, force);
            } else {
                await deleteInstalledChart(installedAppId);
            }
            toast.success('Successfully deleted.');
            let url = `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`;
            push(url);
        } catch (err: any) {
            if (!force && err.code != 403) {
                setForceDeleteDialog(true);
                setForceDeleteDialogData(err);
            } else {
                showError(err);
            }
        } finally {
            setDeleting(false);
        }
    }

    async function redirectToChartValues() {
        let id = chartId || chartIdFromDeploymentDetail;
        let url = getChartValuesURL(id);
        push(url);
    }

    function handleRepoChartValueChange(event) {
        setRepoChartValue(event);
        fetchChartVersionsData(
            event.chartId,
            true,
            false,
            setSelectedVersionUpdatePage,
            setChartVersionsData,
            setLoading,
        );
        getChartValuesList(
            event.chartId,
            setChartValuesList,
            setChartValues,
            setLoading,
            initialChartValuesFromParent.id,
            installedAppVersionId,
        );
    }

    let isUpdate = environmentId && teamId;
    let isDisabled = isUpdate ? false : !(selectedEnvironment && selectedProject && selectedVersion && appName?.length);
    let chartVersionObj = versions.get(selectedVersion);
    // fetch chart versions for update route
    useEffect(() => {
        if (isUpdate !== null) {
            fetchChartVersionsData(
                chartIdFromDeploymentDetail,
                false,
                false,
                setSelectedVersionUpdatePage,
                setChartVersionsData,
                setLoading,
            );
        }
    }, []);
    return (
        <>
            <div
                className={`deploy-chart-container bcn-0 ${readmeCollapsed ? 'readmeCollapsed' : 'readmeOpen'} `}
                style={{ height: 'calc(100vh - 90px)' }}
            >
                <div className="header-container flex column">
                    {!isUpdate ? (
                        <>
                            <div className="title">
                                {chartName}/ {name}
                            </div>
                            <div className="border" />
                        </>
                    ) : (
                        ''
                    )}
                </div>
                {/* <ActiveReadmeColumn
                    readmeCollapsed={readmeCollapsed}
                    toggleReadmeCollapsed={toggleReadmeCollapsed}
                    defaultReadme={readme}
                    selectedVersionUpdatePage={selectedVersionUpdatePage}
                /> */}
                <div className="deploy-chart-body">
                    <div className="overflown" ref={deployChartForm}>
                        <div className="hide-scroll">
                            <label className="form__row form__row--w-100">
                                <span className="form__label">App Name</span>
                                <input
                                    autoComplete="off"
                                    tabIndex={1}
                                    placeholder="App name"
                                    className="form__input"
                                    value={appName}
                                    autoFocus
                                    disabled={!!isUpdate}
                                    onChange={(e) => setAppName(e.target.value)}
                                />
                            </label>
                            <label className="form__row form__row--w-100">
                                <span className="form__label">Project</span>
                                <ReactSelect
                                    components={{
                                        IndicatorSeparator: null,
                                        DropdownIndicator,
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
                            <ChartEnvironmentSelector
                                isUpdate={!!isUpdate}
                                selectedEnvironment={selectedEnvironment}
                                selectEnvironment={selectEnvironment}
                                environments={environments}
                            />
                            {/* TODO: remove ChartDeprecated */}
                            <ChartDeprecated
                                isUpdate={!!isUpdate}
                                deprecated={deprecated}
                                chartName={chartName}
                                name={name}
                            />
                            <ChartRepoSelector
                                isUpdate={!!isUpdate}
                                repoChartValue={repoChartValue}
                                handleRepoChartValueChange={handleRepoChartValueChange}
                                chartDetails={{
                                    appStoreApplicationVersionId: appStoreVersion,
                                    chartRepoName: chartName,
                                    chartId: appStoreId,
                                    chartName: name,
                                    version: versions.get(selectedVersion).version,
                                    deprecated: deprecated,
                                }}
                            />
                            <ChartVersionValuesSelector
                                isUpdate={!!isUpdate}
                                selectedVersion={selectedVersion}
                                selectVersion={selectVersion}
                                chartVersionObj={chartVersionObj}
                                versions={versions}
                                selectedVersionUpdatePage={selectedVersionUpdatePage}
                                setSelectedVersionUpdatePage={setSelectedVersionUpdatePage}
                                chartVersionsData={chartVersionsData}
                                chartValuesList={chartValuesList}
                                chartValues={chartValues}
                                redirectToChartValues={redirectToChartValues}
                                setChartValues={setChartValues}
                            />
                            {/* <ChartValuesEditor
                                loading={fetchingValuesYaml}
                                valuesText={textRef}
                                onChange={setTextRef}
                                repoChartValue={repoChartValue}
                                hasChartChanged={hasChartChanged()}
                                parentRef={deployChartForm}
                                autoFocus={!!envId}
                            /> */}
                        </div>
                    </div>
                </div>
                <div className="cta-container">
                    {isUpdate && (
                        <button className="cta delete" onClick={(e) => toggleConfirmation(true)}>
                            Delete Application
                        </button>
                    )}
                    <button
                        type="button"
                        tabIndex={6}
                        disabled={isDisabled || loading}
                        className={`cta flex-1 ml-16 mr-16 ${isDisabled ? 'disabled' : ''}`}
                        onClick={deploy}
                    >
                        {loading ? <Progressing /> : isUpdate ? 'update and deploy' : 'deploy chart'}
                    </button>
                </div>
                {confirmation && (
                    <DeleteChartDialog
                        appName={originalName}
                        handleDelete={handleDelete}
                        toggleConfirmation={toggleConfirmation}
                    />
                )}
                {showForceDeleteDialog && (
                    <ForceDeleteDialog
                        forceDeleteDialogTitle={forceDeleteDialogTitle}
                        onClickDelete={() => handleDelete(true)}
                        closeDeleteModal={() => {
                            toggleConfirmation(false);
                            setForceDeleteDialog(false);
                        }}
                        forceDeleteDialogMessage={forceDeleteDialogMessage}
                    />
                )}
            </div>
        </>
    );
};

export default DeployChart;
