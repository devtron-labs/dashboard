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

import { createRef, useEffect, useRef, useState, ReactElement, Fragment, useMemo } from 'react'
import Tippy from '@tippyjs/react'
// eslint-disable-next-line import/no-extraneous-dependencies
import { followCursor } from 'tippy.js'

import { ReactComponent as ICArrowDown } from '@Icons/ic-sort-arrow-down.svg'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { ReactComponent as ICCross } from '@Icons/ic-cross.svg'
import { ReactComponent as ICAdd } from '@Icons/ic-add.svg'
import { ConditionalWrap, ResizableTagTextArea, SortingOrder, useStateFilters } from '@Common/index'
import { stringComparatorBySortOrder } from '@Shared/Helpers'
import { DEFAULT_SECRET_PLACEHOLDER } from '@Shared/constants'

import { KeyValueRow, KeyValueTableProps } from './KeyValueTable.types'
import { DUPLICATE_KEYS_VALIDATION_MESSAGE, EMPTY_KEY_VALIDATION_MESSAGE } from './constants'
import './KeyValueTable.scss'

const renderWithReadOnlyTippy = (children: ReactElement) => (
    <Tippy
        className="default-tt"
        arrow={false}
        placement="bottom"
        content="Cannot edit in read-only mode"
        followCursor="horizontal"
        plugins={[followCursor]}
    >
        {children}
    </Tippy>
)

