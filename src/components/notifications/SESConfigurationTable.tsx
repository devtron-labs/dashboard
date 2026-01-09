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

import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'

import { FiltersTypeEnum, Icon, InteractiveCellText, Table, useSearchString } from '@devtron-labs/devtron-fe-common-lib'

import { DeleteComponentsName } from '@Config/constantMessaging'

import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'
import { ConfigurationsTabTypes, SES_TABLE_COLUMNS } from './constants'
import { renderDefaultTag } from './notifications.util'
import { ConfigurationTableProps, SESConfigurationTableRow } from './types'

import './notifications.scss'

const SESConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { searchParams } = useSearchString()
    const history = useHistory()

    const onClickSESConfigEdit = (id: number) => () => {
        const newParams = {
            ...searchParams,
            configId: id.toString(),
            modal: ConfigurationsTabTypes.SES,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    const tableRows = useMemo(
        () =>
            state.sesConfigurationList.map((sesConfig) => ({
                id: `ses-${sesConfig.id}`,
                data: {
                    icon: <Icon name="ic-ses" color={null} size={null} />,
                    name: (
                        <div className="flex left dc__gap-8 py-10">
                            <InteractiveCellText
                                text={sesConfig.name}
                                onClickHandler={onClickSESConfigEdit(sesConfig.id)}
                            />
                            {renderDefaultTag(sesConfig.isDefault)}
                        </div>
                    ),
                    accessKeyId: sesConfig.accessKeyId,
                    email: sesConfig.email,
                    actions: (
                        <ConfigTableRowActionButton
                            onClickEditRow={onClickSESConfigEdit(sesConfig.id)}
                            onClickDeleteRow={deleteClickHandler(
                                sesConfig.id,
                                DeleteComponentsName.SesConfigurationTab,
                            )}
                            modal={ConfigurationsTabTypes.SES}
                        />
                    ),
                },
            })),
        [state.sesConfigurationList, deleteClickHandler],
    )

    return (
        <Table<SESConfigurationTableRow, FiltersTypeEnum.STATE, {}>
            id="table__ses-configuration"
            columns={SES_TABLE_COLUMNS}
            rows={tableRows}
            emptyStateConfig={{
                noRowsConfig: {
                    title: 'No SES Configurations Found',
                },
            }}
            filtersVariant={FiltersTypeEnum.STATE}
            additionalFilterProps={{
                initialSortKey: 'name',
            }}
            paginationVariant={undefined}
            filter={null}
        />
    )
}

export default SESConfigurationTable
