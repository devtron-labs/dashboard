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
    ActionMenu,
    ActionMenuProps,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    Icon,
    ModuleNameMap,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { NodeDetailTabs } from '../../../../app/types'
import { getShowResourceScanModal, importComponentFromFELibrary } from '../../../../common'
import { NodeType } from '../../appDetails.type'
import { NodeActionMenuOptionsIdEnum } from '../../constants'
import { PodPopupProps } from './types'

const OpenSecurityModalButton = importComponentFromFELibrary('OpenSecurityModalButton', null, 'function')

// TODO: Need to make it common and use this in ResourceTree component as well
const PodPopup = ({
    kind,
    describeNode,
    toggleShowDeleteConfirmation,
    handleShowVulnerabilityModal,
}: PodPopupProps) => {
    const { installedModuleMap } = useMainContext()
    const showResourceScanModal = getShowResourceScanModal(
        kind as NodeType,
        installedModuleMap.current?.[ModuleNameMap.SECURITY_TRIVY],
    )

    const handleActionMenuClick: ActionMenuProps['onClick'] = (item) => {
        switch (item.id) {
            case NodeActionMenuOptionsIdEnum.VIEW_EVENTS:
                describeNode(NodeDetailTabs.EVENTS)
                break
            case NodeActionMenuOptionsIdEnum.VIEW_LOGS:
                describeNode(NodeDetailTabs.LOGS)
                break
            case NodeActionMenuOptionsIdEnum.CHECK_VULNERABILITY:
                handleShowVulnerabilityModal()
                break
            case NodeActionMenuOptionsIdEnum.DELETE:
                toggleShowDeleteConfirmation()
                break
            default:
                break
        }
    }

    return (
        <ActionMenu<NodeActionMenuOptionsIdEnum>
            id="node-resource-dot-button"
            onClick={handleActionMenuClick}
            options={[
                {
                    items: [
                        ...(kind === NodeType.Pod
                            ? [
                                  {
                                      id: NodeActionMenuOptionsIdEnum.VIEW_EVENTS,
                                      label: 'View Events',
                                  },
                                  {
                                      id: NodeActionMenuOptionsIdEnum.VIEW_LOGS,
                                      label: 'View Container Logs',
                                  },
                              ]
                            : []),

                        ...(showResourceScanModal && OpenSecurityModalButton
                            ? [
                                  {
                                      id: NodeActionMenuOptionsIdEnum.CHECK_VULNERABILITY,
                                      label: 'Check vulnerabilities',
                                  },
                              ]
                            : []),
                        {
                            id: NodeActionMenuOptionsIdEnum.DELETE,
                            label: 'Delete',
                            startIcon: { name: 'ic-delete' },
                            type: 'negative',
                        },
                    ],
                },
            ]}
            buttonProps={{
                icon: <Icon name="ic-more-vertical" color={null} />,
                ariaLabel: 'additional-options',
                dataTestId: 'additional-options',
                showAriaLabelInTippy: false,
                style: ButtonStyleType.neutral,
                variant: ButtonVariantType.borderLess,
                size: ComponentSizeType.medium,
            }}
        />
    )
}

export default PodPopup
