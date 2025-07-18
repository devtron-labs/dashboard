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

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CodeEditor,
    createNewResource,
    CreateResourceDTO,
    Drawer,
    GenericEmptyState,
    handleAnalyticsEvent,
    InfoBlock,
    showError,
    useRegisterShortcut,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Success } from '../../../assets/icons/ic-success.svg'
import { ReactComponent as MechanicalOperation } from '../../../assets/img/ic-mechanical-operation.svg'
import { APP_STATUS_HEADERS, MODES } from '../../../config'
import { CREATE_RESOURCE_MODAL_MESSAGING } from '../Constants'
import { CreateResourcePayload, CreateResourceStatus, CreateResourceType } from '../Types'

export const CreateResource: React.FC<CreateResourceType> = ({ closePopup, clusterId }) => {
    const { setDisableShortcuts } = useRegisterShortcut()
    const [showCodeEditorView, toggleCodeEditorView] = useState(true)
    const [loader, setLoader] = useState(false)
    const [resourceYAML, setResourceYAML] = useState('')
    const [resourceResponse, setResourceResponse] = useState<CreateResourceDTO[]>(null)
    const [needsUpdate, setNeedsUpdate] = useState(false)

    const onClose = (): void => {
        if (loader) {
            return
        }
        closePopup(needsUpdate)
    }

    useEffect(() => {
        setDisableShortcuts(true)

        return () => {
            setDisableShortcuts(false)
        }
    }, [])

    const handleEditorValueChange = (codeEditorData: string): void => {
        setResourceYAML(codeEditorData)
    }

    const showCodeEditor = (): void => {
        toggleCodeEditorView(true)
    }

    const onSave = async (): Promise<void> => {
        handleAnalyticsEvent({
            category: 'RB Create Resource',
            action: 'RB_CREATE_RESOURCE_APPLY',
        })
        try {
            setLoader(true)
            const resourceListPayload: CreateResourcePayload = {
                clusterId: Number(clusterId),
                manifest: resourceYAML,
            }
            const { result } = await createNewResource(resourceListPayload)
            if (result) {
                setResourceResponse(result)
                toggleCodeEditorView(false)
                setNeedsUpdate(true)
            }
        } catch (err) {
            showError(err)
        } finally {
            setLoader(false)
        }
    }

    const renderFooter = (): JSX.Element => {
        if (showCodeEditorView) {
            return (
                <div className="dc__border-top flex right p-16 dc__gap-8">
                    <Button
                        dataTestId="cancel-create-resource"
                        text={CREATE_RESOURCE_MODAL_MESSAGING.actionButtonText.cancel}
                        disabled={loader}
                        onClick={onClose}
                        variant={ButtonVariantType.secondary}
                        style={ButtonStyleType.neutral}
                    />
                    <Button
                        dataTestId="create-kubernetes-resource-button"
                        text={CREATE_RESOURCE_MODAL_MESSAGING.actionButtonText.apply}
                        disabled={!resourceYAML}
                        onClick={onSave}
                        isLoading={loader}
                    />
                </div>
            )
        }
        return (
            <div className="dc__border-top flexbox dc__content-space right p-16">
                <button
                    type="button"
                    className="flex cta h-36 lh-36"
                    data-testid="edit-yaml-button"
                    onClick={showCodeEditor}
                >
                    <Edit className="icon-dim-16 mr-4" />
                    {CREATE_RESOURCE_MODAL_MESSAGING.actionButtonText.editYAML}
                </button>
                <button
                    className="cta cancel h-36 lh-36 mr-12"
                    type="button"
                    onClick={onClose}
                    data-testid="close-after-resource-creation"
                >
                    {CREATE_RESOURCE_MODAL_MESSAGING.actionButtonText.close}
                </button>
            </div>
        )
    }

    const renderPageContent = (): JSX.Element => {
        if (loader) {
            return (
                <GenericEmptyState
                    SvgImage={MechanicalOperation}
                    title={CREATE_RESOURCE_MODAL_MESSAGING.creatingObject.title}
                    subTitle={CREATE_RESOURCE_MODAL_MESSAGING.creatingObject.subTitle}
                />
            )
        }

        if (showCodeEditorView) {
            return (
                <>
                    <InfoBlock
                        borderConfig={{
                            top: false,
                            right: false,
                            bottom: false,
                            left: false,
                        }}
                        borderRadiusConfig={{
                            top: false,
                            right: false,
                            bottom: false,
                            left: false,
                        }}
                        description={CREATE_RESOURCE_MODAL_MESSAGING.infoMessage}
                    />

                    <CodeEditor
                        mode={MODES.YAML}
                        noParsing
                        loading={loader}
                        value={resourceYAML}
                        height="fitToParent"
                        onChange={handleEditorValueChange}
                        autoFocus
                    />
                </>
            )
        }

        return (
            <div className="flex-grow-1 dc__overflow-hidden flexbox-col">
                <div className="created-resource-row dc__border-bottom pt-8 pr-20 pb-8 pl-20">
                    {APP_STATUS_HEADERS.map((headerKey) => (
                        <div className="fs-13 fw-6 cn-7" key={headerKey}>
                            {headerKey}
                        </div>
                    ))}
                </div>
                <div className="created-resource-list dc__overflow-auto fs-13">
                    {resourceResponse?.map((resource) => (
                        <div
                            className="created-resource-row pt-8 pr-20 pb-8 pl-20"
                            key={`${resource.kind}/${resource.name}`}
                        >
                            <div className="dc__ellipsis-right">{resource.kind}</div>
                            <div className="dc__word-break">{resource.name}</div>
                            <div className="flexbox">
                                {resource.error ? (
                                    <>
                                        <Error
                                            className="icon-dim-16 mt-3 mr-8"
                                            data-testid={`${CreateResourceStatus.failed}-status`}
                                        />
                                        {CreateResourceStatus.failed}
                                    </>
                                ) : (
                                    <>
                                        <Success
                                            className="icon-dim-16 mt-3 mr-8"
                                            data-testid={`${
                                                resource.isUpdate
                                                    ? CreateResourceStatus.updated
                                                    : CreateResourceStatus.created
                                            }-status`}
                                        />
                                        {resource.isUpdate
                                            ? CreateResourceStatus.updated
                                            : CreateResourceStatus.created}
                                    </>
                                )}
                            </div>
                            <div className="dc__word-break">{resource.error}</div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <Drawer position="right" width="1024px" onEscape={onClose}>
            <div className="create-resource-container bg__primary h-100 flexbox-col">
                <div className="flex flex-align-center flex-justify bg__primary pt-16 pr-20 pb-16 pl-20 dc__border-bottom">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0">{CREATE_RESOURCE_MODAL_MESSAGING.title}</h2>
                    <button
                        type="button"
                        className="dc__transparent flex icon-dim-24"
                        onClick={onClose}
                        aria-label="Close Create Resource Modal"
                    >
                        <CloseIcon className="icon-dim-24" />
                    </button>
                </div>
                {renderPageContent()}
                {renderFooter()}
            </div>
        </Drawer>
    )
}
