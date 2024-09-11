import {
    CodeEditor,
    ConfigurationType,
    DeploymentTemplateTabsType,
    MODES,
    noop,
} from '@devtron-labs/devtron-fe-common-lib'
import DeploymentTemplateGUIView from '@Components/deploymentConfig/DeploymentTemplateView/DeploymentTemplateGUIView'
import { DeploymentTemplateFormProps } from './types'

const DeploymentTemplateForm = ({
    editMode,
    hideLockedKeys,
    lockedConfigKeysWithLockType,
    readOnly,
    selectedTab,
    currentEditorTemplateData,
    isUnSet,
    wasGuiOrHideLockedKeysEdited,
    handleEnableWasGuiOrHideLockedKeysEdited,
    handleChangeToYAMLMode,
    editorOnChange,
    editedDocument,
    uneditedDocument,
}: DeploymentTemplateFormProps) => {
    if (selectedTab === DeploymentTemplateTabsType.COMPARE) {
        // TODO: Implement compare view
        return null
    }

    if (editMode === ConfigurationType.GUI) {
        return (
            <DeploymentTemplateGUIView
                // NOTE: This is with locked keys so original value is passed
                uneditedDocument={uneditedDocument}
                editedDocument={editedDocument}
                value={editedDocument}
                readOnly={readOnly}
                hideLockedKeys={hideLockedKeys}
                editorOnChange={editorOnChange}
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                isUnSet={isUnSet}
                selectedChart={currentEditorTemplateData.selectedChart}
                guiSchema={currentEditorTemplateData.guiSchema}
                wasGuiOrHideLockedKeysEdited={wasGuiOrHideLockedKeysEdited}
                handleEnableWasGuiOrHideLockedKeysEdited={handleEnableWasGuiOrHideLockedKeysEdited}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
                rootClassName="flexbox-col flex-grow-1"
            />
        )
    }

    return (
        <CodeEditor
            defaultValue={uneditedDocument}
            value={editedDocument}
            chartVersion={currentEditorTemplateData.selectedChart?.version.replace(/\./g, '-')}
            onChange={readOnly ? noop : editorOnChange}
            mode={MODES.YAML}
            validatorSchema={currentEditorTemplateData.schema}
            // TODO: Can look into this
            diffView={false}
            readOnly={readOnly}
            noParsing
            height="100%"
        />
    )
}

export default DeploymentTemplateForm
