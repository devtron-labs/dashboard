import { CodeEditor, ConfigurationType, MarkDown, MODES, noop } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { DeploymentTemplateFormProps } from './types'
import DeploymentTemplateEditorHeader from './DeploymentTemplateEditorHeader'
import { DeploymentTemplateGUIView } from './GUIView'

const DeploymentTemplateForm = ({
    editMode,
    hideLockedKeys,
    lockedConfigKeysWithLockType,
    readOnly,
    selectedChart,
    guiSchema,
    schema,
    isUnSet,
    handleChangeToYAMLMode,
    editorOnChange,
    editedDocument,
    uneditedDocument,
    showReadMe,
    readMe,
    isOverridden,
    environmentName,
    latestDraft,
    isPublishedValuesView,
    handleOverride,
}: DeploymentTemplateFormProps) => {
    // TODO: Have to add check for isGUISupported - since not showing this option in inherited mode
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
                selectedChart={selectedChart}
                guiSchema={guiSchema}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
            />
        )
    }

    // TODO: re-look into css
    return (
        <div className={`dc__overflow-scroll flex-grow-1 ${showReadMe ? 'dc__grid-half' : 'flexbox-col'}`}>
            {showReadMe && (
                <div className="flexbox-col dc__border-right dc__border-bottom dc__overflow-scroll">
                    <div className="flexbox dc__gap-8 bcn-0 px-12 py-6 dc__border-bottom flex left py-6">
                        <ICBookOpen className="icon-dim-16 dc__no-shrink scn-9" />
                        <span className="fs-12 fw-6 cn-9 lh-20">{`Readme ${selectedChart ? `(v${selectedChart.version})` : ''}`}</span>
                    </div>

                    <MarkDown markdown={readMe} className="dc__overflow-scroll" />
                </div>
            )}

            <div className="flexbox-col dc__overflow-scroll flex-grow-1">
                <CodeEditor
                    value={editedDocument}
                    chartVersion={selectedChart?.version.replace(/\./g, '-')}
                    onChange={readOnly ? noop : editorOnChange}
                    mode={MODES.YAML}
                    validatorSchema={schema}
                    readOnly={readOnly}
                    noParsing
                    height="100%"
                >
                    <DeploymentTemplateEditorHeader
                        showReadMe={showReadMe}
                        isCompareView={false}
                        readOnly={readOnly}
                        isUnSet={isUnSet}
                        selectedChartVersion={selectedChart?.version || ''}
                        isOverridden={isOverridden}
                        handleOverride={handleOverride}
                        // Since compare view is not here, we can only pass check for isPublishedValuesView
                        showOverrideButton={!isPublishedValuesView}
                        environmentName={environmentName}
                        latestDraft={latestDraft}
                    />
                </CodeEditor>
            </div>
        </div>
    )
}

export default DeploymentTemplateForm
