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

import { CreatePageArrType, Page, PageSizeOption } from './types'
import { FALLBACK_PAGE_SIZE_OPTIONS, VISIBLE_PAGES_LIMIT } from './constants'

/**
 * Returns an array of pages numbers and whether they are selected, visible or not
 */
export const createPageArr = ({ size, pageSize, selectedPageNo }: CreatePageArrType): Page[] => {
    const arr = []
    const numberOfPages = Math.ceil(size / pageSize)
    // we are showing 2 numbers before and after the selected page, so computing the lower and upper bounds
    const lowerBound = selectedPageNo - 2 < 1 ? 1 : selectedPageNo - 2
    const upperBound = selectedPageNo + 2 > numberOfPages ? numberOfPages : selectedPageNo + 2
    for (let i = 1; i <= numberOfPages; i++) {
        arr.push({
            value: i,
            selected: i === selectedPageNo,
            isVisible: upperBound - VISIBLE_PAGES_LIMIT < i && i < lowerBound + VISIBLE_PAGES_LIMIT,
        })
    }
    return arr
}

export const getDefaultPageValueOptions = (pageSizeOptions: PageSizeOption[]): PageSizeOption[] =>
    pageSizeOptions?.length ? pageSizeOptions : FALLBACK_PAGE_SIZE_OPTIONS
