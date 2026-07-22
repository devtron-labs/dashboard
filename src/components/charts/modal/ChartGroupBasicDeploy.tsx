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

import { Component, SyntheticEvent } from 'react'
import {
    ComponentSizeType,
    CustomInput,
    DialogForm,
    DialogFormSubmit,
    SelectPicker,
    showError,
    handleAnalyticsEvent,
    DeploymentAppTypes,
} from '@devtron-labs/devtron-fe-common-lib'
import { ProjectType, ChartGroupEntry, EnvironmentType } from '../charts.types'
import Edit from '../../../assets/icons/ic-edit.svg?react'
import Error from '../../../assets/icons/ic-warning.svg?react'
import placeHolder from '../../../assets/icons/ic-plc-chart.svg'
import { getEnvironmentListMin } from '../../../services/service'
import { DeploymentAppRadioGroup } from '@Components/v2/values/chartValuesDiff/ChartValuesView.component'

import './chartGroupBasicDeploy.scss'

interface ChartGroupBasicDeployProps {
    projects: ProjectType[]
    chartGroupEntries: ChartGroupEntry[]
    environments: {
        id: number
        environment_name: string
        isVirtualEnvironment?: boolean
        allowedDeploymentTypes?: DeploymentAppTypes[]
    }[]
    selectedProjectId: number
    loading: boolean
    deployChartGroup: () => void
    handleProjectChange: (...args) => void
    handleEnvironmentChangeOfAllCharts: (envId: number) => void
    handleDeploymentAppTypeChange: (selectedType: DeploymentAppTypes) => void
    handleNameChange: (chartEntryIndex: number, name: string) => void
    handleGitRepoUrlChange: (chartEntryIndex: number, gitRepoUrl: string) => void
    closeDeployModal: () => void
    redirectToAdvancedOptions: () => void
    validateData: () => any
    setEnvironments: (envList: EnvironmentType) => void
    allowCustomRepository: boolean
}

interface ChartGroupBasicDeployState {
    showAppNames: boolean
    selectedEnvironmentId: number
    showError: boolean
    selectedDeploymentAppType: DeploymentAppTypes
}

export default class ChartGroupBasicDeploy extends Component<ChartGroupBasicDeployProps, ChartGroupBasicDeployState> {
    constructor(props) {
        super(props)
        this.state = {
            selectedEnvironmentId: 0,
            showAppNames: false,
            showError: false,
            selectedDeploymentAppType: DeploymentAppTypes.HELM,
        }
        this.toggleShowAppName = this.toggleShowAppName.bind(this)
        this.deployChartGroup = this.deployChartGroup.bind(this)
    }

    async componentDidMount() {
        if (this.props.environments?.length) {
            return
        }
        try {
            const { result } = await getEnvironmentListMin(true)
            this.props.setEnvironments(result)
        } catch (error) {
            showError(error)
        }
    }

    toggleShowAppName(event): void {
        this.setState({ showAppNames: !this.state.showAppNames })
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_BULK_DEPLOY_TO_EDIT_APP_NAME' })
    }

    handleEnvironmentChange(envId: number) {
        this.setState({ selectedEnvironmentId: envId })
        this.props.handleEnvironmentChangeOfAllCharts(envId)
    }

    handleDeploymentAppTypeChange = (e: SyntheticEvent) => {
        const selectedType = (e.target as HTMLInputElement).value as DeploymentAppTypes
        this.setState({ selectedDeploymentAppType: selectedType })
        this.props.handleDeploymentAppTypeChange(selectedType)
    }

