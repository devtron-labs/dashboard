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

import { useContext, useState } from 'react'
import {
    CustomInput,
    DeploymentAppTypes,
    Progressing,
    TippyCustomized,
    TippyTheme,
    YAMLStringify,
    CodeEditor,
    Environment,
    ReleaseMode,
    SelectPicker,
    ToastVariantType,
    ToastManager,
    showError,
    TriggerType,
    InfoBlock,
    ButtonVariantType,
    MODES,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams, useHistory } from 'react-router-dom'
import yamlJsParser from 'yaml'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'
import { ReactComponent as Add } from '@Icons/ic-add.svg'
import { ReactComponent as Help } from '@Icons/ic-help.svg'
import { ReactComponent as ICInfo } from '@Icons/ic-info-filled.svg'
import { ReactComponent as ICHelpOutline } from '@Icons/ic-help-outline.svg'
import settings from '@Icons/ic-settings.svg'
import trash from '@Icons/misc/delete.svg'
import { ENV_ALREADY_EXIST_ERROR, RegistryPayloadWithSelectType, URLS, ViewType } from '../../config'
import { GeneratedHelmPush, MigrateToDevtronFormState, TriggerTypeRadioProps } from './cdPipeline.types'
import { createClusterEnvGroup, getDeploymentAppType, importComponentFromFELibrary, Select } from '../common'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { getNamespacePlaceholder } from './cdpipeline.util'
import { ValidationRules } from '../ciPipeline/validationRules'
import CustomImageTags from '../CIPipelineN/CustomImageTags'
import { GITOPS_REPO_REQUIRED } from '../v2/values/chartValuesDiff/constant'
import { getGitOpsRepoConfig } from '../../services/service'

import PullImageDigestToggle from './PullImageDigestToggle'
import { EnvironmentWithSelectPickerType } from '@Components/CIPipelineN/types'
import { BuildCDProps } from './types'
import { MigrateToDevtron } from './MigrateToDevtron'
import TriggerTypeRadio from './TriggerTypeRadio'
import { DEPLOYMENT_APP_TYPE_LABEL } from './MigrateToDevtron/constants'
import { MigrateToDevtronProps } from './MigrateToDevtron/types'
import { CDPipelineDeploymentAppType, SourceMaterialsSelector } from '@Pages/App/Configurations'

