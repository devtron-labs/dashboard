import React, { useState } from 'react'
import { useParams } from 'react-router'
import ReactSelect from 'react-select'
import {
    DropdownIndicator,
    EnvFormatOptions,
    formatHighlightedText,
    getCommonSelectStyle,
    GroupHeading,
    Option,
} from '../../common/ReactSelect.utils'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ChartValuesSelect } from '../../../charts/util/ChartValueSelect'
import { importComponentFromFELibrary, Select } from '../../../common'
import {
    Progressing,
    DeleteDialog,
    RadioGroup,
    RadioGroupItem,
    ConditionalWrap,
    DeploymentAppTypes,
    Drawer,
} from '@devtron-labs/devtron-fe-common-lib'
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
    DeleteChartDialogProps,
    DeploymentAppRadioGroupType,
    DeploymentAppSelectorType,
    UpdateApplicationButtonProps,
    ValueNameInputType,
} from './ChartValuesView.type'
import { MarkDown } from '../../../charts/discoverChartDetail/DiscoverChartDetails'
import {
    DELETE_CHART_APP_DESCRIPTION_LINES,
    DELETE_PRESET_VALUE_DESCRIPTION_LINES,
    UPDATE_APP_BUTTON_TEXTS,
} from './ChartValuesView.constants'
import { DeploymentAppTypeNameMapping, REQUIRED_FIELD_MSG } from '../../../../config/constantMessaging'
import { ReactComponent as ArgoCD } from '../../../../assets/icons/argo-cd-app.svg'
import { ReactComponent as Helm } from '../../../../assets/icons/helm-app.svg'
import { envGroupStyle } from './ChartValuesView.utils'
import { DELETE_ACTION } from '../../../../config'
import Tippy from '@tippyjs/react'
import { ReactComponent as InfoIcon } from '../../../../assets/icons/appstatus/info-filled.svg'
import GitManagment from '../../../gitOps/GItManagment'

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
    invalidaEnvironment,
    isVirtualEnvironmentOnSelector,
    isVirtualEnvironment,
    isOCICompliantChart
}: ChartEnvironmentSelectorType): JSX.Element => {
    const singleOption = (props) => {
        return <EnvFormatOptions {...props} environmentfieldName="label" />
    }

    const renderVirtualEnvironmentInfoText = (): JSX.Element => {
        if (isVirtualEnvironmentOnSelector && VirtualEnvSelectionInfoText) {
            return <VirtualEnvSelectionInfoText />
        }
    }

    const renderOCIContainerRegistryText = () => {
       if (isOCICompliantChart) {
           return (
               <div className="cn-7 fs-12 pt-16 flexbox">
                   <InfoIcon className="icon-dim-20 mr-4" />
                   Charts from container registries can be deployed via helm only.
               </div>
           )
       }
    }

    const renderVirtualTippy = (): JSX.Element => {
        if (isVirtualEnvironment && VirtualEnvHelpTippy) {
            return (
                <div className="flex left">
                    <div className="ml-4 mr-4">(Virtual)</div>
                    <VirtualEnvHelpTippy showVirtualText={true}/>
                </div>
            )
        }
    }

    const handleFormatHighlightedText = (opt, { inputValue }) => {
        return formatHighlightedText(opt, inputValue, 'label')
    }

    return !isDeployChartView ? (
        <div className="chart-values__environment-container mb-12">
            <h2 className="chart-values__environment-label fs-13 fw-4 lh-20 cn-7 flex left" data-testid="environment-heading">
                Environment {renderVirtualTippy()}
            </h2>
            {isExternal ? (
                <span className="chart-values__environment fs-13 fw-6 lh-20 cn-9">
                    {installedAppInfo
                        ? installedAppInfo.environmentName
                        : releaseInfo.deployedAppDetail.environmentDetail.clusterName +
                          '__' +
                          releaseInfo.deployedAppDetail.environmentDetail.namespace}
                </span>
            ) : (
                <span className="chart-values__environment fs-13 fw-6 lh-20 cn-9" data-testid="environemnt-value">
                    {selectedEnvironment.label}
                </span>
            )}
        </div>
    ) : (
        <div className="form__row form__row--w-100 fw-4">
            <span className="form__label required-field" data-testid="environment-name-heading">Deploy to environment</span>
            <ReactSelect
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    SingleValue: singleOption,
                    GroupHeading,
                }}
                classNamePrefix="values-environment-select"
                placeholder="Select Environment"
                value={selectedEnvironment}
                styles={envGroupStyle}
                onChange={handleEnvironmentSelection}
                options={environments}
                formatOptionLabel={handleFormatHighlightedText}
            />
            {invalidaEnvironment && renderValidationErrorLabel()}
            {renderVirtualEnvironmentInfoText()}
            {renderOCIContainerRegistryText()}
        </div>
    )
}

