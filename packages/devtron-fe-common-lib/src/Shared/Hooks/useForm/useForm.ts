import { ChangeEvent, FormEvent, useState } from 'react'

import { checkValidation } from './useForm.utils'
import {
    DirtyFields,
    UseFormErrors,
    TouchedFields,
    UseFormSubmitHandler,
    UseFormValidation,
    UseFormValidations,
} from './useForm.types'

/**
 * A custom hook to manage form state, validation, and submission handling.
 *
 * @param options - Optional configuration object for the form.
 * @returns The form state and utility methods
 */
export const useForm = <T extends Record<keyof T, any> = {}>(options?: {
    /** An object containing validation rules for each form field. */
    validations?: UseFormValidations<T>
    /** An object representing the initial values for the form fields. */
    initialValues?: Partial<T>
    /** Defines when validation should occur:
     * - 'onChange': Validation occurs when the user modifies the input
     * - 'onBlur': Validation occurs when the input loses focus.
     *  @default 'onChange'
     */
    validationMode?: 'onChange' | 'onBlur'
}) => {
    const [data, setData] = useState<T>((options?.initialValues || {}) as T)
    const [dirtyFields, setDirtyFields] = useState<DirtyFields<T>>({})
    const [touchedFields, setTouchedFields] = useState<TouchedFields<T>>({})
    const [errors, setErrors] = useState<UseFormErrors<T>>({})
    const [enableValidationOnChange, setEnableValidationOnChange] = useState<Partial<Record<keyof T, boolean>>>({})

    /**
     * Handles change events for form fields, updates the form data, and triggers validation.
     *
     * @param key - The key of the form field to be updated.
     * @param sanitizeFn - An optional function to sanitize the input value.
     * @returns The event handler for input changes.
     */
    const onChange =
        <V extends unknown = string, S extends unknown = unknown>(key: keyof T, sanitizeFn?: (value: V) => S) =>
        // TODO: add support for `Checkbox`, `SelectPicker` and `RadioGroup` components
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = sanitizeFn ? sanitizeFn(e.target.value as V) : e.target.value
            setData({
                ...data,
                [key]: value,
            })
            const initialValues: Partial<T> = options?.initialValues ?? {}
            setDirtyFields({ ...dirtyFields, [key]: initialValues[key] !== value })

            const validationMode = options?.validationMode ?? 'onChange'
            if (validationMode === 'onChange' || enableValidationOnChange[key] || errors[key]) {
                const validations = options?.validations ?? {}
                const error = checkValidation<T>(value as T[keyof T], validations[key as string])
                setErrors({ ...errors, [key]: error })
            }
        }

    /**
     * Handles blur events for form fields and triggers validation if the form mode is 'onBlur'.
     *
     * @param key - The key of the form field.
     * @returns The event handler for the blur event.
     */
    const onBlur = (key: keyof T, noTrim: boolean) => () => {
        if (!noTrim) {
            setData({ ...data, [key]: data[key].trim() })
        }

        if (options?.validationMode === 'onBlur') {
            const validations = options?.validations ?? {}
            const error = checkValidation<T>(data[key] as T[keyof T], validations[key as string])
            if (error && !enableValidationOnChange[key]) {
                setEnableValidationOnChange({ ...enableValidationOnChange, [key]: true })
            }
            setErrors({ ...errors, [key]: error })
        }
    }

    /**
     * Handles the focus event for form fields and updates the `touchedFields` state to mark the field as touched.
     *
     * @param key - The key of the form field.
     * @return The event handler for the focus event.
     */
    const onFocus = (key: keyof T) => () => {
        setTouchedFields({
            ...touchedFields,
            [key]: true,
        })
    }

    /**
     * Handles form submission, validates all form fields, and calls the provided `onValid` function if valid.
     *
     * @param onValid - A function to handle valid form data on submission.
     * @returns The event handler for form submission.
     */
    const handleSubmit = (onValid: UseFormSubmitHandler<T>) => (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Enables validation for all form fields if not enabled after form submission.
        if (Object.keys(enableValidationOnChange).length !== Object.keys(data).length) {
            setEnableValidationOnChange(Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
        }

        const validations = options?.validations
        if (validations) {
            const newErrors: UseFormErrors<T> = {}

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
            const newErrors: UseFormErrors<T> = {}

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

    /**
     * Registers form input fields with onChange, onBlur and onFocus handlers.
     *
     * @param name - The key of the form field to register.
     * @param sanitizeFn - An optional function to sanitize the input value.
     * @returns An object containing form field `name`, `onChange`, `onBlur` and `onFocus` event handlers.
     */
    const register = <V extends unknown = string, S extends unknown = unknown>(
        name: keyof T,
        sanitizeFn?: (value: V) => S,
        registerOptions?: {
            /**
             * Prevents the input value from being trimmed.
             *
             * If `noTrim` is set to true, the input value will not be automatically trimmed.\
             * This can be useful when whitespace is required for certain inputs.
             *
             * @default false - By default, the input will be trimmed.
             */
            noTrim?: boolean
        },
    ) => ({
        onChange: onChange(name, sanitizeFn),
        onBlur: onBlur(name, registerOptions?.noTrim),
        onFocus: onFocus(name),
        name,
    })

    return {
        /** The current form data. */
        data,
        /** An object containing validation errors for each form field. */
        errors,
        /**
         * Registers form input fields with onChange, onBlur and onFocus handlers.
         *
         * @param name - The key of the form field to register.
         * @param sanitizeFn - An optional function to sanitize the input value.
         * @returns An object containing form field `name`, `onChange`, `onBlur` and `onFocus` event handlers.
         */
        register,
        /**
         * Handles form submission, validates all form fields, and calls the provided `onValid` function if valid.
         *
         * @param onValid - A function to handle valid form data on submission.
         * @returns The event handler for form submission.
         */
        handleSubmit,
        /**
         * Manually triggers validation for specific form fields.
         *
         * @param name - The key(s) of the form field(s) to validate.
         * @returns The validation error(s), if any.
         */
        trigger,
        /** An object representing additional form state. */
        formState: {
            /** An object indicating which fields have been touched (interacted with). */
            touchedFields,
            /** An object indicating which fields have been modified. */
            dirtyFields,
            /** A boolean indicating if any field has been modified. */
            isDirty: Object.values(dirtyFields).some((value) => value),
        },
    }
}
