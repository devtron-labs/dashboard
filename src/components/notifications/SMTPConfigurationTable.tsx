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
import { getConfigTabIcons, renderDefaultTag } from './notifications.util'
import { ConfigurationTableProps } from './types'

export const SMTPConfigurationTable = ({ state, deleteClickHandler }: ConfigurationTableProps) => {
    const { smtpConfigurationList } = state
    const { searchParams } = useSearchString()
    const history = useHistory()

    const onClickEditRow = (configId) => () => {
        const newParams = {
            ...searchParams,
            configId: configId.toString(),
            modal: ConfigurationsTabTypes.SMTP,
        }
        history.push({
            search: new URLSearchParams(newParams).toString(),
        })
    }

    return (
        <div className="smtp-config-container flex-grow-1">
            <div className="smtp-config-grid fs-12 fw-6 dc__uppercase cn-7 py-6 dc__gap-16 dc__border-bottom-n1 px-20 dc__position-sticky dc__top-0 bg__primary">
                <p className="icon-dim-24 m-0" />
                <p className="dc__truncate-text flex left m-0">Name</p>
                <p className="dc__truncate-text flex left m-0">Host</p>
                <p className="dc__truncate-text flex left m-0">Port</p>
                <p className="dc__truncate-text flex left m-0">Sender&apos; Email</p>
                <p className="" aria-label="Action" />
            </div>
            <div className="flex-grow-1">
                {smtpConfigurationList.map((smtpConfig) => (
                    <div
                        data-testid={`smtp-container-${smtpConfig.name}`}
                        key={smtpConfig.id}
                        className="configuration-tab__table-row smtp-config-grid dc__gap-16 py-6 px-20 dc__hover-n50 h-100 dc__visible-hover dc__visible-hover--parent"
                    >
                        {getConfigTabIcons(ConfigurationsTabTypes.SMTP)}
                        <div
                            data-testid={`smtp-config-name-${smtpConfig.name}`}
                            className=" dc__truncate-text flexbox dc__gap-8"
                        >
                            <InteractiveCellText
                                text={smtpConfig.name}
                                onClickHandler={onClickEditRow(smtpConfig.id)}
                            />
                            {renderDefaultTag(smtpConfig.isDefault)}
                        </div>
                        <InteractiveCellText
                            text={smtpConfig.host}
                            dataTestId={`smtp-config-host-${smtpConfig.host}`}
                        />
                        <InteractiveCellText text={smtpConfig.port} />
                        <InteractiveCellText text={smtpConfig.email} />
                        <ConfigTableRowActionButton
                            onClickEditRow={onClickEditRow(smtpConfig.id)}
                            onClickDeleteRow={deleteClickHandler(
                                smtpConfig.id,
                                DeleteComponentsName.SMTPConfigurationTab,
                            )}
                            modal={ConfigurationsTabTypes.SMTP}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
