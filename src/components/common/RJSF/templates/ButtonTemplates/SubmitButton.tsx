import React from 'react'
import { getSubmitButtonOptions, SubmitButtonProps } from '@rjsf/utils'

export const SubmitButton = ({ uiSchema }: SubmitButtonProps) => {
    const { submitText, norender, props: submitButtonProps = {} } = getSubmitButtonOptions(uiSchema)

    return norender ? null : (
        <div className="flexbox flex-justify-end">
            <button
                type="submit"
                {...submitButtonProps}
                className={`cta ${submitButtonProps.className || ''}`}
            >
                {submitText}
            </button>
        </div>
    )
}
