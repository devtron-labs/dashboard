export interface SuggestionType {
    variableName: string
    description: string | null
    variableValue?: {
        value: string
    } | null
}

export interface FloatingVariablesSuggestionsProps {
    zIndex: number
    loading: boolean
    variables: SuggestionType[]
    reloadVariables: () => void
    error: boolean
}

export interface SuggestionsItemProps {
    variableName: string
    description: string
    variableValue: string
    highlightText: string
}

export interface SuggestionsProps {
    handleDeActivation: (e: React.MouseEvent<HTMLOrSVGElement>) => void
    loading: boolean
    variables: SuggestionType[]
    reloadVariables: () => void
    error: boolean
}