export const DeploymentAppSelector = ({
    commonState,
    isUpdate,
    handleDeploymentAppTypeSelection,
    isDeployChartView,
    allowedDeploymentTypes
}: DeploymentAppSelectorType): JSX.Element => {
    return !isDeployChartView ? (
        <div className="chart-values__deployment-type">
            <h2 className="fs-13 fw-4 lh-18 cn-7" data-testid="deploy-app-using-heading">
                Deploy app using
            </h2>
            <div className="flex left">
                <span className="fs-13 fw-6  cn-9 md-6 " data-testid="deployment-type">
                    {commonState.installedConfig.deploymentAppType === DeploymentAppTypes.HELM
                        ? DeploymentAppTypeNameMapping.Helm
                        : DeploymentAppTypeNameMapping.GitOps}
                </span>
                <span>
                    {commonState.installedConfig.deploymentAppType === DeploymentAppTypes.GITOPS ? (
                        <ArgoCD className="icon-dim-24 ml-6" />
                    ) : (
                        <Helm className="icon-dim-24 ml-6" />
                    )}
                </span>
            </div>
        </div>
    ) : (
        <div className="form__row form__row--w-100 fw-4">
            <div className="form__row">
                <label className="form__label form__label--sentence dc__bold chart-value-deployment_heading">
                    How do you want to deploy?
                </label>
                <p className="fs-12px cr-5" data-testid="deployment-alert-message">
                    Cannot be changed after deployment
                </p>
                <DeploymentAppRadioGroup
                    isDisabled={isUpdate}
                    deploymentAppType={commonState.deploymentAppType}
                    handleOnChange={handleDeploymentAppTypeSelection}
                    allowedDeploymentTypes={allowedDeploymentTypes}
                />

            </div>
        </div>
    )
}

const RadioWithTippy = (children, isFromCDPipeline: boolean, tippyContent: string): JSX.Element=>{
  return (
      <Tippy className="default-tt w-200" arrow={false} content={tippyContent}>
          <div className={`${isFromCDPipeline ? '' : 'bcn-1'}`} style={{ flex: isFromCDPipeline ? '' : '1 1 auto' }}>
              {children}
          </div>
      </Tippy>
  )
}

export const DeploymentAppRadioGroup = ({
    isDisabled,
    deploymentAppType,
    handleOnChange,
    allowedDeploymentTypes,
    rootClassName,
    isFromCDPipeline,
}: DeploymentAppRadioGroupType): JSX.Element => {
    const [drawerState, setDrawerState] = useState(false)
    return (
        <>
            <RadioGroup
                value={deploymentAppType}
                name="DeploymentAppTypeGroup"
                onChange={handleOnChange}
                disabled={isDisabled}
                className={rootClassName ?? ''}
            >
                <ConditionalWrap
                    condition={allowedDeploymentTypes.indexOf(DeploymentAppTypes.HELM) === -1}
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
                        disabled={allowedDeploymentTypes.indexOf(DeploymentAppTypes.HELM) === -1}
                    >
                        Helm
                    </RadioGroupItem>
                </ConditionalWrap>
                <ConditionalWrap
                    condition={allowedDeploymentTypes.indexOf(DeploymentAppTypes.GITOPS) === -1}
                    wrap={(children) =>
                        RadioWithTippy(
                            children,
                            isFromCDPipeline,
                            'Deployment to this environment is not allowed via GitOps',
                        )
                    }
                >
                    <RadioGroupItem
                        dataTestId="gitops-deployment"
                        value={DeploymentAppTypes.GITOPS}
                        disabled={allowedDeploymentTypes.indexOf(DeploymentAppTypes.GITOPS) === -1}
                    >
                        GitOps
                    </RadioGroupItem>
                </ConditionalWrap>
            </RadioGroup>
            {/* {allowedDeploymentTypes.indexOf(DeploymentAppTypes.GITOPS) !== -1 ? (
                <Drawer position="right" width="600px">
                    <div className="h-100 bcn-0">
                        <GitManagment />
                    </div>
                </Drawer>
            ) : null} */}
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
        <label className="form__row form__row--w-100 fw-4">
            <span className="form__label required-field" data-testid="project-name-heading">Project</span>
            <ReactSelect
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option,
                }}
                placeholder="Select Project"
                classNamePrefix="select-chart-project"
                value={selectedProject}
                styles={getCommonSelectStyle()}
                onChange={handleProjectSelection}
                options={projects}
            />
            {invalidProject && renderValidationErrorLabel()}
        </label>
    )
}

