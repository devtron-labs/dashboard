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

import React, { ChangeEvent, useState } from 'react'
import warn from '../../Assets/Img/delete-medium.svg'
import { Progressing } from '../Progressing'
import ConfirmationDialog from './ConfirmationDialog'
import { DeleteDialogProps } from './Types'
import { CustomInput } from '../CustomInput'

export const DeleteDialog: React.FC<DeleteDialogProps> & { Description?: React.FC<any> } = ({
    showDeleteConfirmation: _showDeleteConfirmation,
    deleteConfirmationText = null,
    ...props
}: DeleteDialogProps) => {
    const [confirmationText, setConfirmationText] = useState('')

    const showDeleteConfirmation = _showDeleteConfirmation && !!deleteConfirmationText
    const isDeleteDisabled =
        props.apiCallInProgress ||
        props.disabled ||
        (showDeleteConfirmation && deleteConfirmationText !== confirmationText)

    const handleConfirmationTextChange = (e: ChangeEvent<HTMLInputElement>) => {
        setConfirmationText(e.target.value)
    }

    const handleDelete = (e: React.MouseEvent) => {
        if (props.shouldStopPropagation) {
            e.stopPropagation()
        }

        props.delete()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && !isDeleteDisabled) {
            event.preventDefault()

            if (props.shouldStopPropagation) {
                event.stopPropagation()
            }

            props.delete()
        }
    }

    const handleModalClose = (e: React.MouseEvent) => {
        if (props.shouldStopPropagation) {
            e.stopPropagation()
        }

        props.closeDelete()
    }

    const getLabel = () => (
        <span>
            Type
            <span className="fw-6 dc__word-break">&nbsp;&apos;{deleteConfirmationText}&apos;&nbsp;</span>
            to confirm
        </span>
    )

    return (
        <ConfirmationDialog className="confirmation-dialog__body--w-400" close={props.closeDelete}>
            <ConfirmationDialog.Icon src={warn} />
            <ConfirmationDialog.Body title={props.title}>
                <div className="fs-13 cn-7 lh-1-54 w-100">
                    {props.description ? props.description : null}
                    {props.children}
                    {showDeleteConfirmation && (
                        <CustomInput
                            name="delete-confirmation"
                            value={confirmationText}
                            onChange={handleConfirmationTextChange}
                            label={getLabel()}
                            inputWrapClassName="mt-12 w-100"
                            placeholder="Type to confirm"
                            isRequiredField
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    )}
                </div>
            </ConfirmationDialog.Body>
            <ConfirmationDialog.ButtonGroup>
                <div className="flex right">
                    <button
                        type="button"
                        className="cta cancel cta-cd-delete-modal ml-16"
                        onClick={handleModalClose}
                        disabled={props.apiCallInProgress}
                        data-testid="dialog-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="cta delete cta-cd-delete-modal ml-16"
                        onClick={handleDelete}
                        disabled={isDeleteDisabled}
                        data-testid="dialog-delete"
                    >
                        {props.apiCallInProgress ? (
                            <Progressing />
                        ) : (
                            `${props.deletePrefix || ''}${
                                props.buttonPrimaryText ? props.buttonPrimaryText : 'Delete'
                            }${props.deletePostfix || ''}`
                        )}
                    </button>
                </div>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

// eslint-disable-next-line react/jsx-no-useless-fragment
const DeleteDialogDescription = ({ children }: Pick<DeleteDialogProps, 'children'>) => <>{children}</>

DeleteDialog.Description = DeleteDialogDescription
