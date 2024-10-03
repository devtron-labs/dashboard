import { createContext, MutableRefObject, useContext, useMemo, useRef, useState } from 'react'

import { useForm } from '@devtron-labs/devtron-fe-common-lib'

import { ConfigMapSecretUseFormProps } from './types'

export interface ConfigMapSecretContextType {
    formDataRef: MutableRefObject<ConfigMapSecretUseFormProps>
    isFormDirty: boolean
    setFormState: (
        data: ConfigMapSecretUseFormProps,
        formState: ReturnType<typeof useForm<ConfigMapSecretUseFormProps>>['formState'],
    ) => void
}

export interface ConfigMapSecretProviderProps {
    children: JSX.Element
}

const ConfigMapSecretContext = createContext<ConfigMapSecretContextType>(null)

export const ConfigMapSecretProvider = ({ children }: ConfigMapSecretProviderProps) => {
    const [isFormDirty, setIsFormDirty] = useState(false)
    const formDataRef = useRef<ConfigMapSecretUseFormProps>(null)

    const setFormState: ConfigMapSecretContextType['setFormState'] = (data, formState) => {
        formDataRef.current = data
        setIsFormDirty(formState.isDirty)
    }

    const contextValue = useMemo<ConfigMapSecretContextType>(
        () => ({
            setFormState,
            formDataRef,
            isFormDirty,
        }),
        [isFormDirty],
    )

    return <ConfigMapSecretContext.Provider value={contextValue}>{children}</ConfigMapSecretContext.Provider>
}

export const useConfigMapSecretContext = () => {
    const context = useContext(ConfigMapSecretContext)
    if (!context) {
        throw new Error(`ConfigMapSecret Context cannot be used outside configmap/secret scope`)
    }
    return context
}
