import React from 'react'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { FormType } from '../ciPipeline/types'

export function TaskList({
    formData,
    setFormData,
    addNewTask,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    addNewTask: () => void
}) {
    return (
        <>
            <div className="task-container">
                {formData.beforeDockerBuildScripts.map((taskDetail, index) => (
                    <div className="task-item fw-4 fs-13">{taskDetail.name}</div>
                ))}
            </div>
            <div className="task-item add-task-container cb-5 fw-6 fs-13 flexbox" onClick={addNewTask}>
                <Add className="add-icon" /> Add task
            </div>
        </>
    )
}
