import { DynamicDataTableRowDataType, getUniqueId } from '@devtron-labs/devtron-fe-common-lib'

import { CategoriesDataRowType, ManageCategoryDTO } from './types'

export const getEmptyCategoriesDataRow = (): CategoriesDataRowType => {
    const id = getUniqueId()

    return {
        data: {
            categories: {
                value: '',
                type: DynamicDataTableRowDataType.TEXT,
                props: {
                    placeholder: 'Eg. staging',
                },
            },
            description: {
                value: '',
                type: DynamicDataTableRowDataType.TEXT,
                props: {
                    placeholder: 'Enter description',
                },
            },
        },
        id,
    }
}

export const getInitialCategoryListData = (categoryList: ManageCategoryDTO[]): CategoriesDataRowType[] => {
    if (categoryList.length === 0) {
        return [getEmptyCategoriesDataRow()]
    }
    return categoryList.map((category) => ({
        data: {
            categories: {
                value: category.category,
                type: DynamicDataTableRowDataType.TEXT,
                props: {
                    placeholder: 'Eg. staging',
                },
            },
            description: {
                value: category.description,
                type: DynamicDataTableRowDataType.TEXT,
                props: {
                    placeholder: 'Enter description',
                },
            },
        },
        id: category.id,
    }))
}
