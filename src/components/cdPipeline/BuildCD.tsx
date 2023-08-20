import {
    DeploymentAppTypes,
    InfoColourBar,
    Progressing,
    RadioGroup,
    RadioGroupItem,
    TippyCustomized,
    TippyTheme,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { TriggerType, ViewType } from '../../config'
import { Environment, GeneratedHelmPush } from './cdPipeline.types'
import { createClusterEnvGroup, getDeploymentAppType, importComponentFromFELibrary, Select } from '../common'
import {
    DropdownIndicator,
    EnvFormatOptions,
    formatHighlightedTextDescription,
    GroupHeading,
    groupStyle,
} from '../v2/common/ReactSelect.utils'
import ReactSelect from 'react-select'
import { Info } from '../common/icons/Icons'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import settings from '../../assets/icons/ic-settings.svg'
import trash from '../../assets/icons/misc/delete.svg'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import yamlJsParser from 'yaml'
import { toast } from 'react-toastify'
import { styles, Option } from './cdpipeline.util'
import { ValidationRules } from '../ciPipeline/validationRules'
import { DeploymentAppRadioGroup } from '../v2/values/chartValuesDiff/ChartValuesView.component'
import CodeEditor from '../CodeEditor/CodeEditor'

const VirtualEnvSelectionInfoText = importComponentFromFELibrary('VirtualEnvSelectionInfoText')
const HelmManifestPush = importComponentFromFELibrary('HelmManifestPush')
const ManualApproval = importComponentFromFELibrary('ManualApproval')

export default function BuildCD({
    isAdvanced,
    setIsVirtualEnvironment,
    noStrategyAvailable,
    allStrategies,
    parentPipelineId,
    isWebhookCD,
    dockerRegistries
}) {
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
    } = useContext(pipelineContext)
    const validationRules = new ValidationRules()
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

    const selectEnvironment = (selection: Environment): void => {
        const _form = { ...formData }
        const _formDataErrorObj = { ...formDataErrorObj }

        if (selection) {
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
            _form.generatedHelmPushAction = selection.isVirtualEnvironment ? GeneratedHelmPush.DO_NOT_PUSH : GeneratedHelmPush.PUSH
            _form.allowedDeploymentTypes = selection.allowedDeploymentTypes
            setFormDataErrorObj(_formDataErrorObj)
            setFormData(_form)
        } else {
            let list = _form.environments.map((item) => {
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
            setFormData(_form)
            setFormDataErrorObj(_formDataErrorObj)
        }
    }

    const renderPipelineNameInput = () => {
        return (
            <div className="form__row">
                <label className="form__label dc__required-field">Pipeline Name</label>
                <input
                    className="form__input"
                    autoComplete="off"
                    disabled={!!cdPipelineId}
                    data-testid="advance-pipeline-name-textbox"
                    placeholder="Pipeline name"
                    type="text"
                    value={formData.name}
                    onChange={handlePipelineName}
                />
                {formDataErrorObj.name && !formDataErrorObj.name.isValid && (
                    <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                        <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                        <span>{formDataErrorObj.name.message}</span>
                    </span>
                )}
            </div>
        )
    }

    const renderWebhookWarning = () => {
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
        } else return null
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
        const form = {...formData}
        const formDataError = {...formDataErrorObj}
        formDataError.repositoryError = validationRules.repository(event.target.value)
        form.repoName = event.target.value
        setFormData(form)
        setFormDataErrorObj(formDataError)
    }

    const handleRegistryChange = (selectedRegistry): void => {
        const form = {...formData}
        const formDataError = {...formDataErrorObj}
        formDataError.containerRegistryError = validationRules.containerRegistry(selectedRegistry.id || formData.containerRegistryName)
        form.selectedRegistry = selectedRegistry
        form.containerRegistryName = selectedRegistry.id
        setFormData(form)
        setFormDataErrorObj(formDataError)

    }

    const  onChangeSetGeneratedHelmPush = (selectedGeneratedHelmValue: string): void => {
        const form = {...formData}
        form.generatedHelmPushAction = selectedGeneratedHelmValue
        setFormData(form)
    }

    const selectStrategy = (e): void => {
        const value = e.target.value
        const _form = { ...formData }
        let selection = _form.strategies.find((strategy) => strategy.deploymentTemplate == value)
        let strategies = _form.strategies.filter((strategy) => strategy.deploymentTemplate != value)

        if (_form.savedStrategies.length == 0) selection.default = true
        else selection.default = false

        selection['defaultConfig'] = allStrategies.current[selection.deploymentTemplate]
        selection['jsonStr'] = JSON.stringify(allStrategies.current[selection.deploymentTemplate], null, 4)
        selection['yamlStr'] = yamlJsParser.stringify(allStrategies.current[selection.deploymentTemplate], {
            indent: 2,
        })
        selection['isCollapsed'] = true

        _form.strategies = strategies
        _form.savedStrategies.push(selection)
        setFormData(_form)
    }

    const renderEnvNamespaceAndTriggerType = () => {
        let envId = formData.environmentId
        let selectedEnv: Environment = formData.environments.find((env) => env.id == envId)
        let namespaceEditable = false
        const envList = createClusterEnvGroup(formData.environments as Environment[], 'clusterName')

        const groupHeading = (props) => {
            return <GroupHeading {...props} />
        }

        const getNamespaceplaceholder = (): string => {
            if (isVirtualEnvironment) {
                if (formData.namespace) {
                    return 'Will be auto-populated based on environment'
                } else {
                    return 'Not available'
                }
            } else {
                return 'Will be auto-populated based on environment'
            }
        }

        const renderVirtualEnvironmentInfo = () => {
            if (isVirtualEnvironment && VirtualEnvSelectionInfoText) {
                return <VirtualEnvSelectionInfoText />
            }
        }

        const singleOption = (props) => {
            return <EnvFormatOptions {...props} environmentfieldName="name" />
        }

        const handleFormatHighlightedText = (opt: Environment, { inputValue }) => {
            return formatHighlightedTextDescription(opt, inputValue, 'name')
        }

        return (
            <>
                <div className="form__row form__row--flex mt-12">
                    <div className="w-50 mr-8">
                        <div className="form__label">Environment*</div>
                        <ReactSelect
                            menuPortalTarget={isAdvanced ? null : document.getElementById('visible-modal')}
                            closeMenuOnScroll={true}
                            isDisabled={!!cdPipelineId}
                            classNamePrefix="cd-pipeline-environment-dropdown"
                            placeholder="Select Environment"
                            options={envList}
                            value={selectedEnv}
                            getOptionLabel={(option) => `${option.name}`}
                            getOptionValue={(option) => `${option.id}`}
                            isMulti={false}
                            onChange={(selected: any) => selectEnvironment(selected)}
                            components={{
                                IndicatorSeparator: null,
                                DropdownIndicator,
                                SingleValue: singleOption,
                                GroupHeading: groupHeading,
                            }}
                            styles={{
                                ...groupStyle(),
                                control: (base) => ({ ...base, border: '1px solid #d6dbdf' }),
                            }}
                            formatOptionLabel={handleFormatHighlightedText}
                        />
                        {!formDataErrorObj.envNameError.isValid ? (
                            <span className="form__error">
                                <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                {formDataErrorObj.envNameError.message}
                            </span>
                        ) : null}
                        {renderVirtualEnvironmentInfo()}
                    </div>
                    <div className="flex-1 ml-8">
                        <span className="form__label">Namespace</span>
                        <input
                            className="form__input"
                            autoComplete="off"
                            placeholder={getNamespaceplaceholder()}
                            data-testid="cd-pipeline-namespace-textbox"
                            type="text"
                            disabled={!namespaceEditable}
                            value={selectedEnv?.namespace ? selectedEnv.namespace : formData.namespace}
                            onChange={handleNamespaceChange}
                        />

                        {!formDataErrorObj.nameSpaceError.isValid && !isVirtualEnvironment ? (
                            <span className="form__error">
                                <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                {formDataErrorObj.nameSpaceError.message}
                            </span>
                        ) : null}
                    </div>
                </div>
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

        let strategies = _form.strategies.map((strategy) => {
            return {
                ...strategy,
                default: strategy.deploymentTemplate == selection,
            }
        })
        let savedStrategies = _form.savedStrategies.map((strategy) => {
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
        let removedStrategy = _form.savedStrategies.find(
            (savedStrategy) => selection === savedStrategy.deploymentTemplate,
        )
        if (removedStrategy.default) {
            toast.error('Cannot remove default strategy')
            return
        }
        let savedStrategies = _form.savedStrategies.filter(
            (savedStrategy) => selection !== savedStrategy.deploymentTemplate,
        )
        _form.strategies.push(removedStrategy)
        _form.savedStrategies = savedStrategies
        setFormData(_form)
    }

    const toggleStrategy = (selection: string): void => {
        const _form = { ...formData }
        let savedStrategies = _form.savedStrategies.map((strategy) => {
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
        let json, jsonStr, yamlStr
        if (key === 'json') {
            jsonStr = value
            try {
                json = JSON.parse(jsonStr)
                yamlStr = yamlJsParser.stringify(json, { indent: 2 })
            } catch (error) {}
        } else {
            yamlStr = value
            try {
                json = yamlJsParser.parse(yamlStr)
                jsonStr = JSON.stringify(json, undefined, 2)
            } catch (error) {}
        }
        const _form = { ...formData }
        let strategies = _form.savedStrategies.map((strategy) => {
            if (strategy.deploymentTemplate === selection) {
                if (json) strategy['config'] = json
                if (jsonStr) strategy['jsonStr'] = jsonStr
                if (yamlStr) strategy['yamlStr'] = yamlStr
            }
            return strategy
        })
        _form.savedStrategies = strategies
        setFormData(_form)
    }

    const onChangeRequiredApprovals = (requiredCount: string): void => {
        const _form = { ...formData }
        _form.requiredApprovals = requiredCount
        setFormData(_form)
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
                    isFromCDPipeline={true}
                />
            </div>
        )
    }

    const renderStrategyOptions = () => {
        return (
            <Select rootClassName="deployment-strategy-dropdown br-0 bw-0 w-150" onChange={selectStrategy}>
                <Select.Button rootClassName="right" hideArrow={true}>
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

    const renderBasicDeploymentStartegy = () => {
        let strategyMenu = Object.keys(allStrategies.current).map((option) => {
            return { label: option, value: option }
        })
        let strategy = formData.savedStrategies[0]
            ? {
                  label: formData.savedStrategies[0]?.deploymentTemplate,
                  value: formData.savedStrategies[0]?.deploymentTemplate,
              }
            : undefined

        return (
            <>
                <p className="fs-14 fw-6 cn-9 mb-8 mt-16">Deployment Strategy</p>
                <p className="fs-13 fw-5 cn-7 mb-8">Configure deployment preferences for this pipeline</p>
                <ReactSelect
                    menuPortalTarget={document.getElementById('visible-modal')}
                    closeMenuOnScroll={true}
                    classNamePrefix="deployment-strategy-dropdown"
                    isSearchable={false}
                    isClearable={false}
                    isMulti={false}
                    placeholder="Select Strategy"
                    options={strategyMenu}
                    value={strategy}
                    onChange={(selected: any) => {
                        handleStrategy(selected.value)
                    }}
                    components={{
                        IndicatorSeparator: null,
                        DropdownIndicator,
                        Option,
                    }}
                    styles={{ ...styles }}
                />
                {isWebhookCD && !parentPipelineId && renderWebhookWarning()}
            </>
        )
    }

    const renderDeploymentStrategy = () => {
        if (noStrategyAvailable.current) {
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
                    showCloseButton={true}
                    trigger="click"
                    interactive={true}
                    documentationLinkText="View Documentation"
                >
                    <div className="icon-dim-16 fcn-9 ml-8 cursor">
                        <Question />
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
                                            onClick={(event) => setDefaultStrategy(strategy.deploymentTemplate)}
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
                                        value={strategy.jsonStr}
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
                {isAdvanced && renderPipelineNameInput()}
                <p className="fs-14 fw-6 cn-9">Deploy to environment</p>
                {renderEnvNamespaceAndTriggerType()}

                {!window._env_.HIDE_GITOPS_OR_HELM_OPTION &&
                    !isVirtualEnvironment &&
                    formData.allowedDeploymentTypes.length > 0 &&
                    renderDeploymentAppType()}
                {isAdvanced ? renderDeploymentStrategy() : renderBasicDeploymentStartegy()}
                {isAdvanced && ManualApproval && (
                    <>
                        <div className="divider mt-12 mb-12" />
                        <ManualApproval
                            requiredApprovals={formData.requiredApprovals}
                            currentRequiredCount={formData.userApprovalConfig?.requiredCount}
                            onChangeRequiredApprovals={onChangeRequiredApprovals}
                        />
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
