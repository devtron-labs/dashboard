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

import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Progressing, VisibleModal, stopPropagation, usePrompt } from '@devtron-labs/devtron-fe-common-lib'
import CIMaterial from './ciMaterial'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import { CIMaterialModalProps, CIMaterialRouterProps } from './types'

export const CIMaterialModal = ({
    loader,
    closeCIModal,
    isLoading,
    abortController,
    resetAbortController,
    ...props
}: CIMaterialModalProps) => {
    const { ciNodeId } = useParams<Pick<CIMaterialRouterProps, 'ciNodeId'>>()
    usePrompt({ shouldPrompt: isLoading })

    useEffect(
        () => () => {
            abortController.abort()
            resetAbortController()
        },
        [],
    )

    return (
        <VisibleModal className="" close={closeCIModal}>
            <div className="modal-body--ci-material h-100 w-100 flexbox-col" onClick={stopPropagation}>
                {loader ? (
                    <>
                        <div className="trigger-modal__header flex right">
                            <button
                                type="button"
                                aria-label="close-modal"
                                className="dc__transparent"
                                onClick={closeCIModal}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div style={{ height: 'calc(100% - 55px)' }}>
                            <Progressing pageLoader size={32} />
                        </div>
                    </>
                ) : (
                    <CIMaterial {...props} loader={loader} isLoading={isLoading} pipelineId={+ciNodeId} />
                )}
            </div>
        </VisibleModal>
    )
}

export default CIMaterialModal
