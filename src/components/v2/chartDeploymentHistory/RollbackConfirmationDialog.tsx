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

import React from 'react'
import {
    usePrompt,
    DEFAULT_ROUTE_PROMPT_MESSAGE,
    ConfirmationModal,
    ConfirmationModalVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { Prompt } from 'react-router-dom'
import { ReactComponent as DeployButton } from '../../../assets/icons/ic-nav-rocket.svg'

interface RollbackConfirmationDialogProps {
    deploying: boolean
    rollbackDialogTitle: string
    setShowRollbackConfirmation: React.Dispatch<React.SetStateAction<boolean>>
    handleDeployClick: () => Promise<void>
    showRollbackConfirmation: boolean
}

const RollbackConfirmationDialog = ({
    deploying,
    rollbackDialogTitle,
    setShowRollbackConfirmation,
    handleDeployClick,
    showRollbackConfirmation,
}: RollbackConfirmationDialogProps) => {
    usePrompt({ shouldPrompt: deploying })

    const handleClose = () => {
        setShowRollbackConfirmation(false)
    }

    return (
        <>
            <ConfirmationModal
                variant={ConfirmationModalVariantType.info} // need to confirm variant as no icon is present
                title={rollbackDialogTitle}
                subtitle="Are you sure you want to deploy a previous version?"
                showConfirmationModal={showRollbackConfirmation}
                buttonConfig={{
                    secondaryButtonConfig: {
                        text: 'Cancel',
                        onClick: handleClose,
                        disabled: deploying,
                    },
                    primaryButtonConfig: {
                        text: 'Deploy',
                        isLoading: deploying,
                        startIcon: <DeployButton />,
                        onClick: handleDeployClick,
                    },
                }}
                handleClose={handleClose}
            />
            <Prompt when={deploying} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
        </>
    )
}

export default RollbackConfirmationDialog
