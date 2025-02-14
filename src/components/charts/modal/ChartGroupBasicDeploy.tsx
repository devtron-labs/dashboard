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

import { Component } from 'react'
import { ComponentSizeType, CustomInput, DialogForm, DialogFormSubmit, SelectPicker, showError, DEFAULT_ROUTE_PROMPT_MESSAGE } from '@devtron-labs/devtron-fe-common-lib'
import { ProjectType, ChartGroupEntry, EnvironmentType } from '../charts.types'
import { ReactComponent as Edit } from '../../../assets/icons/ic-edit.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-warning.svg'
import { renderAdditionalErrorInfo } from '../charts.util'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import { getEnvironmentListMin } from '../../../services/service'
import { Prompt } from 'react-router-dom'

interface ChartGroupBasicDeployProps {
    projects: ProjectType[]
    chartGroupEntries: ChartGroupEntry[]
    environments: { id: number; environment_name: string; isVirtualEnvironment?: boolean }[]
    selectedProjectId: number
    loading: boolean
    deployChartGroup: () => void
    handleProjectChange: (...args) => void
    handleEnvironmentChangeOfAllCharts: (envId: number) => void
    handleNameChange: (chartEntryIndex: number, name: string) => void
    closeDeployModal: () => void
    redirectToAdvancedOptions: () => void
    validateData: () => any
    setEnvironments: (envList: EnvironmentType) => void
}

interface ChartGroupBasicDeployState {
    showAppNames: boolean
    selectedEnvironmentId: number
    showError: boolean
}

export default class ChartGroupBasicDeploy extends Component<ChartGroupBasicDeployProps, ChartGroupBasicDeployState> {
    constructor(props) {
        super(props)
        this.state = {
            selectedEnvironmentId: 0,
            showAppNames: false,
            showError: false,
        }
        this.toggleShowAppName = this.toggleShowAppName.bind(this)
        this.deployChartGroup = this.deployChartGroup.bind(this)
    }

    async componentDidMount() {
        if (this.props.environments?.length) {
            return
        }
        try {
            const { result } = await getEnvironmentListMin()
            this.props.setEnvironments(result)
        } catch (error) {
            showError(error)
        }
    }

    toggleShowAppName(event): void {
        this.setState({ showAppNames: !this.state.showAppNames })
    }

    handleEnvironmentChange(envId: number) {
        this.setState({ selectedEnvironmentId: envId })
        this.props.handleEnvironmentChangeOfAllCharts(envId)
    }

    async deployChartGroup() {
        const validated = await this.props.validateData()
        if (validated) {
            await this.props.deployChartGroup()
        } else {
            this.setState({ showAppNames: true, showError: true })
        }
    }

    renderApplicationListHeader() {
        const appNames = this.props.chartGroupEntries
            .filter((chart) => chart.isEnabled)
            .map((chart) => {
                return chart.name.value
            })
            .join(', ')
        return (
            <div className="deploy-selected-charts__applications dc__border-top-n1 pt-16" tabIndex={0}>
                <div className="flex-1">
                    <h3 className="deploy-selected-charts__applications-title">Application Names</h3>
                    {this.state.showAppNames ? null : (
                        <div className="deploy-selected-charts__app_names">{appNames}</div>
                    )}
                </div>
                <button
                    type="button"
                    className="deploy-selected-charts__applications-edit"
                    data-testid="edit-application-name-chart-icon"
                    onClick={this.toggleShowAppName}
                >
                    <Edit className="icon-dim-24" />
                </button>
            </div>
        )
    }

