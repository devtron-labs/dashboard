import { useState } from 'react'

import { ComponentSizeType, SelectPicker } from '@devtron-labs/devtron-fe-common-lib'

export const categoryList = ['staging', 'production']

export const getCategoryList = () =>
    categoryList.map((category) => ({
        label: category,
        value: category,
    }))

export const AssignCategorySelect = () => {
    const [selectedCategory, setSelectedCategory] = useState(null)

    const handleCategoryChange = (selected) => {
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
            size={ComponentSizeType.large}
        />
    )
}
