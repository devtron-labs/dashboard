export interface FloatingVariablesSuggestionsProps {
    zIndex: number
    loading: boolean
    // FIXME: any is not a good type
    variables: any
    reloadVariables: () => void
    error: any
}

export interface RenderSuggestionsItemProps {
    variableName: string
    variableDescription: string
    variableValue: string
}
