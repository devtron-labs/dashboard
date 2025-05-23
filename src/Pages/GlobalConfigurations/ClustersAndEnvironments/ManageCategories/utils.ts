import { DynamicDataTableRowDataType, getUniqueId } from '@devtron-labs/devtron-fe-common-lib'

import { CategoriesDataRowType, ClusterEnvironmentCategoryDTO } from './types'

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

export const getInitialCategoryListData = (categoryList: ClusterEnvironmentCategoryDTO[]): CategoriesDataRowType[] => {
    if (categoryList.length === 0) {
        return [getEmptyCategoriesDataRow()]
    }
    return categoryList.map((category) => ({
        data: {
            categories: {
                value: category.name,
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
