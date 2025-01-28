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

import { DynamicDataTable } from '@devtron-labs/devtron-fe-common-lib'
import { VariableDataTableActionType } from '@Components/CIPipelineN/VariableDataTable/types'
import { getEmptyVariableDataRow, getTableHeaders } from './notifications.util'
import {
    HandleRowUpdateActionProps,
    WebhookConfigDynamicDataTableProps,
    WebhookDataRowType,
    WebhookHeaderKeyType,
} from './types'

export const WebhookConfigDynamicDataTable = ({ rows, setRows }: WebhookConfigDynamicDataTableProps) => {
    const handleRowUpdateAction = ({ actionType, actionValue, rowId, headerKey }: HandleRowUpdateActionProps) => {
        let updatedRows: WebhookDataRowType[] = [...rows]
        switch (actionType) {
            case VariableDataTableActionType.UPDATE_ROW:
                updatedRows = rows.map<WebhookDataRowType>((row) =>
                    row.id === rowId
                        ? {
                              ...row,
                              data: {
                                  ...row.data,
                                  [headerKey]: {
                                      ...row.data[headerKey],
                                      value: actionValue,
                                  },
                              },
                          }
                        : row,
                )
                break

            default:
                break
        }

        setRows(updatedRows)
    }

    const dataTableHandleChange = (updatedRow: WebhookDataRowType, headerKey: WebhookHeaderKeyType, value: string) => {
        handleRowUpdateAction({
            actionType: VariableDataTableActionType.UPDATE_ROW,
            actionValue: value,
            headerKey,
            rowId: updatedRow.id,
        })
    }

    const onClickAddRow = () => {
        const newRow = getEmptyVariableDataRow()
        setRows([newRow, ...rows])
    }

    const onDeleteRow = (row: WebhookDataRowType) => {
        const remainingRows = rows.filter(({ id }) => id !== row?.id)
        if (remainingRows.length === 0) {
            const emptyRowData = getEmptyVariableDataRow()
            setRows([emptyRowData])
            return
        }
        setRows(remainingRows)
    }

    return (
        <DynamicDataTable
            headers={getTableHeaders()}
            rows={rows}
            onRowEdit={dataTableHandleChange}
            onRowAdd={onClickAddRow}
            onRowDelete={onDeleteRow}
        />
    )
}
