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

import { FiltersTypeEnum, PaginationEnum, Table, useSearchString } from '@devtron-labs/devtron-fe-common-lib'

import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'

import { ConfigurationRowActionButtonWrapper } from './ConfigTableRowActionButton'
import { BASE_CONFIG, ConfigurationsTabTypes, SMTP_TABLE_COLUMNS } from './constants'
import { renderDefaultTag } from './notifications.util'
import { ConfigurationTableProps, SMTPConfigurationTableRowType } from './types'

export const SMTPConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { smtpConfigurationList } = state
    const { searchParams } = useSearchString()
    const history = useHistory()

    const onClickEditRow = (id: number) => () => {
        const newParams = {
            ...searchParams,
            configId: id.toString(),
            modal: ConfigurationsTabTypes.SMTP,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    const tableRows = useMemo(
        () =>
            smtpConfigurationList.map((smtpConfig) => ({
                id: `${smtpConfig.id}`,
                data: {
                    name: (
                        <div className="flex left dc__gap-8 py-10">
                            <InteractiveCellText
                                text={smtpConfig.name}
                                onClickHandler={onClickEditRow(smtpConfig.id)}
                            />
                            {renderDefaultTag(smtpConfig.isDefault)}
                        </div>
                    ),
                    host: smtpConfig.host,
                    port: smtpConfig.port.toString(),
                    email: smtpConfig.email,
                },
            })),
        [smtpConfigurationList],
    )

    return (
        <Table<SMTPConfigurationTableRowType, FiltersTypeEnum.STATE>
            id="table__smtp-configuration"
            columns={SMTP_TABLE_COLUMNS}
            rows={tableRows}
            emptyStateConfig={{
                noRowsConfig: {
                    title: 'No SMTP Configurations Found',
                },
            }}
            filtersVariant={FiltersTypeEnum.STATE}
            additionalFilterProps={{
                initialSortKey: BASE_CONFIG[0].field,
            }}
            paginationVariant={PaginationEnum.NOT_PAGINATED}
            filter={null}
            rowStartIconConfig={{
                name: 'ic-smtp',
                color: null,
                size: 24,
            }}
            rowActionOnHoverConfig={{
                width: 100,
                Component: ConfigurationRowActionButtonWrapper,
            }}
            additionalProps={{ deleteClickHandler, modal: ConfigurationsTabTypes.SMTP }}
        />
    )
}
