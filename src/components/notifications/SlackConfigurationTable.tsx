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

import { DeleteComponentsName } from '@Config/constantMessaging'
import { useSearchString } from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { InteractiveCellText } from '@Components/common/helpers/InteractiveCellText'

import { ConfigurationTableProps } from './types'
import { ConfigurationsTabTypes } from './constants'
import { getConfigTabIcons } from './notifications.util'
import './notifications.scss'
import { ConfigTableRowActionButton } from './ConfigTableRowActionButton'

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
        <div className="slack-config-container h-100">
            <div className="slack-config-grid fs-12 fw-6 dc__uppercase cn-7 py-6 dc__gap-16 dc__border-bottom-n1 px-20  dc__position-sticky dc__top-0 bg__primary">
                <div className="icon-dim-24" />
                <p className="flex left m-0 ">Name</p>
                <p className="flex left m-0 ">Webhook URL</p>
                <p className="m-0" />
            </div>
            <div className="flex-grow-1">
                {slackConfigurationList.map((slackConfig) => (
                    <div
                        key={slackConfig.id}
                        className="slack-config-grid configuration-tab__table-row dc__gap-16 dc__hover-n50 dc__visible-hover dc__visible-hover--parent"
                    >
                        {getConfigTabIcons(ConfigurationsTabTypes.SLACK)}
                        <div className="flex left dc__gap-8">
                            <InteractiveCellText
                                text={slackConfig.slackChannel}
                                linkRedirectsTo={onClickSlackConfigEdit(slackConfig.id)}
                            />
                        </div>
                        <InteractiveCellText text={slackConfig.webhookUrl} />
                        <ConfigTableRowActionButton
                            onClickEditRow={onClickSlackConfigEdit(slackConfig.id)}
                            onClickDeleteRow={deleteClickHandler(
                                slackConfig.id,
                                DeleteComponentsName.SlackConfigurationTab,
                            )}
                            modal={ConfigurationsTabTypes.SLACK}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SlackConfigurationTable
