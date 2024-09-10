import { Validation } from '@Components/common/hooks/useForm'

import { EnvironmentFormProps } from './types'

export const environmentFormValidationSchema = ({
    isNamespaceMandatory,
}: {
    isNamespaceMandatory: boolean
}): Partial<Record<keyof EnvironmentFormProps, Validation>> => ({
    environmentName: {
        required: true,
        pattern: [
            { message: 'Environment name is required', value: /^.*$/ },
            { message: "Use only lowercase alphanumeric characters or '-'", value: /^[a-z0-9-]+$/ },
            { message: "Cannot start/end with '-'", value: /^(?![-]).*[^-]$/ },
            { message: 'Minimum 1 and Maximum 16 characters required', value: /^.{1,16}$/ },
        ],
    },
    namespace: {
        required: isNamespaceMandatory,
        pattern: [
            { message: 'Namespace is required', value: /^.*$/ },
            { message: "Use only lowercase alphanumeric characters or '-'", value: /^[a-z0-9-]+$/ },
            { message: "Cannot start/end with '-'", value: /^(?![-]).*[^-]$/ },
            { message: 'Maximum 63 characters required', value: /^.{1,63}$/ },
        ],
    },
    isProduction: {
        required: true,
        pattern: { message: 'token is required', value: /[^]+/ },
    },
    description: {
        pattern: [{ message: 'Maximum 40 characters required', value: /^.{0,40}$/ }],
    },
})
