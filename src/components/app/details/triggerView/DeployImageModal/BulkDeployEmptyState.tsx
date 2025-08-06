import {
    CommonNodeAttr,
    DeploymentNodeType,
    ErrorScreenManager,
    GenericEmptyState,
    TriggerBlockType,
} from '@devtron-labs/devtron-fe-common-lib'

import emptyPreDeploy from '@Images/empty-pre-deploy.webp'
import { BULK_CD_MESSAGING } from '@Components/ApplicationGroup/Constants'
import { importComponentFromFELibrary } from '@Components/common'

import { BulkDeployEmptyStateProps } from './types'

const TriggerBlockEmptyState = importComponentFromFELibrary('TriggerBlockEmptyState', null, 'function')
const MissingPluginBlockState = importComponentFromFELibrary('MissingPluginBlockState', null, 'function')

const BulkDeployEmptyState = ({
    selectedApp,
    stageType,
    appId,
    isTriggerBlockedDueToPlugin,
    handleClose,
    reloadMaterials,
}: BulkDeployEmptyStateProps) => {
    if (TriggerBlockEmptyState && selectedApp.triggerBlockedInfo?.blockedBy === TriggerBlockType.MANDATORY_TAG) {
        return <TriggerBlockEmptyState stageType={stageType} appId={appId} />
    }

    if (isTriggerBlockedDueToPlugin) {
        // It can't be CD
        const commonNodeAttrType: CommonNodeAttr['type'] = stageType === DeploymentNodeType.PRECD ? 'PRECD' : 'POSTCD'

        return (
            <MissingPluginBlockState
                configurePluginURL={selectedApp.configurePluginURL}
                nodeType={commonNodeAttrType}
            />
        )
    }

    if (selectedApp.materialError) {
        return (
            <ErrorScreenManager
                code={selectedApp.materialError.code}
                reload={reloadMaterials}
                on404Redirect={handleClose}
            />
        )
    }

    return (
        <GenericEmptyState
            image={emptyPreDeploy}
            title={`${selectedApp?.appName} ${BULK_CD_MESSAGING[stageType].title}`}
            subTitle={BULK_CD_MESSAGING[stageType].subTitle}
        />
    )
}

export default BulkDeployEmptyState
