import React, { useState } from 'react'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { BuildStageType } from '../../config'
import { FormType } from '../ciPipeline/types'
import { ReactComponent as Drag } from '../../assets/icons/drag.svg'
import { ReactComponent as Dots } from '../../assets/icons/appstatus/ic-menu-dots.svg'
import { ReactComponent as Trash } from '../../assets/icons/ic-delete.svg'
import { PopupMenu } from '../common'

export function TaskList({
    formData,
    setFormData,
    addNewTask,
    activeStageName,
    selectedTaskIndex,
}: {
    formData: FormType
    setFormData: React.Dispatch<React.SetStateAction<FormType>>
    addNewTask: () => void
    activeStageName: string
    selectedTaskIndex: number
}) {
    const [dragItem, setDragItem] = useState(0)
    const [dragAllowed, setDragAllowed] = useState(false)
    const handleDragStart = (index) => {
        setDragItem(index)
    }

    const handleDragEnter = (e, index) => {
        const _formData = { ...formData }
        let addTaskTo = 'beforeDockerBuildScripts'
        if (activeStageName === BuildStageType.PostBuild) {
            addTaskTo = 'afterDockerBuildScripts'
        }
        const newList = [..._formData[addTaskTo]]
        const item = newList[dragItem]
        newList.splice(dragItem, 1)
        newList.splice(index, 0, item)
        setDragItem(index)
        _formData[addTaskTo] = newList
        setFormData(_formData)
    }

    const handleDrop = (e) => {
        setDragAllowed(false)
    }

    const deleteTask = (index) => {
        //setDragAllowed(false)
    }

    return (
        <>
            <div className="task-container">
                {formData[
                    activeStageName === BuildStageType.PreBuild ? 'beforeDockerBuildScripts' : 'afterDockerBuildScripts'
                ].map((taskDetail, index) => (
                    <div
                        className={`task-item fw-4 fs-13 ${selectedTaskIndex === index ? ' bcb-1 eb-5' : ''}`}
                        draggable={dragAllowed}
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDrop={(e) => handleDrop(e)}
                        onDragOver={(e) => e.preventDefault()}
                        key={index}
                    >
                        <Drag className="drag-icon" onMouseDown={() => setDragAllowed(true)} />
                        <span className="w-80 pl-5">{taskDetail.name}</span>
                        <PopupMenu autoClose>
                            <PopupMenu.Button isKebab>
                                <Dots className="rotate" style={{ ['--rotateBy' as any]: '90deg' }} />
                            </PopupMenu.Button>
                            <PopupMenu.Body rootClassName="deployment-table-row__delete">
                                <div className="flex left" onClick={(e) => deleteTask(index)}>
                                    <Trash />
                                    Delete
                                </div>
                            </PopupMenu.Body>
                        </PopupMenu>
                    </div>
                ))}
            </div>
            <div className="task-item add-task-container cb-5 fw-6 fs-13 flexbox" onClick={addNewTask}>
                <Add className="add-icon" /> Add task
            </div>
        </>
    )
}
