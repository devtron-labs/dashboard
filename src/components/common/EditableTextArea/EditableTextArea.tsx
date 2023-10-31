import React, { useState } from 'react'
import { ReactComponent as EditIcon } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-warning.svg'
import { EditableTextAreaProps, Error } from './types'
import { ButtonWithLoader } from '../formFields/ButtonWithLoader'

const TextArea = (
    props: EditableTextAreaProps & {
        setIsEditable: (boolean) => void
    },
) => {
    const { rows, placeholder, initialText, setIsEditable, updateContent, validations } = props
    const [text, setText] = useState<EditableTextAreaProps['initialText']>(initialText)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error>({ isValid: true, message: '' })

    const handleCancelEdit = () => {
        setText(initialText)
        setIsEditable(false)
    }

    const handleSaveContent = () => {
        setIsLoading(true)
        updateContent(text)
            .then(() => {
                setIsEditable(false)
                setIsLoading(false)
            })
            .catch(() => {
                // keep editable true
                setIsLoading(false)
            })
    }

    const validateInput = (value: string): Error => {
        if (validations) {
            const trimmedValue = value.trim()
            const { maxLength } = validations

            if (!!maxLength && trimmedValue.length > maxLength.value) {
                return {
                    isValid: false,
                    message: maxLength.message,
                }
            }
        }
        return {
            isValid: true,
            message: '',
        }
    }

    const handleChange = (e) => {
        const value = e.target.value ?? ''
        setText(value)
        setError(validateInput(value))
    }

    return (
        <div className="flexbox-col flex-grow-1 dc__gap-12">
            <div>
                <textarea
                    rows={rows}
                    placeholder={placeholder}
                    value={text}
                    className="form__textarea bcn-0 fs-13 lh-20 cn-9 dc__resizable-textarea--vertical"
                    onChange={handleChange}
                />
                {!error.isValid && (
                    <span className="form__error">
                        <ErrorIcon className="form__icon form__icon--error" />
                        {error.message} <br />
                    </span>
                )}
            </div>
            <div className="flex dc__gap-12 ml-auto">
                <button className="cta cancel lh-20-imp h-28" disabled={isLoading} onClick={handleCancelEdit}>
                    Cancel
                </button>
                <ButtonWithLoader
                    rootClassName="cta lh-20-imp h-28"
                    onClick={handleSaveContent}
                    disabled={!error.isValid}
                    isLoading={isLoading}
                    loaderColor="white"
                >
                    Save
                </ButtonWithLoader>
            </div>
        </div>
    )
}

export const EditableTextArea = (props: EditableTextAreaProps) => {
    const { initialText = '' } = props
    const [isEditable, setIsEditable] = useState<boolean>(false)

    return (
        <>
            {isEditable ? (
                <TextArea {...props} initialText={initialText} setIsEditable={setIsEditable} />
            ) : (
                <div className="flexbox flex-justify dc__gap-10">
                    <div className="fs-13 fw-4 lh-20 cn-9 dc__word-break">{initialText}</div>
                    <EditIcon className="icon-dim-16 cursor mw-16" onClick={() => setIsEditable(!isEditable)} />
                </div>
            )}
        </>
    )
}
