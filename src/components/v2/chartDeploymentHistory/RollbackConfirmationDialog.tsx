import React from 'react'
import { ConfirmationDialog, usePrompt, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { Prompt } from 'react-router-dom'
import { ReactComponent as DeployButton } from '../../../assets/icons/ic-deploy.svg'
import { DEFAULT_ROUTE_PROMPT_MESSAGE } from '../../../config'

export interface RollbackConfirmationDialogProps {
    deploying: boolean
    rollbackDialogTitle: string
    setShowRollbackConfirmation: React.Dispatch<React.SetStateAction<boolean>>
    handleDeployClick: () => Promise<void>
}

const RollbackConfirmationDialog = ({
    deploying,
    rollbackDialogTitle,
    setShowRollbackConfirmation,
    handleDeployClick,
}: RollbackConfirmationDialogProps) => {
    usePrompt({ shouldPrompt: deploying })
    return (
        <>
            <ConfirmationDialog className="rollback-confirmation-dialog">
                <ConfirmationDialog.Body title={rollbackDialogTitle}>
                    <p className="fs-13 cn-7 lh-1-54">Are you sure you want to deploy a previous version?</p>
                </ConfirmationDialog.Body>
                <ConfirmationDialog.ButtonGroup>
                    <div className="flex right">
                        <button
                            type="button"
                            className="flex cta cancel"
                            onClick={() => setShowRollbackConfirmation(false)}
                            disabled={deploying}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex cta deploy-button"
                            type="button"
                            onClick={handleDeployClick}
                            disabled={deploying}
                            data-testid="re-deployment-dialog-box-button"
                        >
                            {deploying ? (
                                <Progressing />
                            ) : (
                                <>
                                    <DeployButton className="deploy-button-icon" />
                                    <span className="ml-8">Deploy</span>
                                </>
                            )}
                        </button>
                    </div>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
            <Prompt when={deploying} message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
        </>
    )
}

export default RollbackConfirmationDialog
