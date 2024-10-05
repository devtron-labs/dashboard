import { createContext, useContext, useMemo, useRef, useState } from 'react'

import { ConfigMapSecretFormContextType, ConfigMapSecretFormProviderProps, ConfigMapSecretUseFormProps } from './types'

// CONTEXT
const ConfigMapSecretForm = createContext<ConfigMapSecretFormContextType>(null)

// CONTEXT PROVIDER
export const ConfigMapSecretFormProvider = ({ children }: ConfigMapSecretFormProviderProps) => {
    const [isFormDirty, setIsFormDirty] = useState(false)
    const [isParsingError, setIsParsingError] = useState(false)
    const formDataRef = useRef<ConfigMapSecretUseFormProps>(null)

    const setFormState: ConfigMapSecretFormContextType['setFormState'] = ({ type, data, errors, isDirty }) => {
        if (type === 'SET_DATA') {
            formDataRef.current = data
            setIsFormDirty(isDirty)
            setIsParsingError(!!(errors.yaml || errors.esoSecretYaml || errors.secretDataYaml))
        } else {
            formDataRef.current = null
            setIsFormDirty(false)
            setIsParsingError(false)
        }
    }

    const contextValue = useMemo<ConfigMapSecretFormContextType>(
        () => ({
            setFormState,
            formDataRef,
            isFormDirty,
            isParsingError,
        }),
        [isFormDirty, isParsingError],
    )

    return <ConfigMapSecretForm.Provider value={contextValue}>{children}</ConfigMapSecretForm.Provider>
}

// CONTEXT HOOK
export const useConfigMapSecretFormContext = () => {
    const context = useContext(ConfigMapSecretForm)
    if (!context) {
        throw new Error(`ConfigMapSecret Form Context cannot be used outside configmap/secret scope`)
    }
    return context
}
