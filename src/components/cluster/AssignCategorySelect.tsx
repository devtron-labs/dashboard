import { ComponentSizeType, OptionType, SelectPicker } from '@devtron-labs/devtron-fe-common-lib'

import { AssignCategorySelectTypes } from './cluster.type'

export const categoryList = ['staging', 'production']

export const getCategoryList = () =>
    categoryList.map((category) => ({
        label: category,
        value: +category,
    }))

export const AssignCategorySelect = ({ selectedCategory, setSelectedCategory }: AssignCategorySelectTypes) => {
    const handleCategoryChange = (selected: OptionType<number, string>) => {
        setSelectedCategory(selected)
    }

    return (
        <SelectPicker
            label="Assign Category"
            inputId="assign-category-menu-list"
            name="assign-category-menu-list"
            classNamePrefix="assign-category-menu-list"
            options={getCategoryList()}
            onChange={handleCategoryChange}
            value={selectedCategory}
            size={ComponentSizeType.medium}
            fullWidth
        />
    )
}
