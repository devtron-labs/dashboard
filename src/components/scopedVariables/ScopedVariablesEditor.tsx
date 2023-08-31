import React, { useState } from 'react'
import { toast } from 'react-toastify'
import Tippy from '@tippyjs/react'
import Descriptor from './Descriptor'
import CodeEditor from '../CodeEditor/CodeEditor'
import { ButtonWithLoader } from '../common'
import {
    postScopedVariables,
    getScopedVariablesJSON,
    parseYAMLStringToObj,
    parseIntoYAMLString,
    sortVariables,
} from './utils/helpers'
import { ScopedVariablesDataI, ScopedVariablesEditorI } from './types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as ICArrowRight } from '../../assets/icons/ic-arrow-right.svg'
import { ReactComponent as ICPencil } from '../../assets/icons/ic-pencil.svg'
import {
    PARSE_ERROR_TOAST_MESSAGE,
    SAVE_ERROR_TOAST_MESSAGE,
    SAVE_SUCCESS_TOAST_MESSAGE,
    GET_SCOPED_VARIABLES_ERROR,
} from './constants'

const ScopedVariablesEditor = ({
    variablesData,
    name,
    abortRead,
    reloadScopedVariables,
    jsonSchema,
    setShowEditView,
    setScopedVariables,
}: ScopedVariablesEditorI) => {
    const [editorData, setEditorData] = useState(variablesData)
    const [savedScopedVariables, setSavedScopedVariables] = useState(null)
    const [showSaveView, setShowSaveView] = useState<boolean>(false)
    const [loadingSavedScopedVariables, setLoadingSavedScopedVariables] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const handleSave = async () => {
        let variablesObj: ScopedVariablesDataI
        try {
            variablesObj = parseYAMLStringToObj(editorData)
            if (!variablesObj || (variablesObj && typeof variablesObj !== 'object')) {
                toast.error(PARSE_ERROR_TOAST_MESSAGE)
                return
            }
        } catch (e) {
            toast.error(PARSE_ERROR_TOAST_MESSAGE)
            return
        }
        try {
            setIsSaving(true)
            const res = await postScopedVariables(variablesObj)
            if (+res?.code === 200) {
                if (setShowEditView) {
                    setShowEditView(false)
                } else {
                    abortRead()
                }
                toast.success(SAVE_SUCCESS_TOAST_MESSAGE)
                setScopedVariables(null)
                reloadScopedVariables()
            } else {
                toast.error(SAVE_ERROR_TOAST_MESSAGE)
            }
        } catch (e) {
            toast.error(SAVE_ERROR_TOAST_MESSAGE)
        } finally {
            setIsSaving(false)
        }
    }

    const handleReview = async () => {
        let variablesObj: ScopedVariablesDataI
        try {
            variablesObj = parseYAMLStringToObj(editorData)
            if (!variablesObj || (variablesObj && typeof variablesObj !== 'object')) {
                toast.error(PARSE_ERROR_TOAST_MESSAGE)
                return
            }
        } catch (e) {
            toast.error(PARSE_ERROR_TOAST_MESSAGE)
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
                toast.error(GET_SCOPED_VARIABLES_ERROR)
                setShowSaveView(false)
            }
        } catch (e) {
            toast.error(GET_SCOPED_VARIABLES_ERROR)
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
        <div className="flex column dc__content-space h-100 bcn-0">
            <Descriptor />
            <div className="flexbox-col p-8 dc__align-start dc__gap-16 dc__align-self-stretch dc__window-bg flex-grow-1 dc__no-shrink">
                <div className="flexbox-col dc__content-space dc__align-start flex-grow-1 dc__no-shrink dc__align-self-stretch dc__border-radius-4-imp dc__border">
                    <div className="flexbox pt-8 pb-8 pl-12 pr-12 bcn-0 dc__border-bottom dc__gap-16 dc__align-self-stretch dc__align-start dc__top-radius-4">
                        {setShowEditView ? (
                            <p className="flex-grow-1 dc__no-shrink cn-9 fs-13 fw-4 lh-20 m-0 dc__ellipsis-right">
                                {showSaveView ? 'Review' : 'Edit'} <span style={{ fontWeight: 700 }}>Variables</span>
                            </p>
                        ) : (
                            <p className="flex-grow-1 dc__no-shrink cn-9 fs-13 fw-4 lh-20 m-0 dc__ellipsis-right">
                                Upload{' '}
                                <span style={{ fontWeight: 700 }}>{name?.split('.').slice(0, -1).join('.')}</span>
                            </p>
                        )}

                        <Tippy
                            className="default-tt"
                            arrow
                            placement="top"
                            content={
                                <div>
                                    <div className="flex column left">Close</div>
                                </div>
                            }
                        >
                            <button
                                className="p-0 h-20 dc__no-background dc__no-border dc__outline-none-imp"
                                onClick={handleAbort}
                                data-testid="close-btn"
                            >
                                <Close width="20px" height="20px" />
                            </button>
                        </Tippy>
                    </div>

                    {showSaveView && (
                        <div className="bcn-1 flexbox dc__content-space w-100 h-32 dc__align-items-center">
                            <div
                                className="dc__border-right fs-12 fw-6 cn-7 pt-8 pb-8 pl-12 pr-12 flexbox"
                                style={{ width: '48.5%' }}
                            >
                                Last Saved File
                            </div>
                            <div className="fs-12 fw-6 cn-7 flex-grow-1 dc__gap-4 flexbox pt-8 pb-8 pl-12 pr-12">
                                <ICPencil height={20} width={20} />
                                Edit File
                            </div>
                        </div>
                    )}

                    <CodeEditor
                        mode="yaml"
                        value={editorData}
                        noParsing
                        diffView={showSaveView}
                        defaultValue={savedScopedVariables || ''}
                        height="100%"
                        onChange={handleEditorChange}
                        validatorSchema={jsonSchema}
                    />

                    <div className="flexbox pt-13 pb-13 pl-12 pr-12 bcn-0 dc__border-top dc__content-end dc__align-items-center dc__align-self-stretch dc__gap-12">
                        <button
                            className="flex pt-8 pb-8 pl-16 pr-16 dc__gap-8 dc__border-radius-4-imp dc__border bcn-0 cn-7 fs-13 fw-6 lh-20 mw-56 dc__outline-none-imp"
                            onClick={handleAbort}
                        >
                            Cancel
                        </button>

                        <ButtonWithLoader
                            rootClassName="flex mw-56 pt-8 pb-8 pl-16 pr-16 dc__outline-none-imp dc__gap-8 dc__border-radius-4-imp bcb-5 cn-0 fs-13 fw-6 lh-20 dc__no-border cta"
                            onClick={showSaveView ? handleSave : handleReview}
                            loaderColor="white"
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

export default ScopedVariablesEditor
