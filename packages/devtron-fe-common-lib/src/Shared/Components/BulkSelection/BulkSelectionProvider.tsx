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

import { createContext, useContext, useMemo, useState } from 'react'
import { ToastManager, ToastVariantType } from '@Shared/Services'
import {
    BULK_SELECTION_CONTEXT_ERROR,
    CLEAR_SELECTIONS_WARNING,
    SELECT_ALL_ACROSS_PAGES_LOCATOR,
    getInvalidActionMessage,
} from './constants'
import {
    BulkSelectionEvents,
    GetBulkSelectionCheckboxValuesType,
    HandleBulkSelectionType,
    SelectAllDialogStatus,
    UseBulkSelectionProps,
    UseBulkSelectionReturnType,
} from './types'
import { CHECKBOX_VALUE, noop } from '../../../Common'

// giving type any here since not exporting this context, rather using it through useBulkSelection hook which is typed
const BulkSelectionContext = createContext<UseBulkSelectionReturnType<any>>({
    selectedIdentifiers: {},
    handleBulkSelection: noop,
    isChecked: false,
    checkboxValue: CHECKBOX_VALUE.CHECKED,
    isBulkSelectionApplied: false,
    getSelectedIdentifiersCount: noop,
})

export const useBulkSelection = <T,>() => {
    const context = useContext<UseBulkSelectionReturnType<T>>(BulkSelectionContext)
    if (!context) {
        throw new Error(BULK_SELECTION_CONTEXT_ERROR)
    }
    return context
}

export const BulkSelectionProvider = <T,>({
    children,
    identifiers,
    getSelectAllDialogStatus,
}: UseBulkSelectionProps<T>) => {
    const [selectedIdentifiers, setSelectedIdentifiers] = useState<T>({} as T)

    const isBulkSelectionApplied = selectedIdentifiers[SELECT_ALL_ACROSS_PAGES_LOCATOR]

    const getSelectedIdentifiersCount = () => Object.keys(selectedIdentifiers).length

    const setIdentifiersAfterClear = (newIdentifiers: T, selectedIds: (number | string)[]) => {
        const _newIdentifiers = JSON.parse(JSON.stringify(newIdentifiers))
        selectedIds.forEach((id) => {
            delete _newIdentifiers[id]
        })
        setSelectedIdentifiers(_newIdentifiers)
    }

    const setIdentifiersAfterPageSelection = (baseObject: T) => {
        const _selectedIdentifiers = JSON.parse(JSON.stringify(selectedIdentifiers))
        // removing bulk selection across pages if present
        if (isBulkSelectionApplied) {
            delete _selectedIdentifiers[SELECT_ALL_ACROSS_PAGES_LOCATOR]
        }

        setSelectedIdentifiers({
            ..._selectedIdentifiers,
            ...baseObject,
        })
    }

    const handleBulkSelection = ({ action, data }: HandleBulkSelectionType<T>) => {
        const selectedIds = data?.identifierIds ?? []
        const identifierObject = data?.identifierObject ?? {}

        switch (action) {
            case BulkSelectionEvents.CLEAR_ALL_SELECTIONS:
                setSelectedIdentifiers({} as T)
                break

            case BulkSelectionEvents.CLEAR_IDENTIFIERS_AFTER_ACROSS_SELECTION: {
                ToastManager.showToast({
                    variant: ToastVariantType.info,
                    description: CLEAR_SELECTIONS_WARNING,
                })
                setIdentifiersAfterClear(identifiers, selectedIds)
                break
            }

            case BulkSelectionEvents.CLEAR_IDENTIFIERS: {
                setIdentifiersAfterClear(selectedIdentifiers, selectedIds)
                break
            }

            case BulkSelectionEvents.SELECT_ALL_ACROSS_PAGES: {
                if (isBulkSelectionApplied) {
                    return
                }
                const selectedIdentifiersLength = getSelectedIdentifiersCount()
                // This is for showing a modal dialog if applicable to confirm if bulk selection is to be applied
                // Do note that the 'getSelectAllDialogStatus' should be called after the length check explicitly
                // otherwise the modal will open each time
                if (selectedIdentifiersLength > 0 && getSelectAllDialogStatus() === SelectAllDialogStatus.OPEN) {
                    return
                }

                setSelectedIdentifiers({
                    [SELECT_ALL_ACROSS_PAGES_LOCATOR]: true,
                } as unknown as T)
                break
            }

            case BulkSelectionEvents.CLEAR_SELECTIONS_AND_SELECT_ALL_ACROSS_PAGES:
                setSelectedIdentifiers({
                    [SELECT_ALL_ACROSS_PAGES_LOCATOR]: true,
                } as unknown as T)
                break

            case BulkSelectionEvents.SELECT_ALL_ON_PAGE: {
                if (selectedIdentifiers[SELECT_ALL_ACROSS_PAGES_LOCATOR]) {
                    ToastManager.showToast({
                        variant: ToastVariantType.info,
                        description: CLEAR_SELECTIONS_WARNING,
                    })
                }

                setIdentifiersAfterPageSelection(identifiers)
                break
            }

            case BulkSelectionEvents.SELECT_IDENTIFIER: {
                setIdentifiersAfterPageSelection(identifierObject as T)
                break
            }

            default:
                throw new Error(getInvalidActionMessage(action))
        }
    }

    const getBulkSelectionCheckboxValues = (): GetBulkSelectionCheckboxValuesType => {
        const selectedIdentifiersArray = Object.keys(selectedIdentifiers)
        if (selectedIdentifiersArray.length === 0) {
            return {
                isChecked: false,
                checkboxValue: CHECKBOX_VALUE.CHECKED,
            }
        }

        // if selectedIdentifiers contains select all across pages locator then it means all are selected
        if (isBulkSelectionApplied) {
            return {
                isChecked: true,
                checkboxValue: CHECKBOX_VALUE.BULK_CHECKED,
            }
        }

        // if all the identifiers are selected then CHECKED else intermediate
        const areAllPresentIdentifiersSelected = Object.keys(identifiers).every(
            (identifierId) => selectedIdentifiers[identifierId],
        )

        if (areAllPresentIdentifiersSelected) {
            return {
                isChecked: true,
                checkboxValue: CHECKBOX_VALUE.CHECKED,
            }
        }

        return {
            isChecked: true,
            checkboxValue: CHECKBOX_VALUE.INTERMEDIATE,
        }
    }

    const { isChecked, checkboxValue } = getBulkSelectionCheckboxValues()

    const value = useMemo(
        () => ({
            selectedIdentifiers,
            handleBulkSelection,
            isChecked,
            checkboxValue,
            isBulkSelectionApplied,
            getSelectedIdentifiersCount,
        }),
        [selectedIdentifiers, handleBulkSelection, isChecked, checkboxValue, getSelectedIdentifiersCount],
    )

    return <BulkSelectionContext.Provider value={value}>{children}</BulkSelectionContext.Provider>
}
