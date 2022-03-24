import React from 'react'
import { ConfigurationType, DOCUMENTATION, TriggerType } from '../../config'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { RadioGroup as RadioLabel } from '../common'
import { FormType } from '../ciPipeline/types'
import { TaskList } from './TaskList'
import { useLocation } from 'react-router'

export function Sidebar({
    formData,
    setFormData,
    addNewTask,
    configurationType,
    setConfigurationType,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    addNewTask: ()=> void
    configurationType: string
    setConfigurationType: React.Dispatch<React.SetStateAction<string>>
}) {
    const location = useLocation();
    const isBuildPage = location.pathname.indexOf('/build') >= 0;
    const changeTriggerType = (appCreationType: string): void => {
        let _formData = { ...formData }
        _formData.triggerType = appCreationType
        setFormData(_formData)
    }

    return (
        <div className="">
            {!isBuildPage && <div className="sidebar-action-container sidebar-action-container-border">
                <div className="action-title fw-6 fs-12 cn-6">CONFIGURE STAGE USING</div>
                <RadioLabel className="configuration-container"
                disabled={false}
                 initialTab={configurationType}
                    name="configuration-type"
                    onChange={(event) => {
                        setConfigurationType(event.target.value)
                    }}
                >
                    <RadioLabel.Radio className="left-radius" value={ConfigurationType.GUI}>{ConfigurationType.GUI}</RadioLabel.Radio>
                    <RadioLabel.Radio className="right-radius" value={ConfigurationType.YAML}>{ConfigurationType.YAML}</RadioLabel.Radio>
                </RadioLabel>
                {configurationType === ConfigurationType.GUI && <><div className="action-title fw-6 fs-12 cn-6">Tasks (IN ORDER OF EXECUTION)</div>
                <TaskList formData={formData} setFormData={setFormData} addNewTask={addNewTask}/></>}
            </div>}
            <div className="sidebar-action-container sidebar-action-container-border">
                <div className="action-title fw-6 fs-12 cn-6">Trigger BUILD PIPELINE</div>
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
            <div className="sidebar-action-container ">
                <div className="action-title fw-6 fs-13 cn-9">📙 Need help?</div>
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
