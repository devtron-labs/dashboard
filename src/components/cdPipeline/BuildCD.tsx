import {
    FormErrorObjectType,
    InfoColourBar,
    Progressing,
    RadioGroup,
    RadioGroupItem,
    TippyCustomized,
    TippyTheme,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { TriggerType, ViewType } from '../../config'
import { DeploymentAppType } from '../v2/values/chartValuesDiff/ChartValuesView.type'
import { CDFormErrorObjectType, CDFormType, Environment } from './cdPipeline.types'
import { createClusterEnvGroup, importComponentFromFELibrary, Select } from '../common'
import {
    DropdownIndicator,
    EnvFormatOptions,
    formatHighlightedTextDescription,
    GroupHeading,
} from '../v2/common/ReactSelect.utils'
import ReactSelect from 'react-select'
import { groupStyle } from '../secrets/secret.utils'
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

const VirtualEnvSelectionInfoText = importComponentFromFELibrary('VirtualEnvSelectionInfoText')
const VirtualEnvSelectionInfoBar = importComponentFromFELibrary('VirtualEnvSelectionInfoBar')
const ManualApproval = importComponentFromFELibrary('ManualApproval')

export default function BuildCD({
    isAdvanced,
    setIsVirtualEnvironment,
    noStrategyAvailable,
    showFormError,
    allStrategies,
    parentPipelineId,
    isWebhookCD
}) {
    const {
        formData,
        setFormData,
        formDataErrorObj,
        setFormDataErrorObj,
        pageState,
        setPageState,
        handleStrategy,
        getPrePostStageInEnv,
        isVirtualEnvironment,

    }: {
        formData: CDFormType
        setFormData: React.Dispatch<React.SetStateAction<any>>
        formDataErrorObj: CDFormErrorObjectType
        setFormDataErrorObj: React.Dispatch<React.SetStateAction<CDFormErrorObjectType>>
        pageState: string
        setPageState: React.Dispatch<React.SetStateAction<string>>
        handleStrategy: (value: any) => void
        getPrePostStageInEnv: (isVirtualEnvironment: boolean, isRunPrePostStageInEnv: boolean) => boolean
        isVirtualEnvironment: boolean,

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
            let list = _form.environments.map((item) => {
                return {
                    ...item,
                    active: item.id == selection.id,
                }
            })
            _form.environmentId = selection.id
            _form.environmentName = selection.name
            _form.namespace = selection.namespace
            setIsVirtualEnvironment(selection.isVirtualEnvironment)
            _formDataErrorObj.envNameError = validationRules.environment(selection.id)
            _formDataErrorObj.nameSpaceError = !isVirtualEnvironment && validationRules.namespace(selection.namespace)
            _form.preStageConfigMapSecretNames = {
                configMaps: [],
                secrets: [],
            }
            _form.postStageConfigMapSecretNames = {
                configMaps: [],
                secrets: [],
            }
            _form.isClusterCdActive = selection.isClusterCdActive
            _form.runPreStageInEnv = getPrePostStageInEnv(selection.isVirtualEnvironment, _form.isClusterCdActive && _form.runPreStageInEnv)
            _form.runPostStageInEnv = getPrePostStageInEnv(selection.isVirtualEnvironment, _form.isClusterCdActive && _form.runPostStageInEnv)
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

    const renderDeploymentAppType = () => {
        return (
            <div className="cd-pipeline__deployment-type mt-16">
                <label className="form__label form__label--sentence dc__bold">How do you want to deploy?</label>
                <RadioGroup
                    value={formData.deploymentAppType ? formData.deploymentAppType : DeploymentAppType.Helm}
                    name="deployment-app-type"
                    onChange={handleDeploymentAppTypeChange}
                    disabled={!!cdPipelineId}
                    className={`chartrepo-type__radio-group ${!cdPipelineId ? 'bcb-5' : ''}`}
                >
                    <RadioGroupItem dataTestId="helm-deployment-type-button" value={DeploymentAppType.Helm}>
                        Helm
                    </RadioGroupItem>
                    <RadioGroupItem dataTestId="gitOps-deployment-type-button" value={DeploymentAppType.GitOps}>
                        GitOps
                    </RadioGroupItem>
                </RadioGroup>
            </div>
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

    const selectStrategy = (value: string): void => {
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
        const envList = createClusterEnvGroup(formData.environments, 'clusterName')

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
                            value={selectedEnv && selectedEnv.namespace ? selectedEnv.namespace : formData.namespace}
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
                    ? VirtualEnvSelectionInfoBar && <VirtualEnvSelectionInfoBar />
                    : renderTriggerType()}
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

    const handleStrategyChange = (event, selection: string, key: 'json' | 'yaml'): void => {
        let json, jsonStr, yamlStr
        if (key === 'json') {
            jsonStr = event.target.value
            try {
                json = JSON.parse(jsonStr)
                yamlStr = yamlJsParser.stringify(json, { indent: 2 })
            } catch (error) {}
        } else {
            yamlStr = event.target.value
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
        const _form = {...formData}
        _form.requiredApprovals = requiredCount 
        setFormData(_form)
    }

    const renderStrategyOptions = () => {
        return (
            <Select
                rootClassName="deployment-strategy-dropdown br-0 bw-0 w-150"
                onChange={(e) => selectStrategy(e.target.value)}
            >
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
                  label:formData.savedStrategies[0]?.deploymentTemplate,
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
                                    <textarea
                                        className="dc__code-textarea code-textarea--cd-pipeline"
                                        value={strategy.jsonStr}
                                        onChange={(event) =>
                                            handleStrategyChange(event, strategy.deploymentTemplate, 'json')
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

    return pageState === ViewType.LOADING.toString() ? (
        <div style={{ minHeight: '200px' }} className="flex">
            <Progressing pageLoader />
        </div>
    ) : (
        <div className="cd-pipeline-body p-20 ci-scrollable-content">
            {isAdvanced && renderPipelineNameInput()}
            <p className="fs-14 fw-6 cn-9">Deploy to environment</p>
            {renderEnvNamespaceAndTriggerType()}
            {!window._env_.HIDE_GITOPS_OR_HELM_OPTION && !isVirtualEnvironment && renderDeploymentAppType()}
            {isAdvanced ? renderDeploymentStrategy() : renderBasicDeploymentStartegy()}
                {ManualApproval && (
                    <>
                        <div className="divider mt-12 mb-12" />
                        <ManualApproval
                            requiredApprovals={formData.requiredApprovals}
                            currentRequiredCount={formData.userApprovalConfig?.requiredCount}
                            onChangeRequiredApprovals={onChangeRequiredApprovals}
                        />
                    </>
                )}
        </div>
    )
}
