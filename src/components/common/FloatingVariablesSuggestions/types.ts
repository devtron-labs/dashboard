export interface SuggestionType {
    variableName: string
    shortDescription: string | null
    variableValue?: {
        value: string
    } | null
    isRedacted: boolean
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
