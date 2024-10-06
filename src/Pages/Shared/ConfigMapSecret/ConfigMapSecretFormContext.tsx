import { createContext, useContext, useMemo, useRef, useState } from 'react'

import { CONFIG_MAP_SECRET_NO_DATA_ERROR } from './constants'
import { ConfigMapSecretFormContextType, ConfigMapSecretFormProviderProps, ConfigMapSecretUseFormProps } from './types'

// CONTEXT
const ConfigMapSecretForm = createContext<ConfigMapSecretFormContextType>(null)

// CONTEXT PROVIDER
export const ConfigMapSecretFormProvider = ({ children }: ConfigMapSecretFormProviderProps) => {
    // STATES
    const [isFormDirty, setIsFormDirty] = useState(false)
    const [parsingError, setParsingError] = useState('')

    // REFS
    const formDataRef = useRef<ConfigMapSecretUseFormProps>(null)

    // METHODS
    const setFormState: ConfigMapSecretFormContextType['setFormState'] = ({ type, data, errors, isDirty }) => {
        if (type === 'SET_DATA') {
            formDataRef.current = data
            setIsFormDirty(isDirty)
            const yamlError = formDataRef.current.external ? errors.esoSecretYaml : errors.yaml
            setParsingError(
                yamlError !== CONFIG_MAP_SECRET_NO_DATA_ERROR && typeof yamlError === 'string' ? yamlError : '',
            )
        } else {
            formDataRef.current = null
            setIsFormDirty(false)
            setParsingError('')
        }
    }

    // CONTEXT VALUE
    const contextValue = useMemo<ConfigMapSecretFormContextType>(
        () => ({
            setFormState,
            formDataRef,
            isFormDirty,
            parsingError,
        }),
        [isFormDirty, parsingError],
    )

    return <ConfigMapSecretForm.Provider value={contextValue}>{children}</ConfigMapSecretForm.Provider>
}

// CONTEXT HOOK
export const useConfigMapSecretFormContext = () => {
    const context = useContext(ConfigMapSecretForm)
    if (!context) {
        throw new Error(`ConfigMapSecretForm Context cannot be used outside configmap/secret scope`)
    }
    return context
}
