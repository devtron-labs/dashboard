import React, { useState, useEffect, useContext } from 'react'
import { ConfigurationType, ViewType } from '../../config'
import { Progressing, RadioGroup, showError } from '../common'
import {
    ConditionContainerType,
    FormErrorObjectType,
    FormType,
    PluginType,
    PluginVariableType,
    ScriptType,
    VariableType,
} from '../ciPipeline/types'
import { VariableContainer } from './VariableContainer'
import { ConditionContainer } from './ConditionContainer'
import { getPluginDetail } from '../ciPipeline/ciPipeline.service'
import { ServerErrors } from '../../modals/commonTypes'
import { YAMLScriptComponent } from './YAMLScriptComponent'
import YAML from 'yaml'
import CustomInputOutputVariables from './CustomInputOutputVariables'
import { TaskTypeDetailComponent } from './TaskTypeDetailComponent'
import { ciPipelineContext } from './CIPipeline'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ValidationRules } from '../ciPipeline/validationRules'

export function TaskDetailComponent() {
    const {
        formData,
        setFormData,
        selectedTaskIndex,
        activeStageName,
        appId,
        formDataErrorObj,
        calculateLastStepDetail,
        setFormDataErrorObj,
    }: {
        formData: FormType
        setFormData: React.Dispatch<React.SetStateAction<FormType>>
        selectedTaskIndex: number
        activeStageName: string
        appId: number
        formDataErrorObj: FormErrorObjectType
        calculateLastStepDetail: (
            isFromAddNewTask: boolean,
            _formData: FormType,
            activeStageName: string,
            startIndex?: number,
        ) => {
            index: number
            calculatedStageVariables: Map<string, VariableType>[]
        }
        setFormDataErrorObj: React.Dispatch<React.SetStateAction<FormErrorObjectType>>
    } = useContext(ciPipelineContext)
    const [pageState, setPageState] = useState(ViewType.FORM)
    const validationRules = new ValidationRules()
    const [configurationType, setConfigurationType] = useState<string>('GUI')
    const [editorValue, setEditorValue] = useState<string>('')

    const currentStepTypeVariable =
        formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE
            ? 'inlineStepDetail'
            : 'pluginRefStepDetail'

    useEffect(() => {
        if (formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.PLUGIN_REF) {
            setPageState(ViewType.LOADING)
            getPluginDetail(formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.pluginId, appId)
                .then((response) => {
                    setPageState(ViewType.FORM)
                    processPluginData(response.result)
                })
                .catch((error: ServerErrors) => {
                    setPageState(ViewType.ERROR)
                    showError(error)
                })
        }
    }, [])

    const setVariableStepIndexInPlugin = (variable): VariableType => {
        variable.variableStepIndexInPlugin = variable.variableStepIndex
        delete variable.variableStepIndex
        return variable
    }

    const processPluginData = (pluginData) => {
        const _form = { ...formData }
        if (_form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.outputVariables?.length === 0) {
            _form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.outputVariables =
                pluginData.outputVariables?.map(setVariableStepIndexInPlugin)
            if (_form[activeStageName].steps.length > selectedTaskIndex) {
                calculateLastStepDetail(false, _form, activeStageName, selectedTaskIndex)
            }
        }
        if (_form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.inputVariables?.length === 0) {
            _form[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.inputVariables =
                pluginData.inputVariables?.map(setVariableStepIndexInPlugin)
        }
        setFormData(_form)
    }
    const handleNameChange = (e: any): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].name = e.target.value
        const _formErrorObject = { ...formDataErrorObj }
        _formErrorObject[activeStageName].steps[selectedTaskIndex].name = validationRules.requiredField(e.target.value)
        _formErrorObject[activeStageName].steps[selectedTaskIndex].isValid =
            _formErrorObject[activeStageName].steps[selectedTaskIndex].name.isValid
        setFormDataErrorObj(_formErrorObject)
        setFormData(_formData)
    }
    const handleDescriptionChange = (e: any): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].description = e.target.value
        setFormData(_formData)
    }

    const handleEditorValueChange = (editorValue: string): void => {
        try {
            setEditorValue(editorValue)
            const _formData = { ...formData }
            _formData[activeStageName].steps[selectedTaskIndex] = {
                ..._formData[activeStageName].steps[selectedTaskIndex],
                ...YAML.parse(editorValue),
            }
            setFormData(_formData)
        } catch (error) {}
    }

    const handleConfigurationChange = (ev: any): void => {
        setConfigurationType(ev.target.value)
        if (ev.target.value === ConfigurationType.YAML) {
            if (formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE) {
                setEditorValue(
                    YAML.stringify({
                        outputDirectoryPath: formData[activeStageName].steps[selectedTaskIndex].outputDirectoryPath,
                        inlineStepDetail: formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail,
                    }),
                )
            } else {
                setEditorValue(
                    YAML.stringify({
                        pluginRefStepDetail: formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail,
                    }),
                )
            }
        }
    }

    const handleTaskScriptTypeChange = (ev: any): void => {
        const _formData = { ...formData }
        _formData[activeStageName].steps[selectedTaskIndex].inlineStepDetail.scriptType = ev.target.value
        setFormData(_formData)
    }

    return pageState === ViewType.LOADING.toString() ? (
        <div style={{ minHeight: '200px' }} className="flex">
            <Progressing pageLoader />
        </div>
    ) : (
        <div>
            <div>
                <div className="row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 ">
                        Task name <span className="cr-5">*</span>
                    </div>{' '}
                    <div>
                        <input
                            className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                            type="text"
                            onChange={(e) => handleNameChange(e)}
                            value={formData[activeStageName].steps[selectedTaskIndex].name}
                        />
                        {formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.name &&
                            !formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.name.isValid && (
                                <span className="flexbox cr-5 mt-4 fw-5 fs-11 flexbox">
                                    <AlertTriangle className="icon-dim-14 mr-5 ml-5 mt-2" />
                                    <span>
                                        {formDataErrorObj[activeStageName].steps[selectedTaskIndex]?.name.message}
                                    </span>
                                </span>
                            )}
                    </div>
                </div>
                <div className="row-container mb-12">
                    <div className="fw-6 fs-13 lh-32 cn-7 ">Description</div>{' '}
                    <input
                        className="w-100 br-4 en-2 bw-1 pl-10 pr-10 pt-5 pb-5"
                        type="text"
                        onChange={(e) => handleDescriptionChange(e)}
                        value={formData[activeStageName].steps[selectedTaskIndex].description}
                        placeholder="Enter task description"
                    />
                </div>

                {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE && (
                    <div className="row-container mb-12">
                        <div className="fw-6 fs-13 lh-32 cn-7 ">Task type</div>
                        <RadioGroup
                            className="configuration-container justify-start"
                            disabled={false}
                            initialTab={
                                formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].scriptType
                            }
                            name="task-type"
                            onChange={handleTaskScriptTypeChange}
                        >
                            <RadioGroup.Radio className="left-radius" value={ScriptType.SHELL}>
                                Shell
                            </RadioGroup.Radio>
                            <RadioGroup.Radio className="right-radius no-left-border" value={ScriptType.CONTAINERIMAGE}>
                                Container Image
                            </RadioGroup.Radio>
                        </RadioGroup>
                    </div>
                )}
            </div>
            {configurationType === ConfigurationType.GUI ? (
                <>
                    <hr />
                    {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE ? (
                        <CustomInputOutputVariables type={PluginVariableType.INPUT} />
                    ) : (
                        <VariableContainer type={PluginVariableType.INPUT} />
                    )}{' '}
                    <hr />
                    {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.inputVariables
                        ?.length > 0 && (
                        <>
                            <ConditionContainer type={ConditionContainerType.TRIGGER_SKIP} />
                            <hr />
                        </>
                    )}
                    {formData[activeStageName].steps[selectedTaskIndex].stepType === PluginType.INLINE ? (
                        <>
                            <TaskTypeDetailComponent />
                            {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].scriptType !==
                                ScriptType.CONTAINERIMAGE && (
                                <CustomInputOutputVariables type={PluginVariableType.OUTPUT} />
                            )}
                        </>
                    ) : (
                        <VariableContainer type={PluginVariableType.OUTPUT} />
                    )}
                    {formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable]?.outputVariables
                        ?.length > 0 &&
                        (formData[activeStageName].steps[selectedTaskIndex].stepType !== PluginType.INLINE ||
                            formData[activeStageName].steps[selectedTaskIndex][currentStepTypeVariable].scriptType !==
                                ScriptType.CONTAINERIMAGE) && (
                            <>
                                <hr />
                                <ConditionContainer type={ConditionContainerType.PASS_FAILURE} />
                                <hr />
                            </>
                        )}
                </>
            ) : (
                <YAMLScriptComponent
                    editorValue={editorValue}
                    handleEditorValueChange={handleEditorValueChange}
                    height="calc(100vh - 320px)"
                    showSample={true}
                />
            )}
        </div>
    )
}
