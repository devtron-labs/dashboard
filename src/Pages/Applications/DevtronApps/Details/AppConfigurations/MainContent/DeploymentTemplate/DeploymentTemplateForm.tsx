import {
    ConfigurationType,
    Progressing,
    useDeploymentTemplateComputedData as useCommonDeploymentTemplateComputedData,
    useDeploymentTemplateContext,
} from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import DeploymentTemplateGUIView from '@Components/deploymentConfig/DeploymentTemplateView/DeploymentTemplateGUIView'
import { DeploymentTemplateFormProps } from './types'

const useDeploymentTemplateComputedData = importComponentFromFELibrary(
    'useDeploymentTemplateComputedData',
    useCommonDeploymentTemplateComputedData,
    'function',
)

const DeploymentTemplateForm = ({
    editMode,
    hideLockedKeys,
    lockedConfigKeysWithLockType,
    readOnly,
    resolveScopedVariables,
}: DeploymentTemplateFormProps) => {
    const {
        state: { chartConfigLoading },
        editorOnChange,
    } = useDeploymentTemplateContext()

    const { editedDocument, isResolvingVariables, uneditedDocumentWithoutLockedKeys } =
        useDeploymentTemplateComputedData({
            resolveScopedVariables,
            hideLockedKeys,
        })

    if (editMode === ConfigurationType.GUI) {
        // TODO: Ideally chartConfigLoading should be handled outside of this component
        if (isResolvingVariables || chartConfigLoading) {
            return (
                <div className="flex h-100 dc__overflow-scroll">
                    <Progressing pageLoader />
                </div>
            )
        }
        // Can remove isResolvingVariables if not needed, TODO: Can move to hook itself
        const formKey = `${resolveScopedVariables ? 'resolved' : 'unresolved'}-${hideLockedKeys ? 'hide-lock' : 'show-locked'}-${isResolvingVariables ? 'loading' : 'loaded'}-deployment-template`

        return (
            <DeploymentTemplateGUIView
                uneditedDocument={uneditedDocumentWithoutLockedKeys}
                editedDocument={editedDocument}
                value={editedDocument}
                // TODO: Look into this later for readme, etc
                readOnly={readOnly}
                // TODO: Look into this later
                hideLockedKeys={hideLockedKeys}
                editorOnChange={editorOnChange}
                // TODO: Look into this later
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                key={formKey}
            />
        )
    }

    return null
}

export default DeploymentTemplateForm
