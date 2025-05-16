import { DynamicDataTableRowDataType, getUniqueId } from '@devtron-labs/devtron-fe-common-lib'

import { CategoriesDataRowType } from './types'

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