    async deployChartGroup() {
        const validated = await this.props.validateData()
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_BULK_DEPLOY_TO_DEPLOY' })
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

    handleAdvancedOptions = () => {
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_BULK_DEPLOY_TO_ADV_OPTIONS' })
        this.props.redirectToAdvancedOptions()
    }

    render() {
        const environments: { label: string; value: string; isVirtualEnvironment?: boolean }[] =
            this.props.environments.map((p) => {
                return {
                    value: String(p.id),
                    label: p.environment_name,
                    isVirtualEnvironment: p.isVirtualEnvironment,
                    allowedDeploymentTypes: p.allowedDeploymentTypes ?? [],
                }
            })

        const tempE = this.props.environments.find((env) => env.id === this.state.selectedEnvironmentId)
        const selectedEnvironment: { label: string; value: string; allowedDeploymentTypes: DeploymentAppTypes[] } =
            tempE
                ? {
                      label: tempE.environment_name,
                      value: String(tempE.id),
                      allowedDeploymentTypes: tempE.allowedDeploymentTypes,
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
                            inputId="chart-group-deployment-project"
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
                            inputId="chart-group-deployment-env"
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
                    {selectedEnvironment && !window._env_.HIDE_GITOPS_OR_HELM_OPTION && (
                        <div className="flexbox-col dc__gap-6 w-100 chart-group-deployment-radio">
                            <span className="fs-13 cn-7 lh-20 fw-4">How do you want to deploy?</span>
                            <DeploymentAppRadioGroup
                                isDisabled={false}
                                deploymentAppType={this.state.selectedDeploymentAppType}
                                handleOnChange={this.handleDeploymentAppTypeChange}
                                allowedDeploymentTypes={selectedEnvironment?.allowedDeploymentTypes || []}
                                rootClassName="flexbox"
                            />
                            <span className="fs-11 lh-16 cr-5 fw-4">This cannot be changed after deployment</span>
                        </div>
                    )}
                    {this.renderApplicationListHeader()}
                    <ApplicationNameList
                        charts={this.props.chartGroupEntries}
                        handleNameChange={this.props.handleNameChange}
                        showAppNames={this.state.showAppNames}
                        handleGitRepoUrlChange={this.props.handleGitRepoUrlChange}
                        deploymentAppType={this.state.selectedDeploymentAppType}
                        allowCustomRepository={this.props.allowCustomRepository}
                    />
                </div>
                <div className="deploy-selected-charts__bottom flexbox flex-justify">
                    <button
                        type="button"
                        className="cta cancel"
                        onClick={this.handleAdvancedOptions}
                        data-testid="deployment-advance-button"
                    >
                        Advanced Options
                    </button>
                    <DialogFormSubmit tabIndex={3}>Deploy Chart</DialogFormSubmit>
                </div>
            </DialogForm>
        )
    }
}

const ApplicationNameList = ({
    charts,
    handleNameChange,
    showAppNames,
    handleGitRepoUrlChange,
    deploymentAppType,
    allowCustomRepository,
}) => {
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
                            <div className="flexbox-col dc__gap-6">
                                <span>{`${chart.chartMetaData.chartRepoName}/${chart.chartMetaData.chartName}`}</span>
                                <div className="flexbox dc__gap-12">
                                    <CustomInput
                                        placeholder="Enter chart name"
                                        name={`chart-name-edit-input-${index}`}
                                        label="Application Name"
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
                                                        onClick={(e) =>
                                                            handleNameChange(index, chart.name.suggestedName)
                                                        }
                                                    >
                                                        {chart.name.suggestedName}
                                                    </span>
                                                </>
                                            ) : null
                                        }
                                        fullWidth
                                    />
                                    {deploymentAppType !== DeploymentAppTypes.HELM && allowCustomRepository && (
                                        <CustomInput
                                            placeholder="Enter Git Repo URL"
                                            name={`git-repo-url-input-${index}`}
                                            label="Git Repo URL"
                                            value={chart.gitRepoUrl?.value || ''}
                                            onChange={(event) => {
                                                handleGitRepoUrlChange(index, event.target.value)
                                            }}
                                            error={chart.gitRepoUrl?.error}
                                            required
                                            fullWidth
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }
                return null
            })}
        </div>
    )
}
