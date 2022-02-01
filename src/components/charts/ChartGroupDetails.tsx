import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useRouteMatch } from 'react-router';
import ChartGroupDeployments from './ChartGroupDeployments';
import MultiChartSummary from './MultiChartSummary';
import useChartGroup from './useChartGroup';
import { URLS } from '../../config';
import { Progressing, showError, BreadCrumb, Pencil, useBreadcrumb, ConditionalWrap, useAsync } from '../common';
import { getDeployableChartsFromConfiguredCharts } from './list/DiscoverCharts';
import {
    deployChartGroup,
    getChartGroupInstallationDetails,
    deleteInstalledChart,
    getChartGroups,
    deleteChartGroup,
} from './charts.service';
import { toast } from 'react-toastify';
import ChartGroupBasicDeploy from './modal/ChartGroupBasicDeploy';
import Tippy from '@tippyjs/react';
import AppSelector from '../AppSelector/AppSelector';
import { isGitopsConfigured } from '../../services/service';
import { ConfirmationDialog } from '../common';
import warn from '../../assets/icons/ic-warning.svg';
import { NavLink } from 'react-router-dom';
import DeleteComponent from '../../util/DeleteComponent';

export default function ChartGroupDetails() {
    const { groupId } = useParams<{ groupId }>();
    const { push } = useHistory();
    const { url } = useRouteMatch();
    const [projectId, setProjectId] = useState(null);
    const [loading, setLoading] = useState(null);
    const [showGitOpsWarningModal, toggleGitOpsWarningModal] = useState(false);
    const [isGitOpsConfigAvailable, setIsGitOpsConfigAvailable] = useState(false);
    const {
        state,
        validateData,
        handleNameChange,
        toggleChart,
        getChartVersionsAndValues,
        handleChartVersionChange,
        handleChartValueChange,
        handleEnvironmentChangeOfAllCharts,
    } = useChartGroup(groupId);
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                'chart-store': null,
                group: 'Chart groups',
                ':groupId': {
                    component: (
                        <AppSelector
                            api={() => getChartGroups().then((res) => ({ result: res.result.groups }))}
                            primaryKey="groupId"
                            primaryValue="name"
                            matchedKeys={[]}
                            apiPrimaryKey="id"
                        />
                    ),
                    linked: false,
                },
            },
        },
        [state.name],
    );
    const [showDeployModal, toggleDeployModal] = useState(false);
    const [chartGroupDetailsLoading, chartGroupInstalled, chartGroupDetailsError, reloadChartGroupDetails] = useAsync(
        () => getChartGroupInstallationDetails(groupId),
        [groupId],
    );
    const [deleting, setDeleting] = useState(false);
    const [confirmation, toggleConfirmation] = useState(false);

    useEffect(() => {
        isGitopsConfigured()
            .then((response) => {
                let isGitOpsConfigAvailable = response.result && response.result.exists;
                setIsGitOpsConfigAvailable(isGitOpsConfigAvailable);
            })
            .catch((error) => {
                showError(error);
            });
    }, []);

    function handleOnDeployTo() {
        if (isGitOpsConfigAvailable) {
            toggleDeployModal(true);
        } else {
            toggleGitOpsWarningModal(true);
        }
    }

    function handleAdvancedChart() {
        if (isGitOpsConfigAvailable) {
            push(`${url}/deploy`, {
                charts: state.charts,
                configureChartIndex: state.charts.findIndex((chart) => chart.isEnabled),
            });
        } else {
            toggleGitOpsWarningModal(true);
        }
    }

    function redirectToConfigure() {
        let url = `${URLS.CHARTS}/discover/group/${groupId}/edit`;
        push(url);
    }

    async function deleteInstalledChartFromDeployments(installedAppId: number) {
        try {
            await deleteInstalledChart(installedAppId);
            toast.success('Successfully Deleted');
            reloadChartGroupDetails();
        } catch (err) {
            showError(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleInstall() {
        try {
            setLoading(true);
            const validated = await validateData();
            if (!validated) {
                return;
            }
            const deployableCharts = getDeployableChartsFromConfiguredCharts(state.charts);
            await deployChartGroup(projectId, deployableCharts, Number(groupId));
            toast.success('Deployment initiated');
            toggleDeployModal(false);
            reloadChartGroupDetails();
        } catch (err) {
            showError(err);
        } finally {
            setLoading(false);
        }
    }

    let payload = {
         
    }
    
    return (
        <div className="chart-group-details-page">
            <div className="page-header">
                <div className="flex left column">
                    <div className="flex left">
                        <BreadCrumb sep={'/'} breadcrumbs={breadcrumbs} />
                    </div>
                    <div className="page-header__title">{state.name}</div>
                </div>
                <div className="page-header__cta-container flex">
                    <button type="button" className="cta flex cancel mr-16" onClick={redirectToConfigure}>
                        <Pencil className="mr-5" />
                        Edit
                    </button>
                    <button className="cta delete" type="button" onClick={() => toggleConfirmation(true)}>
                        {deleting ? <Progressing /> : 'Delete'}
                    </button>
                </div>
            </div>
            <div className="chart-group-details-page__body">
                {state.loading && <Progressing pageLoader />}
                {!state.loading && (
                    <div className="deploy-and-details-view summary-show">
                        <div className="deploy-and-details-view--details">
                            <ChartGroupDeployments
                                name={chartGroupInstalled?.result?.name || ''}
                                description={chartGroupInstalled?.result?.description || ''}
                                installedChartData={chartGroupInstalled?.result?.installedChartData || []}
                                deleteInstalledChart={deleteInstalledChartFromDeployments}
                            />
                        </div>
                        <div className="summary">
                            <MultiChartSummary
                                charts={state.charts}
                                configureChartIndex={state.configureChartIndex}
                                toggleChart={toggleChart}
                                getChartVersionsAndValues={getChartVersionsAndValues}
                                configureChart={(index) => {
                                    if (!state.charts[index].isEnabled) {
                                        toast.warn('Please enable chart to configure.');
                                        return;
                                    }
                                    push(`${url}/deploy`, {
                                        configureChartIndex: index,
                                        charts: state.charts,
                                        projectId,
                                    });
                                }}
                                handleChartValueChange={handleChartValueChange}
                                handleChartVersionChange={handleChartVersionChange}
                            />
                            <div className={`flex left deployment-buttons`}>
                                <ConditionalWrap
                                    condition={state.charts.filter((chart) => chart.isEnabled).length === 0}
                                    wrap={(children) => (
                                        <Tippy
                                            className="default-tt"
                                            arrow={false}
                                            placement="top"
                                            content="No charts to deploy."
                                        >
                                            <div>{children}</div>
                                        </Tippy>
                                    )}
                                >
                                    <button
                                        type="button"
                                        disabled={state.charts.filter((chart) => chart.isEnabled).length === 0}
                                        /*onClick={(e) =>
                                           push(`${url}/deploy`, {
                                               charts: state.charts,
                                               configureChartIndex: state.charts.findIndex((chart) => chart.isEnabled),
                                           })

                                        }*/
                                        onClick={handleAdvancedChart}
                                        className="cta cancel ellipsis-right w100"
                                    >
                                        Advanced Options
                                    </button>
                                </ConditionalWrap>
                                <ConditionalWrap
                                    condition={state.charts.filter((chart) => chart.isEnabled).length === 0}
                                    wrap={(children) => (
                                        <Tippy
                                            className="default-tt"
                                            arrow={false}
                                            placement="top"
                                            content="No charts to deploy."
                                        >
                                            <div>{children}</div>
                                        </Tippy>
                                    )}
                                >
                                    <button
                                        type="button"
                                        disabled={state.charts.filter((chart) => chart.isEnabled).length === 0}
                                        onClick={() => handleOnDeployTo()}
                                        className="cta ellipsis-right w100"
                                    >
                                        {loading ? <Progressing /> : 'Deploy to ...'}
                                    </button>
                                </ConditionalWrap>
                            </div>
                        </div>
                    </div>
                )}
                 {confirmation && (
                <DeleteComponent
                    setDeleting={setDeleting}
                    deleteComponent={deleteChartGroup}
                    payload={payload}
                    title={state.name}
                    toggleConfirmation={toggleConfirmation}
                    component={'chart group'}
                    confirmationDialogDescription={
                        ''
                    }
                />
            )}
            </div>
            {showDeployModal ? (
                <ChartGroupBasicDeploy
                    projects={state.projects}
                    chartGroupEntries={state.charts}
                    environments={state.environments}
                    selectedProjectId={projectId}
                    deployChartGroup={handleInstall}
                    loading={loading}
                    handleProjectChange={setProjectId}
                    handleNameChange={handleNameChange}
                    closeDeployModal={() => toggleDeployModal(false)}
                    validateData={validateData}
                    handleEnvironmentChangeOfAllCharts={handleEnvironmentChangeOfAllCharts}
                    redirectToAdvancedOptions={() => {
                        toggleDeployModal(false);
                        push(`${url}/deploy`, { charts: state.charts, projectId });
                    }}
                />
            ) : null}

            {showGitOpsWarningModal ? (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon src={warn} />
                    <ConfirmationDialog.Body title="GitOps configuration required">
                        <p className="">
                            GitOps configuration is required to perform this action. Please configure GitOps and try
                            again.
                        </p>
                    </ConfirmationDialog.Body>
                    <ConfirmationDialog.ButtonGroup>
                        <button
                            type="button"
                            tabIndex={3}
                            className="cta cancel sso__warn-button"
                            onClick={() => toggleGitOpsWarningModal(false)}
                        >
                            Cancel
                        </button>
                        <NavLink className="cta sso__warn-button btn-confirm" to={`/global-config/gitops`}>
                            Configure GitOps
                        </NavLink>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            ) : null}
        </div>
    );
}
