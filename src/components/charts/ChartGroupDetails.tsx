import React, { useState, useEffect } from 'react'
import { useParams, useHistory, useRouteMatch } from 'react-router'
import ChartGroupDeployments from './ChartGroupDeployments'
import MultiChartSummary from './MultiChartSummary'
import useChartGroup from './useChartGroup'
import { URLS } from '../../config'
import { Progressing, showError, BreadCrumb, Pencil, useBreadcrumb, ConditionalWrap, useAsync } from '../common'
import { getDeployableChartsFromConfiguredCharts } from './list/DiscoverCharts'
import {
    deployChartGroup,
    getChartGroupInstallationDetails,
    deleteInstalledChart,
    getChartGroups,
    deleteChartGroup,
} from './charts.service'
import { toast } from 'react-toastify'
import ChartGroupBasicDeploy from './modal/ChartGroupBasicDeploy'
import Tippy from '@tippyjs/react'
import DeleteComponent from '../../util/DeleteComponent'
import { DeleteComponentsName } from '../../config/constantMessaging'
import { ChartSelector } from '../AppSelector'
import PageHeader from '../common/header/PageHeader'

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

    function handleAdvancedChart() {
            push(`${url}/deploy`, {
                charts: state.charts,
                configureChartIndex: state.charts.findIndex((chart) => chart.isEnabled),
            })
    }

    function redirectToConfigure() {
        let url = `${URLS.CHARTS}/discover/group/${groupId}/edit`
        push(url)
    }

    async function deleteInstalledChartFromDeployments(installedAppId: number) {
        try {
            await deleteInstalledChart(installedAppId)
            toast.success('Successfully Deleted')
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
            await deployChartGroup(projectId, deployableCharts, Number(groupId))
            toast.success('Deployment initiated')
            toggleDeployModal(false)
            reloadChartGroupDetails()
        } catch (err) {
            showError(err)
        } finally {
            setLoading(false)
        }
    }

    function getDeleteComponent() {
        let payload = {
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
                redirectTo={true}
                url={`${URLS.CHARTS}/discover`}
                reload={false}
            />
        )
    }

    const renderChartGroupActionButton = () => {
        return (
            <div className="page-header__cta-container flex">
                <button type="button" className="cta flex cancel mr-16 h-32" onClick={redirectToConfigure}>
                    <Pencil className="mr-5" />
                    Edit
                </button>
                <button className="cta flex delete h-32" type="button" onClick={() => toggleConfirmation(true)}>
                    {deleting ? <Progressing /> : 'Delete'}
                </button>
            </div>
        )
    }

    const renderBreadcrumbs = () => {
        return (
            <div className="flex left">
                <BreadCrumb sep={'/'} breadcrumbs={breadcrumbs} />
            </div>
        )
    }
    return (
        <div className="chart-group-details-page">
            <PageHeader
                isBreadcrumbs={true}
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
                                        toast.warn('Please enable chart to configure.')
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
                                        onClick={() => toggleDeployModal(true)}
                                        className="cta ellipsis-right w100"
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
                />
            ) : null}
        </div>
    )
}