export const ChartVersionSelector = ({
    selectedVersion,
    chartVersionObj,
    selectedVersionUpdatePage,
    handleVersionSelection,
    chartVersionsData,
}: ChartVersionSelectorType) => {
    return (
        <div className="w-100 mb-12">
            <span className="form__label fs-13 fw-4 lh-20 cn-7" data-testid="chart-version-heading">
                Chart Version
            </span>
            <Select
                tabIndex={4}
                rootClassName="select-button--default chart-values-selector"
                onChange={(event) => {
                    handleVersionSelection(event.target.value, {
                        id: event.target.value,
                        version: event.target.innerText,
                    })
                }}
                value={selectedVersionUpdatePage?.id || selectedVersion}
                dataTestId="select-chart-version"
            >
                <Select.Button dataTestIdDropdown="chart-version-of-preset">
                    {selectedVersionUpdatePage?.version || chartVersionObj?.version}
                </Select.Button>
                {chartVersionsData.map((_chartVersion, index) => (
                    <Select.Option
                        key={_chartVersion.id}
                        value={_chartVersion.id}
                        dataTestIdMenuList={`chart-select-${index}`}
                    >
                        {_chartVersion.version}
                    </Select.Option>
                ))}
            </Select>
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
    return (
        <div className="w-100 mb-12">
            <span className="form__label fs-13 fw-4 lh-20 cn-7" data-testid="chart-values-heading">Chart Values</span>
            <ChartValuesSelect
                className="chart-values-selector"
                chartValuesList={chartValuesList}
                chartValues={chartValues}
                redirectToChartValues={redirectToChartValues}
                onChange={handleChartValuesSelection}
                hideVersionFromLabel={hideVersionFromLabel}
                hideCreateNewOption={hideCreateNewOption}
            />
        </div>
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
        <div className="chart-values-view__readme">
            <div className="code-editor__header flex left fs-12 fw-6 cn-7" data-testid="readme-heading">Readme</div>
            {fetchingReadMe ? (
                <Progressing pageLoader />
            ) : (
                <MarkDown markdown={activeReadMe} className="chart-values-view__readme-markdown" />
            )}
        </div>
    )
}

export const DeleteChartDialog = ({
    appName,
    handleDelete,
    toggleConfirmation,
    isCreateValueView,
    disableButton,
}: DeleteChartDialogProps) => {
    const closeConfirmation = () => {
        toggleConfirmation(false)
    }
    const handleForceDelete = () => {
        handleDelete(DELETE_ACTION.DELETE)
    }
    return (
        <DeleteDialog
            apiCallInProgress={disableButton}
            title={`Delete '${appName}' ?`}
            delete={handleForceDelete}
            closeDelete={closeConfirmation}
        >
            {isCreateValueView ? (
                <DeleteDialog.Description>
                    <p>{DELETE_PRESET_VALUE_DESCRIPTION_LINES.First}</p>
                    <p>{DELETE_PRESET_VALUE_DESCRIPTION_LINES.Second}</p>
                </DeleteDialog.Description>
            ) : (
                <DeleteDialog.Description>
                    <p>{DELETE_CHART_APP_DESCRIPTION_LINES.First}</p>
                    <p>{DELETE_CHART_APP_DESCRIPTION_LINES.Second}</p>
                </DeleteDialog.Description>
            )}
        </DeleteDialog>
    )
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

export const ValueNameInput = ({
    valueName,
    handleValueNameChange,
    handleValueNameOnBlur,
    invalidValueName,
    invalidValueNameMessage,
    valueNameDisabled,
}: ValueNameInputType) => {
    return (
        <label className="form__row form__row--w-100">
            <span className="form__label required-field">Name</span>
            <input
                autoComplete="off"
                tabIndex={1}
                placeholder="Eg. value-template"
                className="form__input"
                value={valueName}
                onChange={(e) => handleValueNameChange(e.target.value)}
                onBlur={() => handleValueNameOnBlur()}
                disabled={valueNameDisabled}
                data-testid="preset-values-name-input"
            />
            {invalidValueName && renderValidationErrorLabel(invalidValueNameMessage)}
        </label>
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
        <label className="form__row form__row--w-100">
            <span className="form__label required-field" data-testid="app-name-heading">App Name</span>
            <input
                autoComplete="off"
                tabIndex={1}
                placeholder="Eg. app-name"
                className="form__input"
                value={appName}
                onChange={(e) => handleAppNameChange(e.target.value)}
                onBlur={() => handleAppNameOnBlur()}
                data-testid="app-name-input"
            />
            {invalidAppName && renderValidationErrorLabel(invalidAppNameMessage)}
        </label>
    )
}

export const DeleteApplicationButton = ({
    type,
    isUpdateInProgress,
    isDeleteInProgress,
    dispatch,
}: DeleteApplicationButtonProps) => {
    return (
        <button
            className="chart-values-view__delete-cta cta delete"
            disabled={isUpdateInProgress || isDeleteInProgress}
            onClick={(e) =>
                dispatch({
                    type: ChartValuesViewActionTypes.showDeleteAppConfirmationDialog,
                    payload: true,
                })
            }
            data-testid="delete-preset-value"
        >
            {isDeleteInProgress ? (
                <div className="flex">
                    <span>Deleting</span>
                    <span className="ml-10">
                        <Progressing />
                    </span>
                </div>
            ) : (
                `Delete ${type}`
            )}
        </button>
    )
}

export const UpdateApplicationButton = ({
    isUpdateInProgress,
    isDeleteInProgress,
    isDeployChartView,
    isCreateValueView,
    deployOrUpdateApplication,
}: UpdateApplicationButtonProps) => {
    const { chartValueId } = useParams<{ chartValueId: string }>()

    return (
        <button
            type="button"
            tabIndex={6}
            disabled={isUpdateInProgress || isDeleteInProgress}
            className={`chart-values-view__update-cta cta ${
                isUpdateInProgress || isDeleteInProgress ? 'disabled' : ''
            }`}
            onClick={deployOrUpdateApplication}
            data-testid="preset-save-values-button"
        >
            {isUpdateInProgress ? (
                <div className="flex">
                    <span>
                        {isCreateValueView
                            ? `${UPDATE_APP_BUTTON_TEXTS.Saving} ${
                                  chartValueId !== '0' ? UPDATE_APP_BUTTON_TEXTS.Changes : UPDATE_APP_BUTTON_TEXTS.Value
                              }`
                            : isDeployChartView
                            ? UPDATE_APP_BUTTON_TEXTS.Deploying
                            : UPDATE_APP_BUTTON_TEXTS.Updating}
                    </span>
                    <span className="ml-10">
                        <Progressing />
                    </span>
                </div>
            ) : isCreateValueView ? (
                `${UPDATE_APP_BUTTON_TEXTS.Save} ${
                    chartValueId !== '0' ? UPDATE_APP_BUTTON_TEXTS.Changes : UPDATE_APP_BUTTON_TEXTS.Value
                }`
            ) : isDeployChartView ? (
                UPDATE_APP_BUTTON_TEXTS.Deploy
            ) : (
                UPDATE_APP_BUTTON_TEXTS.Update
            )}
        </button>
    )
}

