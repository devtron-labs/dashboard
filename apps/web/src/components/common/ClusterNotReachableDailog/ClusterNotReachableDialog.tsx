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
import warningIconSrc from '../../../assets/icons/ic-warning-y5.svg'
import { BUTTON_TEXT, NONCASCADE_DELETE_DIALOG_INTERNAL_MESSAGE } from '../../../config/constantMessaging'
import { ClusrerNotReachableDialogType } from './ClusterNotReachableDialog.type'

const ClusterNotReachableDailog = ({ clusterName, onClickCancel, onClickDelete }: ClusrerNotReachableDialogType) => {
    if (!clusterName) {
        return null
    }

    return (
        <ConfirmationDialog>
            <ConfirmationDialog.Icon src={warningIconSrc} />
            <ConfirmationDialog.Body title={`The cluster ${clusterName} is not reachable`} />
            {NONCASCADE_DELETE_DIALOG_INTERNAL_MESSAGE.map((message, index) => (
                <p key={`dailog-msg-${index}`} className="fs-14 cn-7 lh-20 mt-12">
                    {message}
                </p>
            ))}
            <ConfirmationDialog.ButtonGroup>
                <button type="button" className="cta cancel" onClick={onClickCancel}>
                    {BUTTON_TEXT.CANCEL}
                </button>
                <button type="button" className="cta delete" onClick={onClickDelete}>
                    {BUTTON_TEXT.FORCE_DELETE}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

export default ClusterNotReachableDailog
