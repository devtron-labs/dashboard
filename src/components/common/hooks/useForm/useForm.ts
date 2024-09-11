import { ChangeEvent, FormEvent, useState } from 'react'

import { ErrorRecord, UseFormSubmitHandler, UseFormValidation, UseFormValidations } from './useForm.types'

/**
 * Validates a form field based on the provided validation rules.
 *
 * @template T - A record type representing form data.
 * @param value - The value of the form field to be validated.
 * @param validation - The validation rules for the form field.
 * @returns Returns error message(s) or null if valid.
 */
const checkValidation = <T extends Record<keyof T, any> = {}>(
    value: T[keyof T],
    validation: UseFormValidation,
): string | string[] | null => {
    if (
        (typeof validation?.required === 'object' ? validation.required.value : validation.required) &&
        (value === null || value === undefined || value === '')
    ) {
        return typeof validation?.required === 'object' ? validation.required.message : 'This is a required field'
    }

    const errors = []

    const pattern = validation?.pattern
    if (Array.isArray(pattern)) {
        const error = pattern.reduce<string[]>((acc, p) => {
            if (!p.value.test(value)) {
                acc.push(p.message)
            }
            return acc
        }, [])

        if (error.length) {
            errors.push(...error)
        }
    } else if (pattern?.value && !pattern.value.test(value)) {
        errors.push(pattern.message)
    }

    const custom = validation?.custom
    if (Array.isArray(custom)) {
        const error = custom.reduce<string[]>((acc, c) => {
            if (!c.isValid(value)) {
                acc.push(c.message)
            }
            return acc
        }, [])

        if (error.length) {
            errors.push(...error)
        }
    } else if (custom?.isValid && !custom.isValid(value)) {
        errors.push(custom.message)
    }

    return errors.length ? errors : null
}

/**
 * A custom hook to manage form state, validation, and submission handling.
 *
 * @template T - A record type representing form data.
 * @param options (optional) - Options for initial form values and validation rules.
 * @param options.validations - An object containing validation rules for form fields.
 * @param options.initialValues - An object representing the initial values of the form.
 * @returns Returns form state, handlers for change and submission, validation errors, and a trigger function for manual validation.
 */
export const useForm = <T extends Record<keyof T, any> = {}>(options?: {
    validations?: UseFormValidations<T>
    initialValues?: Partial<T>
}) => {
    const [data, setData] = useState<T>((options?.initialValues || {}) as T)
    const [errors, setErrors] = useState<ErrorRecord<T>>({})

    /**
     * Handles change events for form inputs, updates the form data, and triggers validation.
     *
     * @template S - The sanitized value type.
     * @param key - The key of the form field to be updated.
     * @param sanitizeFn - An optional function to sanitize the input value.
     * @returns The event handler for input changes.
     */
    const handleChange =
        <S extends unknown>(key: keyof T, sanitizeFn?: (value: string) => S) =>
        (e: ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
            const value = sanitizeFn ? sanitizeFn(e.target.value) : e.target.value
            setData({
                ...data,
                [key]: value,
            })

            const validations = options?.validations ?? {}
            const error = checkValidation<T>(value as T[keyof T], validations[key as string])
            setErrors({ ...errors, [key]: error })
        }

    /**
     * Handles form submission, validates all form fields, and calls the provided `onValid` function if valid.
     *
     * @para onValid - A function to handle valid form data on submission.
     * @returns The event handler for form submission.
     */
    const handleSubmit = (onValid: UseFormSubmitHandler<T>) => (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const validations = options?.validations
        if (validations) {
            const newErrors: ErrorRecord<T> = {}

            Object.keys(validations).forEach((key) => {
                const validation: UseFormValidation = validations[key]
                const error = checkValidation<T>(data[key], validation)
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
        onValid(data, e)
    }

    /**
     * Manually triggers validation for specific form fields.
     *
     * @param name - The key(s) of the form field(s) to validate.
     * @returns The validation error(s), if any.
     */
    const trigger = (name: keyof T | (keyof T)[]): (string | string[]) | (string | string[])[] => {
        const validations = options?.validations

        if (Array.isArray(name)) {
            const newErrors: ErrorRecord<T> = {}

            const _errors = name.map((key) => {
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
            const validation = validations[name]
            const error = checkValidation(data[name], validation)

            if (error) {
                setErrors({ ...errors, [name]: error })
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
