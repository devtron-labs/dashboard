import { ChangeEvent, FormEvent, useState } from 'react'

import { ErrorRecord, Validation, Validations } from './useForm.types'

export const useForm = <T extends Record<keyof T, any> = {}>(options?: {
    validations?: Validations<T>
    initialValues?: Partial<T>
}) => {
    const [data, setData] = useState<T>((options?.initialValues || {}) as T)
    const [errors, setErrors] = useState<ErrorRecord<T>>({})

    const checkValidation = (value: T[keyof T], validation: Validation): string | string[] => {
        if (
            (typeof validation?.required === 'object' ? validation.required.value : validation.required) &&
            (value === null || value === undefined || value === '')
        ) {
            return typeof validation?.required === 'object' ? validation.required.message : 'This is a required field'
        }

        const pattern = validation?.pattern
        if (Array.isArray(pattern)) {
            const error = pattern.flatMap((p) => {
                if (!p.value.test(value)) {
                    return p.message
                }
                return []
            })

            return error.length ? error : null
        }
        if (pattern?.value && !pattern.value.test(value)) {
            return pattern.message
        }

        const custom = validation?.custom
        if (Array.isArray(custom)) {
            const error = custom.flatMap((c) => {
                if (!c.isValid(value)) {
                    return c.message
                }
                return []
            })

            return error.length ? error : null
        }
        if (custom?.isValid && !custom.isValid(value)) {
            return custom.message
        }

        return null
    }

    // Needs to extend unknown so we can add a generic to an arrow function
    const handleChange =
        <S extends unknown>(key: keyof T, sanitizeFn?: (value: string) => S) =>
        (e: ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
            const value = sanitizeFn ? sanitizeFn(e.target.value) : e.target.value
            setData({
                ...data,
                [key]: value,
            })

            const validations = options?.validations ?? {}
            const error = checkValidation(value as T[keyof T], validations[key as string])
            setErrors({ ...errors, [key]: error })
        }

    const handleSubmit =
        (onSubmit: (data: T, e: FormEvent<HTMLFormElement>) => void) => (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const validations = options?.validations
            if (validations) {
                const newErrors: ErrorRecord<T> = {}

                Object.keys(validations).forEach((key) => {
                    const validation: Validation = validations[key]
                    const error = checkValidation(data[key], validation)
                    if (error) {
                        newErrors[key] = error
                    }
                })

                if (Object.keys(newErrors).length) {
                    setErrors(newErrors)
                    return
                }
            }

            setErrors({})
            onSubmit(data, e)
        }

    const trigger = (keys: keyof T | (keyof T)[]): (string | string[]) | (string | string[])[] => {
        const validations = options?.validations

        if (Array.isArray(keys)) {
            const newErrors: ErrorRecord<T> = {}

            const _errors = keys.map((key) => {
                if (validations) {
                    const validation = validations[key]
                    const error = checkValidation(data[key], validation)
                    newErrors[key] = error

                    return error
                }

                return null
            })

            if (Object.keys(newErrors).length) {
                setErrors({ ...errors, ...newErrors })
            }

            return _errors
        }

        if (validations) {
            const validation = validations[keys]
            const error = checkValidation(data[keys], validation)

            if (error) {
                setErrors({ ...errors, [keys]: error })
            }

            return error
        }

        return null
    }

    return {
        data,
        handleChange,
        handleSubmit,
        errors,
        trigger,
    }
}
