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

import { InfoColourBar, deleteNodeCapacity, DeleteConfirmationModal } from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { NodeActionModalPropType } from '../types'
import { DELETE_NODE_MODAL_MESSAGING } from '../constants'
import { DeleteComponentsName } from '@Config/constantMessaging'

export default function DeleteNodeModal({
    name,
    version,
    kind,
    closePopup,
    showConfirmationDialog,
}: NodeActionModalPropType) {
    const { clusterId } = useParams<{ clusterId: string }>()

    const onClose = (): void => {
        closePopup()
    }

    const onDelete = async () => {
        const payload = {
            clusterId: Number(clusterId),
            name,
            version,
            kind,
        }
        await deleteNodeCapacity(payload)
        closePopup(true)
    }

    const renderSubtitle = () => {
        const recommendedNote = () => {
            return (
                <div className="fs-13 fw-4 lh-20">
                    <span className="fw-6">{DELETE_NODE_MODAL_MESSAGING.recommended}</span>
                    {DELETE_NODE_MODAL_MESSAGING.recommendedInfoText}
                </div>
            )
        }
        return (
            <>
                <InfoColourBar
                    classname="question-bar p-lr-12"
                    message={recommendedNote()}
                    Icon={Help}
                    iconClass="fcv-5"
                />
                <p className="m-0 fs-13 lh-20 cn-7">{DELETE_NODE_MODAL_MESSAGING.description}</p>
            </>
        )
    }

    return (
        <DeleteConfirmationModal
            title={name}
            component={DeleteComponentsName.Node}
            subtitle={renderSubtitle()}
            onDelete={onDelete}
            closeConfirmationModal={onClose}
            showConfirmationModal={showConfirmationDialog}
            successToastMessage={DELETE_NODE_MODAL_MESSAGING.initiated}
            confirmationConfig={{
                identifier: 'delete-cd-node-input',
                confirmationKeyword: name,
            }}
        />
    )
}
