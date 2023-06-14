import React, { useContext, useEffect, useState } from 'react'
import { BuildStageVariable, ConfigurationType, DOCUMENTATION, TriggerType } from '../../config'
import {
    RadioGroup,
    RadioGroupItem,
    FormType,
    FormErrorObjectType,
    VariableType,
} from '@devtron-labs/devtron-fe-common-lib'
import { TaskList } from './TaskList'
import { ciPipelineContext } from './CIPipeline'
import { importComponentFromFELibrary } from '../common'
import { CIPipelineSidebarType } from '../ciConfig/types'

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
        setConfigurationType,
        activeStageName,
        formDataErrorObj,
        setFormDataErrorObj,
        setSelectedTaskIndex,
        calculateLastStepDetail,
        validateStage,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        configurationType: string
        setConfigurationType: React.Dispatch<React.SetStateAction<string>>
        activeStageName: string
        formDataErrorObj: FormErrorObjectType
        setFormDataErrorObj: React.Dispatch<React.SetStateAction<FormErrorObjectType>>
        setSelectedTaskIndex: React.Dispatch<React.SetStateAction<number>>
        calculateLastStepDetail: (
            isFromAddNewTask: boolean,
            _formData: FormType,
            activeStageName: string,
            startIndex?: number,
        ) => {
            index: number
            calculatedStageVariables: Map<string, VariableType>[]
        }
        validateStage: (stageName: string, _formData: FormType, formDataErrorObject?: FormErrorObjectType) => void
    } = useContext(ciPipelineContext)
    const [helpData, setHelpData] = useState<{ helpText: string; docLink: string }>({
        helpText: 'Docs: Configure build stage',
        docLink: DOCUMENTATION.BUILD_STAGE,
    })
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
        } else if (activeStageName === BuildStageVariable.PreBuild) {
            setHelpData({ helpText: 'Docs: Configure pre-build tasks', docLink: DOCUMENTATION.PRE_POST_BUILD_STAGE })
        }
    }, [activeStageName])

    const showMandatoryWarning = (): boolean => {
        return (
            mandatoryPluginData &&
            ((activeStageName === BuildStageVariable.PreBuild && !mandatoryPluginData.isValidPre) ||
                (activeStageName === BuildStageVariable.PostBuild && !mandatoryPluginData.isValidPost))
        )
    }

    const handleApplyPlugin = (_formData: FormType): void => {
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

    return (
        <div className="dc__position-rel">
            {activeStageName !== BuildStageVariable.Build ? (
                <div className="sidebar-action-container sidebar-action-container-border">
                    {configurationType === ConfigurationType.GUI && (
                        <>
                            {!isJobView && MandatoryPluginWarning && showMandatoryWarning() && (
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
                            <TaskList
                                withWarning={showMandatoryWarning()}
                                mandatoryPluginsMap={mandatoryPluginsMap}
                                setInputVariablesListFromPrevStep={setInputVariablesListFromPrevStep}
                                isJobView={isJobView}
                            />
                        </>
                    )}
                </div>
            ) : (
                <div className="sidebar-action-container sidebar-action-container-border pr-20">
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
            <div className="sidebar-action-container pr-20">
                <div className="fw-6 fs-13 cn-9 mb-8">📙 Need help?</div>
                <div>
                    <a className="dc__link fw-6" href={helpData.docLink} target="_blank" rel="noreferrer noopener">
                        {helpData.helpText}
                    </a>
                </div>
            </div>
        </div>
    )
}
