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

export interface SelectComposition {
    Button?: React.FC<any>
    OptGroup?: React.FC<any>
    Option?: React.FC<any>
    Search?: React.FC<any>
    All?: React.FC<any>
    Async?: React.FC<any>
}

export interface OptionGroupProps {
    label: string
    rootClassName?: string
}

export interface SelectProps {
    children
    onChange: (...args) => void
    valueComparator?: (...args) => boolean
    value?: any
    rootClassName?: string
    disabled?: boolean
    tabIndex?: number
    name?: string
    autoWidth?: boolean
    isKebab?: boolean
    dataTestId?: string
}

export interface SelectAsync {
    api: (...args) => Promise<any>
}
