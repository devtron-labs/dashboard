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

import { RouteComponentProps } from 'react-router-dom'

export const COMMAND = {
    APPLICATIONS: 'app',
    CHART: 'chart',
    SECURITY: 'security',
    GLOBAL_CONFIG: 'global-config',
    STACK_MANAGER: 'stack-manager',
}

export const COMMAND_REV = {
    app: 'Applications',
    chart: 'Charts',
    security: 'Security',
    env: 'environments',
    misc: 'misc',
    none: 'none',
    'global-config': 'Global Config',
}

export interface CommandProps extends RouteComponentProps<{}> {
    isCommandBarActive: boolean
    toggleCommandBar: (flag: boolean) => void
}

export interface ArgumentType {
    value: string
    ref: any
    readonly data: {
        readonly value?: string | number
        readonly kind?: string
        readonly url?: string
        readonly group?: string
        readonly isEOC: boolean
    }
}

export interface CommandState {
    argumentInput: string
    command: { label: string; argument: ArgumentType }[]
    arguments: ArgumentType[]
    readonly allSuggestedArguments: ArgumentType[]
    suggestedArguments: ArgumentType[]
    isLoading: boolean
    isSuggestionError: boolean
    focussedArgument: number // index of the higlighted argument
    tab: 'jump-to' | 'this-app'
    groupName: string | undefined
}

export const PlaceholderText = 'Search'

export type CommandSuggestionType = { allSuggestionArguments: ArgumentType[]; groups: any[] }
