import { ComponentSizeType, SelectPicker, SelectPickerOptionType } from '@devtron-labs/devtron-fe-common-lib'

import { ClusterEnvironmentCategoryType } from '@Pages/GlobalConfigurations/ClustersAndEnvironments/ManageCategories/types'

import { AssignCategorySelectTypes } from './cluster.type'

export const categoryList = ['staging', 'production']

export const getClusterCategoryOptions = (clusterCategory: ClusterEnvironmentCategoryType[]) =>
    clusterCategory?.map((category) => ({
        label: category.name,
        value: category.id,
        description: category.description,
    }))

export const AssignCategorySelect = ({
    selectedCategory,
    setSelectedCategory,
    categoriesList,
}: AssignCategorySelectTypes) => {
    const handleCategoryChange = (selected: SelectPickerOptionType) => {
        setSelectedCategory(selected)
    }

    return (
        <SelectPicker
            label="Assign Category"
            inputId="assign-category-menu-list"
            name="assign-category-menu-list"
            classNamePrefix="assign-category-menu-list"
            options={getClusterCategoryOptions(categoriesList)}
            onChange={handleCategoryChange}
            value={selectedCategory}
            size={ComponentSizeType.medium}
            fullWidth
        />
    )
}
