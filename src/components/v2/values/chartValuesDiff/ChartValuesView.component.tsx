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

import { useEffect, useState } from 'react'
import { GroupBase } from 'react-select'
import {
    Progressing,
    RadioGroup,
    RadioGroupItem,
    ConditionalWrap,
    DeploymentAppTypes,
    CustomInput,
    Drawer,
    TippyTheme,
    GitOpsAuthModeType,
    SelectPicker,
    SelectPickerOptionType,
    SelectPickerProps,
    MarkDown,
    ComponentSizeType,
    ButtonVariantType,
    handleAnalyticsEvent,
    Button,
    ButtonStyleType,
    Icon,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { importComponentFromFELibrary } from '../../../common'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as EditIcon } from '../../../../assets/icons/ic-pencil.svg'
import { AUTO_GENERATE_GITOPS_REPO, GITOPS_REPO_REQUIRED, GITOPS_REPO_REQUIRED_FOR_ENV } from './constant'
import './ChartValuesView.scss'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'

import {
    ActiveReadmeColumnProps,
    AppNameInputType,
    ChartEnvironmentSelectorType,
    ChartProjectSelectorType,
    ChartValuesSelectorType,
    ChartValuesViewActionTypes,
    ChartVersionSelectorType,
    ChartVersionValuesSelectorType,
    DeleteApplicationButtonProps,
    DeploymentAppRadioGroupType,
    DeploymentAppSelectorType,
    ValueNameInputType,
    gitOpsDrawerType,
} from './ChartValuesView.type'
import { REQUIRED_FIELD_MSG } from '../../../../config/constantMessaging'
import { repoType } from '../../../../config'
import UserGitRepo from '../../../gitOps/UserGitRepo'
import { getChartValuesFiltered } from '@Components/charts/charts.helper'
import { ChartValuesType } from '@Components/charts/charts.types'
import { ConfigureGitopsInfoBlock } from '@Components/workflowEditor/ConfigureGitopsInfoBlock'
import { DeploymentTypeIcon, DEPLOYMENT_TYPE_TO_TEXT_MAP } from '@Components/common/DeploymentTypeIcon'

const VirtualEnvSelectionInfoText = importComponentFromFELibrary('VirtualEnvSelectionInfoText')
const VirtualEnvHelpTippy = importComponentFromFELibrary('VirtualEnvHelpTippy')
export const ChartEnvironmentSelector = ({
    isExternal,
    isDeployChartView,
    installedAppInfo,
    releaseInfo,
    selectedEnvironment,
    handleEnvironmentSelection,
    environments,
    invalidEnvironment,
    isVirtualEnvironmentOnSelector,
    isVirtualEnvironment,
}: ChartEnvironmentSelectorType): JSX.Element => {
    const renderVirtualEnvironmentInfoText = (): JSX.Element => {
        if (isVirtualEnvironmentOnSelector && VirtualEnvSelectionInfoText) {
            return <VirtualEnvSelectionInfoText />
        }

        return null
    }

    const renderVirtualTippy = (): JSX.Element => {
        if (isVirtualEnvironment && VirtualEnvHelpTippy) {
            return (
                <div className="flex left">
                    <div className="ml-4 mr-4">(Isolated)</div>
                    <VirtualEnvHelpTippy showVirtualText />
                </div>
            )
        }
    }

    return !isDeployChartView ? (
        <div className="chart-values__environment-container w-100">
            <h2
                className="chart-values__environment-label fs-13 fw-4 lh-20 cn-7 flex left"
                data-testid="environment-heading"
            >
                Environment {renderVirtualTippy()}
            </h2>
            {isExternal ? (
                <span className="chart-values__environment fs-13 fw-6 lh-20 cn-9">
                    {installedAppInfo
                        ? installedAppInfo.environmentName
                        : `${releaseInfo.deployedAppDetail.environmentDetail.clusterName}__${releaseInfo.deployedAppDetail.environmentDetail.namespace}`}
                </span>
            ) : (
                <span className="chart-values__environment fs-13 fw-6 lh-20 cn-9" data-testid="environemnt-value">
                    {selectedEnvironment.label}
                </span>
            )}
        </div>
    ) : (
        <div className="w-100 fw-4">
            <SelectPicker
                label="Deploy to environment"
                inputId="values-environment-select"
                placeholder="Select Environment"
                value={selectedEnvironment}
                onChange={handleEnvironmentSelection}
                options={environments}
                required
                error={invalidEnvironment ? REQUIRED_FIELD_MSG : null}
                helperText={renderVirtualEnvironmentInfoText()}
            />
        </div>
    )
}

