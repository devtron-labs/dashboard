/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DynamicDataTableRowType, ServerErrors } from '@devtron-labs/devtron-fe-common-lib'

export interface ClusterEnvironmentCategoryDTO {
    id: number
    name: string
    description: string
}

export interface ManageClusterCategoryDTO {
    clusterCategories: ClusterEnvironmentCategoryDTO[]
}

export interface ManageEnvironmentCategoryDTO {
    environmentCategories: ClusterEnvironmentCategoryDTO[]
}

export interface ClusterEnvironmentCategoryType extends ClusterEnvironmentCategoryDTO {}

export type CategoriesTableColumnsType = 'categories' | 'description'
export type CategoriesDataRowType = DynamicDataTableRowType<CategoriesTableColumnsType>

export interface ManageCategoriesProps {
    clusterCategoriesList: ClusterEnvironmentCategoryType[]
    categoryLoader: boolean
    categoryListError: ServerErrors
    reloadCategoryList: () => void
}
