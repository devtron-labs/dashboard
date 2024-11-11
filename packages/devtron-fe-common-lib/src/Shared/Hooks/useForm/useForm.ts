import { BaseSyntheticEvent, ChangeEvent, useState } from 'react'

import { deepEqual } from '@Common/Helper'

import { checkValidation } from './useForm.utils'
import {
    DirtyFields,
    UseFormErrors,
    TouchedFields,
    UseFormSubmitHandler,
    UseFormValidation,
    UseFormValidations,
    UseFormErrorHandler,
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
    validationMode?: 'onChange' | 'onBlur' | 'onSubmit'
}) => {
    const [data, setData] = useState<T>((options?.initialValues || {}) as T)
    const [dirtyFields, setDirtyFields] = useState<DirtyFields<T>>({})
    const [touchedFields, setTouchedFields] = useState<TouchedFields<T>>({})
    const [errors, setErrors] = useState<UseFormErrors<T>>({})
    const [enableValidationOnChange, setEnableValidationOnChange] = useState<Partial<Record<keyof T, boolean>>>({})

    /**
     * Retrieves the validation rules for the form fields based on the current form data.
     *
     * @template T - A record type representing form data.
     * @param formData (optional) - The form data to be used for generating dynamic validations. Defaults to the current form data (`data`).
     * @returns A partial record containing validation rules for each form field, or an empty object if no validations are provided.
     */
    const getValidations = (formData = data): Partial<Record<keyof T, UseFormValidation>> => {
        if (options?.validations) {
            const validations =
                typeof options.validations === 'function' ? options.validations(formData) : options.validations
            return validations
        }
        return {}
    }

    /**
     * Handles change events for form fields, updates the form data, and triggers validation.
     *
     * @template Value - The type of the value received from the event (used if `isCustomComponent` is true).
     * @template SFnReturnType - The type returned by the optional `sanitizeFn` function.
     * @template CustomComponent - A boolean indicating whether the component is custom (e.g., not a standard HTML input).
     *
     * @param key - The key of the form field to be updated.
     * @param sanitizeFn - An optional function to sanitize the input value. If `isCustomComponent` is `true`,
     *                     the `sanitizeFn` will receive `Value` as its argument, otherwise it will receive a `string`.
     * @param isCustomComponent - A boolean indicating whether the event is coming from a custom component (default is `false`).
     * @returns The event handler for input changes. The event type will be `Value` if `isCustomComponent` is `true`, otherwise it will be a `ChangeEvent<HTMLInputElement>`.
     */
    const onChange =
        <
            Value extends unknown = unknown,
            SFnReturnType extends unknown = unknown,
            CustomComponent extends boolean = false,
        >(
            key: keyof T,
            sanitizeFn?: (value: CustomComponent extends true ? Value : string) => SFnReturnType,
            isCustomComponent?: CustomComponent,
        ) =>
        (e: CustomComponent extends true ? Value : ChangeEvent<HTMLInputElement>) => {
            // Extract value based on whether it's a custom component or standard input.
            const conditionalValue = isCustomComponent
                ? (e as Value) // For custom component, the event itself holds the value.
                : (e as ChangeEvent<HTMLInputElement>).target.value // For standard input, get the value from event's target.

            // Apply the sanitization function if provided, else use the value as is.
            const value = sanitizeFn
                ? sanitizeFn(conditionalValue as CustomComponent extends true ? Value : string)
                : conditionalValue

            // Update the form data and trigger validation if necessary.
            setData((prev) => {
                const updatedData = { ...prev, [key]: value }
                const validationMode = options?.validationMode ?? 'onChange'

                // If validation should occur (based on mode or field state), check validation for the field.
                if (validationMode === 'onChange' || enableValidationOnChange[key] || errors[key]) {
                    const validations = getValidations(updatedData)
                    const error = checkValidation<T>(value as T[keyof T], validations[key as string])
                    setErrors({ ...errors, [key]: error })
                }
                return updatedData
            })

            // Check if the field is dirty (i.e., if its value has changed from the initial one).
            const initialValues: Partial<T> = options?.initialValues ?? {}
            // Set dirty field state.
            setDirtyFields((prev) => ({ ...prev, [key]: !deepEqual(initialValues[key], value) }))
        }

    /**
     * Handles blur events for form fields and triggers validation if the form mode is 'onBlur'.
     *
     * @param key - The key of the form field.
     * @returns The event handler for the blur event.
     */
    const onBlur = (key: keyof T, noTrim: boolean) => () => {
        if (!noTrim) {
            setData({ ...data, [key]: data[key]?.trim() })
        }

        if (options?.validationMode === 'onBlur') {
            const validations = getValidations()
            const error = checkValidation<T>(data[key], validations[key as string])
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
        setTouchedFields((prev) => ({ ...prev, [key]: true }))
    }

    /**
     * Handles form submission, validates all form fields, and calls the provided `onValid` function if the form data is valid.
     * If validation errors are found, it will call the optional `onError` function.
     *
     * @param onValid - A function to handle valid form data on submission. Called when all fields pass validation.
     * @param onError - (Optional) A function to handle validation errors if the form submission fails validation.
     *                  Receives the validation errors and the form event.
     * @returns The event handler for form submission, which prevents the default form submission,
     *          performs validation, and triggers either `onValid` or `onError` based on the result.
     */
    const handleSubmit =
        (onValid: UseFormSubmitHandler<T>, onError?: UseFormErrorHandler<T>) =>
        (e?: BaseSyntheticEvent): Promise<void> => {
            e?.preventDefault()

            // Enables validation for all form fields if not enabled yet after form submission.
            if (Object.keys(enableValidationOnChange).length !== Object.keys(data).length) {
                setEnableValidationOnChange(Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
            }

            const validations = getValidations()
            if (validations) {
                const newErrors: UseFormErrors<T> = {}

                // Validates each form field based on its corresponding validation rule.
                Object.keys(validations).forEach((key) => {
                    const validation: UseFormValidation = validations[key]
                    const error = checkValidation<T>(data[key], validation)
                    if (error) {
                        newErrors[key] = error
                    }
                })

                // If validation errors exist, set the error state and call the `onError` function if provided.
                if (Object.keys(newErrors).length) {
                    setErrors(newErrors)
                    onError?.(newErrors, e)
                    // Stops execution if there are errors.
                    return
                }
            }

            // Clears any previous errors if no validation errors were found.
            setErrors({})
            // Calls the valid handler with the current form data and event.
            onValid(data, e)
        }

    /**
     * Manually triggers validation for specific form fields.
     *
     * @param name - The key(s) of the form field(s) to validate.
     * @returns The validation error(s), if any.
     */
    const trigger = (name: keyof T | (keyof T)[]): (string | string[]) | (string | string[])[] => {
        const validations = getValidations()

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
     * Sets the value of a specified form field and updates the dirty and touched state based on options.
     *
     * @param name - The key of the form field to be updated.
     * @param value - The new value to set for the specified form field.
     * @param valueOptions - Optional parameters to control the dirty and touched state.
     */
    const setValue = (
        name: keyof T,
        value: T[keyof T],
        valueOptions?: {
            /** A boolean indicating whether to mark the field as dirty after setting the value. */
            shouldDirty?: boolean
            /** A boolean indicating whether to mark the field as touched after setting the value. */
            shouldTouch?: boolean
        },
    ) => {
        // Update the form data with the new value.
        setData((prev) => ({ ...prev, [name]: value }))
        if (valueOptions?.shouldDirty) {
            const initialValues: Partial<T> = options?.initialValues ?? {}
            // Mark the field as dirty if the new value differs from the initial value.
            setDirtyFields((prev) => ({ ...prev, [name]: !deepEqual(initialValues[name], value) }))
        }
        if (valueOptions?.shouldTouch) {
            // Mark the field as touched.
            setTouchedFields((prev) => ({ ...prev, [name]: true }))
        }
    }

    /**
     * Resets the form state to the specified data, with options to keep certain states intact.
     *
     * @param formData - The data to reset the form to.
     * @param resetOptions - Optional parameters to control which states to keep on reset.
     */
    const reset = (
        formData: T,
        resetOptions?: {
            /** A boolean indicating whether to retain the current dirty state of the form fields. */
            keepDirty?: boolean
            /** A boolean indicating whether to retain the current touched state of the form fields. */
            keepTouched?: boolean
            /** A boolean indicating whether to retain the current error state of the form fields. */
            keepErrors?: boolean
        },
    ) => {
        const { keepDirty = false, keepTouched = false, keepErrors = false } = resetOptions ?? {} // Destructure reset options with defaults.
        setData(formData)
        if (!keepErrors) {
            setErrors({})
        }
        if (!keepDirty) {
            setDirtyFields({})
        }
        if (!keepTouched) {
            setTouchedFields({})
        }
    }

    /**
     * Registers form input fields with onChange, onBlur, and onFocus handlers.
     *
     * @param name - The key of the form field to register.
     * @param registerOptions - Optional parameters to customize the registration of the field.
     * @returns An object containing the following:
     *  - `onChange`: A handler function that updates the form data when the input value changes.
     *  - `onBlur`: A handler function that triggers validation when the input loses focus.
     *  - `onFocus`: A handler function that can be used to manage focus state.
     *  - `name`: The key of the form field being registered.
     */
    const register = <Value extends unknown, SFnReturnType extends unknown, CustomComponent extends boolean>(
        name: keyof T,
        registerOptions?: {
            /**
             * A function to sanitize the input value.
             * @param value The input value.
             * @returns The sanitized value.
             */
            sanitizeFn?: (value: CustomComponent extends true ? Value : string) => SFnReturnType // Function to sanitize the input value.
            /**
             * Prevents the input value from being trimmed.
             *
             * If `noTrim` is set to true, the input value will not be automatically trimmed.\
             * This can be useful when whitespace is required for certain inputs.
             *
             * @default false - By default, the input will be trimmed.
             */
            noTrim?: boolean // Prevents the input value from being trimmed.
            /** A boolean flag indicating if the input is a custom component. */
            isCustomComponent?: CustomComponent
        },
    ) => ({
        onChange: onChange(name, registerOptions?.sanitizeFn, registerOptions?.isCustomComponent),
        onBlur: onBlur(name, registerOptions?.noTrim),
        onFocus: onFocus(name),
        name,
    })

    return {
        /** The current form data. */
        data,
        /** An object containing validation errors for each form field. */
        errors,
        register,
        handleSubmit,
        trigger,
        setValue,
        reset,
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
