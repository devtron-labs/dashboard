import React from 'react'
import { FormType } from '../ciPipeline/types'
import { EmptyTaskState } from './EmptyTaskState'

export function PostBuild({
    formData,
    setFormData,
    addNewTask,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    addNewTask: () => void
}) {
    return formData.afterDockerBuildScripts.length === 0 ? (
        <EmptyTaskState addNewTask={addNewTask} />
    ) : (
        <div>What do you want to do now in Post-build</div>
    )
}
