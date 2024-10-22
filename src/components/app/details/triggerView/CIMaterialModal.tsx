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

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    CIMaterialType,
    Progressing,
    ServerErrors,
    SourceTypeMap,
    VisibleModal,
    showError,
    stopPropagation,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'
import { savePipeline } from '@Components/ciPipeline/ciPipeline.service'
import CIMaterial from './ciMaterial'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import { CIMaterialModalProps, CIMaterialRouterProps, RegexValueType } from './types'
import BranchRegexModal from './BranchRegexModal'
import { TriggerViewContext } from './config'

export const CIMaterialModal = ({
    loader,
    closeCIModal,
    isLoading,
    abortController,
    resetAbortController,
    ...props
}: CIMaterialModalProps) => {
    const { ciNodeId } = useParams<Pick<CIMaterialRouterProps, 'ciNodeId'>>()
    const context = React.useContext(TriggerViewContext)
    const [savingRegexValue, setSavingRegexValue] = useState(false)
    const selectedCIPipeline = props.filteredCIPipelines?.find((_ciPipeline) => _ciPipeline?.id === props.pipelineId)

    const isValidRegex = (pattern: string, value: string): boolean => new RegExp(pattern).test(value)

    const _regexValue: Record<number, RegexValueType> = props.material.reduce(
        (acc, mat) => {
            acc[mat.gitMaterialId] = {
                value: mat.value,
                isInvalid: mat.regex ? !isValidRegex(mat.regex, mat.value) : false,
            }
            return acc
        },
        {} as Record<number, RegexValueType>,
    )

    const [regexValue, setRegexValue] = useState<Record<number, RegexValueType>>(_regexValue)
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

    const isRegexValueInvalid = (_cm): void => {
        const regExp = new RegExp(_cm.source.regex)
        const regVal = regexValue[_cm.gitMaterialId]
        if (!regExp.test(regVal.value)) {
            const _regexVal = {
                ...regexValue,
                [_cm.gitMaterialId]: { value: regVal.value, isInvalid: true },
            }
            setRegexValue(_regexVal)
        }
    }

    const onClickNextButton = () => {
        setSavingRegexValue(true)
        const payload: any = {
            appId: Number(props.match.params.appId ?? props.appId),
            id: +props.workflowId,
            ciPipelineMaterial: [],
        }

        // Populate the ciPipelineMaterial with flatten object
        if (selectedCIPipeline?.ciMaterial?.length) {
            payload.ciPipelineMaterial = selectedCIPipeline.ciMaterial.map((_cm) => {
                const regVal = regexValue[_cm.gitMaterialId]
                let _updatedCM

                if (regVal?.value && _cm.source.regex) {
                    isRegexValueInvalid(_cm)

                    _updatedCM = {
                        ..._cm,
                        type: SourceTypeMap.BranchFixed,
                        value: regVal.value,
                        regex: _cm.source.regex,
                    }
                } else {
                    // Maintain the flattened object structure for unchanged values
                    _updatedCM = {
                        ..._cm,
                        ..._cm.source,
                    }
                }

                // Deleting as it's not required in the request payload
                delete _updatedCM.source

                return _updatedCM
            })
        }

        savePipeline(payload, true)
            .then((response) => {
                if (response) {
                    props.getWorkflows()
                    context.onClickCIMaterial(props.pipelineId.toString(), props.pipelineName)
                }
            })
            .catch((error: ServerErrors) => {
                showError(error)
            })
            .finally(() => {
                setSavingRegexValue(false)
            })
    }

    const handleRegexInputValue = (id: number, value: string, mat: CIMaterialType) => {
        setRegexValue((prevState) => ({
            ...prevState,
            [id]: { value, isInvalid: mat.regex && !new RegExp(mat.regex).test(value) },
        }))
    }

    const renderBranchRegexModal = () => (
        <BranchRegexModal
            material={props.material}
            selectedCIPipeline={selectedCIPipeline}
            showWebhookModal={props.showWebhookModal}
            title={props.title}
            isChangeBranchClicked={props.isChangeBranchClicked}
            onClickNextButton={onClickNextButton}
            handleRegexInputValue={handleRegexInputValue}
            regexValue={regexValue}
            onCloseBranchRegexModal={props.onCloseBranchRegexModal}
            savingRegexValue={savingRegexValue}
        />
    )

    const renderBranchCIModal = () => (
        <VisibleModal className="" close={closeCIModal}>
            (
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
            )
        </VisibleModal>
    )

    return props.showMaterialRegexModal ? renderBranchRegexModal() : renderBranchCIModal()
}

export default CIMaterialModal
