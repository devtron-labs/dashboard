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

import { MODES } from '../Constants'
import { Action, CodeEditorInitialValueType, CodeEditorState, CodeEditorThemesKeys } from './types'

export const CodeEditorReducer = (state: CodeEditorState, action: Action) => {
    switch (action.type) {
        case 'changeLanguage':
            return { ...state, mode: action.value }
        case 'setDiff':
            return { ...state, diffMode: action.value }
        case 'setTheme':
            return { ...state, theme: action.value }
        case 'setCode':
            return { ...state, code: action.value }
        case 'setHeight':
            return { ...state, height: action.value.toString() }
        default:
            return state
    }
}

export const initialState = ({
    mode,
    theme,
    value,
    diffView,
    noParsing,
}: CodeEditorInitialValueType): CodeEditorState => ({
    mode: mode as MODES,
    theme: (theme || CodeEditorThemesKeys.vs) as CodeEditorThemesKeys,
    code: value,
    diffMode: diffView,
    noParsing: [MODES.JSON, MODES.YAML].includes(mode as MODES) ? noParsing : true,
})
