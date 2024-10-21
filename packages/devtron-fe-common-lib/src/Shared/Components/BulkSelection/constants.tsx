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

import { BulkSelectionEvents } from './types'

export const BULK_DROPDOWN_TEST_ID = 'bulk-selection-pop-up-menu' as const
export const BulkSelectionOptionsLabels = {
    [BulkSelectionEvents.SELECT_ALL_ON_PAGE]: 'All on this page',
    [BulkSelectionEvents.SELECT_ALL_ACROSS_PAGES]: 'All across pages',
    [BulkSelectionEvents.CLEAR_ALL_SELECTIONS]: 'Clear selection(s)',
} as const

// Considering application can not be named as *
export const SELECT_ALL_ACROSS_PAGES_LOCATOR = '*' as const
export const getInvalidActionMessage = (action: string) => `Invalid action ${action} passed to useBulkSelection`
export const BULK_SELECTION_CONTEXT_ERROR = 'useBulkSelection must be used within BulkSelectionContext'
export const CLEAR_SELECTIONS_WARNING = 'Selections on other pages are cleared'
