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
import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Progressing,
    VisibleModal,
    stopPropagation,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'
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
    const selectedCIPipeline = props.filteredCIPipelines?.find((_ciPipeline) => _ciPipeline?.id === props.pipelineId)

    usePrompt({ shouldPrompt: isLoading })

    useEffect(
        () => () => {
            abortController.abort()
            resetAbortController()
        },
        [],
    )

    useEffect(() => {
        if (props.isJobView && props.environmentLists?.length > 0) {
            const envId = selectedCIPipeline?.environmentId || 0
            const _selectedEnv = props.environmentLists.find((env) => env.id === envId)
            props.setSelectedEnv(_selectedEnv)
        }
    }, [selectedCIPipeline])

    const renderBranchCIModal = () => (
        <VisibleModal className="" close={closeCIModal}>
            (
            <div className="modal-body--ci-material h-100 w-100 flexbox-col" onClick={stopPropagation}>
                {loader ? (
                    <>
                        <div className="trigger-modal__header flex right">
                            <Button
                                ariaLabel="close-button"
                                variant={ButtonVariantType.borderLess}
                                icon={<CloseIcon />}
                                onClick={closeCIModal}
                                size={ComponentSizeType.small}
                                style={ButtonStyleType.negativeGrey}
                                dataTestId="ci-material-close-button"
                            />
                        </div>
                        <div style={{ height: 'calc(100% - 55px)' }}>
                            <Progressing pageLoader size={32} />
                        </div>
                    </>
                ) : (
                    <CIMaterial {...props} loader={loader} isLoading={isLoading} pipelineId={ciNodeId} />
                )}
            </div>
            )
        </VisibleModal>
    )

    return renderBranchCIModal()
}

export default CIMaterialModal
