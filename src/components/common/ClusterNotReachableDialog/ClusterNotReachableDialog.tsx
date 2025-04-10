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

import { ForceDeleteConfirmationModal } from '@devtron-labs/devtron-fe-common-lib'

import { NON_CASCADE_DELETE_DIALOG_INTERNAL_MESSAGE } from '../../../config/constantMessaging'
import { ClusterNotReachableDialogType } from './ClusterNotReachableDialog.type'

const ClusterNotReachableDialog = ({ clusterName, onClickCancel, onClickDelete }: ClusterNotReachableDialogType) => {
    if (!clusterName) {
        return null
    }

    return (
        <ForceDeleteConfirmationModal
            title={`The cluster ${clusterName} is not reachable`}
            subtitle={
                <p className="flexbox-col fs-13 cn-8 m-0 dc__gap-12">
                    <span className="lh-20">{NON_CASCADE_DELETE_DIALOG_INTERNAL_MESSAGE.PARA1} </span>
                    <span className="lh-20">{NON_CASCADE_DELETE_DIALOG_INTERNAL_MESSAGE.PARA2}</span>
                </p>
            }
            onDelete={onClickDelete}
            closeConfirmationModal={onClickCancel}
        />
    )
}

export default ClusterNotReachableDialog
