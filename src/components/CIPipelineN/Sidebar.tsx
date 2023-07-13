import React, { useContext, useEffect, useState } from 'react'
import { BuildStageVariable, ConfigurationType, DOCUMENTATION, TriggerType } from '../../config'
import {
    RadioGroup,
    RadioGroupItem,
    Option,
    multiSelectStyles,
    CHECKBOX_VALUE,
} from '@devtron-labs/devtron-fe-common-lib'
import { TaskList } from './TaskList'
import { importComponentFromFELibrary } from '../common'
import { CIPipelineSidebarType } from '../ciConfig/types'
import { pipelineContext } from '../workflowEditor/workflowEditor'
import { ReactComponent as File } from '../../assets/icons/ic-file-code.svg'
import { ReactComponent as Key } from '../../assets/icons/ic-key-bulb.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Remove } from '../../assets/icons/ic-close.svg'
import ReactSelect from 'react-select'
import { groupHeaderStyle, GroupHeading } from '../v2/common/ReactSelect.utils'
import { ValueContainer } from '../cdPipeline/cdpipeline.util'
import Tippy from '@tippyjs/react'
import { PipelineFormType } from '../workflowEditor/types'

const MandatoryPluginWarning = importComponentFromFELibrary('MandatoryPluginWarning')

export function Sidebar({
    isJobView,
    mandatoryPluginData,
    pluginList,
    mandatoryPluginsMap,
    setInputVariablesListFromPrevStep,
}: CIPipelineSidebarType) {
    const {
        formData,
        setFormData,
        configurationType,
        activeStageName,
        formDataErrorObj,
        setFormDataErrorObj,
        setSelectedTaskIndex,
        calculateLastStepDetail,
        validateStage,
        isCdPipeline,
        configMapAndSecrets,
        isVirtualEnvironment,
        getPrePostStageInEnv,
    } = useContext(pipelineContext)

    const [addConfigSecret, setAddConfigSecret] = useState<boolean>(false)
    const [helpData, setHelpData] = useState<{ helpText: string; docLink: string }>({
        helpText: 'Docs: Configure build stage',
        docLink: DOCUMENTATION.BUILD_STAGE,
    })
    const isPreBuildTab = activeStageName === BuildStageVariable.PreBuild
    const changeTriggerType = (appCreationType: string): void => {
        const _formData = { ...formData }
        _formData.triggerType = appCreationType
        setFormData(_formData)
    }

    useEffect(() => {
        if (isJobView) {
            setHelpData({ helpText: 'Docs: Configure job', docLink: DOCUMENTATION.JOB_WORKFLOW_EDITOR })
        } else if (activeStageName === BuildStageVariable.Build) {
            setHelpData({ helpText: 'Docs: Configure build stage', docLink: DOCUMENTATION.BUILD_STAGE })
        } else if (activeStageName === BuildStageVariable.PostBuild) {
            setHelpData({ helpText: 'Docs: Configure post-build tasks', docLink: DOCUMENTATION.PRE_POST_BUILD_STAGE })
        } else if (isPreBuildTab) {
            setHelpData({ helpText: 'Docs: Configure pre-build tasks', docLink: DOCUMENTATION.PRE_POST_BUILD_STAGE })
        }
    }, [activeStageName])

    const showMandatoryWarning = (): boolean => {
        return (
            mandatoryPluginData &&
            ((isPreBuildTab && !mandatoryPluginData.isValidPre) ||
                (activeStageName === BuildStageVariable.PostBuild && !mandatoryPluginData.isValidPost))
        )
    }

    const handleApplyPlugin = (_formData: PipelineFormType): void => {
        const preBuildVariable = calculateLastStepDetail(
            false,
            _formData,
            BuildStageVariable.PreBuild,
        ).calculatedStageVariables
        const postBuildVariable = calculateLastStepDetail(
            false,
            _formData,
            BuildStageVariable.PostBuild,
        ).calculatedStageVariables
        setInputVariablesListFromPrevStep({
            preBuildStage: preBuildVariable,
            postBuildStage: postBuildVariable,
        })
        setSelectedTaskIndex(_formData[activeStageName].steps.length - 1)
        validateStage(BuildStageVariable.PreBuild, _formData)
        validateStage(BuildStageVariable.PostBuild, _formData)
    }

    const addConfigSecrets = (selected) => {
        const _form = { ...formData}
        const preConfigMaps = []
        const preSecrets = []
        const postConfigsMaps = []
        const postSecrets = []
        selected.forEach((item) => {
            if (item.type === 'configmaps') {
                if (isPreBuildTab) {
                    preConfigMaps.push(item)
                } else if (activeStageName === BuildStageVariable.PostBuild) {
                    postConfigsMaps.push(item)
                }
            } else {
                if (isPreBuildTab) {
                    preSecrets.push(item)
                } else if (activeStageName === BuildStageVariable.PostBuild) {
                    postSecrets.push(item)
                }
            }
        })
        if (isPreBuildTab) {
            _form.preStageConfigMapSecretNames.configMaps = preConfigMaps
            _form.preStageConfigMapSecretNames.secrets = preSecrets
        } else {
            _form.postStageConfigMapSecretNames.configMaps = postConfigsMaps
            _form.postStageConfigMapSecretNames.secrets = postSecrets
        }
        setFormData(_form)
    }

    const renderConfigSecret = () => {
        const preStageValue = [
            ...formData.preStageConfigMapSecretNames.configMaps,
            ...formData.preStageConfigMapSecretNames.secrets,
        ]
        const postStageValue = [
            ...formData.postStageConfigMapSecretNames.configMaps,
            ...formData.postStageConfigMapSecretNames.secrets,
        ]
        const valueList = isPreBuildTab ? preStageValue : postStageValue

        const listIcon = (type) => {
            if (type === 'configmaps') {
                return <File className="icon-dim-20 mr-9" />
            } else {
                return <Key className="icon-dim-20 mr-8" />
            }
        }

        const tempMultiSelectStyles = {
            ...multiSelectStyles,
            ...groupHeaderStyle,
            menu: (base, state) => ({
                ...base,
                top: 'auto',
                marginTop: '4px',

            }),
            dropdownIndicator: (base, state) => ({
                ...base,
                transition: 'all .2s ease',
                transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }),
        }

        const onBlur = () => {
            setAddConfigSecret(false)
        }

        const onClick = () => {
            setAddConfigSecret(true)
        }

        const removeConfigSecret = (name) => {
            const updatedList = valueList.filter((item) => item.value !== name)
            addConfigSecrets(updatedList)
        }

        return (
            <>
                <div className="sidebar-action-container-border pb-12">
                    {!addConfigSecret ? (
                        <div className="flex flex-justify pt-6 pb-6">
                            <span className="fs-12 cn-6 fw-6">CONFIGMAPS & SECRETS</span>
                            <Add className="fcb-5 icon-dim-20 cursor" onClick={onClick} />
                        </div>
                    ) : (
                        <div className="pl-2 pr-2">
                            <ReactSelect
                                options={configMapAndSecrets}
                                value={valueList}
                                placeholder="Search"
                                menuIsOpen={addConfigSecret}
                                autoFocus={addConfigSecret}
                                className="basic-multi-select"
                                onBlur={onBlur}
                                closeMenuOnSelect={false}
                                hideSelectedOptions={false}
                                controlShouldRenderValue={false}
                                components={{
                                    ClearIndicator: null,
                                    ValueContainer: ValueContainer,
                                    IndicatorSeparator: null,
                                    Option,
                                    IndicatorsContainer: () => null,
                                    GroupHeading: (props) => <GroupHeading {...props} hideClusterName />,
                                }}
                                styles={tempMultiSelectStyles}
                                onChange={addConfigSecrets}
                                isMulti
                            />
                        </div>
                    )}
                    {valueList.length > 0 && (
                        <div className="">
                            {valueList.map((item) => {
                                return (
                                    <div key={item.value} className="dc__hover-n50 pt-6 pb-6 flex left dc__visible-hover dc__visible-hover--parent">
                                        {listIcon(item.type)}
                                        {item.label}
                                        <Remove
                                            className="icon-dim-20 dc__align-right cursor fcn-6 dc__visible-hover--child"
                                            onClick={() => removeConfigSecret(item.value)}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
                {renderExecuteTask()}
            </>
        )
    }

    const changeTriggerStageType = (appCreationType) => {
        const _formData = { ...formData }
        if (isPreBuildTab) {
            _formData.preBuildStage.triggerType = appCreationType
        } else {
            _formData.postBuildStage.triggerType = appCreationType
        }
        setFormData(_formData)
    }

    const handleRunInEnvCheckbox = () => {
        const form = { ...formData }
        if (isPreBuildTab) form.runPreStageInEnv = getPrePostStageInEnv(isVirtualEnvironment, !form.runPreStageInEnv)
        else form.runPostStageInEnv = getPrePostStageInEnv(isVirtualEnvironment, !form.runPostStageInEnv)
        setFormData(form)
    }

    const renderExecuteTask = () => {
        const runInEnv = isPreBuildTab ? formData.runPreStageInEnv : formData.runPostStageInEnv

        return (
            <Tippy
            className="default-tt"
            arrow={false}
            placement="bottom"
            disabled={isVirtualEnvironment}
            content="This Environment is not configured to run on devtron worker."
        >
            <div
                className="flexbox flex-justify fs-13 fw-4 mt-12 mb-12 dc__position-rel"
            >
                Execute tasks in application environment
                <input
                    type="checkbox"
                    className="icon-dim-20"
                    checked={runInEnv}
                    value={CHECKBOX_VALUE.CHECKED}
                    onChange={handleRunInEnvCheckbox}
                    disabled={!formData.isClusterCdActive}
                />
            </div>
            </Tippy>
        )
    }

    const triggerPipelineMode = () => {
        const triggerValue = isPreBuildTab ? formData.preBuildStage.triggerType : formData.postBuildStage.triggerType

        return (
            <div className="sidebar-action-container sidebar-action-container-border">
                <div className="dc__uppercase fw-6 fs-12 cn-6 mb-12">
                    Trigger {isPreBuildTab ? 'PRE' : 'POST'}-DEPLOYMENT STAGE
                </div>
                <div>
                    <RadioGroup
                        className="no-border"
                        value={triggerValue}
                        name="trigger-type"
                        onChange={(event) => {
                            changeTriggerStageType(event.target.value)
                        }}
                    >
                        <RadioGroupItem
                            value={TriggerType.Auto}
                            dataTestId="trigger-STAGE-pipeline-automatically-checkbox"
                        >
                            Automatically
                        </RadioGroupItem>
                        <RadioGroupItem
                            value={TriggerType.Manual}
                            dataTestId="trigger-STAGE-pipeline-manually-checkbox"
                        >
                            Manually
                        </RadioGroupItem>
                    </RadioGroup>
                </div>
            </div>
        )
    }

    return (
        <div>
            {activeStageName !== BuildStageVariable.Build ? (
                <div className="sidebar-action-container">
                    {configurationType === ConfigurationType.GUI && (
                        <>
                            {!isCdPipeline && !isJobView && MandatoryPluginWarning && showMandatoryWarning() && (
                                <MandatoryPluginWarning
                                    stage={activeStageName}
                                    mandatoryPluginData={mandatoryPluginData}
                                    formData={formData}
                                    setFormData={setFormData}
                                    formDataErrorObj={formDataErrorObj}
                                    setFormDataErrorObj={setFormDataErrorObj}
                                    allPluginList={pluginList}
                                    handleApplyPlugin={handleApplyPlugin}
                                />
                            )}
                            <div className="dc__uppercase fw-6 fs-12 cn-6 mb-10">Tasks (IN ORDER OF EXECUTION)</div>
                            <div className="pb-16 sidebar-action-container-border">
                                <TaskList
                                    withWarning={showMandatoryWarning()}
                                    mandatoryPluginsMap={mandatoryPluginsMap}
                                    setInputVariablesListFromPrevStep={setInputVariablesListFromPrevStep}
                                    isJobView={isJobView}
                                />
                            </div>
                            {isCdPipeline && !isVirtualEnvironment && triggerPipelineMode()}
                        </>
                    )}
                </div>
            ) : (
                <div className="sidebar-action-container pr-20">
                    <div className="dc__uppercase fw-6 fs-12 cn-6 mb-12">
                        Trigger {isJobView ? 'JOB' : 'BUILD'} PIPELINE
                    </div>
                    <div>
                        <RadioGroup
                            className="no-border"
                            value={formData.triggerType}
                            name="trigger-type"
                            onChange={(event) => {
                                changeTriggerType(event.target.value)
                            }}
                        >
                            <RadioGroupItem
                                value={TriggerType.Auto}
                                dataTestId="trigger-build-pipeline-automatically-checkbox"
                            >
                                Automatically
                            </RadioGroupItem>
                            <RadioGroupItem
                                value={TriggerType.Manual}
                                dataTestId="trigger-build-pipeline-manually-checkbox"
                            >
                                Manually
                            </RadioGroupItem>
                        </RadioGroup>
                    </div>
                </div>
            )}
            {isCdPipeline && activeStageName !== BuildStageVariable.Build && renderConfigSecret()}

            {!isCdPipeline && (
                <div className="sidebar-action-container pr-20">
                    <div className="fw-6 fs-13 cn-9 mb-8">📙 Need help?</div>
                    <div>
                        <a className="dc__link fw-6" href={helpData.docLink} target="_blank" rel="noreferrer noopener">
                            {helpData.helpText}
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}
