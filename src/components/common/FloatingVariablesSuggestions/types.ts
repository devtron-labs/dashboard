/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DraggableBounds } from 'react-draggable'

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
    appId: string
    envId?: string
    clusterId?: string
    bounds?: DraggableBounds | string | false
}

export interface SuggestionsItemProps {
    variableName: string
    description: string
    variableValue: string
    isRedacted: boolean
    highlightText: string
}

export interface SuggestionsProps {
    handleDeActivation: (e: React.MouseEvent<HTMLOrSVGElement>) => void
    loading: boolean
    variables: SuggestionType[]
    reloadVariables: () => void
    error: boolean
}
