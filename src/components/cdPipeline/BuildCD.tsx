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

import {
    CustomInput,
    DeploymentAppTypes,
    InfoColourBar,
    Progressing,
    RadioGroup,
    RadioGroupItem,
    TippyCustomized,
    TippyTheme,
    YAMLStringify,
    CodeEditor,
    UserApprovalConfigType,
    Environment,
    ReleaseMode,
    SelectPicker,
    CDFormType,
    ToastVariantType,
    ToastManager,
    ComponentSizeType,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import { useContext, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import yamlJsParser from 'yaml'
import error from '../../assets/icons/misc/errorInfo.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ENV_ALREADY_EXIST_ERROR, RegistryPayloadWithSelectType, TriggerType, URLS, ViewType } from '../../config'
import { GeneratedHelmPush } from './cdPipeline.types'
import { createClusterEnvGroup, getDeploymentAppType, importComponentFromFELibrary, Select } from '../common'
import { Info } from '../common/icons/Icons'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as ICHelpOutline } from '../../assets/icons/ic-help-outline.svg'
import settings from '../../assets/icons/ic-settings.svg'
import trash from '../../assets/icons/misc/delete.svg'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { getNamespacePlaceholder } from './cdpipeline.util'
import { ValidationRules } from '../ciPipeline/validationRules'
import { DeploymentAppRadioGroup } from '../v2/values/chartValuesDiff/ChartValuesView.component'
import CustomImageTags from '../CIPipelineN/CustomImageTags'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'
import { GITOPS_REPO_REQUIRED } from '../v2/values/chartValuesDiff/constant'
import { getGitOpsRepoConfig } from '../../services/service'
import { ReactComponent as ICInfo } from '../../assets/icons/ic-info-filled.svg'

import PullImageDigestToggle from './PullImageDigestToggle'
import { PipelineFormDataErrorType } from '@Components/workflowEditor/types'
import { EnvironmentWithSelectPickerType } from '@Components/CIPipelineN/types'
import { BuildCDProps } from './types'

const VirtualEnvSelectionInfoText = importComponentFromFELibrary('VirtualEnvSelectionInfoText')
const HelmManifestPush = importComponentFromFELibrary('HelmManifestPush')
const getBuildCDManualApproval = importComponentFromFELibrary('getBuildCDManualApproval', null, 'function')
const validateUserApprovalConfig: (
    userApprovalConfig: UserApprovalConfigType,
) => PipelineFormDataErrorType['userApprovalConfig'] = importComponentFromFELibrary(
    'validateUserApprovalConfig',
    () => ({
        isValid: true,
    }),
    'function',
)
const MigrateHelmReleaseBody = importComponentFromFELibrary('MigrateHelmReleaseBody', null, 'function')

export default function BuildCD({
    isAdvanced,
    setIsVirtualEnvironment,
    noStrategyAvailable,
    allStrategies,
    parentPipelineId,
    isWebhookCD,
    dockerRegistries,
    envIds,
    isGitOpsRepoNotConfigured,
    noGitOpsModuleInstalledAndConfigured,
    releaseMode,
    getMandatoryPluginData,
}: BuildCDProps) {
    const {
        formData,
        setFormData,
        formDataErrorObj,
        setFormDataErrorObj,
        setPageState,
        handleStrategy,
        getPrePostStageInEnv,
        isVirtualEnvironment,
        pageState,
        isEnvUsedState,
        setIsEnvUsedState,
        savedCustomTagPattern,
        selectedCDStageTypeValue,
        setSelectedCDStageTypeValue,
        appId,
        setReloadNoGitOpsRepoConfiguredModal,
    } = useContext(pipelineContext)
    const validationRules = new ValidationRules()
    const history = useHistory()

    const [gitopsConflictLoading, setGitopsConflictLoading] = useState(false)
    let { cdPipelineId } = useParams<{
        appId: string
        workflowId: string
        ciPipelineId: string
        cdPipelineId?: string
    }>()
    if (cdPipelineId === '0') {
        cdPipelineId = null
    }

    const handlePipelineName = (event) => {
        const _form = { ...formData }
        _form.name = event.target.value
        setFormData(_form)
        const _formDataErrorObj = { ...formDataErrorObj }
        _formDataErrorObj.name = validationRules.name(_form.name)
        setFormDataErrorObj(_formDataErrorObj)
    }

    const handleDeploymentAppTypeChange = (event) => {
        const _form = { ...formData }
        _form.deploymentAppType = event.target.value
        setFormData(_form)
    }

    const handleTriggerTypeChange = (event) => {
        const _form = { ...formData }
        _form.triggerType = event.target.value
        setFormData(_form)
    }

    const handleNamespaceChange = (event): void => {
        const _form = { ...formData }
        _form.namespace = event.target.value
        setFormData(_form)
    }

    const selectEnvironment = async (selection: EnvironmentWithSelectPickerType) => {
        const _form = { ...formData, deploymentAppName: '' }
        const _formDataErrorObj = { ...formDataErrorObj }

        if (selection) {
            if (envIds.includes(selection.id)) {
                setIsEnvUsedState(true)
            } else {
                setIsEnvUsedState(false)
            }
            _form.environmentId = selection.id
            _form.environmentName = selection.name
            _form.namespace = selection.namespace
            setIsVirtualEnvironment(selection.isVirtualEnvironment)
            _formDataErrorObj.envNameError = validationRules.environment(selection.id)
            _formDataErrorObj.nameSpaceError =
                !selection.isVirtualEnvironment && validationRules.namespace(selection.namespace)
            _form.preStageConfigMapSecretNames = {
                configMaps: [],
                secrets: [],
            }
            _form.postStageConfigMapSecretNames = {
                configMaps: [],
                secrets: [],
            }
            _form.isClusterCdActive = selection.isClusterCdActive
            _form.runPreStageInEnv = getPrePostStageInEnv(
                selection.isVirtualEnvironment,
                _form.isClusterCdActive && _form.runPreStageInEnv,
            )
            _form.runPostStageInEnv = getPrePostStageInEnv(
                selection.isVirtualEnvironment,
                _form.isClusterCdActive && _form.runPostStageInEnv,
            )
            _form.deploymentAppType = getDeploymentAppType(
                selection.allowedDeploymentTypes,
                _form.deploymentAppType,
                selection.isVirtualEnvironment,
            )
            _form.generatedHelmPushAction = selection.isVirtualEnvironment
                ? GeneratedHelmPush.DO_NOT_PUSH
                : GeneratedHelmPush.PUSH
            _form.allowedDeploymentTypes = selection.allowedDeploymentTypes
            _form.isDigestEnforcedForEnv = _form.environments.find(
                (env) => env.id == selection.id,
            )?.isDigestEnforcedForEnv
        } else {
            const list = _form.environments.map((item) => {
                return {
                    ...item,
                    active: false,
                }
            })
            _form.environmentId = 0
            _form.namespace = ''
            _form.environments = list
            setIsVirtualEnvironment(false)
            _formDataErrorObj.envNameError = validationRules.environment(_form.environmentId)
        }

        setFormData(_form)
        setFormDataErrorObj(_formDataErrorObj)

        try {
            await getMandatoryPluginData(_form)
        } catch (error) {
            showError(error)
        }
    }

    const renderPipelineNameInput = () => {
        return (
            <div className="form__row">
                <CustomInput
                    name="pipeline-name"
                    label="Pipeline Name"
                    disabled={!!cdPipelineId}
                    data-testid="advance-pipeline-name-textbox"
                    placeholder="Pipeline name"
                    value={formData.name}
                    onChange={handlePipelineName}
                    isRequiredField
                    error={formDataErrorObj.name && !formDataErrorObj.name.isValid && formDataErrorObj.name.message}
                />
            </div>
        )
    }

    const renderWebhookInfo = () => {
        return (
            <InfoColourBar
                message={
                    <div>
                        <span className="fw-6">Connecting to external CI service: </span>A webhook url and sample JSON
                        will be generated after the pipeline is created.
                    </div>
                }
                classname="bw-1 bcv-1 ev-2 bcv-1 fs-12 mt-20"
                Icon={Help}
                iconClass="fcv-5 h-20"
            />
        )
    }

    const renderNamespaceInfo = (namespaceEditable: boolean) => {
        if (namespaceEditable) {
            return (
                <div className="dc__info-container info__container--cd-pipeline">
                    <Info />
                    <div className="flex column left">
                        <div className="dc__info-title">Set Namespace</div>
                        <div className="dc__info-subtitle">
                            The entered namespace will be applicable to selected environment across all the pipelines
                            for this application.
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    const checkGitOpsRepoConflict = () => {
        setGitopsConflictLoading(true)
        getGitOpsRepoConfig(+appId)
            .then(() => {
                history.push(`/app/${appId}/edit/${URLS.APP_GITOPS_CONFIG}`)
            })
            .catch((err) => {
                if (err.code === 409) {
                    setReloadNoGitOpsRepoConfiguredModal(true)
                }
            })
            .finally(() => {
                setGitopsConflictLoading(false)
            })
    }

    const gitOpsRepoConfigInfoBar = (content: string) => {
        return (
            <InfoColourBar
                message={content}
                classname="warn mb-16"
                Icon={Warn}
                iconClass="warning-icon"
                linkClass={`flex ${gitopsConflictLoading ? 'loading-dots-cb5 cursor-not-allowed' : ''}`}
                linkText="Configure GitOps Repository"
                internalLink
                linkOnClick={checkGitOpsRepoConflict}
            />
        )
    }

    const renderTriggerType = () => {
        return (
            <div className="cd-pipeline__trigger-type">
                <label className="form__label form__label--sentence dc__bold">
                    When do you want the pipeline to execute?
                </label>
                <RadioGroup
                    value={formData.triggerType ? formData.triggerType : TriggerType.Auto}
                    name="trigger-type"
                    onChange={handleTriggerTypeChange}
                    className="chartrepo-type__radio-group"
                >
                    <RadioGroupItem dataTestId="cd-auto-mode-button" value={TriggerType.Auto}>
                        Automatic
                    </RadioGroupItem>
                    <RadioGroupItem dataTestId="cd-manual-mode-button" value={TriggerType.Manual}>
                        Manual
                    </RadioGroupItem>
                </RadioGroup>
            </div>
        )
    }

    const setRepositoryName = (event): void => {
        const form = { ...formData }
        const formDataError = { ...formDataErrorObj }
        formDataError.repositoryError = validationRules.repository(event.target.value)
        form.repoName = event.target.value
        setFormData(form)
        setFormDataErrorObj(formDataError)
    }

    const handleRegistryChange = (selectedRegistry): void => {
        const form = { ...formData }
        const formDataError = { ...formDataErrorObj }
        formDataError.containerRegistryError = validationRules.containerRegistry(
            selectedRegistry.id || formData.containerRegistryName,
        )
        form.selectedRegistry = {
            ...selectedRegistry,
            value: selectedRegistry.id,
            label: selectedRegistry.id,
        } as RegistryPayloadWithSelectType
        form.containerRegistryName = selectedRegistry.id
        setFormData(form)
        setFormDataErrorObj(formDataError)
    }

    const onChangeSetGeneratedHelmPush = (selectedGeneratedHelmValue: string): void => {
        const form = { ...formData }
        form.generatedHelmPushAction = selectedGeneratedHelmValue
        setFormData(form)
    }

    const selectStrategy = (e): void => {
        const { value } = e.target
        const _form = { ...formData }
        const selection = _form.strategies.find((strategy) => strategy.deploymentTemplate == value)
        const strategies = _form.strategies.filter((strategy) => strategy.deploymentTemplate != value)

        if (_form.savedStrategies.length == 0) {
            selection.default = true
        } else {
            selection.default = false
        }

        selection['defaultConfig'] = allStrategies.current[selection.deploymentTemplate]
        selection['jsonStr'] = JSON.stringify(allStrategies.current[selection.deploymentTemplate], null, 4)
        selection['yamlStr'] = YAMLStringify(allStrategies.current[selection.deploymentTemplate], {
            indent: 2,
        })
        selection['isCollapsed'] = true

        _form.strategies = strategies
        _form.savedStrategies.push(selection)
        setFormData(_form)
    }

    const renderEnvSelector = () => {
        const envId = formData.environmentId
        const _environment = formData.environments.find((env) => env.id == envId)
        const selectedEnv: EnvironmentWithSelectPickerType = _environment && {
            ..._environment,
            label: _environment.name,
            value: _environment.id.toString(),
        }
        const envList = createClusterEnvGroup(formData.environments as Environment[], 'clusterName')

        const renderVirtualEnvironmentInfo = () => {
            if (isVirtualEnvironment && VirtualEnvSelectionInfoText) {
                return <VirtualEnvSelectionInfoText />
            }
        }

        const getEnvListOptions = () =>
            envList.map((_elm) => ({
                label: `Cluster: ${_elm.label}`,
                options: _elm.options.map((_option) => ({
                    ..._option,
                    label: _option?.name,
                    value: _option?.id.toString(),
                })),
            }))

        return (
            <>
                <SelectPicker
                    label="Environment"
                    required
                    inputId="environment"
                    menuPosition={isAdvanced ? null : 'fixed'}
                    isDisabled={!!cdPipelineId}
                    classNamePrefix="cd-pipeline-environment-dropdown"
                    placeholder="Select Environment"
                    autoFocus
                    options={
                        releaseMode === ReleaseMode.MIGRATE_HELM
                            ? getEnvListOptions().filter((env) =>
                                  env.options.filter((_env) => !_env.isVirtualEnvironment),
                              )
                            : getEnvListOptions()
                    }
                    value={selectedEnv}
                    getOptionValue={(option) => option.value as unknown as string}
                    onChange={selectEnvironment}
                    size={ComponentSizeType.large}
                />
                {isEnvUsedState && (
                    <span className="form__error">
                        <img src={error} className="form__icon" />
                        {ENV_ALREADY_EXIST_ERROR}
                    </span>
                )}
                {!formDataErrorObj.envNameError.isValid ? (
                    <span className="form__error">
                        <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                        {formDataErrorObj.envNameError.message}
                    </span>
                ) : null}
                {renderVirtualEnvironmentInfo()}
            </>
        )
    }

    const renderEnvNamespaceAndTriggerType = () => {
        const envId = formData.environmentId
        const selectedEnv: Environment = formData.environments.find((env) => env.id == envId)
        const namespaceEditable = false

        const isHelmEnforced =
            formData.allowedDeploymentTypes.length === 1 &&
            formData.allowedDeploymentTypes[0] === DeploymentAppTypes.HELM

        const gitOpsRepoNotConfiguredAndOptionsHidden =
            window._env_.HIDE_GITOPS_OR_HELM_OPTION &&
            selectedEnv &&
            !noGitOpsModuleInstalledAndConfigured &&
            !isHelmEnforced &&
            isGitOpsRepoNotConfigured

        return (
            <>
                <div className="form__row form__row--flex mt-12">
                    <div className="w-50 mr-8">{renderEnvSelector()}</div>
                    <div className="flex-1 ml-8">
                        <CustomInput
                            name="namespace"
                            rootClassName="h-36"
                            label="Namespace"
                            placeholder={getNamespacePlaceholder(isVirtualEnvironment, formData.namespace)}
                            data-testid="cd-pipeline-namespace-textbox"
                            disabled={!namespaceEditable}
                            value={selectedEnv?.namespace ? selectedEnv.namespace : formData.namespace}
                            onChange={handleNamespaceChange}
                            error={
                                !formDataErrorObj.nameSpaceError.isValid &&
                                !isVirtualEnvironment &&
                                formDataErrorObj.nameSpaceError.message
                            }
                        />
                    </div>
                </div>
                {gitOpsRepoNotConfiguredAndOptionsHidden && gitOpsRepoConfigInfoBar(GITOPS_REPO_REQUIRED)}
                {renderNamespaceInfo(namespaceEditable)}
                {isVirtualEnvironment
                    ? HelmManifestPush && (
                          <HelmManifestPush
                              generatedHelmPushAction={formData.generatedHelmPushAction}
                              onChangeSetGeneratedHelmPush={onChangeSetGeneratedHelmPush}
                              repositoryName={formData.repoName}
                              handleOnRepository={setRepositoryName}
                              dockerRegistries={dockerRegistries}
                              handleRegistryChange={handleRegistryChange}
                              selectedRegistry={formData.selectedRegistry}
                              containerRegistryName={formData.containerRegistryName}
                              containerRegistryErrorForm={formDataErrorObj.containerRegistryError}
                              repositoryErrorForm={formDataErrorObj.repositoryError}
                          />
                      )
                    : renderTriggerType()}
                {isVirtualEnvironment && formData.generatedHelmPushAction === GeneratedHelmPush.PUSH && (
                    <div className="mt-16">{renderTriggerType()}</div>
                )}
            </>
        )
    }

    const setDefaultStrategy = (selection: string): void => {
        const _form = { ...formData }

        const strategies = _form.strategies.map((strategy) => {
            return {
                ...strategy,
                default: strategy.deploymentTemplate == selection,
            }
        })
        const savedStrategies = _form.savedStrategies.map((strategy) => {
            return {
                ...strategy,
                default: strategy.deploymentTemplate == selection,
            }
        })
        _form.savedStrategies = savedStrategies
        _form.strategies = strategies
        setFormData(_form)
    }

    const deleteStrategy = (selection: string): void => {
        const _form = { ...formData }
        const removedStrategy = _form.savedStrategies.find(
            (savedStrategy) => selection === savedStrategy.deploymentTemplate,
        )
        if (removedStrategy.default) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Cannot remove default strategy',
            })
            return
        }
        const savedStrategies = _form.savedStrategies.filter(
            (savedStrategy) => selection !== savedStrategy.deploymentTemplate,
        )
        _form.strategies.push(removedStrategy)
        _form.savedStrategies = savedStrategies
        setFormData(_form)
    }

    const toggleStrategy = (selection: string): void => {
        const _form = { ...formData }
        const savedStrategies = _form.savedStrategies.map((strategy) => {
            return {
                ...strategy,
                isCollapsed: strategy.deploymentTemplate === selection ? !strategy.isCollapsed : strategy.isCollapsed,
            }
        })
        _form.savedStrategies = savedStrategies
        setPageState(ViewType.FORM)
        setFormData(_form)
    }

    const handleStrategyChange = (value, selection: string, key: 'json' | 'yaml'): void => {
        let json
        let jsonStr
        let yamlStr
        if (key === 'json') {
            jsonStr = value
            try {
                json = JSON.parse(jsonStr)
                yamlStr = YAMLStringify(json)
            } catch (error) {}
        } else {
            yamlStr = value
            try {
                json = yamlJsParser.parse(yamlStr)
                jsonStr = JSON.stringify(json, undefined, 2)
            } catch (error) {}
        }
        const _form = { ...formData }
        const strategies = _form.savedStrategies.map((strategy) => {
            if (strategy.deploymentTemplate === selection) {
                if (json) {
                    strategy['config'] = json
                }
                if (jsonStr) {
                    strategy['jsonStr'] = jsonStr
                }
                if (yamlStr) {
                    strategy['yamlStr'] = yamlStr
                }
            }
            return strategy
        })
        _form.savedStrategies = strategies
        setFormData(_form)
    }

    const handleUpdateUserApprovalConfig = (updatedUserApprovalConfig: CDFormType['userApprovalConfig']) => {
        const _form = structuredClone(formData)
        const _formDataErrorObj = structuredClone(formDataErrorObj)

        _form.userApprovalConfig = updatedUserApprovalConfig
        _formDataErrorObj.userApprovalConfig = validateUserApprovalConfig(updatedUserApprovalConfig)

        setFormData(_form)
        setFormDataErrorObj(_formDataErrorObj)
    }

    const renderDeploymentAppType = () => {
        return (
            <div className="cd-pipeline__deployment-type mt-16">
                <label className="form__label form__label--sentence dc__bold">How do you want to deploy?</label>
                <DeploymentAppRadioGroup
                    isDisabled={!!cdPipelineId}
                    deploymentAppType={formData.deploymentAppType ?? DeploymentAppTypes.HELM}
                    handleOnChange={handleDeploymentAppTypeChange}
                    allowedDeploymentTypes={formData.allowedDeploymentTypes}
                    rootClassName={`chartrepo-type__radio-group ${!cdPipelineId ? 'bcb-5' : ''}`}
                    isFromCDPipeline
                    isGitOpsRepoNotConfigured={isGitOpsRepoNotConfigured}
                    gitOpsRepoConfigInfoBar={gitOpsRepoConfigInfoBar}
                />
            </div>
        )
    }

    const renderStrategyOptions = () => {
        return (
            <Select rootClassName="deployment-strategy-dropdown br-0 bw-0 w-150" onChange={selectStrategy}>
                <Select.Button rootClassName="right" hideArrow>
                    <span className="flex cb-5 fw-6">
                        <Add className="icon-dim-20 mr-8 fcb-5 dc__vertical-align-middle" />
                        Add Strategy
                    </span>
                </Select.Button>
                {formData.strategies.map((strategy) => {
                    return (
                        <Select.Option
                            rootClassName="select-option--deployment-strategy"
                            key={strategy.deploymentTemplate}
                            value={strategy.deploymentTemplate}
                        >
                            {strategy.deploymentTemplate}
                        </Select.Option>
                    )
                })}
            </Select>
        )
    }

    const renderBasicDeploymentStrategy = () => {
        const strategyMenu = Object.keys(allStrategies.current).map((option) => {
            return { label: option, value: option }
        })
        const strategy = formData.savedStrategies[0]
            ? {
                  label: formData.savedStrategies[0]?.deploymentTemplate,
                  value: formData.savedStrategies[0]?.deploymentTemplate,
              }
            : undefined

        return (
            <>
                <p className="fs-14 fw-6 cn-9 mb-8 mt-16">Deployment Strategy</p>
                <p className="fs-13 fw-5 cn-7 mb-8">Configure deployment preferences for this pipeline</p>
                <SelectPicker
                    classNamePrefix="deployment-strategy-dropdown"
                    inputId="deployment-strategy-dropdown"
                    name="deployment-strategy-dropdown"
                    placeholder="Select Strategy"
                    options={strategyMenu}
                    value={strategy}
                    onChange={(selected: any) => {
                        handleStrategy(selected.value)
                    }}
                />
                {isWebhookCD && !parentPipelineId ? renderWebhookInfo() : null}
            </>
        )
    }

    const renderAdvancedDeploymentStrategy = () => {
        if (noStrategyAvailable.current || releaseMode === ReleaseMode.MIGRATE_HELM) {
            return null
        }

        const renderDeploymentStrategyTippy = () => {
            return (
                <TippyCustomized
                    theme={TippyTheme.white}
                    className="flex w-300 h-100 fcv-5"
                    placement="right"
                    Icon={Help}
                    heading="Deployment strategy"
                    infoText="Add one or more deployment strategies. You can choose from selected strategy while deploying manually to this environment."
                    showCloseButton
                    trigger="click"
                    interactive
                    documentationLinkText="View Documentation"
                >
                    <div className="icon-dim-16 fcn-9 ml-8 cursor">
                        <ICHelpOutline />
                    </div>
                </TippyCustomized>
            )
        }

        return (
            <div className="form__row">
                <p className="form__label form__label--caps mb-8-imp">
                    <div className="flex  dc__content-space mt-16">
                        <div className="flex left">
                            <span>Deployment Strategy</span>
                            {renderDeploymentStrategyTippy()}
                        </div>
                        {renderStrategyOptions()}
                    </div>
                </p>
                {formData.savedStrategies.map((strategy) => {
                    return (
                        <div key={strategy.deploymentTemplate} className="deployment-strategy__info">
                            <div className="deployment-strategy__info-header">
                                <span>
                                    <span>{strategy.deploymentTemplate}</span>
                                    {strategy.default ? (
                                        <span className="default-strategy">Default</span>
                                    ) : (
                                        <span
                                            className="set-as-default"
                                            onClick={() => setDefaultStrategy(strategy.deploymentTemplate)}
                                        >
                                            Set Default
                                        </span>
                                    )}
                                </span>
                                <span className="deployment-strategy__controls">
                                    <button
                                        type="button"
                                        className="dc__transparent"
                                        onClick={(event) => toggleStrategy(strategy.deploymentTemplate)}
                                    >
                                        <img src={settings} alt="config" className="icon-dim-20" />
                                    </button>
                                    <button
                                        type="button"
                                        className="dc__transparent"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            deleteStrategy(strategy.deploymentTemplate)
                                        }}
                                    >
                                        <img src={trash} alt="trash" className="icon-dim-20" />
                                    </button>
                                </span>
                            </div>
                            {strategy.isCollapsed ? null : (
                                <div className="deployment-strategy__info-body">
                                    <CodeEditor
                                        height={300}
                                        value={strategy.yamlStr}
                                        mode="yaml"
                                        onChange={(event) =>
                                            handleStrategyChange(event, strategy.deploymentTemplate, 'yaml')
                                        }
                                    >
                                        <CodeEditor.Header className="code-editor" />
                                    </CodeEditor>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderBuild = () => {
        return (
            <>
                {isAdvanced && formData.releaseMode === ReleaseMode.MIGRATE_HELM && (
                    <div className="flexbox px-12 py-8 dc__gap-8 bcb-1 br-4 mb-16">
                        <ICInfo className="dc__no-shrink icon-dim-20" />
                        <span className="fs=13 fw-4 lh-20 cn-9">
                            This deployment pipeline was linked to helm release: {formData.deploymentAppName}
                        </span>
                    </div>
                )}
                {isAdvanced && renderPipelineNameInput()}
                <p className="fs-14 fw-6 cn-9">Deploy to environment</p>
                {renderEnvNamespaceAndTriggerType()}
                {!window._env_.HIDE_GITOPS_OR_HELM_OPTION &&
                    !isVirtualEnvironment &&
                    formData.allowedDeploymentTypes.length > 0 &&
                    !noGitOpsModuleInstalledAndConfigured &&
                    renderDeploymentAppType()}
                {isAdvanced ? renderAdvancedDeploymentStrategy() : renderBasicDeploymentStrategy()}
                {isAdvanced &&
                    getBuildCDManualApproval &&
                    getBuildCDManualApproval(
                        formData.userApprovalConfig,
                        formDataErrorObj.userApprovalConfig,
                        handleUpdateUserApprovalConfig,
                    )}
                {isAdvanced && (
                    <>
                        <CustomImageTags
                            formData={formData}
                            setFormData={setFormData}
                            formDataErrorObj={formDataErrorObj}
                            setFormDataErrorObj={setFormDataErrorObj}
                            isCDBuild
                            savedTagPattern={savedCustomTagPattern}
                            selectedCDStageTypeValue={selectedCDStageTypeValue}
                            setSelectedCDStageTypeValue={setSelectedCDStageTypeValue}
                        />
                        <PullImageDigestToggle formData={formData} setFormData={setFormData} />
                    </>
                )}
            </>
        )
    }

    return pageState === ViewType.LOADING.toString() ? (
        <div style={{ minHeight: '200px' }} className="flex">
            <Progressing pageLoader />
        </div>
    ) : (
        <div className="cd-pipeline-body p-20 ci-scrollable-content">
            {releaseMode === ReleaseMode.MIGRATE_HELM && !isAdvanced ? (
                <MigrateHelmReleaseBody
                    renderTriggerType={renderTriggerType}
                    formData={formData}
                    setFormData={setFormData}
                    renderEnvSelector={renderEnvSelector}
                />
            ) : (
                renderBuild()
            )}
        </div>
    )
}
