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

import React from 'react'
import { ConfirmationDialog } from '@devtron-labs/devtron-fe-common-lib'
import warningIconSrc from '../../assets/icons/ic-warning-y6.svg'
import { DEPRECATED_EXTERNAL_CI_MESSAGE, DOCUMENTATION } from '../../config'
import { DeprecatedWarningModalType } from './types'

export default function DeprecatedWarningModal({ closePopup }: DeprecatedWarningModalType) {
    const close = (): void => {
        closePopup()
    }
    return (
        <ConfirmationDialog className="confirmation-dialog__body--w-400">
            <ConfirmationDialog.Icon src={warningIconSrc} />
            <ConfirmationDialog.Body title="Pipeline is deprecated">
                <div className="fs-14 cn-7 w-100">{DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_ONE}</div>
                <div className="fs-14 cn-7 mt-20 w-100">{DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_TWO}</div>
                <div className="fs-14 cn-7 mt-20 w-100">
                    {DEPRECATED_EXTERNAL_CI_MESSAGE.LINE_THREE}&nbsp;
                    <a className="dc__link" href={DOCUMENTATION.WEBHOOK_CI} rel="noreferrer noopener" target="_blank">
                        {DEPRECATED_EXTERNAL_CI_MESSAGE.DOC_LINK_TEXT}
                    </a>
                </div>
            </ConfirmationDialog.Body>
            <ConfirmationDialog.ButtonGroup>
                <div data-testid="delete_popup_box" className="flex right">
                    <button data-testid="okay_button_popup_box" type="button" className="cta cancel" onClick={close}>
                        Okay
                    </button>
                </div>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}