const HelmManifestPush = importComponentFromFELibrary('HelmManifestPush')

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
    isCustomChart,
    getMandatoryPluginData,
    migrateToDevtronFormState,
    setMigrateToDevtronFormState,
    isTemplateView,
    isGitOpsInstalledButNotConfigured,
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
        _form.triggerType = event.target.value as MigrateToDevtronFormState['triggerType']
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

            // Only readonly field not to be consumed while sending
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
            /**
             * Readonly field
             */
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
                    required
                    error={formDataErrorObj.name && !formDataErrorObj.name.isValid && formDataErrorObj.name.message}
                />
            </div>
        )
    }

    const renderWebhookInfo = () => {
        return (
            <div className="mt-16">
                <InfoBlock
                    variant="help"
                    description={
                        <div>
                            <span className="fw-6">Connecting to external CI service: </span>A webhook url and sample
                            JSON will be generated after the pipeline is created.
                        </div>
                    }
                />
            </div>
        )
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
                } else {
                    showError(err)
                }
            })
            .finally(() => {
                setGitopsConflictLoading(false)
            })
    }

    const gitOpsRepoConfigInfoBar = (content: string) =>
        isTemplateView ? null : (
            <InfoBlock
                description={content}
                variant="warning"
                buttonProps={{
                    dataTestId: 'configure-gitops-repo-button',
                    variant: ButtonVariantType.text,
                    text: 'Configure',
                    endIcon: <ICArrowRight />,
                    onClick: checkGitOpsRepoConflict,
                    isLoading: gitopsConflictLoading,
                }}
            />
        )

    const renderTriggerType = () => (
        <TriggerTypeRadio
            value={formData.triggerType ? (formData.triggerType as TriggerTypeRadioProps['value']) : TriggerType.Auto}
            onChange={handleTriggerTypeChange}
        />
    )

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

    const renderEnvNamespaceAndTriggerType = () => {
        const envId = formData.environmentId
        const _environment = formData.environments.find((env) => env.id == envId)
        const selectedEnv: EnvironmentWithSelectPickerType = _environment && {
            ..._environment,
            label: _environment.name,
            value: _environment.id.toString(),
        }

        const isHelmEnforced =
            formData.allowedDeploymentTypes.length === 1 &&
            formData.allowedDeploymentTypes[0] === DeploymentAppTypes.HELM

        const gitOpsRepoNotConfiguredAndOptionsHidden =
            window._env_.HIDE_GITOPS_OR_HELM_OPTION &&
            selectedEnv &&
            !noGitOpsModuleInstalledAndConfigured &&
            !isHelmEnforced &&
            isGitOpsRepoNotConfigured

        const envList = createClusterEnvGroup(formData.environments as Environment[], 'clusterName')

        const getEnvListOptions = () =>
            envList.map((_elm) => ({
                label: `Cluster: ${_elm.label}`,
                options: _elm.options.map((_option) => ({
                    ..._option,
                    label: _option?.name,
                    value: _option?.id.toString(),
                })),
            }))

        const getEnvError = () => {
            if (isEnvUsedState) {
                return ENV_ALREADY_EXIST_ERROR
            }

            return !formDataErrorObj.envNameError.isValid ? formDataErrorObj.envNameError.message : null
        }

        return (
            <>
                <SourceMaterialsSelector
                    branchInputProps={{
                        name: 'cd-pipeline-namespace',
                        onChange: handleNamespaceChange,
                        placeholder: getNamespacePlaceholder(isVirtualEnvironment, formData.namespace),
                        label: 'Namespace',
                        value: selectedEnv?.namespace ? selectedEnv.namespace : formData.namespace,
                        disabled: true,
                        error:
                            !formDataErrorObj.nameSpaceError.isValid &&
                            !isVirtualEnvironment &&
                            formDataErrorObj.nameSpaceError.message,
                    }}
                    sourceTypePickerProps={{
                        inputId: 'cd-pipeline-environment',
                        classNamePrefix: 'cd-pipeline-environment',
                        label: 'Environment',
                        placeholder: 'Select environment',
                        isDisabled: !!cdPipelineId,
                        menuPosition: isAdvanced ? null : 'fixed',
                        options:
                            releaseMode === ReleaseMode.MIGRATE_EXTERNAL_APPS
                                ? getEnvListOptions().filter((env) =>
                                      env.options.filter((_env) => !_env.isVirtualEnvironment),
                                  )
                                : getEnvListOptions(),
                        value: selectedEnv,
                        getOptionValue: (option) => option.value as string,
                        helperText: isVirtualEnvironment ? 'Isolated environment' : null,
                        error: getEnvError(),
                        onChange: selectEnvironment,
                        autoFocus: true,
                    }}
                />
                <div className="mb-16">
                    {gitOpsRepoNotConfiguredAndOptionsHidden && gitOpsRepoConfigInfoBar(GITOPS_REPO_REQUIRED)}
                </div>
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
        if (noStrategyAvailable.current || (releaseMode === ReleaseMode.MIGRATE_EXTERNAL_APPS && isCustomChart)) {
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
                    <div className="flex dc__content-space mt-16">
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
                                        mode={MODES.YAML}
                                        value={strategy.yamlStr}
                                        height={300}
                                        onChange={(event) =>
                                            handleStrategyChange(event, strategy.deploymentTemplate, 'yaml')
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderBuild = () => {
        if (!isAdvanced && releaseMode === ReleaseMode.MIGRATE_EXTERNAL_APPS) {
            return (
                <MigrateToDevtron
                    migrateToDevtronFormState={migrateToDevtronFormState}
                    setMigrateToDevtronFormState={setMigrateToDevtronFormState}
                />
            )
        }

        return (
            <>
                {isAdvanced && (
                    <>
                        {formData.releaseMode === ReleaseMode.MIGRATE_EXTERNAL_APPS && (
                            <div className="flexbox px-12 py-8 dc__gap-8 bcb-1 br-4 mb-16">
                                <ICInfo className="dc__no-shrink icon-dim-20 dc__no-shrink" />
                                <span className="fs-13 fw-4 lh-20 cn-9 dc__word-break">
                                    This deployment pipeline was linked to&nbsp;
                                    {DEPLOYMENT_APP_TYPE_LABEL[formData.deploymentAppType as DeploymentAppTypes]}
                                    &nbsp;: {formData.deploymentAppName}
                                </span>
                            </div>
                        )}

                        {renderPipelineNameInput()}
                    </>
                )}

                <p className="fs-14 fw-6 cn-9">Deploy to environment</p>
                {renderEnvNamespaceAndTriggerType()}
                <CDPipelineDeploymentAppType
                    isGitOpsInstalledButNotConfigured={isGitOpsInstalledButNotConfigured}
                    isVirtualEnvironment={isVirtualEnvironment}
                    noGitOpsModuleInstalledAndConfigured={noGitOpsModuleInstalledAndConfigured}
                    isDisabled={!!cdPipelineId}
                    deploymentAppType={formData.deploymentAppType ?? DeploymentAppTypes.HELM}
                    handleChange={handleDeploymentAppTypeChange}
                    allowedDeploymentTypes={formData.allowedDeploymentTypes}
                    rootClassName={`chartrepo-type__radio-group ${!cdPipelineId ? 'bcb-5' : ''}`}
                    isGitOpsRepoNotConfigured={isGitOpsRepoNotConfigured}
                    gitOpsRepoConfigInfoBar={gitOpsRepoConfigInfoBar}
                    areGitopsCredentialsConfigured={!isGitOpsInstalledButNotConfigured}
                />
                {isAdvanced ? renderAdvancedDeploymentStrategy() : renderBasicDeploymentStrategy()}
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
        <div className="cd-pipeline-body p-20 ci-scrollable-content">{renderBuild()}</div>
    )
}
