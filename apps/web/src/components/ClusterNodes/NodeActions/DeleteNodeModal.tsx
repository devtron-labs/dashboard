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

import { useState } from 'react'
import { showError, DeleteDialog, InfoColourBar, ToastVariantType, ToastManager } from '@devtron-labs/devtron-fe-common-lib'
import { useParams } from 'react-router-dom'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { NodeActionModalPropType } from '../types'
import { deleteNodeCapacity } from '../clusterNodes.service'
import { DELETE_NODE_MODAL_MESSAGING } from '../constants'

export default function DeleteNodeModal({ name, version, kind, closePopup }: NodeActionModalPropType) {
    const { clusterId } = useParams<{ clusterId: string }>()
    const [apiCallInProgress, setAPICallInProgress] = useState(false)

    const onClose = (): void => {
        closePopup()
    }

    const deleteAPI = async () => {
        try {
            setAPICallInProgress(true)
            const payload = {
                clusterId: Number(clusterId),
                name,
                version,
                kind,
            }
            await deleteNodeCapacity(payload)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: DELETE_NODE_MODAL_MESSAGING.initiated,
            })
            closePopup(true)
        } catch (err) {
            showError(err)
        } finally {
            setAPICallInProgress(false)
        }
    }

    const RecommendedNote = () => {
        return (
            <div className="fs-13 fw-4 lh-20">
                <span className="fw-6">{DELETE_NODE_MODAL_MESSAGING.recommended}</span>
                {DELETE_NODE_MODAL_MESSAGING.recommendedInfoText}
            </div>
        )
    }

    return (
        <DeleteDialog
            title={`${DELETE_NODE_MODAL_MESSAGING.delete} ‘${name}’ ?`}
            delete={deleteAPI}
            closeDelete={onClose}
            deletePostfix={DELETE_NODE_MODAL_MESSAGING.deletePostfix}
            apiCallInProgress={apiCallInProgress}
        >
            <InfoColourBar
                classname="question-bar p-lr-12"
                message={<RecommendedNote />}
                Icon={Help}
                iconClass="fcv-5"
            />
            <DeleteDialog.Description>
                <p className="mt-12 mb-12">{DELETE_NODE_MODAL_MESSAGING.description}</p>
            </DeleteDialog.Description>
        </DeleteDialog>
    )
}
