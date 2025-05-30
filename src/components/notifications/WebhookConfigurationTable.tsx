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

import { useSearchString } from '@devtron-labs/devtron-fe-common-lib'

import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText/InteractiveCellText'
import { DeleteComponentsName } from '@Config/constantMessaging'

import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'
import { ConfigurationsTabTypes } from './constants'
import { getConfigTabIcons } from './notifications.util'
import { ConfigurationTableProps } from './types'

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

    return (
        <div className="webhook-config-container">
            <div className="webhook-config-grid fs-12 fw-6 dc__uppercase cn-7 py-6 dc__gap-16 dc__border-bottom-n1 px-20 dc__position-sticky dc__top-0 bg__primary">
                <p className="icon-dim-24 m-0" />
                <p className="flex left m-0">Name</p>
                <p className="dc__truncate-text flex left m-0">Webhook URL</p>
                <p className="m-0" />
            </div>
            <div className="flex-grow-1">
                {webhookConfigurationList.map((webhookConfig) => (
                    <div
                        key={webhookConfig.id}
                        className="configuration-tab__table-row webhook-config-grid fs-13 cn-9 dc__gap-16 py-6 px-20 dc__hover-n50 dc__visible-hover dc__visible-hover--parent"
                        data-testid={`webhook-container-${webhookConfig.name}`}
                    >
                        {getConfigTabIcons(ConfigurationsTabTypes.WEBHOOK)}
                        <InteractiveCellText
                            text={webhookConfig.name}
                            onClickHandler={onClickWebhookConfigEdit(webhookConfig.id)}
                            dataTestId={`webhook-config-name-${webhookConfig.name}`}
                        />
                        <InteractiveCellText
                            text={webhookConfig.webhookUrl}
                            dataTestId={`webhook-url-${webhookConfig.webhookUrl}`}
                        />
                        <ConfigTableRowActionButton
                            onClickEditRow={onClickWebhookConfigEdit(webhookConfig.id)}
                            onClickDeleteRow={deleteClickHandler(
                                webhookConfig.id,
                                DeleteComponentsName.WebhookConfigurationTab,
                            )}
                            modal={ConfigurationsTabTypes.WEBHOOK}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
