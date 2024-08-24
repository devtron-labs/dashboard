import { importComponentFromFELibrary } from '@Components/common'
import { UserApprovalConfigType } from '@devtron-labs/devtron-fe-common-lib'

export const getIsManualApprovalConfigured: (userApprovalConfig: Pick<UserApprovalConfigType, 'type'>) => boolean =
    importComponentFromFELibrary('getIsManualApprovalConfigured', () => false, 'function')
