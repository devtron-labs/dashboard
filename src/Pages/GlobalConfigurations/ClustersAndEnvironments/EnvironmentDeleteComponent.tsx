import { DeleteComponentsName } from '@Config/constantMessaging'
import { DeleteConfirmationModal, ERROR_STATUS_CODE, DC_DELETE_SUBTITLES } from '@devtron-labs/devtron-fe-common-lib'
import { EnvironmentDeleteComponentProps } from './ClusterEnvironmentDrawer/types'

export const EnvironmentDeleteComponent = ({
    environmentName,
    onDelete,
    closeConfirmationModal,
}: EnvironmentDeleteComponentProps) => (
    <DeleteConfirmationModal
        title={environmentName}
        component={DeleteComponentsName.Environment}
        subtitle={DC_DELETE_SUBTITLES.DELETE_ENVIRONMENT_SUBTITLE}
        onDelete={onDelete}
        closeConfirmationModal={closeConfirmationModal}
        errorCodeToShowCannotDeleteDialog={ERROR_STATUS_CODE.BAD_REQUEST}
    />
)