    render() {
        const environments: { label: string; value: string; isVirtualEnvironment?: boolean }[] =
            this.props.environments.map((p) => {
                return {
                    value: String(p.id),
                    label: p.environment_name,
                    isVirtualEnvironment: p.isVirtualEnvironment,
                }
            })

        const tempE = this.props.environments.find((env) => env.id === this.state.selectedEnvironmentId)
        const selectedEnvironment: { label: string; value: string } = tempE
            ? {
                  label: tempE.environment_name,
                  value: String(tempE.id),
              }
            : undefined

        const projects: { label: string; value: string }[] = this.props.projects.map((p) => {
            return { value: String(p.id), label: p.name }
        })
        const temp = this.props.projects.find((p) => p.id === this.props.selectedProjectId)
        const selectedProject: { label: string; value: string } = temp
            ? {
                  label: temp.name,
                  value: String(temp.id),
              }
            : undefined

        const rootClassName = this.state.showAppNames
            ? 'modal__body--deploy-selected-charts modal__body--deploy-selected-charts-show'
            : 'modal__body--deploy-selected-charts'
        return (
            <DialogForm
                className={rootClassName}
                title="Deploy Selected Charts"
                isLoading={this.props.loading}
                closeOnESC
                close={this.props.closeDeployModal}
                onSave={this.deployChartGroup}
            >
                <div className="deploy-selected-charts__body">
                    <label className="form__row">
                        <SelectPicker
                            autoFocus
                            classNamePrefix="group-deployment-project"
                            inputId='chart-group-deployment-project'
                            value={selectedProject}
                            placeholder="Select Project"
                            onChange={(selected) => {
                                this.props.handleProjectChange(parseInt((selected as any).value))
                            }}
                            options={projects}
                            size={ComponentSizeType.large}
                            label="Project"
                            required
                        />
                        <span className="form__error">
                            {!this.props.selectedProjectId && this.state.showError ? (
                                <>
                                    <Error className="form__icon form__icon--error" />
                                    This is a required Field
                                </>
                            ) : null}
                        </span>
                    </label>
                    <div className="form__row">
                        <SelectPicker
                            name="chart-group-deployment-env"
                            inputId='chart-group-deployment-env'
                            value={selectedEnvironment}
                            classNamePrefix="group-deployment-env"
                            placeholder="Select Environment"
                            onChange={(selected) => {
                                this.handleEnvironmentChange(parseInt((selected as any).value))
                            }}
                            options={environments?.filter((item) => !item.isVirtualEnvironment)}
                            size={ComponentSizeType.large}
                            label="Deploy to Environment"
                            required
                        />
                        <span className="form__error">
                            {!this.state.selectedEnvironmentId && this.state.showError ? (
                                <>
                                    <Error className="form__icon form__icon--error" />
                                    This is a required Field
                                </>
                            ) : null}
                        </span>
                    </div>
                    {this.renderApplicationListHeader()}
                    <ApplicationNameList
                        charts={this.props.chartGroupEntries}
                        handleNameChange={this.props.handleNameChange}
                        showAppNames={this.state.showAppNames}
                    />
                </div>
                <div className="deploy-selected-charts__bottom flexbox flex-justify">
                    <button
                        type="button"
                        className="cta cancel"
                        onClick={this.props.redirectToAdvancedOptions}
                        data-testid="deployment-advance-button"
                    >
                        Advanced Options
                    </button>
                    <Prompt when={this.props.loading} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
                    <DialogFormSubmit tabIndex={3}>Deploy Chart</DialogFormSubmit>
                </div>
            </DialogForm>
        )
    }
}

const ApplicationNameList = ({ charts, handleNameChange, showAppNames }) => {
    function handleImageError(e) {
        const target = e.target as HTMLImageElement
        target.onerror = null
        target.src = placeHolder
    }

    let listClassNames = 'deploy-selected-chart__list'
    if (showAppNames) {
        listClassNames = `${listClassNames} show`
    }

    return (
        <div className={listClassNames}>
            {charts.map((chart, index) => {
                if (chart.isEnabled) {
                    return (
                        <div key={index} className="form__row deploy-selected-chart__list-item">
                            <img
                                onError={handleImageError}
                                src={chart.chartMetaData.icon || ''}
                                alt=""
                                className="dc__chart-grid-item__icon"
                            />
                            <div className="w-100">
                                <CustomInput
                                    placeholder="Enter chart name"
                                    name={`chart-name-edit-input-${index}`}
                                    label={`${chart.chartMetaData.chartRepoName}/${chart.chartMetaData.chartName}`}
                                    value={chart.name.value}
                                    onChange={(event) => {
                                        handleNameChange(index, event.target.value)
                                    }}
                                    error={chart.name.error}
                                    required
                                    helperText={
                                        chart.name.suggestedName ? (
                                            <>
                                                Suggested Name:
                                                <span
                                                    className="anchor pointer"
                                                    onClick={(e) => handleNameChange(index, chart.name.suggestedName)}
                                                >
                                                    {chart.name.suggestedName}
                                                </span>
                                            </>
                                        ) : null
                                    }
                                />
                            </div>
                        </div>
                    )
                }
                return null
            })}
        </div>
    )
}
