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

import { useHistory } from 'react-router-dom'

import { FiltersTypeEnum, Table, useSearchString } from '@devtron-labs/devtron-fe-common-lib'

import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'
import { DeleteComponentsName } from '@Config/constantMessaging'

import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'
import { ConfigurationsTabTypes, SLACK_WEBHOOK_TABLE_COLUMNS } from './constants'
import { getConfigTabIcons } from './notifications.util'
import { ConfigurationTableProps, SlackWebhookConfigurationTableRow } from './types'

import './notifications.scss'

const SlackConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { searchParams } = useSearchString()
    const history = useHistory()
    const { slackConfigurationList } = state

    const onClickSlackConfigEdit = (id: number) => () => {
        const newParams = {
            ...searchParams,
            configId: id.toString(),
            modal: ConfigurationsTabTypes.SLACK,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    return (
        <Table<SlackWebhookConfigurationTableRow, FiltersTypeEnum.STATE, {}>
            id="table__slack-configuration"
            columns={SLACK_WEBHOOK_TABLE_COLUMNS}
            rows={slackConfigurationList.map((slackConfig) => ({
                id: `slack-${slackConfig.id}`,
                data: {
                    icon: getConfigTabIcons(ConfigurationsTabTypes.SLACK),
                    name: (
                        <div className="flex left dc__gap-8 py-10">
                            <InteractiveCellText
                                text={slackConfig.slackChannel}
                                onClickHandler={onClickSlackConfigEdit(slackConfig.id)}
                            />
                        </div>
                    ),
                    webhookUrl: slackConfig.webhookUrl,
                    actions: (
                        <ConfigTableRowActionButton
                            onClickEditRow={onClickSlackConfigEdit(slackConfig.id)}
                            onClickDeleteRow={deleteClickHandler(
                                slackConfig.id,
                                DeleteComponentsName.SlackConfigurationTab,
                            )}
                            modal={ConfigurationsTabTypes.SLACK}
                        />
                    ),
                },
            }))}
            emptyStateConfig={{
                noRowsConfig: {
                    title: 'No Slack Configurations Found',
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

export default SlackConfigurationTable
