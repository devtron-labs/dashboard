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
import {
    ServerErrors,
    ButtonWithLoader,
    CodeEditor,
    ToastManager,
    ToastVariantType,
    InfoBlock,
    Button,
    ComponentSizeType,
    ButtonVariantType,
    ButtonStyleType,
    MODES,
} from '@devtron-labs/devtron-fe-common-lib'
import Descriptor from './Descriptor'
import { parseYAMLStringToObj, parseIntoYAMLString, sortVariables } from './utils'
import { postScopedVariables, getScopedVariablesJSON } from './service'
import { ScopedVariablesDataType, ScopedVariablesEditorProps } from './types'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICArrowRight } from '@Icons/ic-arrow-right.svg'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { SAVE_SUCCESS_TOAST_MESSAGE, GET_SCOPED_VARIABLES_ERROR, UPLOAD_FAILED_STANDARD_MESSAGE } from './constants'

export default function ScopedVariablesEditor({
    variablesData,
    name,
    abortRead,
    reloadScopedVariables,
    jsonSchema,
    setShowEditView,
    setScopedVariables,
}: ScopedVariablesEditorProps) {
    const [editorData, setEditorData] = useState(variablesData)
    const [savedScopedVariables, setSavedScopedVariables] = useState(null)
    const [showSaveView, setShowSaveView] = useState<boolean>(false)
    const [loadingSavedScopedVariables, setLoadingSavedScopedVariables] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [infoError, setInfoError] = useState<string>('')

    const handleParsing = (data: string): ScopedVariablesDataType => {
        let variablesObj: ScopedVariablesDataType
        try {
            variablesObj = parseYAMLStringToObj(data)
            if (!variablesObj || (variablesObj && typeof variablesObj !== 'object')) {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: UPLOAD_FAILED_STANDARD_MESSAGE,
                })
                return null
            }
        } catch (e) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: UPLOAD_FAILED_STANDARD_MESSAGE,
            })
            return null
        }
        return variablesObj
    }

    const handleSave = async () => {
        const variablesObj = handleParsing(editorData)
        if (!variablesObj) {
            return
        }
        try {
            setIsSaving(true)
            const res = await postScopedVariables(variablesObj)
            if (+res?.code === 200) {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: SAVE_SUCCESS_TOAST_MESSAGE,
                })
                setScopedVariables(null)
                reloadScopedVariables()
            } else {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: UPLOAD_FAILED_STANDARD_MESSAGE,
                })
            }
        } catch (e) {
            if (e instanceof ServerErrors && Array.isArray(e.errors)) {
                setInfoError(e.errors[0]?.userMessage || UPLOAD_FAILED_STANDARD_MESSAGE)
            }
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: UPLOAD_FAILED_STANDARD_MESSAGE,
            })
            setIsSaving(false)
        }
    }

    const handleReview = async () => {
        const variablesObj = handleParsing(editorData)
        if (!variablesObj) {
            return
        }
        try {
            setLoadingSavedScopedVariables(true)
            const res = await getScopedVariablesJSON()
            if (+res?.code === 200) {
                setShowSaveView(true)
                if (res?.result?.manifest) {
                    const latestVariables = sortVariables(res?.result?.manifest)
                    setSavedScopedVariables(parseIntoYAMLString(latestVariables))
                } else {
                    setSavedScopedVariables(null)
                }
            } else {
                ToastManager.showToast({
                    variant: ToastVariantType.error,
                    description: GET_SCOPED_VARIABLES_ERROR,
                })
                setShowSaveView(false)
            }
        } catch (e) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: GET_SCOPED_VARIABLES_ERROR,
            })
            setShowSaveView(false)
        } finally {
            setLoadingSavedScopedVariables(false)
        }
    }

    const handleEditorChange = (value: string) => {
        setEditorData(value)
    }

    const handleAbort = () => {
        if (showSaveView) {
            setScopedVariables(savedScopedVariables ? parseYAMLStringToObj(savedScopedVariables) : null)
        }
        if (setShowEditView) {
            setShowEditView(false)
            return
        }
        abortRead()
    }

    return (
        <div className="flex column dc__content-space h-100 bg__primary saved-variables-editor">
            <Descriptor />
            <div className="flexbox-col p-8 dc__align-start dc__gap-16 dc__align-self-stretch bg__tertiary flex-grow-1 dc__no-shrink">
                <div className="flexbox-col dc__content-space dc__align-start flex-grow-1 dc__no-shrink dc__align-self-stretch dc__border-radius-4-imp dc__border">
                    <div className="flexbox pt-8 pb-8 pl-12 pr-12 bg__primary dc__border-bottom dc__gap-16 dc__align-self-stretch dc__align-start dc__top-radius-4">
                        {setShowEditView ? (
                            <p
                                data-testid={`${showSaveView ? 'review-variables' : 'edit-variables'}`}
                                className="flex-grow-1 dc__no-shrink cn-9 fs-13 fw-4 lh-20 m-0 dc__ellipsis-right"
                            >
                                {showSaveView ? 'Review' : 'Edit'} <span className="fw-7">Variables</span>
                            </p>
                        ) : (
                            <p className="flex-grow-1 dc__no-shrink cn-9 fs-13 fw-4 lh-20 m-0 dc__ellipsis-right">
                                Upload&nbsp;
                                <span className="fw-7">{name?.split('.').slice(0, -1).join('.')}</span>
                            </p>
                        )}

                        <Button
                            dataTestId="close-btn"
                            ariaLabel="Close"
                            icon={<ICClose />}
                            onClick={handleAbort}
                            disabled={showSaveView ? isSaving : loadingSavedScopedVariables}
                            size={ComponentSizeType.xxs}
                            variant={ButtonVariantType.borderLess}
                            style={ButtonStyleType.negativeGrey}
                        />
                    </div>

                    {infoError && (
                        <InfoBlock
                            variant="error"
                            description={infoError}
                            borderRadiusConfig={{
                                left: false,
                                right: false,
                                top: false,
                            }}
                            borderConfig={{
                                top: false,
                                right: false,
                                left: false,
                            }}
                        />
                    )}

                    <CodeEditor
                        mode={MODES.YAML}
                        noParsing
                        diffView={showSaveView}
                        codeEditorProps={{
                            value: editorData,
                            defaultValue: savedScopedVariables || '',
                            height: '100%',
                            onChange: handleEditorChange,
                            validatorSchema: jsonSchema,
                        }}
                        codeMirrorProps={{
                            height: 'fitToParent',
                            ...(showSaveView
                                ? {
                                      diffView: true,
                                      originalValue: savedScopedVariables || '',
                                      modifiedValue: editorData,
                                      onModifiedValueChange: handleEditorChange,
                                  }
                                : {
                                      diffView: false,
                                      value: editorData,
                                      onChange: handleEditorChange,
                                      validatorSchema: jsonSchema,
                                  }),
                        }}
                    >
                        {showSaveView && (
                            <CodeEditor.Header
                                hideDefaultSplitHeader
                                className="bg__tertiary w-100 h-32 dc__grid-half vertical-divider"
                                diffViewWidth
                            >
                                <div className="fs-12 fw-6 cn-7 pt-8 pb-8 pl-12 pr-12 flexbox">Last Saved File</div>
                                <div className="fs-12 fw-6 cn-7 flex-grow-1 dc__gap-4 flexbox pt-8 pb-8 pl-12 pr-12">
                                    <div className="flex">
                                        <ICPencil className="icon-dim-16" />
                                    </div>
                                    Edit File
                                </div>
                            </CodeEditor.Header>
                        )}
                    </CodeEditor>

                    <div className="flexbox pt-13 pb-13 pl-12 pr-12 bg__primary dc__border-top dc__content-end dc__align-items-center dc__align-self-stretch dc__gap-12">
                        <button
                            type="button"
                            className="flex pt-8 pb-8 pl-16 pr-16 dc__gap-8 dc__border-radius-4-imp dc__border bg__primary cn-7 fs-13 fw-6 lh-20 mw-56 dc__outline-none-imp h-32"
                            onClick={handleAbort}
                            disabled={showSaveView ? isSaving : loadingSavedScopedVariables}
                        >
                            Cancel
                        </button>

                        <ButtonWithLoader
                            rootClassName="flex mw-56 pt-8 pb-8 pl-16 pr-16 dc__outline-none-imp dc__gap-8 dc__border-radius-4-imp bcb-5 cn-0 fs-13 fw-6 lh-20 dc__no-border h-32 cta"
                            onClick={showSaveView ? handleSave : handleReview}
                            isLoading={showSaveView ? isSaving : loadingSavedScopedVariables}
                            disabled={showSaveView ? isSaving : loadingSavedScopedVariables}
                        >
                            {showSaveView ? (
                                'Save'
                            ) : (
                                <div className="flex dc__gap-4">
                                    <div>Review Changes</div>

                                    <ICArrowRight />
                                </div>
                            )}
                        </ButtonWithLoader>
                    </div>
                </div>
            </div>
        </div>
    )
}
