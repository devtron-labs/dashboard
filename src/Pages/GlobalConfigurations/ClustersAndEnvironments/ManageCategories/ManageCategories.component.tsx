import { useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DEFAULT_ROUTE_PROMPT_MESSAGE,
    Drawer,
    DynamicDataTable,
    stopPropagation,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Add } from '@Icons/ic-add.svg'
import { ReactComponent as ICClose } from '@Icons/ic-close.svg'
import { URLS } from '@Config/routes'

import { CATEGORIES_TABLE_HEADERS } from './constants'
import { CategoriesDataRowType, CategoriesTableColumnsType } from './types'
import { getEmptyCategoriesDataRow } from './utils'

const ManageCategories = () => {
    const [apiCallInProgress] = useState(false)

    const [rows, setRows] = useState<CategoriesDataRowType[]>([getEmptyCategoriesDataRow()])
    const { push } = useHistory()

    const handleModalClose = () => {
        push(URLS.GLOBAL_CONFIG_CLUSTER)
    }

    const dataTableHandleChange = (
        updatedRow: CategoriesDataRowType,
        headerKey: CategoriesTableColumnsType,
        value: string,
    ) => {
        const updatedRows: CategoriesDataRowType[] = rows.map<CategoriesDataRowType>((row) =>
            row.id === updatedRow.id
                ? {
                      ...row,
                      data: {
                          ...row.data,
                          [headerKey]: {
                              ...row.data[headerKey],
                              value,
                          },
                      },
                  }
                : row,
        )

        setRows(updatedRows)
    }

    const onClickAddRow = () => {
        const newRow = getEmptyCategoriesDataRow()
        setRows([newRow, ...rows])
    }

    const onDeleteRow = (row: CategoriesDataRowType) => {
        const remainingRows = rows.filter(({ id }) => id !== row?.id)
        if (remainingRows.length === 0) {
            const emptyRowData = getEmptyCategoriesDataRow()
            setRows([emptyRowData])
            return
        }
        setRows(remainingRows)
    }
    return (
        <Drawer position="right" width="1024px" onEscape={handleModalClose} onClose={handleModalClose}>
            <div
                className="bg__primary h-100 cn-9 w-100 flexbox-col dc__overflow-hidden p-0 create-cluster"
                onClick={stopPropagation}
            >
                <header className="px-20 py-12 lh-24 flexbox dc__content-space dc__align-items-center dc__border-bottom">
                    <h3 className="m-0 fs-16 fw-6 lh-1-43 dc__first-letter-capitalize">
                        Cluster & Environment Categories
                    </h3>

                    <Button
                        icon={<ICClose />}
                        dataTestId="close-create-cluster-modal-button"
                        component={ButtonComponentType.button}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.xs}
                        variant={ButtonVariantType.borderLess}
                        ariaLabel="Close new cluster drawer"
                        showTooltip={apiCallInProgress}
                        tooltipProps={{
                            content: DEFAULT_ROUTE_PROMPT_MESSAGE,
                        }}
                        disabled={apiCallInProgress}
                        onClick={handleModalClose}
                        showAriaLabelInTippy={false}
                    />
                </header>

                <div className="flexbox-col flex-grow-1 dc__gap-12 dc__overflow-hidden px-20 py-20">
                    <div className="flex right">
                        <Button
                            dataTestId="manage_categories_button"
                            variant={ButtonVariantType.secondary}
                            component={ButtonComponentType.button}
                            startIcon={<Add />}
                            size={ComponentSizeType.medium}
                            text="Manage Categories"
                            onClick={onClickAddRow}
                        />
                    </div>
                    <DynamicDataTable
                        headers={CATEGORIES_TABLE_HEADERS}
                        rows={rows}
                        onRowEdit={dataTableHandleChange}
                        onRowDelete={onDeleteRow}
                        onRowAdd={onClickAddRow}
                    />
                </div>
                <div className="flex right w-100 dc__gap-12 px-20 py-12 dc__border-top">
                    <Button
                        text="Cancel"
                        variant={ButtonVariantType.secondary}
                        style={ButtonStyleType.neutral}
                        dataTestId="cancel-category-btn"
                        onClick={handleModalClose}
                    />
                    <Button
                        text="Save"
                        dataTestId="save-category-btn"
                        isLoading={apiCallInProgress}
                        disabled={apiCallInProgress}
                        onClick={handleModalClose}
                        buttonProps={{
                            type: 'submit',
                        }}
                    />
                </div>
            </div>
        </Drawer>
    )
}

export default ManageCategories
