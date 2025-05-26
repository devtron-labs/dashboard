import { useEffect, useState } from 'react'
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
    ErrorScreenManager,
    GenericEmptyState,
    GenericFilterEmptyState,
    Icon,
    Progressing,
    SearchBar,
    stopPropagation,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import emptyFolder from '@Images/no-artifact.webp'
import { URLS } from '@Config/routes'

import { CATEGORIES_TABLE_HEADERS } from './constants'
import { updateCategoryList } from './service'
import { CategoriesDataRowType, CategoriesTableColumnsType, ManageCategoriesProps } from './types'
import { getEmptyCategoriesDataRow, getInitialCategoryListData } from './utils'

const ManageCategories = ({
    clusterCategoriesList,
    categoryLoader,
    categoryListError,
    reloadCategoryList,
}: ManageCategoriesProps) => {
    const { searchKey, handleSearch, clearFilters } = useStateFilters()

    const [rows, setRows] = useState<CategoriesDataRowType[]>([getEmptyCategoriesDataRow()])
    const { push } = useHistory()

    const updateCategories = async () => {
        const payload = rows.map((row) => ({
            id: +row.id,
            name: row.data.categories.value,
            description: row.data.description.value,
        }))

        await updateCategoryList({ clusterCategories: payload })
        reloadCategoryList()
    }

    useEffect(() => {
        if (clusterCategoriesList) {
            const filteredCategories = clusterCategoriesList.filter((category) =>
                category.name.toLowerCase().includes(searchKey.toLowerCase()),
            )
            setRows(getInitialCategoryListData(filteredCategories))
        }
    }, [clusterCategoriesList, searchKey])

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

    const renderHeader = () => (
        <header className="px-20 py-12 lh-24 flexbox dc__content-space dc__align-items-center dc__border-bottom">
            <h3 className="m-0 fs-16 fw-6 lh-1-43">Cluster & Environment Categories</h3>

            <Button
                icon={<Icon name="ic-close-large" color={null} />}
                dataTestId="close-create-cluster-modal-button"
                component={ButtonComponentType.button}
                style={ButtonStyleType.negativeGrey}
                size={ComponentSizeType.xs}
                variant={ButtonVariantType.borderLess}
                ariaLabel="Close new cluster drawer"
                showTooltip={categoryLoader}
                tooltipProps={{
                    content: DEFAULT_ROUTE_PROMPT_MESSAGE,
                }}
                disabled={categoryLoader}
                onClick={handleModalClose}
                showAriaLabelInTippy={false}
            />
        </header>
    )

    const renderAddCategoryButton = () => (
        <Button
            dataTestId="manage_categories_button"
            variant={clusterCategoriesList?.length !== 0 ? ButtonVariantType.primary : ButtonVariantType.secondary}
            component={ButtonComponentType.button}
            startIcon={<Icon name="ic-add" color={null} />}
            size={ComponentSizeType.medium}
            text="Add Category"
            onClick={onClickAddRow}
        />
    )
    const renderSearchBar = () => (
        <div className="flex dc__content-space px-20 py-12">
            <SearchBar
                initialSearchText={searchKey}
                containerClassName="w-250"
                inputProps={{
                    autoFocus: true,
                    placeholder: 'Search categories',
                }}
                handleEnter={handleSearch}
                dataTestId="search-category-input"
            />
            {renderAddCategoryButton()}
        </div>
    )

    const renderFooter = () => (
        <div className="flex right w-100 dc__gap-12 px-20 py-12 dc__border-top">
            <Button
                text="Cancel"
                variant={ButtonVariantType.secondary}
                style={ButtonStyleType.neutral}
                dataTestId="cancel-category-btn"
                onClick={handleModalClose}
            />
            <Button
                text={clusterCategoriesList?.length === 0 ? 'Save' : 'Update'}
                dataTestId="save-category-btn"
                isLoading={categoryLoader}
                disabled={categoryLoader}
                onClick={updateCategories}
                buttonProps={{
                    type: 'submit',
                }}
            />
        </div>
    )

    const renderList = () => {
        if (!clusterCategoriesList.some((res) => res.name.includes(searchKey))) {
            return <GenericFilterEmptyState handleClearFilters={clearFilters} />
        }
        return (
            <>
                <div className="flexbox-col flex-grow-1 dc__overflow-auto px-20 pb-12">
                    <DynamicDataTable
                        headers={CATEGORIES_TABLE_HEADERS}
                        rows={rows}
                        onRowEdit={dataTableHandleChange}
                        onRowDelete={onDeleteRow}
                        onRowAdd={onClickAddRow}
                    />
                </div>
                {renderFooter()}
            </>
        )
    }

    const renderContent = () => {
        if (categoryListError) {
            return <ErrorScreenManager code={categoryListError?.code} reload={reloadCategoryList} />
        }

        if (categoryLoader) {
            return <Progressing pageLoader />
        }

        if (clusterCategoriesList?.length === 0) {
            return (
                <GenericEmptyState
                    title="No categories added"
                    subTitle="Create categories (example: Stage, Dev, QA etc)  and assign it to Cluster or Environments"
                    renderButton={renderAddCategoryButton}
                    isButtonAvailable
                    image={emptyFolder}
                />
            )
        }

        return (
            <>
                {renderSearchBar()}
                {renderList()}
            </>
        )
    }

    return (
        <Drawer position="right" width="1024px" onEscape={handleModalClose} onClose={handleModalClose}>
            <div
                className="bg__primary h-100 cn-9 w-100 flexbox-col dc__overflow-hidden p-0 create-cluster"
                onClick={stopPropagation}
            >
                {renderHeader()}
                {renderContent()}
            </div>
        </Drawer>
    )
}

export default ManageCategories
