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

import { ReactNode } from 'react'
import { ResizableTagTextAreaProps } from '../../../Common'

/**
 * Interface representing a key-value header.
 * @template K - A string representing the key type.
 */
export interface KeyValueHeader<K extends string> {
    /** The label of the header. */
    label: string
    /** The key associated with the header. */
    key: K
    /** An optional class name for the header. */
    className?: string
}

/**
 * Type representing a key-value row.
 * @template K - A string representing the key type.
 */
export type KeyValueRow<K extends string> = {
    data: {
        [key in K]: Pick<ResizableTagTextAreaProps, 'value' | 'dataTestId' | 'disabled' | 'tabIndex'> & {
            /** An optional boolean indicating if an asterisk should be shown. */
            required?: boolean
        }
    }
    id: string | number
}

/**
 * Interface representing the configuration for a key-value table.
 * @template K - A string representing the key type.
 */
export interface KeyValueConfig<K extends string> {
    /** An array containing two key-value headers. */
    headers: [KeyValueHeader<K>, KeyValueHeader<K>]
    /** An array of key-value rows. */
    rows: KeyValueRow<K>[]
}

type ErrorUIProps =
    | {
          /**
           * Indicates whether to show errors.
           */
          showError: true
          /**
           * @default - false
           * If true, would validate for duplicate keys and if present would show error tooltip on the cell.
           */
          validateDuplicateKeys?: boolean
          /**
           * @default - false
           * If true, would validate for rows having values but no key and if error would show error tooltip on the cell.
           */
          validateEmptyKeys?: boolean
      }
    | {
          /**
           * Indicates whether to show errors.
           */
          showError?: false
          validateDuplicateKeys?: never
          validateEmptyKeys?: never
      }

/**
 * Type representing a mask for key-value pairs.
 * @template K - A string representing the key type.
 */
export type KeyValueMask<K extends string> = {
    [key in K]?: boolean
}

export type KeyValuePlaceholder<K extends string> = {
    [key in K]?: string
}

/**
 * Interface representing the properties for a key-value table component.
 * @template K - A string representing the key type.
 */
export type KeyValueTableProps<K extends string> = {
    /** The configuration for the key-value table. */
    config: KeyValueConfig<K>
    /** An optional mask for the key-value pairs. */
    maskValue?: KeyValueMask<K>
    placeholder?: KeyValuePlaceholder<K>
    /** An optional boolean indicating if the table is sortable. */
    isSortable?: boolean
    /** An optional React node for a custom header component. */
    headerComponent?: ReactNode
    /** When true, data addition field will not be shown. */
    isAdditionNotAllowed?: boolean
    /** When true, data add or update is disabled. */
    readOnly?: boolean
    /**
     * An optional function to handle changes in the table rows.
     * @param rowId - The id of the row that changed.
     * @param headerKey - The key of the header that changed.
     * @param value - The value of the cell.
     */
    onChange?: (rowId: string | number, headerKey: K, value: string) => void
    /**
     * An optional function to handle row deletions.
     * @param deletedRowIndex - The index of the row that was deleted.
     */
    onDelete?: (deletedRowId: string | number) => void
    /**
     * The function to use to validate the value of the cell.
     * @param value - The value to validate.
     * @param key - The row key of the value.
     * @param rowId - The id of the row.
     * @returns Return true if the value is valid, otherwise false
     * and set `showError` to `true` and provide errorMessages array to show error message.
     */
    validationSchema?: (value: string, key: K, rowId: string | number) => boolean
    /**
     * An array of error messages to be displayed in the cell error tooltip.
     */
    errorMessages?: string[]
    /**
     * A callback function called when an error occurs.
     * @param errorState - The error state, true when any cell has error, otherwise false.
     */
    onError?: (errorState: boolean) => void
} & ErrorUIProps
