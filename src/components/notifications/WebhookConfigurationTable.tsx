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

import { FiltersTypeEnum, Table, useSearchString } from '@devtron-labs/devtron-fe-common-lib'

import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'
import { DeleteComponentsName } from '@Config/constantMessaging'

import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'
import { ConfigurationsTabTypes, SLACK_WEBHOOK_TABLE_COLUMNS } from './constants'
import { getConfigTabIcons } from './notifications.util'
import { ConfigurationTableProps, SlackWebhookConfigurationTableRow } from './types'

export const WebhookConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { webhookConfigurationList } = state
    const { searchParams } = useSearchString()
    const history = useHistory()

    const onClickWebhookConfigEdit = (id: number) => () => {
        const newParams = {
            ...searchParams,
            configId: id.toString(),
            modal: ConfigurationsTabTypes.WEBHOOK,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    const tableRows = useMemo(
        () =>
            webhookConfigurationList.map((webhookConfig) => ({
                id: `webhook-${webhookConfig.id}`,
                data: {
                    icon: getConfigTabIcons(ConfigurationsTabTypes.WEBHOOK),
                    name: (
                        <div className="flex left dc__gap-8 py-10">
                            <InteractiveCellText
                                text={webhookConfig.name}
                                onClickHandler={onClickWebhookConfigEdit(webhookConfig.id)}
                            />
                        </div>
                    ),
                    webhookUrl: webhookConfig.webhookUrl,
                    actions: (
                        <ConfigTableRowActionButton
                            onClickEditRow={onClickWebhookConfigEdit(webhookConfig.id)}
                            onClickDeleteRow={deleteClickHandler(
                                webhookConfig.id,
                                DeleteComponentsName.WebhookConfigurationTab,
                            )}
                            modal={ConfigurationsTabTypes.WEBHOOK}
                        />
                    ),
                },
            })),
        [webhookConfigurationList, deleteClickHandler],
    )

    return (
        <Table<SlackWebhookConfigurationTableRow, FiltersTypeEnum.STATE, {}>
            id="table__webhook-configuration"
            columns={SLACK_WEBHOOK_TABLE_COLUMNS}
            rows={tableRows}
            emptyStateConfig={{
                noRowsConfig: {
                    title: 'No Webhook Configurations Found',
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
