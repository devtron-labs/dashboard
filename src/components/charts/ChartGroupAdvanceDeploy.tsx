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

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useHistory, useLocation, useRouteMatch, Prompt } from 'react-router-dom'
import {
    showError,
    Progressing,
    BreadCrumb,
    useBreadcrumb,
    ConditionalWrap,
    useEffectAfterMount,
    PageHeader,
    ToastVariantType,
    ToastManager,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import MultiChartSummary from './MultiChartSummary'
import useChartGroup from './useChartGroup'
import { Select, mapByKey } from '../common'
import AdvancedConfig from './AdvancedConfig'
import { getDeployableChartsFromConfiguredCharts } from './list/DiscoverCharts'
import { deployChartGroup } from './charts.service'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-alert-triangle.svg'
import { renderChartGroupDeploymentToastMessage } from './charts.helper'

export default function ChartGroupAdvanceDeploy() {
    const { groupId } = useParams<{ groupId: string }>()
    const { push } = useHistory()
    const location = useLocation()
    const [project, setProject] = useState({ id: null, error: '' })
    const [installing, setInstalling] = useState(false)
    const {
        state,
        validateData,
        handleValuesYaml,
        handleNameChange,
        handleEnvironmentChange,
        configureChart,
        toggleChart,
        fetchChartValues,
        getChartVersionsAndValues,
        handleChartVersionChange,
        handleChartValueChange,
        discardValuesYamlChanges,
        setCharts,
    } = useChartGroup(groupId)
    const projectsMap = mapByKey(state.projects, 'id')
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                'chart-store': 'Chart store',
                group: 'Chart groups',
                ':groupId': {
                    component: state.name,
                    linked: true,
                },
                deploy: { component: 'Advanced options', linked: false },
            },
        },
        [state.name],
    )
    const isLeavingPageAllowed = state.charts.every((chart) => chart.valuesYaml === chart.originalValuesYaml)

    const { url, path } = useRouteMatch()
    const [deployed, setDeployed] = useState(false)

    useEffectAfterMount(() => {
        if (state.loading) {
            return
        }
        if (state.charts.length === 0) {
            push(url.replace('/deploy', ''))
        }
        configureChart((location?.state as any)?.configureChartIndex || 0)
    }, [state.loading])

    useEffectAfterMount(() => {
        if (state.chartGroupDetailsLoading) {
            return
        }
        setCharts((location?.state as any)?.charts || [])
        if ((location?.state as any)?.projectId) {
            setProject({ id: (location?.state as any).projectId, error: '' })
        }
    }, [state.chartGroupDetailsLoading])

    const reloadCallback = useCallback(
        (event) => {
            event.preventDefault()
            if (!isLeavingPageAllowed) {
                event.returnValue = 'Your changes will be lost. Do you want to leave without deploying?'
            }
        },
        [isLeavingPageAllowed],
    )

    useEffect(() => {
        window.addEventListener('beforeunload', reloadCallback)
        return () => {
            window.removeEventListener('beforeunload', reloadCallback)
        }
    }, [reloadCallback])

    useEffectAfterMount(() => {
        // whenver deployment succeeds, go to deployments list
        if (!deployed) {
            return
        }
        push(url.replace('/deploy', ''))
    }, [deployed])

    async function handleInstall() {
        try {
            if (!project.id) {
                setProject((project) => ({ ...project, error: 'Project is mandatory for deployment.' }))
                return
            }
            setInstalling(true)
            const validated = await validateData()
            if (!validated) {
                ToastManager.showToast({
                    variant: ToastVariantType.warn,
                    description: 'Click on highlighted charts and resolve errors.',
                })
                return
            }
            const deployableCharts = getDeployableChartsFromConfiguredCharts(state.charts)
            const { result } = await deployChartGroup(project.id, deployableCharts, Number(groupId))
            setDeployed(true)
            // TODO: Proper error handling in case of deployment is failed.
            renderChartGroupDeploymentToastMessage(result)
        } catch (err) {
            showError(err)
        } finally {
            setInstalling(false)
        }
    }

    const renderAdvanceBreadcrumb = () => {
        return (
            <div className="flex left">
                <BreadCrumb sep="/" breadcrumbs={breadcrumbs.slice(1)} />
            </div>
        )
    }

    return (
        <div className="chart-group-advance-deploy-page">
            <PageHeader isBreadcrumbs breadCrumbs={renderAdvanceBreadcrumb} />
            <div className="chart-group-advance-deploy__body flexbox-col dc__overflow-auto">
                {!deployed && (
                    <Prompt
                        when={!isLeavingPageAllowed}
                        message="Your changes will be lost. Do you want to leave without deploying?"
                    />
                )}
                {state.loading && <Progressing pageLoader />}
                {!state.loading && (
                    <div className="deploy-and-details-view summary-show">
                        <div className="deploy-and-details-view--details">
                            {typeof state.configureChartIndex === 'number' && (
                                <AdvancedConfig
                                    chart={state.charts[state.configureChartIndex]}
                                    index={state.configureChartIndex}
                                    handleValuesYaml={handleValuesYaml}
                                    getChartVersionsAndValues={getChartVersionsAndValues}
                                    fetchChartValues={fetchChartValues}
                                    handleChartValueChange={handleChartValueChange}
                                    handleChartVersionChange={handleChartVersionChange}
                                    handleEnvironmentChange={handleEnvironmentChange}
                                    handleNameChange={handleNameChange}
                                    discardValuesYamlChanges={discardValuesYamlChanges}
                                />
                            )}
                        </div>
                        <div className="summary">
                            <MultiChartSummary
                                charts={state.charts}
                                configureChartIndex={state.configureChartIndex}
                                toggleChart={toggleChart}
                                getChartVersionsAndValues={getChartVersionsAndValues}
                                configureChart={configureChart}
                            />
                            <div className="deployment-buttons" style={{ gridTemplateColumns: '1fr' }}>
                                <div className="mb-12">
                                    <label className="dc__required-field">Project</label>
                                    <Select
                                        rootClassName={`${project.error ? 'popup-button--error' : ''}`}
                                        value={project.id}
                                        onChange={(e) => setProject({ id: e.target.value, error: '' })}
                                        dataTestId="select-project-button"
                                    >
                                        <Select.Button>
                                            {project.id && projectsMap.has(project.id)
                                                ? projectsMap.get(project.id).name
                                                : 'Select project'}
                                        </Select.Button>
                                        {state.projects?.map((project) => (
                                            <Select.Option key={project.id} value={project.id}>
                                                {project.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    {project.error && (
                                        <span className="form__error flex left">
                                            <WarningIcon className="mr-5 icon-dim-16" />
                                            {project.error}
                                        </span>
                                    )}
                                </div>
                                <ConditionalWrap
                                    condition={state.charts.filter((chart) => chart.isEnabled).length === 0}
                                    wrap={(children) => (
                                        <Tippy
                                            className="default-tt"
                                            arrow={false}
                                            placement="top"
                                            content="No charts selected for deployment."
                                        >
                                            <div>{children}</div>
                                        </Tippy>
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={handleInstall}
                                        disabled={state.charts.filter((chart) => chart.isEnabled).length === 0}
                                        className="cta dc__ellipsis-right"
                                        data-testid="deploy_button"
                                    >
                                        {installing ? <Progressing /> : 'Deploy'}
                                    </button>
                                </ConditionalWrap>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
