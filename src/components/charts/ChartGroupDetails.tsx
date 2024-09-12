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

import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import { useState } from 'react'
import {
    showError,
    Progressing,
    BreadCrumb,
    useBreadcrumb,
    ConditionalWrap,
    useAsync,
    PageHeader,
    DeleteComponent,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import ChartGroupDeployments from './ChartGroupDeployments'
import MultiChartSummary from './MultiChartSummary'
import useChartGroup from './useChartGroup'
import { URLS } from '../../config'
import { Pencil } from '../common'
import { getDeployableChartsFromConfiguredCharts } from './list/DiscoverCharts'
import {
    deployChartGroup,
    getChartGroupInstallationDetails,
    deleteInstalledChart,
    getChartGroups,
    deleteChartGroup,
} from './charts.service'
import ChartGroupBasicDeploy from './modal/ChartGroupBasicDeploy'
import { DeleteComponentsName } from '../../config/constantMessaging'
import { ChartSelector } from '../AppSelector'
import NoGitOpsConfiguredWarning from '../workflowEditor/NoGitOpsConfiguredWarning'
import { renderChartGroupDeploymentToastMessage } from './charts.helper'

export default function ChartGroupDetails() {
    const { groupId } = useParams<{ groupId }>()
    const { push } = useHistory()
    const { url } = useRouteMatch()
    const [projectId, setProjectId] = useState(null)
    const [loading, setLoading] = useState(null)
    const {
        state,
        validateData,
        handleNameChange,
        toggleChart,
        getChartVersionsAndValues,
        handleChartVersionChange,
        handleChartValueChange,
        handleEnvironmentChangeOfAllCharts,
        setEnvironmentList,
    } = useChartGroup(groupId)
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                'chart-store': null,
                group: 'Chart groups',
                ':groupId': {
                    component: (
                        <ChartSelector
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
    )
    const [showDeployModal, toggleDeployModal] = useState(false)
    const [chartGroupDetailsLoading, chartGroupInstalled, chartGroupDetailsError, reloadChartGroupDetails] = useAsync(
        () => getChartGroupInstallationDetails(groupId),
        [groupId],
    )
    const [deleting, setDeleting] = useState(false)
    const [confirmation, toggleConfirmation] = useState(false)
    const [showGitOpsWarningModal, toggleGitOpsWarningModal] = useState(false)
    const [clickedOnAdvance, setClickedOnAdvance] = useState(null)

    function handleAdvancedChart() {
        push(`${url}/deploy`, {
            charts: state.charts,
            configureChartIndex: state.charts.findIndex((chart) => chart.isEnabled),
        })
    }

    function redirectToConfigure() {
        const url = `${URLS.CHARTS}/discover/group/${groupId}/edit`
        push(url)
    }

    async function deleteInstalledChartFromDeployments(installedAppId: number) {
        try {
            await deleteInstalledChart(installedAppId)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Successfully Deleted',
            })
            reloadChartGroupDetails()
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleInstall() {
        try {
            setLoading(true)
            const validated = await validateData()
            if (!validated) {
                return
            }
            const deployableCharts = getDeployableChartsFromConfiguredCharts(state.charts)
            const { result } = await deployChartGroup(projectId, deployableCharts, Number(groupId))
            // TODO: Proper error handling in case of deployment is failed.
            renderChartGroupDeploymentToastMessage(result)
            toggleDeployModal(false)
            reloadChartGroupDetails()
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    function getDeleteComponent() {
        const payload = {
            name: state.name,
            description: state.description,
            id: parseInt(groupId),
            chartGroupEntries: state.charts,
            installedChartData: chartGroupInstalled?.result?.installedChartData,
        }

        return (
            <DeleteComponent
                setDeleting={setDeleting}
                deleteComponent={deleteChartGroup}
                payload={payload}
                title={state.name}
                toggleConfirmation={toggleConfirmation}
                component={DeleteComponentsName.ChartGroup}
                redirectTo
                url={`${URLS.CHARTS}/discover`}
            />
        )
    }

    const handleDeployButtonClick = (): void => {
        handleActionButtonClick(false)
    }

    const handleAdvancedButtonClick = (): void => {
        handleActionButtonClick(true)
    }

    const handleActionButtonClick = (_clickedOnAdvance: boolean): void => {
        if (state.noGitOpsConfigAvailable) {
            setClickedOnAdvance(_clickedOnAdvance)
            toggleGitOpsWarningModal(true)
        } else {
            handleContinueWithHelm(_clickedOnAdvance)
        }
    }

    const handleContinueWithHelm = (_clickedOnAdvance: boolean): void => {
        if (_clickedOnAdvance) {
            handleAdvancedChart()
        } else {
            toggleDeployModal(true)
        }
    }

    const hideNoGitOpsWarning = (isContinueWithHelm: boolean): void => {
        toggleGitOpsWarningModal(false)
        if (isContinueWithHelm) {
            handleContinueWithHelm(clickedOnAdvance)
        }
    }

    const renderChartGroupActionButton = () => {
        return (
            <div className="dc__page-header__cta-container flex">
                <button
                    type="button"
                    className="cta flex cancel mr-16 h-32"
                    onClick={redirectToConfigure}
                    data-testid="chart-group-edit-button"
                >
                    <Pencil className="mr-5" />
                    Edit
                </button>
                <button
                    className="cta flex delete h-32"
                    type="button"
                    data-testid="chart-group-delete-button"
                    onClick={() => toggleConfirmation(true)}
                >
                    {deleting ? <Progressing /> : 'Delete'}
                </button>
            </div>
        )
    }

    const renderBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb sep="/" breadcrumbs={breadcrumbs} />
            </div>
        )
    }
    return (
        <div className="chart-group-details-page">
            <PageHeader
                isBreadcrumbs
                breadCrumbs={renderBreadcrumbs}
                renderActionButtons={renderChartGroupActionButton}
            />
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
                                        ToastManager.showToast({
                                            variant: ToastVariantType.warn,
                                            description: 'Please enable chart to configure.',
                                        })
                                        return
                                    }
                                    push(`${url}/deploy`, {
                                        configureChartIndex: index,
                                        charts: state.charts,
                                        projectId,
                                    })
                                }}
                                handleChartValueChange={handleChartValueChange}
                                handleChartVersionChange={handleChartVersionChange}
                            />
                            <div className="flex left deployment-buttons">
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
                                        /* onClick={(e) =>
                                           push(`${url}/deploy`, {
                                               charts: state.charts,
                                               configureChartIndex: state.charts.findIndex((chart) => chart.isEnabled),
                                           })

                                        } */
                                        onClick={handleAdvancedButtonClick}
                                        className="cta cancel dc__ellipsis-right w-100"
                                        data-testid="advanced-options-button"
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
                                        onClick={handleDeployButtonClick}
                                        className="cta dc__ellipsis-right w-100"
                                        data-testid="group-deploy-to-button"
                                    >
                                        {loading ? <Progressing /> : 'Deploy to ...'}
                                    </button>
                                </ConditionalWrap>
                            </div>
                        </div>
                    </div>
                )}
                {confirmation && getDeleteComponent()}
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
                        toggleDeployModal(false)
                        push(`${url}/deploy`, { charts: state.charts, projectId })
                    }}
                    setEnvironments={setEnvironmentList}
                />
            ) : null}
            {showGitOpsWarningModal && <NoGitOpsConfiguredWarning closePopup={hideNoGitOpsWarning} />}
        </div>
    )
}
