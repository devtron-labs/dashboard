/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    CustomInput,
    DeleteConfirmationModal,
    ERROR_STATUS_CODE,
    preventDefault,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Trash } from '@Icons/ic-delete-interactive.svg'
import folder from '@Icons/ic-folder.svg'
import { DeleteComponentsName } from '@Config/constantMessaging'

import { deleteProject } from './service'
import { ProjectProps } from './types'

import './project.scss'

export const Project = ({
    id,
    name,
    active,
    isCollapsed,
    onCancel,
    handleChange,
    loadingData,
    index,
    isValid,
    errorMessage,
    reload,
    saveProject,
}: ProjectProps) => {
    const [confirmation, setConfirmation] = useState(false)
    const toggleConfirmation = () => {
        setConfirmation(!confirmation)
    }

    const handleActionChange = (event: React.ChangeEvent) => {
        handleChange(event, index, 'name')
    }

    const saveProjectData = (event: React.SyntheticEvent) => {
        preventDefault(event)
        saveProject(index)
    }

    const onDelete = async () => {
        const deletePayload = {
            id,
            name,
            active,
        }
        await deleteProject(deletePayload)
        reload()
    }

    const renderCollapsedView = () => (
        <div
            data-testid={`hover-project-id-${name}`}
            className="project__row white-card white-card--add-new-item mb-16 dc__visible-hover dc__visible-hover--parent"
        >
            <img src={folder} alt="project" className="icon-dim-24 mr-16" />
            <span className="project-title">{name}</span>
            <div className="dc__visible-hover--child dc__align-right">
                <Button
                    dataTestId={`delete-project-button-${name}`}
                    icon={<Trash />}
                    onClick={toggleConfirmation}
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.negativeGrey}
                    size={ComponentSizeType.medium}
                    ariaLabel="Delete"
                />
            </div>
            {confirmation && (
                <DeleteConfirmationModal
                    title={name}
                    component={DeleteComponentsName.Project}
                    onDelete={onDelete}
                    closeConfirmationModal={toggleConfirmation}
                    errorCodeToShowCannotDeleteDialog={ERROR_STATUS_CODE.INTERNAL_SERVER_ERROR}
                />
            )}
        </div>
    )

    const renderForm = () => (
        <form className="white-card p-24 mb-16 dashed">
            <div className="white-card__header"> {id ? 'Edit project' : 'Add Project'} </div>
            <CustomInput
                label="Project Name"
                name="name"
                value={name}
                placeholder="e.g. My Project"
                onChange={handleActionChange}
                autoFocus
                data-testid="project-name-input"
                required
                error={!isValid.name && errorMessage.name}
            />
            <div className="form__buttons mt-16 dc__gap-16">
                <Button
                    dataTestId="project-cancel-button"
                    text="Cancel"
                    variant={ButtonVariantType.secondary}
                    style={ButtonStyleType.neutral}
                    onClick={onCancel}
                />
                <Button
                    dataTestId="project-save-button"
                    text="Save"
                    isLoading={loadingData}
                    onClick={saveProjectData}
                />
            </div>
        </form>
    )

    if (isCollapsed) {
        return renderCollapsedView()
    }

    return renderForm()
}
