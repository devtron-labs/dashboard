import React from 'react'
import { BuildStageVariable, ConfigurationType, DOCUMENTATION, TriggerType } from '../../config'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { RadioGroup as RadioLabel } from '../common'
import { FormType } from '../ciPipeline/types'
import { TaskList } from './TaskList'

export function Sidebar({
    formData,
    setFormData,
    addNewTask,
    configurationType,
    setConfigurationType,
    activeStageName,
    selectedTaskIndex: selectedTaskIndex,
    setSelectedTaskIndex: setSelectedTaskIndex,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    addNewTask: () => void
    configurationType: string
    setConfigurationType: React.Dispatch<React.SetStateAction<string>>
    activeStageName: string
    selectedTaskIndex: number
    setSelectedTaskIndex: React.Dispatch<React.SetStateAction<number>>
}) {
    const changeTriggerType = (appCreationType: string): void => {
        const _formData = { ...formData }
        _formData.triggerType = appCreationType
        setFormData(_formData)
    }

    return (
        <div className="">
            {activeStageName !== BuildStageVariable.Build && (
                <div className="sidebar-action-container sidebar-action-container-border">
                    <div className="text-uppercase fw-6 fs-12 cn-6">CONFIGURE STAGE USING</div>
                    <RadioLabel
                        className="configuration-container mb-10"
                        disabled={false}
                        initialTab={configurationType}
                        name="configuration-type"
                        onChange={(event) => {
                            setConfigurationType(event.target.value)
                        }}
                    >
                        <RadioLabel.Radio className="left-radius" value={ConfigurationType.GUI}>
                            {ConfigurationType.GUI}
                        </RadioLabel.Radio>
                        <RadioLabel.Radio className="right-radius" value={ConfigurationType.YAML}>
                            {ConfigurationType.YAML}
                        </RadioLabel.Radio>
                    </RadioLabel>
                    {configurationType === ConfigurationType.GUI && (
                        <>
                            <div className="text-uppercase fw-6 fs-12 cn-6">Tasks (IN ORDER OF EXECUTION)</div>
                            <TaskList
                                formData={formData}
                                setFormData={setFormData}
                                addNewTask={addNewTask}
                                activeStageName={activeStageName}
                                selectedTaskIndex={selectedTaskIndex}
                                setSelectedTaskIndex={setSelectedTaskIndex}
                            />
                        </>
                    )}
                </div>
            )}
            {activeStageName === BuildStageVariable.Build && (
                <div className="sidebar-action-container sidebar-action-container-border">
                    <div className="text-uppercase fw-6 fs-12 cn-6">Trigger BUILD PIPELINE</div>
                    <div>
                        <RadioGroup
                            className="no-border"
                            value={formData.triggerType}
                            name="trigger-type"
                            onChange={(event) => {
                                changeTriggerType(event.target.value)
                            }}
                        >
                            <RadioGroupItem value={TriggerType.Auto}>Automatically</RadioGroupItem>
                            <RadioGroupItem value={TriggerType.Manual}>Manually</RadioGroupItem>
                        </RadioGroup>
                    </div>
                </div>
            )}
            <div className="sidebar-action-container ">
                <div className="text-uppercase fw-6 fs-13 cn-9">📙 Need help?</div>
                <div>
                    <a
                        className="learn-more__href fs-12"
                        href={DOCUMENTATION.PRE_BUILD_TASK}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        Docs: Configure pre-build tasks
                    </a>
                </div>
            </div>
        </div>
    )
}
