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

import React, { useEffect, useRef, useState } from 'react'
import {
    showError,
    Progressing,
    Drawer,
    InfoColourBar,
    GenericEmptyState,
    useRegisterShortcut,
    CodeEditor,
    createNewResource,
    CreateResourceDTO,
    CodeEditorThemesKeys,
} from '@devtron-labs/devtron-fe-common-lib'
import { APP_STATUS_HEADERS, MODES } from '../../../config'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Success } from '../../../assets/icons/ic-success.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as MechanicalOperation } from '../../../assets/img/ic-mechanical-operation.svg'
import { CreateResourcePayload, CreateResourceStatus, CreateResourceType } from '../Types'
import { CREATE_RESOURCE_MODAL_MESSAGING } from '../Constants'

export const CreateResource: React.FC<CreateResourceType> = ({ closePopup, clusterId }) => {
    const { setDisableShortcuts } = useRegisterShortcut()
    const [showCodeEditorView, toggleCodeEditorView] = useState(true)
    const [loader, setLoader] = useState(false)
    const [resourceYAML, setResourceYAML] = useState('')
    const [resourceResponse, setResourceResponse] = useState<CreateResourceDTO[]>(null)

    const appStatusDetailRef = useRef<HTMLDivElement>(null)

    const onClose = (): void => {
        if (loader) {
            return
        }
        closePopup(true)
    }

    const escKeyPressHandler = (evt): void => {
        if (evt && evt.key === 'Escape') {
            evt.preventDefault()
            onClose()
        }
    }
    const outsideClickHandler = (evt): void => {
        if (appStatusDetailRef.current && !appStatusDetailRef.current.contains(evt.target)) {
            onClose()
        }
    }
    useEffect(() => {
        document.addEventListener('keydown', escKeyPressHandler)
        return (): void => {
            document.removeEventListener('keydown', escKeyPressHandler)
        }
    }, [escKeyPressHandler])

    useEffect(() => {
        document.addEventListener('click', outsideClickHandler)
        return (): void => {
            document.removeEventListener('click', outsideClickHandler)
        }
    }, [outsideClickHandler])

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
                <div className="dc__border-top flex right p-16">
                    <button className="cta cancel h-36 lh-36 mr-12" type="button" disabled={loader} onClick={onClose}>
                        {CREATE_RESOURCE_MODAL_MESSAGING.actionButtonText.cancel}
                    </button>
                    <button
                        type="button"
                        className="cta h-36 lh-36"
                        disabled={loader || !resourceYAML}
                        onClick={onSave}
                        data-testid="create-kubernetes-resource-button"
                    >
                        {loader ? <Progressing /> : CREATE_RESOURCE_MODAL_MESSAGING.actionButtonText.apply}
                    </button>
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
                    <InfoColourBar
                        message={CREATE_RESOURCE_MODAL_MESSAGING.infoMessage}
                        classname="info_bar dc__no-border-radius dc__no-top-border"
                        Icon={InfoIcon}
                    />
                    <CodeEditor
                        theme={CodeEditorThemesKeys.vsDarkDT}
                        value={resourceYAML}
                        mode={MODES.YAML}
                        noParsing
                        height="calc(100vh - 165px)"
                        onChange={handleEditorValueChange}
                        loading={loader}
                        focus
                    />
                </>
            )
        }
        return (
            <div>
                <div className="created-resource-row dc__border-bottom pt-8 pr-20 pb-8 pl-20">
                    {APP_STATUS_HEADERS.map((headerKey) => (
                        <div className="fs-13 fw-6 cn-7" key={headerKey}>
                            {headerKey}
                        </div>
                    ))}
                </div>
                <div className="created-resource-list fs-13">
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
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="create-resource-container bg__primary h-100" ref={appStatusDetailRef}>
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
                <div style={{ height: 'calc(100vh - 127px)' }}>{renderPageContent()}</div>
                {renderFooter()}
            </div>
        </Drawer>
    )
}
