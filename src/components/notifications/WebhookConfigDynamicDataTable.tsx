import { DynamicDataTable } from '@devtron-labs/devtron-fe-common-lib'
import { VariableDataTableActionType } from '@Components/CIPipelineN/VariableDataTable/types'
import { useEffect } from 'react'
import { getEmptyVariableDataRow, getInitialWebhookKeyRow, getTableHeaders } from './notifications.util'
import {
    HandleRowUpdateActionProps,
    WebhookConfigDynamicDataTableProps,
    WebhookDataRowType,
    WebhookHeaderKeyType,
} from './types'

export const WebhookConfigDynamicDataTable = ({ rows, setRows, headers }: WebhookConfigDynamicDataTableProps) => {
    useEffect(() => {
        setRows(getInitialWebhookKeyRow(headers))
    }, [])

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
        if (!updatedRow || !updatedRow.id) return
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
