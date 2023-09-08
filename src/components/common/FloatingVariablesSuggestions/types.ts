export interface Suggestion {
    variableName: string
    variableDescription: string
    variableValue: {
        value: string
    }
}

export interface FloatingVariablesSuggestionsProps {
    zIndex: number
    loading: boolean
    variables: Suggestion[]
    reloadVariables: () => void
    error: boolean
}

export interface RenderSuggestionsItemProps {
    variableName: string
    variableDescription: string
    variableValue: string
}
