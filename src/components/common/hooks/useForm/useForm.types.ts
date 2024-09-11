import { FormEvent } from 'react'

type ValidationRequired =
    | boolean
    | {
          value: boolean
          message: string
      }

type ValidationPattern =
    | {
          value: RegExp
          message: string
      }
    | {
          value: RegExp
          message: string
      }[]

type ValidationCustom =
    | {
          isValid: (value: string) => boolean
          message: string
      }
    | {
          isValid: (value: string) => boolean
          message: string
      }[]

export interface UseFormValidation {
    required?: ValidationRequired
    pattern?: ValidationPattern
    custom?: ValidationCustom
}

export type ErrorRecord<T> = Partial<Record<keyof T, string | string[]>>

export type UseFormValidations<T extends {}> = Partial<Record<keyof T, UseFormValidation>>

export type UseFormSubmitHandler<T extends {}> = (data: T, e?: FormEvent<HTMLFormElement>) => void
