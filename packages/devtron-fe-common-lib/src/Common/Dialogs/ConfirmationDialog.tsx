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

import { stopPropagation } from '@Common/Helper'
import { VisibleModal2 } from '../Modals/VisibleModal2'
import {
    ConfirmationDialogBodyType,
    ConfirmationDialogButtonGroupType,
    ConfirmationDialogIconType,
    ConfirmationDialogType,
} from './Types'

const ConfirmationDialog = ({ className = '', children, close }: ConfirmationDialogType) => (
    <VisibleModal2 className="confirmation-dialog" close={close}>
        <div onClick={stopPropagation} className={`confirmation-dialog__body ${className}`}>{children}</div>
    </VisibleModal2>
)

const Icon = ({ src, className = '' }: ConfirmationDialogIconType) => (
    <img src={src} className={`confirmation-dialog__icon ${className}`} alt="" />
)

const Body = ({ title, subtitle = null, children = null }: ConfirmationDialogBodyType) => (
    <div className="flex left column ">
        <h3 className="confirmation-dialog__title lh-1-5 dc__break-word w-100">{title}</h3>
        {subtitle && <div className="confirmation-dialog__subtitle">{subtitle}</div>}
        {children}
    </div>
)

const ButtonGroup = ({ children }: ConfirmationDialogButtonGroupType) => (
    <div className="flex right confirmation-dialog__button-group">{children}</div>
)

ConfirmationDialog.Icon = Icon
ConfirmationDialog.Body = Body
ConfirmationDialog.ButtonGroup = ButtonGroup
export default ConfirmationDialog