export const DeploymentAppSelector = ({
    commonState,
    isUpdate,
    handleDeploymentAppTypeSelection,
    isDeployChartView,
    allowedDeploymentTypes,
    gitRepoURL,
    allowedCustomBool,
}: DeploymentAppSelectorType): JSX.Element => {
    return !isDeployChartView ? (
        <div className="chart-values__deployment-type w-100">
            <h2 className="fs-13 fw-4 lh-18 cn-7" data-testid="deploy-app-using-heading">
                Deploy app using
            </h2>
            <div className="flex left">
                <span className="fs-13 fw-6 cn-9 md-6" data-testid="deployment-type">
                    {DEPLOYMENT_TYPE_TO_TEXT_MAP[commonState.installedConfig.deploymentAppType as DeploymentAppTypes]}
                </span>
                <DeploymentTypeIcon
                    deploymentAppType={commonState.installedConfig.deploymentAppType as DeploymentAppTypes}
                    iconSize={24}
                />
            </div>
            {gitRepoURL && allowedCustomBool && (
                <div className="pt-12">
                    <div className="fs-14">
                        Manifests are committed to
                        <div>
                            <Tippy
                                theme={TippyTheme.black}
                                className="default-tt manifest-repo-link dc__min-width-fit-content"
                                arrow={false}
                                placement="bottom-start"
                                animation="shift-toward-subtle"
                                content={gitRepoURL}
                            >
                                <a className="dc__block dc__ellipsis-left cursor" href={gitRepoURL} target="_blank">
                                    {gitRepoURL}
                                </a>
                            </Tippy>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className="flexbox-col dc__gap-6 w-100 chart-values-deployment-radio">
            <span className="fs-13 cn-7 lh-20 fw-4">How do you want to deploy?</span>
            <DeploymentAppRadioGroup
                isDisabled={isUpdate}
                deploymentAppType={commonState.deploymentAppType}
                handleOnChange={handleDeploymentAppTypeSelection}
                allowedDeploymentTypes={allowedDeploymentTypes}
                rootClassName="flexbox-col"
            />
            <span className="fs-11 lh-16 cr-5 fw-4">This cannot be changed after deployment</span>
        </div>
    )
}

const RadioWithTippy = (children, isFromCDPipeline: boolean, tippyContent: string): JSX.Element => {
    return (
        <Tippy className="default-tt w-200" arrow={false} content={tippyContent}>
            <div className={`${isFromCDPipeline ? '' : 'bcn-1'}`} style={{ flex: isFromCDPipeline ? '' : '1 1 auto' }}>
                {children}
            </div>
        </Tippy>
    )
}

const GitOpsActionBlock = ({
    deploymentAppType,
    areGitopsCredentialsConfigured,
    gitOpsRepoConfigInfoBar,
    isGitOpsRepoNotConfigured,
    allowedDeploymentTypes,
}: Pick<
    DeploymentAppRadioGroupType,
    | 'deploymentAppType'
    | 'areGitopsCredentialsConfigured'
    | 'gitOpsRepoConfigInfoBar'
    | 'allowedDeploymentTypes'
    | 'isGitOpsRepoNotConfigured'
>) => {
    if (deploymentAppType !== DeploymentAppTypes.ARGO) {
        return null
    }

    if (!areGitopsCredentialsConfigured) {
        return <ConfigureGitopsInfoBlock />
    }

    const gitOpsNotConfiguredText =
        allowedDeploymentTypes.length == 1 ? GITOPS_REPO_REQUIRED_FOR_ENV : GITOPS_REPO_REQUIRED

    if (isGitOpsRepoNotConfigured) {
        return gitOpsRepoConfigInfoBar(gitOpsNotConfiguredText)
    }

    return null
}

export const DeploymentAppRadioGroup = ({
    isDisabled,
    deploymentAppType,
    handleOnChange,
    allowedDeploymentTypes,
    rootClassName,
    isFromCDPipeline,
    isGitOpsRepoNotConfigured,
    gitOpsRepoConfigInfoBar,
    areGitopsCredentialsConfigured = true,
    showGitOpsOption = true,
}: DeploymentAppRadioGroupType): JSX.Element => {
    const isHelmDeploymentDisabled = allowedDeploymentTypes.indexOf(DeploymentAppTypes.HELM) === -1
    const isArgoDeploymentDisabled = allowedDeploymentTypes.indexOf(DeploymentAppTypes.ARGO) === -1
    const isFluxDeploymentDisabled = allowedDeploymentTypes.indexOf(DeploymentAppTypes.FLUX) === -1

    return (
        <div className="flexbox-col dc__gap-16">
            <RadioGroup
                value={deploymentAppType}
                name="DeploymentAppTypeGroup"
                onChange={handleOnChange}
                disabled={isDisabled}
                className={rootClassName ?? ''}
            >
                <ConditionalWrap
                    condition={isHelmDeploymentDisabled && !isDisabled}
                    wrap={(children) =>
                        RadioWithTippy(
                            children,
                            isFromCDPipeline,
                            'Deployment to this environment is not allowed via Helm',
                        )
                    }
                >
                    <RadioGroupItem
                        dataTestId="helm-deployment"
                        value={DeploymentAppTypes.HELM}
                        disabled={isHelmDeploymentDisabled}
                    >
                        Helm
                    </RadioGroupItem>
                </ConditionalWrap>
                {showGitOpsOption && (
                    <ConditionalWrap
                        condition={isArgoDeploymentDisabled && !isDisabled}
                        wrap={(children) =>
                            RadioWithTippy(
                                children,
                                isFromCDPipeline,
                                'Deployment to this environment is not allowed via ArgoCD',
                            )
                        }
                    >
                        <RadioGroupItem
                            dataTestId="gitops-deployment"
                            value={DeploymentAppTypes.ARGO}
                            disabled={isArgoDeploymentDisabled}
                        >
                            GitOps (Via Argo CD)
                        </RadioGroupItem>
                    </ConditionalWrap>
                )}
                {window._env_.FEATURE_FLUX_DEPLOYMENTS_ENABLE && (
                    <ConditionalWrap
                        condition={isFluxDeploymentDisabled && !isDisabled}
                        wrap={(children) =>
                            RadioWithTippy(
                                children,
                                isFromCDPipeline,
                                'Deployment to this environment is not allowed via FluxCD',
                            )
                        }
                    >
                        <RadioGroupItem
                            dataTestId="flux-deployment"
                            value={DeploymentAppTypes.FLUX}
                            disabled={isFluxDeploymentDisabled}
                        >
                            GitOps (Via Flux CD)
                        </RadioGroupItem>
                    </ConditionalWrap>
                )}
            </RadioGroup>

            <GitOpsActionBlock
                deploymentAppType={deploymentAppType}
                areGitopsCredentialsConfigured={areGitopsCredentialsConfigured}
                gitOpsRepoConfigInfoBar={gitOpsRepoConfigInfoBar}
                isGitOpsRepoNotConfigured={isGitOpsRepoNotConfigured}
                allowedDeploymentTypes={allowedDeploymentTypes}
            />
        </div>
    )
}

export const GitOpsDrawer = ({
    commonState,
    deploymentAppType,
    allowedDeploymentTypes,
    staleData,
    dispatch,
    isDrawerOpen,
    handleDrawerState,
    showRepoSelector,
    allowedCustomBool,
}: gitOpsDrawerType): JSX.Element => {
    const [selectedRepoType, setSelectedRepoType] = useState(
        commonState.authMode !== GitOpsAuthModeType.SSH ? repoType.DEFAULT : repoType.CONFIGURE,
    )
    const [isDeploymentAllowed, setIsDeploymentAllowed] = useState(false)
    const [gitOpsState, setGitOpsState] = useState(false)
    const [repoURL, setRepoURL] = useState(
        commonState.gitRepoURL === AUTO_GENERATE_GITOPS_REPO ? '' : commonState.gitRepoURL,
    )

    useEffect(() => {
        if (deploymentAppType === DeploymentAppTypes.ARGO) {
            setIsDeploymentAllowed(allowedDeploymentTypes.indexOf(DeploymentAppTypes.ARGO) !== -1)
        } else {
            setGitOpsState(false)
        }
    }, [deploymentAppType, allowedDeploymentTypes])

    const handleRepoTypeChange = (newRepoType: string) => {
        setSelectedRepoType(newRepoType)
    }

    const handleCloseButton = () => {
        setIsDeploymentAllowed(false)
        setGitOpsState(true)
        handleDrawerState(false)
    }

    const handleRepoTextChange = (newRepoText: string) => {
        setRepoURL(newRepoText)
    }

    const handleSaveButton = () => {
        if (selectedRepoType === repoType.CONFIGURE && repoURL.length === 0) {
            return
        }
        if (selectedRepoType === repoType.DEFAULT || staleData) {
            dispatch({
                type: ChartValuesViewActionTypes.setGitRepoURL,
                payload: AUTO_GENERATE_GITOPS_REPO,
            })
        } else {
            dispatch({
                type: ChartValuesViewActionTypes.setGitRepoURL,
                payload: repoURL,
            })
        }

        setGitOpsState(true)
        setIsDeploymentAllowed(false)
        handleDrawerState(false)
    }

    const toggleDrawer = () => {
        setIsDeploymentAllowed(true)
    }

    const renderValidationErrorLabel = (message?: string): JSX.Element => {
        return (
            <div className="error-label flex left dc__align-start fs-11 fw-4 mt-6">
                <div className="error-label-icon">
                    <Error className="icon-dim-16" />
                </div>
                <div className="ml-4 cr-5">{message || REQUIRED_FIELD_MSG}</div>
            </div>
        )
    }
    const deploymentManifestGitRepo =
        commonState.gitRepoURL === AUTO_GENERATE_GITOPS_REPO ? 'Auto-create repository' : commonState.gitRepoURL
    return (
        <>
            {(isDeploymentAllowed || isDrawerOpen) && (
                <div>
                    <Drawer onEscape={handleCloseButton} position="right" width="800px">
                        <div className="cluster-form dc__position-rel h-100 bg__primary">
                            <div className="flex flex-align-center dc__border-bottom flex-justify bg__primary pb-12 pt-12 pl-20 pr-20">
                                <h2 data-testid="add_cluster_header" className="fs-16 fw-6 lh-1-43 m-0 title-padding">
                                    <span className="fw-6 fs-16 cn-9">Git Repository</span>
                                </h2>
                                <button
                                    data-testid="header_close_icon"
                                    type="button"
                                    className="dc__transparent flex icon-dim-24"
                                    onClick={handleCloseButton}
                                >
                                    <Close className="icon-dim-24" />
                                </button>
                            </div>
                            <div className="mr-20">
                                <UserGitRepo
                                    setRepoURL={handleRepoTextChange}
                                    setSelectedRepoType={handleRepoTypeChange}
                                    repoURL={repoURL}
                                    selectedRepoType={selectedRepoType}
                                    staleData={staleData}
                                    authMode={commonState.authMode}
                                />
                            </div>
                        </div>
                        <div className="w-100 dc__border-top flex right pb-12 pt-12 pl-20 pr-20 dc__position-fixed dc__position-abs bg__primary dc__bottom-0">
                            <button
                                data-testid="cancel_button"
                                className="cta cancel h-36 lh-36 mr-10"
                                type="button"
                                onClick={handleCloseButton}
                            >
                                Cancel
                            </button>
                            <button
                                data-testid="save_cluster_list_button_after_selection"
                                className="cta h-36 lh-36"
                                type="button"
                                disabled={selectedRepoType === repoType.CONFIGURE && !repoURL.trim()}
                                onClick={handleSaveButton}
                            >
                                Save
                            </button>
                        </div>
                    </Drawer>
                </div>
            )}
            {(gitOpsState && allowedDeploymentTypes.indexOf(DeploymentAppTypes.HELM) !== -1) ||
            (showRepoSelector && window._env_.HIDE_GITOPS_OR_HELM_OPTION) ? (
                <div className="form__input dashed mt-10 flex bg__secondary">
                    <div className="">
                        <span>
                            Commit deployment manifests to
                            <EditIcon className="icon-dim-20 cursor ml-28 pt-4" onClick={toggleDrawer} />
                        </span>
                        <a
                            className="fs-13 fw-4 lh-20 dc__block cursor dc__ellipsis-left pb-4 dc__align-left"
                            onClick={toggleDrawer}
                        >
                            {commonState.gitRepoURL.length > 0 ? deploymentManifestGitRepo : 'Set GitOps repository'}
                        </a>
                    </div>
                    {commonState.deploymentAppType === DeploymentAppTypes.ARGO &&
                        allowedCustomBool &&
                        commonState.gitRepoURL.length === 0 &&
                        renderValidationErrorLabel()}
                </div>
            ) : null}
        </>
    )
}

export const ChartProjectSelector = ({
    selectedProject,
    handleProjectSelection,
    projects,
    invalidProject,
}: ChartProjectSelectorType): JSX.Element => {
    return (
        <div className="w-100">
            <SelectPicker
                label="Project"
                inputId="select-chart-project"
                placeholder="Select Project"
                value={selectedProject}
                onChange={handleProjectSelection}
                options={projects}
                required
                error={invalidProject ? REQUIRED_FIELD_MSG : null}
            />
        </div>
    )
}

export const ChartVersionSelector = ({
    selectedVersion,
    selectedVersionUpdatePage,
    handleVersionSelection,
    chartVersionsData,
}: ChartVersionSelectorType) => {
    const selectOptions = chartVersionsData.map((chartVersion) => ({
        value: chartVersion.id,
        label: chartVersion.version,
    }))

    const selectedOption = selectOptions.find(
        (option) => option.value === selectedVersionUpdatePage?.id || option.value === selectedVersion,
    )

    return (
        <div className="w-100">
            <SelectPicker<number, false>
                label="Chart Version"
                inputId="chart-values-selector"
                options={selectOptions}
                onChange={(option) =>
                    handleVersionSelection(option.value, {
                        id: option.value,
                        version: option.label as string,
                    })
                }
                value={selectedOption}
            />
        </div>
    )
}

export const ChartValuesSelector = ({
    chartValuesList,
    chartValues,
    redirectToChartValues,
    handleChartValuesSelection,
    hideVersionFromLabel,
    hideCreateNewOption,
}: ChartValuesSelectorType) => {
    const filteredChartValues = getChartValuesFiltered(chartValuesList)

    const selectOptions: GroupBase<SelectPickerOptionType<ChartValuesType>>[] = [
        {
            label: 'Deployed',
            options: filteredChartValues.deployedChartValues.map((chartValue) => ({
                value: chartValue,
                label: `${chartValue.name} ${chartValue.chartVersion}`,
                description: `Deployed on: ${chartValue.environmentName || ''}`,
            })),
        },
        {
            label: 'Preset Values',
            options: filteredChartValues.savedChartValues.map((chartValue) => ({
                value: chartValue,
                label: `${chartValue.name} ${chartValue.chartVersion}`,
            })),
        },
        {
            label: 'Existing',
            options: filteredChartValues.existingChartValues.map((chartValue) => ({
                value: chartValue,
                label: `${chartValue.name}${hideVersionFromLabel || !chartValue.chartVersion ? '' : ` (${chartValue.chartVersion})`}`,
            })),
        },
        {
            label: 'Default',
            options: filteredChartValues.defaultChartValues.map((chartValue) => ({
                value: chartValue,
                label: `${chartValue.name} ${chartValue.chartVersion}`,
            })),
        },
    ]

    const getOptionValue: SelectPickerProps<ChartValuesType>['getOptionValue'] = (option) =>
        `${option.value.id} ${option.value.kind}`

    const handleChange: SelectPickerProps<ChartValuesType>['onChange'] = (selectedOption) => {
        const kind = selectedOption.value.kind
        handleAnalyticsEvent({
            category: 'Chart Store',
            action: `CS_CHART_CONFIGURE_&_DEPLOY_${kind === 'TEMPLATE' ? 'PRESET' : kind}_VALUE_SELECTED`,
        })
        handleChartValuesSelection(selectedOption.value)
    }

    const chartValuesOptionValue = getOptionValue({
        // Setting label null since the getOptionValue is not consuming it
        label: null,
        value: chartValues,
    })

    const selectedOption = selectOptions
        .flatMap((groupedOption) => groupedOption.options)
        .find((option) => getOptionValue(option) === chartValuesOptionValue)

    return (
        <SelectPicker<ChartValuesType, false>
            inputId="chart-values-selector"
            options={selectOptions}
            menuListFooterConfig={
                !hideCreateNewOption
                    ? {
                          type: 'button',
                          buttonProps: {
                              variant: ButtonVariantType.borderLess,
                              text: 'Create preset value',
                              startIcon: <ICAdd className="icon-dim-20" />,
                              dataTestId: 'add-preset-values-button-dropdown',
                              onClick: redirectToChartValues,
                          },
                      }
                    : null
            }
            getOptionValue={getOptionValue}
            label="Chart Values"
            onChange={handleChange}
            value={selectedOption}
        />
    )
}

export const ChartVersionValuesSelector = ({
    isUpdate,
    selectedVersion,
    selectedVersionUpdatePage,
    handleVersionSelection,
    chartVersionsData,
    chartVersionObj,
    chartValuesList,
    chartValues,
    redirectToChartValues,
    handleChartValuesSelection,
    hideVersionFromLabel,
    hideCreateNewOption,
}: ChartVersionValuesSelectorType) => {
    return (
        <>
            <ChartVersionSelector
                isUpdate={isUpdate}
                selectedVersion={selectedVersion}
                selectedVersionUpdatePage={selectedVersionUpdatePage}
                handleVersionSelection={handleVersionSelection}
                chartVersionsData={chartVersionsData}
                chartVersionObj={chartVersionObj}
            />
            <ChartValuesSelector
                chartValuesList={chartValuesList}
                chartValues={chartValues}
                redirectToChartValues={redirectToChartValues}
                handleChartValuesSelection={handleChartValuesSelection}
                hideVersionFromLabel={hideVersionFromLabel}
                hideCreateNewOption={hideCreateNewOption}
            />
        </>
    )
}

export const ActiveReadmeColumn = ({ fetchingReadMe, activeReadMe }: ActiveReadmeColumnProps) => {
    return (
        <div className="dc__overflow-auto dc__border-right">
            <div
                className="px-16 pt-6 pb-5 bg__secondary border__primary--bottom flex left fs-12 fw-6 cn-7 dc__position-sticky dc__top-0 dc__zi-1"
                data-testid="readme-heading"
            >
                Readme
            </div>
            {fetchingReadMe ? <Progressing pageLoader /> : <MarkDown markdown={activeReadMe} />}
        </div>
    )
}

export const ValueNameInput = ({
    valueName,
    handleValueNameChange,
    handleValueNameOnBlur,
    invalidValueName,
    invalidValueNameMessage,
    valueNameDisabled,
}: ValueNameInputType) => {
    return (
        <div className="w-100">
            <CustomInput
                name="value-name"
                label="Name"
                placeholder="Eg. value-template"
                value={valueName}
                onChange={(e) => handleValueNameChange(e.target.value)}
                onBlur={() => handleValueNameOnBlur()}
                disabled={valueNameDisabled}
                data-testid="preset-values-name-input"
                required
                error={invalidValueName && (invalidValueNameMessage || REQUIRED_FIELD_MSG)}
            />
        </div>
    )
}

export const AppNameInput = ({
    appName,
    handleAppNameChange,
    handleAppNameOnBlur,
    invalidAppName,
    invalidAppNameMessage,
}: AppNameInputType) => {
    return (
        <CustomInput
            name="app-name"
            label="App Name"
            placeholder="Eg. app-name"
            value={appName}
            onChange={(e) => handleAppNameChange(e.target.value)}
            onBlur={handleAppNameOnBlur}
            data-testid="app-name-input"
            required
            error={invalidAppName && (invalidAppNameMessage || REQUIRED_FIELD_MSG)}
            size={ComponentSizeType.medium}
            fullWidth
        />
    )
}

export const DeleteApplicationButton = ({
    type,
    isUpdateInProgress,
    isDeleteInProgress,
    dispatch,
}: DeleteApplicationButtonProps) => {
    const handleClick = () =>
        dispatch({
            type: ChartValuesViewActionTypes.showDeleteAppConfirmationDialog,
            payload: true,
        })

    return (
        <Button
            onClick={handleClick}
            dataTestId="delete-preset-value"
            startIcon={<Icon name="ic-delete" color={null} />}
            isLoading={isDeleteInProgress}
            disabled={isUpdateInProgress}
            text={`Delete ${type}`}
            variant={ButtonVariantType.secondary}
            style={ButtonStyleType.negative}
            fullWidth
        />
    )
}
