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

import {
    FiltersTypeEnum,
    GenericFilterEmptyState,
    PaginationEnum,
    Table,
} from '@devtron-labs/devtron-fe-common-lib'
import { VariableType } from './types'
import { DescriptionCellComponent, SensitiveValueCellComponent, VariableNameCellComponent } from './utils'

export default function VariablesList({
    variablesList,
    handleClearFilters,
}: {
    variablesList: VariableType[]
    handleClearFilters: () => void
}) {
    if (!variablesList?.length) {
        return <GenericFilterEmptyState handleClearFilters={handleClearFilters} />
    }

    const tableRows = variablesList.map(
        (variable) => ({
            id: variable.name,
            data: {
                name: variable.name,
                description: variable.description,
                isSensitive: variable.isSensitive,
            },
        }),
        [variablesList],
    )

    return (
        <div className="w-100 flex-grow-1">
            <Table<VariableType, FiltersTypeEnum.NONE, {}>
                id="table__scoped-variables-list"
                columns={[
                    {
                        field: 'name',
                        label: 'VARIABLE NAME',
                        size: null,
                        CellComponent: VariableNameCellComponent,
                    },
                    {
                        field: 'description',
                        label: 'DESCRIPTION',
                        size: null,
                        CellComponent: DescriptionCellComponent,
                    },
                    {
                        field: 'isSensitive',
                        label: 'VALUE IS',
                        size: null,
                        CellComponent: SensitiveValueCellComponent,
                    },
                ]}
                rows={tableRows}
                emptyStateConfig={{
                    noRowsConfig: {
                        title: 'No variables found',
                    },
                }}
                filtersVariant={FiltersTypeEnum.NONE}
                paginationVariant={PaginationEnum.NOT_PAGINATED}
                filter={null}
                additionalProps={{}}
            />
        </div>
    )
}
