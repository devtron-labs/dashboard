import { CodeEditor, ConfigurationType, MarkDown, MODES, noop } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { DeploymentTemplateFormProps } from './types'
import { GUIView as DeploymentTemplateGUIView } from './GUIView'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from './constants'
import { getEditorSchemaURIFromChartNameAndVersion } from './utils'

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
    environmentName,
    latestDraft,
    isGuiSupported,
    mergeStrategy,
}: DeploymentTemplateFormProps) => {
    if (editMode === ConfigurationType.GUI && isGuiSupported) {
        return (
            <DeploymentTemplateGUIView
                key={`gui-view-${mergeStrategy}`}
                // NOTE: This is with locked keys so original value is passed
                uneditedDocument={uneditedDocument || '{}'}
                editedDocument={editedDocument || '{}'}
                value={editedDocument}
                readOnly={readOnly}
                hideLockedKeys={hideLockedKeys}
                editorOnChange={editorOnChange}
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                isUnSet={isUnSet}
                selectedChart={selectedChart}
                guiSchema={guiSchema}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
                mergeStrategy={mergeStrategy}
            />
        )
    }

    const getHeadingPrefix = (): string => {
        if (latestDraft) {
            return 'Last saved draft'
        }

        if (environmentName) {
            return environmentName
        }

        return DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label
    }

    const renderEditorHeader = () => {
        if (showReadMe) {
            return (
                <CodeEditor.Header className="flex left p-0-imp dc__border-bottom-n1" hideDefaultSplitHeader>
                    <div className="flexbox px-16 py-6 dc__content-space fs-12 fw-6 cn-9 bg__primary">
                        <div className="flexbox w-100 dc__gap-8 dc__align-items-center">
                            <div className="flexbox dc__gap-8 dc__align-items-center">
                                {!readOnly && <ICPencil className="icon-dim-16 dc__no-shrink" />}

                                <span className="cn-9 fs-12 fw-6 lh-20">
                                    {getHeadingPrefix()}
                                    {selectedChart?.version && ` (v${selectedChart.version})`}
                                </span>
                            </div>
                        </div>
                    </div>
                </CodeEditor.Header>
            )
        }

        if (isUnSet) {
            return <CodeEditor.Warning text={DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning} />
        }

        return null
    }

    return (
        <div className={`dc__overflow-scroll flex-grow-1 ${showReadMe ? 'dc__grid-half' : 'flexbox-col'}`}>
            {showReadMe && (
                <div className="flexbox-col dc__border-right dc__overflow-scroll">
                    <div className="flexbox dc__gap-8 bg__primary px-12 py-6 dc__border-bottom-n1 flex left py-6">
                        <ICBookOpen className="icon-dim-16 dc__no-shrink scn-9" />
                        <span className="fs-12 fw-6 cn-9 lh-20">{`Readme ${selectedChart ? `(v${selectedChart.version})` : ''}`}</span>
                    </div>

                    <MarkDown markdown={readMe} className="dc__overflow-scroll" />
                </div>
            )}

            <div className="flexbox-col dc__overflow-scroll flex-grow-1">
                <CodeEditor
                    isCodeMirror
                    value={editedDocument}
                    schemaURI={getEditorSchemaURIFromChartNameAndVersion(selectedChart?.name, selectedChart?.version)}
                    onChange={readOnly ? noop : editorOnChange}
                    mode={MODES.YAML}
                    validatorSchema={schema}
                    readOnly={readOnly}
                    noParsing
                    height="100%"
                >
                    {renderEditorHeader()}
                </CodeEditor>
            </div>
        </div>
    )
}

export default DeploymentTemplateForm
