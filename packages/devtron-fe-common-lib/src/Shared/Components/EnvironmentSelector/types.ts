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

import { OptionType } from '../../../Common'
import { GroupedOptionsType } from '../../types'
import { commonSelectStyles } from '../ReactSelect'

export type SelectedEnvironmentsMapType<T> = Record<string, T>

export type BaseSelectorType =
    | {
          isMulti: true
          handleEnvironmentChange: (options: OptionType[]) => void
      }
    | {
          isMulti: false
          handleEnvironmentChange: (option: OptionType) => void
      }

export type EnvironmentSelectorProps<T> = BaseSelectorType & {
    /**
     * Would expect selected option to be like {[selectedOption1.label] = <any value we want to store>, ...}
     */
    selectedEnvironmentsMap?: SelectedEnvironmentsMapType<T>
    placeholder?: string
    /**
     * This is a HEAVY operation, so make sure to wrap it in useCallback
     * In case we want to process (filter, rename label, etc) the options before displaying them
     */
    processOptions?: (options: GroupedOptionsType[]) => GroupedOptionsType[]
    styles?: typeof commonSelectStyles
    isClearable?: boolean
    autoFocus?: boolean
}
