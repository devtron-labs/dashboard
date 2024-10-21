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

import { ComponentSizeType } from '@Shared/constants'

export interface SearchBarProps {
    /**
     * Initial search text
     *
     * @default ''
     */
    initialSearchText?: string
    /**
     * Search handler for the search input
     */
    handleSearchChange?: (searchText: string) => void
    /**
     * Enter event handler for the search input
     */
    handleEnter?: (searchText: string) => void
    /**
     * Input props for the search input
     */
    inputProps?: React.InputHTMLAttributes<HTMLInputElement> &
        Partial<Record<'ref', React.MutableRefObject<HTMLInputElement>>>
    /**
     * Class name for the container; can be used for handling width
     */
    containerClassName?: string
    /**
     * If true, the change handler would be triggered with debounce
     *
     * @default false
     */
    shouldDebounce?: boolean
    /**
     * Timeout for the debounce handler to be triggered
     */
    debounceTimeout?: number
    /**
     * Data test id for the search input
     */
    dataTestId?: string
    /**
     * Hide the background and border of the search
     */
    noBackgroundAndBorder?: boolean
    /**
     * Height of the searchbar
     *
     * @default 'ComponentSizeType.medium'
     */
    size?: ComponentSizeType.medium | ComponentSizeType.large
}
