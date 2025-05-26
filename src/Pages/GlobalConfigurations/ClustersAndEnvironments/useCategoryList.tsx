import { useAsync } from '@devtron-labs/devtron-fe-common-lib'

import { getClusterCategoryList } from './ManageCategories/service'

export const useCategoryList = () => {
    const [categoryLoader, categoryList, categoryListError, reloadCategoryList] = useAsync(getClusterCategoryList)
    return {
        categoryLoader,
        categoryList,
        categoryListError,
        reloadCategoryList,
    }
}
