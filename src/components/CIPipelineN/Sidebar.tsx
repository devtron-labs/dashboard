import React from 'react'
import { DOCUMENTATION, TriggerType } from '../../config'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { RadioGroup, RadioGroupItem } from '../common/formFields/RadioGroup'
import { FormType } from '../ciPipeline/types'

export function Sidebar({
    formData,
    setFormData,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
}) {
    const changeTriggerType = (appCreationType: string): void => {
        let _formData = { ...formData }
        _formData.triggerType = appCreationType
        setFormData(_formData)
    }

    const addNewTask = () => {
        let _formData = { ...formData }
        const { length, [length - 1]: last } = _formData.beforeDockerBuildScripts
        const index = last ? last.index + 1 : 1
        const stage = {
            index: index,
            name: `Task ` + index,
            outputLocation: '',
            script: '',
            isCollapsed: false,
            id: 0,
        }
        _formData.beforeDockerBuildScripts.push(stage)
        setFormData(_formData)
    }
    return (
        <div className="">
            <div className="sidebar-action-container sidebar-action-container-border">
                <div className="action-title fw-6 fs-12 cn-6">Tasks (IN ORDER OF EXECUTION)</div>
                <div>
                    {formData.beforeDockerBuildScripts.map((taskDetail, index) => (
                        <div className="task-item fw-4 fs-13">{taskDetail.name}</div>
                    ))}
                    <div className="task-item add-task-container cb-5 fw-6 fs-13 flexbox" onClick={addNewTask}>
                        <Add className="add-icon" /> Add task
                    </div>
                </div>
            </div>
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
