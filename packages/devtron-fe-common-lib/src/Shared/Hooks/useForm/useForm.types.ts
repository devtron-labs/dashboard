import { FormEvent } from 'react'

/**
 * Describes the "required" validation rule.
 * It can be a simple boolean or an object containing a boolean value and an error message.
 */
type ValidationRequired =
    | boolean
    | {
          value: boolean
          message: string
      }

/**
 * Describes the "pattern" validation rule, which ensures a value matches a specific regular expression.
 * It can be a single validation object or an array of multiple patterns.
 */
type ValidationPattern =
    | {
          value: RegExp
          message: string
      }
    | {
          value: RegExp
          message: string
      }[]

/**
 * Describes custom validation logic.
 * It checks if a value passes a custom validation function, which returns a boolean.
 * If validation fails, an error message is provided.
 */
type ValidationCustom =
    | {
          isValid: (value: string) => boolean
          message: string
      }
    | {
          isValid: (value: string) => boolean
          message: string
      }[]

/**
 * Defines the validation rules for form fields.
 * Includes `required`, `pattern`, and `custom` validation types.
 */
export interface UseFormValidation {
    required?: ValidationRequired
    pattern?: ValidationPattern
    custom?: ValidationCustom
}

/**
 * Represents the structure for form validation errors.
 * Maps each field to an error message or an array of error messages.
 */
export type UseFormErrors<T> = Partial<Record<keyof T, string | string[]>>

/**
 * Represents the fields that have been modified ("dirty") in the form.
 * Maps each field to a boolean value indicating whether it has been changed.
 */
export type DirtyFields<T> = Partial<Record<keyof T, boolean>>

/**
 * Represents the fields that have been interacted with ("touched") in the form.
 * Maps each field to a boolean value indicating whether it has been focused or interacted with.
 */
export type TouchedFields<T> = Partial<Record<keyof T, boolean>>

/**
 * Defines the structure for form validations.
 * Maps each form field to its corresponding validation rules.
 */
export type UseFormValidations<T extends {}> = Partial<Record<keyof T, UseFormValidation>>

/**
 * Describes the function signature for handling form submission.
 *
 * @param data - The form data collected during submission.
 * @param e - The form event, optionally passed when the form is submitted.
 */
export type UseFormSubmitHandler<T extends {}> = (data: T, e?: FormEvent<HTMLFormElement>) => void
