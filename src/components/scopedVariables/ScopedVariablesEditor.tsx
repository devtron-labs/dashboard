import React, { useState } from 'react'
import { toast } from 'react-toastify'
import Descriptor from './Descriptor'
import CodeEditor from '../CodeEditor/CodeEditor'
import { ButtonWithLoader } from '../common'
import { postScopedVariables, parseYAMLStringToObj, manipulateVariables } from './utils/helpers'
import { ScopedVariablesEditorI } from './types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { PARSE_ERROR_TOAST_MESSAGE, SAVE_ERROR_TOAST_MESSAGE, SAVE_SUCCESS_TOAST_MESSAGE } from './constants'

const ScopedVariablesEditor = ({
    variablesData,
    name,
    abortRead,
    reloadScopedVariables,
    jsonSchema,
    setShowEditView,
}: ScopedVariablesEditorI) => {
    const [isLoading, setIsLoading] = useState(false)
    const [editorData, setEditorData] = useState(variablesData)

    const handleSave = async () => {
        let variablesObj: { variables: any[] }
        try {
            variablesObj = parseYAMLStringToObj(editorData)
            if (!variablesObj || (variablesObj && typeof variablesObj !== 'object')) {
                toast.error(PARSE_ERROR_TOAST_MESSAGE)
                return
            }
            variablesObj = manipulateVariables((value) => JSON.stringify(value), variablesObj)
        } catch (e) {
            toast.error(PARSE_ERROR_TOAST_MESSAGE)
            return
        }
        try {
            setIsLoading(true)
            const res = await postScopedVariables(variablesObj)
            if (+res?.code === 200) {
                if (setShowEditView) {
                    setShowEditView(false)
                } else {
                    abortRead()
                }
                toast.success(SAVE_SUCCESS_TOAST_MESSAGE)
                reloadScopedVariables()
            } else {
                toast.error(SAVE_ERROR_TOAST_MESSAGE)
            }
        } catch (e) {
            toast.error(SAVE_ERROR_TOAST_MESSAGE)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditorChange = (value: string) => {
        setEditorData(value)
    }

    const handleAbort = () => {
        if (setShowEditView) {
            setShowEditView(false)
            return
        }
        abortRead()
    }

    return (
        <div className="flex column dc__content-space h-100 default-bg-color">
            <Descriptor />
            <div className="uploaded-variables-editor-background">
                <div className="uploaded-variables-editor-container">
                    <div className="uploaded-variables-editor-infobar">
                        {setShowEditView ? (
                            <p className="uploaded-variables-editor-infobar__typography dc__ellipsis-right">
                                Edit <span style={{ fontWeight: 700 }}>Variables</span>
                            </p>
                        ) : (
                            <p className="uploaded-variables-editor-infobar__typography dc__ellipsis-right">
                                Upload{' '}
                                <span style={{ fontWeight: 700 }}>{name?.split('.').slice(0, -1).join('.')}</span>
                            </p>
                        )}
                        <button className="uploaded-variables-editor-infobar__abort-read-btn" onClick={handleAbort}>
                            <Close width="20px" height="20px" />
                        </button>
                    </div>

                    <CodeEditor
                        mode="yaml"
                        value={editorData}
                        noParsing={false}
                        height="100%"
                        onChange={handleEditorChange}
                        validatorSchema={jsonSchema}
                    />

                    <div className="uploaded-variables-editor-footer">
                        <button className="uploaded-variables-editor-footer__cancel-button" onClick={handleAbort}>
                            Cancel
                        </button>

                        <ButtonWithLoader
                            rootClassName="uploaded-variables-editor-footer__save-button cta"
                            onClick={handleSave}
                            loaderColor="white"
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            Save
                        </ButtonWithLoader>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScopedVariablesEditor
