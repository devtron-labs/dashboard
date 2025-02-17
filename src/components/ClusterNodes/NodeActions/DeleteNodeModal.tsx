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

import {
    DELETE_NODE_MODAL_MESSAGING,
    deleteNodeCapacity,
    DeleteConfirmationModal,
} from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { DeleteComponentsName } from '@Config/constantMessaging'
import { DeleteNodeModalProps } from '../types'

const DeleteNodeModal = ({
    name,
    version,
    kind,
    closePopup,
    handleClearBulkSelection,
    showConfirmationModal,
}: DeleteNodeModalProps) => {
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
        handleClearBulkSelection()
        closePopup(true)
    }

    return (
        <DeleteConfirmationModal
            title={name}
            component={DeleteComponentsName.Node}
            subtitle={DELETE_NODE_MODAL_MESSAGING.subtitle}
            onDelete={onDelete}
            closeConfirmationModal={onClose}
            showConfirmationModal={showConfirmationModal}
            successToastMessage={DELETE_NODE_MODAL_MESSAGING.successInfoToastMessage}
            confirmationConfig={{
                identifier: 'delete-cd-node-input',
                confirmationKeyword: name,
            }}
        />
    )
}

export default DeleteNodeModal
