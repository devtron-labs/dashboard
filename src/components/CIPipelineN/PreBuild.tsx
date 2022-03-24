import React from 'react'
import { FormType } from '../ciPipeline/types'
import { EmptyTaskState } from './EmptyTaskState'

export function PreBuild({
    formData,
    setFormData,
    addNewTask,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    addNewTask: () => void
}) {
    return formData.beforeDockerBuildScripts.length === 0 ? (
        <EmptyTaskState addNewTask={addNewTask} />
    ) : (
        <div>What do you want to do now?</div>
    )
}