export const KeyValueTable = <K extends string>({
    config,
    maskValue,
    isSortable,
    headerComponent,
    onChange,
    onDelete,
    placeholder,
    isAdditionNotAllowed,
    readOnly,
    showError,
    validationSchema: parentValidationSchema,
    errorMessages: parentErrorMessages = [],
    onError,
    validateDuplicateKeys = false,
    validateEmptyKeys = false,
}: KeyValueTableProps<K>) => {
    // CONSTANTS
    const { headers, rows } = config
    const firstHeaderKey = headers[0].key
    const secondHeaderKey = headers[1].key

    // STATES
    const [updatedRows, setUpdatedRows] = useState<KeyValueRow<K>[]>(rows)
    /** State to trigger useEffect to trigger autoFocus */
    const [newRowAdded, setNewRowAdded] = useState(false)

    const isActionDisabled = readOnly || isAdditionNotAllowed

    /** Boolean determining if table has rows. */
    const hasRows = (!readOnly && !isAdditionNotAllowed) || !!updatedRows.length
    const isFirstRowEmpty = !updatedRows[0]?.data[firstHeaderKey].value && !updatedRows[0]?.data[secondHeaderKey].value
    const disableDeleteRow = updatedRows.length === 1 && isFirstRowEmpty

    // HOOKS
    const { sortBy, sortOrder, handleSorting } = useStateFilters({
        initialSortKey: isSortable ? firstHeaderKey : null,
    })
    const keyTextAreaRef = useRef<Record<string, React.RefObject<HTMLTextAreaElement>>>()
    const valueTextAreaRef = useRef<Record<string, React.RefObject<HTMLTextAreaElement>>>()

    if (!keyTextAreaRef.current) {
        keyTextAreaRef.current = updatedRows.reduce((acc, curr) => ({ ...acc, [curr.id]: createRef() }), {})
    }

    if (!valueTextAreaRef.current) {
        valueTextAreaRef.current = updatedRows.reduce((acc, curr) => ({ ...acc, [curr.id]: createRef() }), {})
    }

    const updatedRowsKeysFrequency: Record<string, number> = useMemo(
        () =>
            updatedRows.reduce(
                (acc, curr) => {
                    const currentKey = curr.data[firstHeaderKey].value
                    if (currentKey) {
                        acc[currentKey] = (acc[currentKey] || 0) + 1
                    }
                    return acc
                },
                {} as Record<string, number>,
            ),
        [updatedRows],
    )

    const validationSchema = (
        value: Parameters<typeof parentValidationSchema>[0],
        key: Parameters<typeof parentValidationSchema>[1],
        rowId: Parameters<typeof parentValidationSchema>[2],
        shouldTriggerCustomValidation: boolean = true,
    ) => {
        if (shouldTriggerCustomValidation) {
            const trimmedValue = value.trim()

            if (validateDuplicateKeys && key === firstHeaderKey && updatedRowsKeysFrequency[trimmedValue] > 1) {
                return false
            }

            if (validateEmptyKeys && key === firstHeaderKey && !trimmedValue) {
                const isValuePresentAtRow = updatedRows.some(
                    ({ id, data }) => id === rowId && data[secondHeaderKey].value.trim(),
                )
                if (isValuePresentAtRow) {
                    return false
                }
            }
        }

        if (parentValidationSchema) {
            return parentValidationSchema(value, key, rowId)
        }

        return true
    }

    const checkAllRowsAreValid = (editedRows: KeyValueRow<K>[]) => {
        if (validateDuplicateKeys) {
            const { isAnyKeyDuplicated } = editedRows.reduce(
                (acc, curr) => {
                    const { keysFrequency } = acc
                    const currentKey = curr.data[firstHeaderKey].value.trim()

                    if (currentKey) {
                        keysFrequency[currentKey] = (keysFrequency[currentKey] || 0) + 1
                    }

                    return {
                        isAnyKeyDuplicated: acc.isAnyKeyDuplicated || keysFrequency[currentKey] > 1,
                        keysFrequency,
                    }
                },
                { isAnyKeyDuplicated: false, keysFrequency: {} as Record<string, number> },
            )

            if (isAnyKeyDuplicated) {
                return false
            }
        }

        if (validateEmptyKeys) {
            const isEmptyKeyPresent = editedRows.some(
                (row) => !row.data[firstHeaderKey].value.trim() && row.data[secondHeaderKey].value.trim(),
            )

            if (isEmptyKeyPresent) {
                return false
            }
        }

        // Sending custom validation as false since already checked above
        const isValid = editedRows.every(
            ({ data: _data, id }) =>
                validationSchema(_data[firstHeaderKey].value, firstHeaderKey, id, false) &&
                validationSchema(_data[secondHeaderKey].value, secondHeaderKey, id, false),
        )

        return isValid
    }

    const getEmptyRow = (): KeyValueRow<K> => {
        const id = (Date.now() * Math.random()).toString(16)
        const data = {
            data: {
                [firstHeaderKey]: {
                    value: '',
                },
                [secondHeaderKey]: {
                    value: '',
                },
            },
            id,
        } as KeyValueRow<K>

        return data
    }

    const handleAddNewRow = () => {
        const data = getEmptyRow()
        const editedRows = [data, ...updatedRows]

        const { id } = data

        onError?.(!checkAllRowsAreValid(editedRows))
        setNewRowAdded(true)
        setUpdatedRows(editedRows)

        keyTextAreaRef.current = {
            ...(keyTextAreaRef.current || {}),
            [id as string]: createRef(),
        }
        valueTextAreaRef.current = {
            ...(valueTextAreaRef.current || {}),
            [id as string]: createRef(),
        }
    }

    useEffect(() => {
        if (!isActionDisabled && !updatedRows.length) {
            handleAddNewRow()
        }
    }, [])

    useEffect(() => {
        if (isSortable) {
            setUpdatedRows((prevRows) => {
                const sortedRows = structuredClone(prevRows)
                sortedRows.sort((a, b) =>
                    stringComparatorBySortOrder(a.data[sortBy].value, b.data[sortBy].value, sortOrder),
                )
                return sortedRows
            })
        }
    }, [sortOrder])

    useEffect(() => {
        const firstRow = updatedRows[0]

        if (firstRow && newRowAdded) {
            setNewRowAdded(false)
            const areKeyAndValueTextAreaRefsPresent =
                keyTextAreaRef.current[firstRow.id].current && valueTextAreaRef.current[firstRow.id].current

            if (!firstRow.data[firstHeaderKey].value && areKeyAndValueTextAreaRefsPresent) {
                valueTextAreaRef.current[firstRow.id].current.focus()
            }
            if (!firstRow.data[secondHeaderKey].value && areKeyAndValueTextAreaRefsPresent) {
                keyTextAreaRef.current[firstRow.id].current.focus()
            }
        }
    }, [newRowAdded])

    // METHODS
    const onSortBtnClick = () => handleSorting(sortBy)

    const onRowDelete = (row: KeyValueRow<K>) => () => {
        const remainingRows = updatedRows.filter(({ id }) => id !== row.id)

        if (remainingRows.length === 0 && !isAdditionNotAllowed) {
            const emptyRowData = getEmptyRow()
            const { id } = emptyRowData

            setNewRowAdded(true)
            onError?.(!checkAllRowsAreValid([emptyRowData]))
            setUpdatedRows([emptyRowData])

            keyTextAreaRef.current = {
                [id as string]: createRef(),
            }
            valueTextAreaRef.current = {
                [id as string]: createRef(),
            }

            onDelete?.(row.id)
            return
        }

        onError?.(!checkAllRowsAreValid(remainingRows))
        setUpdatedRows(remainingRows)

        delete keyTextAreaRef.current[row.id]
        delete valueTextAreaRef.current[row.id]

        onDelete?.(row.id)
    }

    const onRowDataEdit = (row: KeyValueRow<K>, key: K) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.target
        const rowData = {
            ...row,
            data: {
                ...row.data,
                [key]: {
                    ...row.data[key],
                    value,
                },
            },
        }
        const editedRows = updatedRows.map((_row) => (_row.id === row.id ? rowData : _row))
        onError?.(!checkAllRowsAreValid(editedRows))
        setUpdatedRows(editedRows)
    }

    const onRowDataBlur = (row: KeyValueRow<K>, key: K) => (e: React.FocusEvent<HTMLTextAreaElement>) => {
        const { value } = e.target

        onChange?.(row.id, key, value)
        onError?.(!checkAllRowsAreValid(updatedRows))
    }

    const renderFirstHeader = (key: K, label: string, className: string) => (
        <div
            key={`${key}-header`}
            className={`bcn-50 py-8 px-12 flexbox dc__content-space dc__align-items-center ${updatedRows.length || !isActionDisabled ? 'dc__top-left-radius' : 'dc__left-radius-4'} ${className || ''}`}
        >
            {isSortable ? (
                <button
                    type="button"
                    className="cn-7 fs-12 lh-20-imp fw-6 flexbox dc__align-items-center dc__gap-2 dc__transparent"
                    onClick={onSortBtnClick}
                >
                    {label}
                    <ICArrowDown
                        className="icon-dim-16 dc__no-shrink scn-7 rotate cursor"
                        style={{
                            ['--rotateBy' as string]: sortOrder === SortingOrder.ASC ? '0deg' : '180deg',
                        }}
                    />
                </button>
            ) : (
                <div
                    className={`cn-7 fs-12 lh-20 fw-6 flexbox dc__align-items-center dc__content-space dc__gap-2 ${hasRows ? 'dc__top-left-radius' : 'dc__left-radius-4'}`}
                >
                    {label}
                    {!!headerComponent && headerComponent}
                </div>
            )}

            <button
                type="button"
                className={`dc__transparent p-0 flex dc__gap-4 ${isActionDisabled ? 'dc__disabled' : ''}`}
                disabled={isActionDisabled}
                onClick={handleAddNewRow}
            >
                <ICAdd className="icon-dim-12 fcb-5 dc__no-shrink" />
                <span className="cb-5 fs-12 fw-6 lh-20">Add</span>
            </button>
        </div>
    )

    const renderErrorMessage = (errorMessage: string) => (
        <div key={errorMessage} className="flexbox align-items-center dc__gap-4">
            <ICClose className="icon-dim-16 fcr-5 dc__align-self-start dc__no-shrink" />
            <p className="fs-12 lh-16 cn-7 m-0">{errorMessage}</p>
        </div>
    )

    const renderErrorMessages = (
        value: Parameters<typeof validationSchema>[0],
        key: Parameters<typeof validationSchema>[1],
        rowId: KeyValueRow<K>['id'],
    ) => {
        const showErrorMessages = showError && !validationSchema(value, key, rowId)
        if (!showErrorMessages) {
            return null
        }

        return (
            <div className="key-value-table__error bcn-0 dc__border br-4 py-7 px-8 flexbox-col dc__gap-4">
                {validateDuplicateKeys && renderErrorMessage(DUPLICATE_KEYS_VALIDATION_MESSAGE)}
                {validateEmptyKeys && renderErrorMessage(EMPTY_KEY_VALIDATION_MESSAGE)}
                {parentErrorMessages.map((error) => renderErrorMessage(error))}
            </div>
        )
    }

    return (
        <>
            <div className={`bcn-2 p-1 ${hasRows ? 'dc__top-radius-4' : 'br-4'}`}>
                <div className="key-value-table two-columns w-100 bcn-1 br-4">
                    {/* HEADER */}
                    <div className="key-value-table__row">
                        {headers.map(({ key, label, className }) =>
                            key === firstHeaderKey ? (
                                renderFirstHeader(key, label, className)
                            ) : (
                                <div
                                    key={key}
                                    className={`bcn-50 cn-9 fs-13 lh-20 py-8 px-12 fw-6 flexbox dc__align-items-center dc__content-space dc__gap-2 ${key === firstHeaderKey ? `${hasRows ? 'dc__top-left-radius' : 'dc__left-radius-4'}` : `${hasRows ? 'dc__top-right-radius-4' : 'dc__right-radius-4'}`}  ${className || ''}`}
                                >
                                    {label}
                                    {!!headerComponent && headerComponent}
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>

            {hasRows && (
                <div className="bcn-2 px-1 pb-1 dc__bottom-radius-4">
                    {!!updatedRows.length && (
                        <div
                            className={`key-value-table w-100 bcn-1 dc__bottom-radius-4 ${!readOnly ? 'three-columns' : 'two-columns'}`}
                        >
                            {updatedRows.map((row) => (
                                <div key={row.id} className="key-value-table__row">
                                    {headers.map(({ key }) => (
                                        <Fragment key={key}>
                                            <ConditionalWrap wrap={renderWithReadOnlyTippy} condition={readOnly}>
                                                <div
                                                    className={`key-value-table__cell bcn-0 flexbox dc__align-items-center dc__gap-4 dc__position-rel ${readOnly || row.data[key].disabled ? 'cursor-not-allowed no-hover' : ''} ${showError && !validationSchema(row.data[key].value, key, row.id) ? 'key-value-table__cell--error no-hover' : ''}`}
                                                >
                                                    {maskValue?.[key] && row.data[key].value ? (
                                                        <div className="py-8 px-12 h-36 flex">
                                                            {DEFAULT_SECRET_PLACEHOLDER}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <ResizableTagTextArea
                                                                {...row.data[key]}
                                                                className={`key-value-table__cell-input placeholder-cn5 py-8 px-12 cn-9 fs-13 lh-20 dc__no-border-radius ${readOnly || row.data[key].disabled ? 'cursor-not-allowed' : ''}`}
                                                                minHeight={20}
                                                                maxHeight={160}
                                                                value={row.data[key].value}
                                                                placeholder={placeholder[key]}
                                                                onChange={onRowDataEdit(row, key)}
                                                                onBlur={onRowDataBlur(row, key)}
                                                                refVar={
                                                                    key === firstHeaderKey
                                                                        ? keyTextAreaRef.current?.[row.id]
                                                                        : valueTextAreaRef.current?.[row.id]
                                                                }
                                                                dependentRef={
                                                                    key === firstHeaderKey
                                                                        ? valueTextAreaRef.current?.[row.id]
                                                                        : keyTextAreaRef.current?.[row.id]
                                                                }
                                                                disabled={readOnly || row.data[key].disabled}
                                                                disableOnBlurResizeToMinHeight
                                                            />
                                                            {row.data[key].required && (
                                                                <span className="cr-5 fs-16 dc__align-self-start px-6 py-8">
                                                                    *
                                                                </span>
                                                            )}
                                                            {renderErrorMessages(row.data[key].value, key, row.id)}
                                                        </>
                                                    )}
                                                </div>
                                            </ConditionalWrap>
                                        </Fragment>
                                    ))}
                                    {!readOnly && (
                                        <button
                                            type="button"
                                            className={`key-value-table__row-delete-btn dc__unset-button-styles dc__align-self-stretch dc__no-shrink flex py-10 px-8 bcn-0 dc__hover-n50 dc__tab-focus ${disableDeleteRow ? 'dc__disabled' : ''}`}
                                            onClick={onRowDelete(row)}
                                            disabled={disableDeleteRow}
                                        >
                                            <ICCross
                                                aria-label="delete-row"
                                                className="icon-dim-16 fcn-4 dc__align-self-start"
                                            />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
