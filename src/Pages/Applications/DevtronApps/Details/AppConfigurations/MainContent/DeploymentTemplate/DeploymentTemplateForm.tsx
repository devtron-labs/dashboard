import { CodeEditor, ConfigurationType, MarkDown, MODES, noop } from '@devtron-labs/devtron-fe-common-lib'
import DeploymentTemplateGUIView from '@Components/deploymentConfig/DeploymentTemplateView/DeploymentTemplateGUIView'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '@Components/deploymentConfig/constants'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { DeploymentTemplateFormProps } from './types'

const DeploymentTemplateForm = ({
    editMode,
    hideLockedKeys,
    lockedConfigKeysWithLockType,
    readOnly,
    selectedChart,
    guiSchema,
    schema,
    isUnSet,
    wasGuiOrHideLockedKeysEdited,
    handleEnableWasGuiOrHideLockedKeysEdited,
    handleChangeToYAMLMode,
    editorOnChange,
    editedDocument,
    uneditedDocument,
    showReadMe,
    readMe,
}: DeploymentTemplateFormProps) => {
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
                wasGuiOrHideLockedKeysEdited={wasGuiOrHideLockedKeysEdited}
                handleEnableWasGuiOrHideLockedKeysEdited={handleEnableWasGuiOrHideLockedKeysEdited}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
                rootClassName="flexbox-col flex-grow-1"
            />
        )
    }

    // TODO: Relook into css
    return (
        <div className={showReadMe ? 'dc__grid-half dc__overflow-scroll flex-grow-1' : 'flexbox-col flex-grow-1'}>
            {showReadMe && (
                <div className="flexbox-col dc__border-right dc__border-bottom dc__overflow-scroll">
                    <div className="code-editor__header flex left fs-12 fw-6 cn-9">
                        {`Readme ${selectedChart ? `(v${selectedChart.version})` : ''}`}
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
                    {isUnSet && !showReadMe && (
                        <CodeEditor.Warning text={DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning} />
                    )}

                    {/* TODO: Should be a common component */}
                    {showReadMe && (
                        <CodeEditor.Header className=" flex left p-0-imp dc__border-bottom" hideDefaultSplitHeader>
                            <div className="flex fs-12 fw-6 cn-9 pl-12 pr-12 w-100 bcn-1">
                                <div className="flexbox dc__content-space w-100 dc__gap-8 dc__align-items-center">
                                    <div className="flexbox dc__gap-8 dc__align-items-center">
                                        {!readOnly && <ICPencil className="icon-dim-16 dc__no-shrink" />}

                                        {/* FIXME: In case of draft and override would be different */}
                                        {selectedChart && (
                                            <span className="cn-9 fs-12 fw-6 lh-20">
                                                Base deployment template (v{selectedChart.version})
                                            </span>
                                        )}
                                    </div>
                                    {/* TODO: Add override */}
                                </div>
                            </div>
                        </CodeEditor.Header>
                    )}
                </CodeEditor>
            </div>
        </div>
    )
}

export default DeploymentTemplateForm
