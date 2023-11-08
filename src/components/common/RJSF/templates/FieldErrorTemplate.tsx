import React from 'react'
import { errorId, FieldErrorProps } from '@rjsf/utils'

import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'

export const FieldErrorTemplate = (props: FieldErrorProps) => {
    const { errors = [], idSchema } = props
    const id = errorId(idSchema)

    return errors.length > 0 && (
        <span id={id}>
            {errors
                .filter((elem) => !!elem)
                .map((error, index: number) => {
                    return (
                        <span className="form__error" key={index}>
                            <Error className="form__icon form__icon--error" />
                            {error}
                        </span>
                    )
                })}
        </span>
    )
}
