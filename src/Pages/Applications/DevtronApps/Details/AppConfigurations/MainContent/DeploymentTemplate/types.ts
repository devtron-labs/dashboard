import { ConfigKeysWithLockType, DeploymentTemplateQueryParamsType } from '@devtron-labs/devtron-fe-common-lib'

// Can derive editMode from url as well, just wanted the typing to be more explicit
export interface DeploymentTemplateFormProps
    extends Pick<DeploymentTemplateQueryParamsType, 'editMode' | 'hideLockedKeys' | 'resolveScopedVariables'> {
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    readOnly: boolean
}

export interface DeploymentTemplateEditorProps {
    editedDocument: string
    uneditedDocument: string
    showDiff: boolean
    readOnly: boolean
}
