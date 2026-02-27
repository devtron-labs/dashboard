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

import { KeyboardEvent } from 'react'

import {
    Button,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    GenericEmptyState,
    Icon,
    ImageType,
    SidePanelTab,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICMaintenance } from '@Images/ic-maintenance.svg'
import EnterpriseTrialDialog from '@Pages/GlobalConfigurations/ClustersAndEnvironments/CreateCluster/EnterpriseTrialDialog'

import { importComponentFromFELibrary } from '../helpers/Helpers'
import { TABS_CONFIG } from './constants'
import { SidePanelDocumentation } from './SidePanelDocumentation'
import { SidePanelHeaderActions } from './SidePanelHeaderActions'
import { SidePanelContentProps } from './types'
import { getContentWrapperClassNameForTab, renderOpenTicketButton } from './utils'

const AIChat = importComponentFromFELibrary('AIChat', null, 'function')

export const SidePanelContent = ({ onClose, setSidePanelConfig, sidePanelConfig }: SidePanelContentProps) => {
    const { featureAskDevtronExpert } = useMainContext()

    const tab = sidePanelConfig.state as SidePanelTab

    const renderAIChat = () => {
        if (!AIChat) {
            return (
                <EnterpriseTrialDialog
                    featureTitle="Ask Devtron Intelligence"
                    featureDescription="Supercharge your troubleshooting! Instantly ask AI about your application or Kubernetes issues and get expert guidance at your fingertips."
                    showBorder={false}
                />
            )
        }

        if (!featureAskDevtronExpert) {
            return (
                <GenericEmptyState
                    title="AI Integration not configured"
                    subTitle="For AI-powered insights, please follow documentation or contact the Devtron team."
                    SvgImage={ICMaintenance}
                    imageType={ImageType.Medium}
                    isButtonAvailable
                    renderButton={renderOpenTicketButton}
                />
            )
        }

        return <AIChat SidePanelHeaderActions={SidePanelHeaderActions} />
    }

    return (
        <>
            <div className="border__primary--bottom flexbox dc__gap-12 dc__no-shrink bg__tertiary">
                <div className="flexbox flex-grow-1 dc__content-start">
                    {TABS_CONFIG.map(({ label, iconName, id }) => {
                        const isSelected = tab === id

                        const onTabClick = () => {
                            setSidePanelConfig((prev) => ({ ...prev, state: id }))
                        }

                        const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.currentTarget.click()
                            }
                        }

                        return (
                            <div
                                key={id}
                                role="button"
                                data-testid={`side-panel-tab-${id}`}
                                className={`flex dc__gap-6 dc__border-right px-16 dc__transition--background ${isSelected ? 'bg__primary' : ''}`}
                                onClick={onTabClick}
                                style={{ ...(isSelected ? { boxShadow: '0 1px 0 0 var(--bg-primary)' } : {}) }}
                                tabIndex={0}
                                onKeyDown={onKeyDown}
                            >
                                <Icon name={iconName} color={isSelected ? 'N900' : 'N700'} />

                                <h2 className={`m-0 fs-14 lh-20 fw-6 ${isSelected ? 'cn-9' : 'cn-7'} flex-grow-1`}>
                                    {label}
                                </h2>
                            </div>
                        )
                    })}
                </div>

                <div className="flex dc__gap-8 pr-16 pt-12 pb-11">
                    <div id="devtron-side-panel-actions" className="flexbox" />

                    <Button
                        dataTestId="close-side-panel-button"
                        ariaLabel="close-side-panel-button"
                        showAriaLabelInTippy={false}
                        icon={<Icon name="ic-close-large" color={null} />}
                        variant={ButtonVariantType.borderLess}
                        style={ButtonStyleType.negativeGrey}
                        size={ComponentSizeType.xs}
                        onClick={onClose}
                    />
                </div>
            </div>

            <div className={getContentWrapperClassNameForTab(tab, SidePanelTab.DOCUMENTATION)}>
                <SidePanelDocumentation SidePanelHeaderActions={SidePanelHeaderActions} />
            </div>

            <div className={getContentWrapperClassNameForTab(tab, SidePanelTab.ASK_DEVTRON)}>{renderAIChat()}</div>
        </>
    )
}
