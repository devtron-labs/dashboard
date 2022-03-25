import React from 'react'
import EmptyState from '../EmptyState/EmptyState'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'

export function EmptyTaskState({
    imgSource,
    title,
    subTitle,
    addNewTask,
}: {
    imgSource: string
    title: string
    subTitle: string
    addNewTask: () => void
}) {
    return (
        <div className="scrollable-content">
            <EmptyState>
                <EmptyState.Image>
                    <img src={imgSource} alt="" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h4>{title}</h4>
                </EmptyState.Title>
                <EmptyState.Subtitle>
                    {subTitle}
                </EmptyState.Subtitle>
                <EmptyState.Button>
                    <div className="task-item add-task-container cb-5 fw-6 fs-13 flexbox" onClick={addNewTask}>
                        <Add className="add-icon" /> Add task
                    </div>
                </EmptyState.Button>
            </EmptyState>
        </div>
    )
}
