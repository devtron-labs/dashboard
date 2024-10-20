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

import { ReactNode } from 'react'

type WithOrWithoutDeleteConfirmationType =
    | {
          showDeleteConfirmation: true
          /**
           * If added, confirmation input is shown
           */
          deleteConfirmationText: string
      }
    | {
          showDeleteConfirmation?: never
          /**
           * If added, confirmation input is shown
           */
          deleteConfirmationText?: never
      }

export type DeleteDialogProps = {
    title: string
    description?: string
    closeDelete: () => void
    delete: () => any
    deletePrefix?: string
    deletePostfix?: string
    apiCallInProgress?: boolean
    dataTestId?: string
    buttonPrimaryText?: string
    shouldStopPropagation?: boolean
    disabled?: boolean
    children?: ReactNode
} & WithOrWithoutDeleteConfirmationType

export interface ForceDeleteDialogType {
    onClickDelete: () => void
    closeDeleteModal: () => void
    forceDeleteDialogTitle: string
    forceDeleteDialogMessage: string
}
export interface ConfirmationDialogType {
    className?: string
    children: any
}
export interface ConfirmationDialogIconType {
    src: string
    className?: string
}
export interface ConfirmationDialogBodyType {
    title: string
    subtitle?: ReactNode
    children?: any
}
export interface ConfirmationDialogButtonGroupType {
    children: any
}
export interface DialogFormProps {
    className: string
    title: string
    isLoading: boolean
    closeOnESC?: boolean
    close: (event) => void
    onSave: (event) => void
    headerClassName?: string
}
