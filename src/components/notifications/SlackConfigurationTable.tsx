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
import { BASE_CONFIG, ConfigurationsTabTypes, SLACK_WEBHOOK_TABLE_COLUMNS } from './constants'
import { ConfigurationTableProps, SlackWebhookConfigurationTableRowType } from './types'

import './notifications.scss'

const SlackConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { searchParams } = useSearchString()
    const history = useHistory()
    const { slackConfigurationList } = state

    const onClickEditRow = (id: number) => () => {
        const newParams = {
            ...searchParams,
            configId: id.toString(),
            modal: ConfigurationsTabTypes.SLACK,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    const tableRow = useMemo(
        () =>
            slackConfigurationList.map((slackConfig) => ({
                id: `${slackConfig.id}`,
                data: {
                    name: (
                        <div className="flex left dc__gap-8 py-10">
                            <InteractiveCellText
                                text={slackConfig.slackChannel}
                                onClickHandler={onClickEditRow(slackConfig.id)}
                            />
                        </div>
                    ),
                    webhookUrl: slackConfig.webhookUrl,
                },
            })),
        [],
    )

    return (
        <Table<SlackWebhookConfigurationTableRowType, FiltersTypeEnum.STATE>
            id="table__slack-configuration"
            columns={SLACK_WEBHOOK_TABLE_COLUMNS}
            rows={tableRow}
            emptyStateConfig={{
                noRowsConfig: {
                    title: 'No Slack Configurations Found',
                },
            }}
            filtersVariant={FiltersTypeEnum.STATE}
            additionalFilterProps={{
                initialSortKey: BASE_CONFIG[0].field,
            }}
            paginationVariant={PaginationEnum.NOT_PAGINATED}
            filter={null}
            rowStartIconConfig={{
                name: 'ic-slack',
                color: null,
                size: 24,
            }}
            rowActionOnHoverConfig={{
                width: 100,
                Component: ConfigurationRowActionButtonWrapper,
            }}
            additionalProps={{ deleteClickHandler, modal: ConfigurationsTabTypes.SLACK }}
        />
    )
}

export default SlackConfigurationTable
