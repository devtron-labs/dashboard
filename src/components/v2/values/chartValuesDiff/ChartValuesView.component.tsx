import React from 'react'
import { useParams } from 'react-router'
import ReactSelect from 'react-select'
import { DropdownIndicator, EnvFormatOptions, getCommonSelectStyle, Option } from '../../common/ReactSelect.utils'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as ErrorExclamation } from '../../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as LinkIcon } from '../../../../assets/icons/ic-link.svg'
import { ChartValuesSelect } from '../../../charts/util/ChartValueSelect'
import { DeleteDialog, Progressing, Select } from '../../../common'
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
    DeploymentAppSelectorType,
    DeploymentAppType,
    DeploymentAppTypeNameMapping,
    ErrorScreenWithInfoProps,
    UpdateApplicationButtonProps,
    ValueNameInputType,
} from './ChartValuesView.type'
import { MarkDown } from '../../../charts/discoverChartDetail/DiscoverChartDetails'
import EmptyState from '../../../EmptyState/EmptyState'
import TippyCustomized, { TippyTheme } from '../../../common/TippyCustomized'
import {
    CONNECT_TO_HELM_CHART_TEXTS,
    DELETE_CHART_APP_DESCRIPTION_LINES,
    DELETE_PRESET_VALUE_DESCRIPTION_LINES,
    UPDATE_APP_BUTTON_TEXTS,
} from './ChartValuesView.constants'
import { REQUIRED_FIELD_MSG } from '../../../../config/constantMessaging'
import { RadioGroup, RadioGroupItem } from '../../../common/formFields/RadioGroup'
import { ReactComponent as ArgoCD } from '../../../../assets/icons/argo-cd-app.svg'
import { ReactComponent as Helm } from '../../../../assets/icons/helm-app.svg'

export const ChartEnvironmentSelector = ({
    isExternal,
    isDeployChartView,
    installedAppInfo,
    releaseInfo,
    isUpdate,
    selectedEnvironment,
    handleEnvironmentSelection,
    environments,
    invalidaEnvironment,
}: ChartEnvironmentSelectorType): JSX.Element => {

    const selectOption = (props) => {
        return <EnvFormatOptions {...props} environmentfieldName="label" />
    }

    return !isDeployChartView ? (
        <div className="chart-values__environment-container mb-12">
            <h2 className="chart-values__environment-label fs-13 fw-4 lh-20 cn-7">Environment</h2>
            {isExternal ? (
                <span className="chart-values__environment fs-13 fw-6 lh-20 cn-9">
                    {installedAppInfo
                        ? installedAppInfo.environmentName
                        : releaseInfo.deployedAppDetail.environmentDetail.clusterName +
                          '__' +
                          releaseInfo.deployedAppDetail.environmentDetail.namespace}
                </span>
            ) : (
                <span className="chart-values__environment fs-13 fw-6 lh-20 cn-9">{selectedEnvironment.label}</span>
            )}
        </div>
    ) : (
        <div className="form__row form__row--w-100 fw-4">
            <span className="form__label required-field">Deploy to environment</span>
            <ReactSelect
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option: selectOption,
                }}
                classNamePrefix="values-environment-select"
                placeholder="Select Environment"
                value={selectedEnvironment}
                styles={getCommonSelectStyle()}
                onChange={handleEnvironmentSelection}
                options={environments}
            />
            {invalidaEnvironment && renderValidationErrorLabel()}
        </div>
    )
}

export const DeploymentAppSelector = ({
    commonState,
    isUpdate,
    handleDeploymentAppTypeSelection,
    isDeployChartView,
}: DeploymentAppSelectorType): JSX.Element => {
    return !isDeployChartView ? (
        <div className="chart-values__deployment-type">
            <h2 className="fs-13 fw-4 lh-18 cn-7">Deploy app using</h2>
            <div className="flex left">
                <span className="fs-13 fw-6  cn-9 md-6 ">
                    {commonState.installedConfig.deploymentAppType === DeploymentAppType.Helm
                        ? DeploymentAppTypeNameMapping.HelmKeyValue
                        : DeploymentAppTypeNameMapping.GitOpsKeyValue}
                </span>
                <span>
                    {commonState.installedConfig.deploymentAppType === DeploymentAppType.GitOps ? (
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
                <p className="fs-12px cr-5"> Cannot be changed after deployment </p>
                <RadioGroup
                    value={commonState.deploymentAppType}
                    name="DeploymentAppTypeGroup"
                    onChange={handleDeploymentAppTypeSelection}
                    disabled={isUpdate}
                >
                    <RadioGroupItem value={DeploymentAppType.Helm}> Helm </RadioGroupItem>

                    <RadioGroupItem value={DeploymentAppType.GitOps}> GitOps </RadioGroupItem>
                </RadioGroup>
            </div>
        </div>
    )
}

export const ChartProjectSelector = ({
    selectedProject,
    handleProjectSelection,
    projects,
    invalidProject,
}: ChartProjectSelectorType): JSX.Element => {
    return  (

        <label className="form__row form__row--w-100 fw-4">
            <span className="form__label required-field">Project</span>
            <ReactSelect
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option,
                }}
                placeholder="Select Project"
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
            <span className="form__label fs-13 fw-4 lh-20 cn-7">Chart Version</span>
            <Select
                tabIndex={4}
                rootClassName="select-button--default chart-values-selector"
                value={selectedVersionUpdatePage?.id || selectedVersion}
                onChange={(event) => {
                    handleVersionSelection(event.target.value, {
                        id: event.target.value,
                        version: event.target.innerText,
                    })
                }}
            >
                <Select.Button>{selectedVersionUpdatePage?.version || chartVersionObj?.version}</Select.Button>
                {chartVersionsData.map((_chartVersion) => (
                    <Select.Option key={_chartVersion.id} value={_chartVersion.id}>
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
            <span className="form__label fs-13 fw-4 lh-20 cn-7">Chart Values</span>
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
            <div className="code-editor__header flex left fs-12 fw-6 cn-7">Readme</div>
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
}: DeleteChartDialogProps) => {
    return (
        <DeleteDialog
            title={`Delete '${appName}' ?`}
            delete={() => handleDelete(false)}
            closeDelete={toggleConfirmation}
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
            <span className="form__label required-field">App Name</span>
            <input
                autoComplete="off"
                tabIndex={1}
                placeholder="Eg. app-name"
                className="form__input"
                value={appName}
                onChange={(e) => handleAppNameChange(e.target.value)}
                onBlur={() => handleAppNameOnBlur()}
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

export const ErrorScreenWithInfo = ({ info }: ErrorScreenWithInfoProps) => {
    return (
        <EmptyState>
            <EmptyState.Image>
                <ErrorExclamation className="icon-dim-20 mb-10" />
            </EmptyState.Image>
            <EmptyState.Subtitle>{info}</EmptyState.Subtitle>
        </EmptyState>
    )
}
