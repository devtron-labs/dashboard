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
    ToastVariantType,
    ToastManager,
    DeleteConfirmationModal,
    Button,
    ButtonVariantType,
    ButtonStyleType,
    ComponentSizeType,
    ApplicationManagementIcon
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import ChartGroupDeployments from './ChartGroupDeployments'
import MultiChartSummary from './MultiChartSummary'
import useChartGroup from './useChartGroup'
import { URLS } from '../../config'
import { ReactComponent as Pencil } from '@Icons/ic-pencil.svg'
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
import { getDeployableChartsFromConfiguredCharts } from './list/utils'

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
                'application-management': {
                    component: <ApplicationManagementIcon />,
                    linked: true,
                },
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
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [showGitOpsWarningModal, toggleGitOpsWarningModal] = useState(false)
    const [clickedOnAdvance, setClickedOnAdvance] = useState(null)

    function handleAdvancedChart() {
        push(`${url}/deploy`, {
            charts: state.charts,
            configureChartIndex: state.charts.findIndex((chart) => chart.isEnabled),
        })
    }

    function redirectToConfigure() {
        const url = `${URLS.APPLICATION_MANAGEMENT_CHART_STORE_DISCOVER}/group/${groupId}/edit`
        push(url)
    }

    async function deleteInstalledChartFromDeployments(installedAppId: number) {
        await deleteInstalledChart(installedAppId)
        reloadChartGroupDetails()
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

    const closeConfirmationModal = () => setShowConfirmationModal(false)
    const onClickConfirmationModal = () => setShowConfirmationModal(true)

    const onDelete = async () => {
        const payload = {
            name: state.name,
            description: state.description,
            id: parseInt(groupId),
            chartGroupEntries: state.charts,
            installedChartData: chartGroupInstalled?.result?.installedChartData,
        }
        await deleteChartGroup(payload)
        push(URLS.APPLICATION_MANAGEMENT_CHART_STORE_DISCOVER)
    }

    const renderDeleteComponent = () => {
        return (
            <DeleteConfirmationModal
                title={state.name}
                closeConfirmationModal={closeConfirmationModal}
                component={DeleteComponentsName.ChartGroup}
                onDelete={onDelete}
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
            <div className="dc__page-header__cta-container flex dc__gap-12">
                <Button
                    text="Edit"
                    variant={ButtonVariantType.secondary}
                    style={ButtonStyleType.neutral}
                    size={ComponentSizeType.medium}
                    dataTestId="chart-group-edit-button"
                    startIcon={<Pencil />}
                    onClick={redirectToConfigure}
                />
                <Button
                    text="Delete"
                    variant={ButtonVariantType.secondary}
                    style={ButtonStyleType.negative}
                    size={ComponentSizeType.medium}
                    dataTestId="chart-group-delete-button"
                    onClick={onClickConfirmationModal}
                />
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
            <div className="chart-group-details-page__body flexbox-col dc__overflow-auto">
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
                {showConfirmationModal && renderDeleteComponent()}
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
