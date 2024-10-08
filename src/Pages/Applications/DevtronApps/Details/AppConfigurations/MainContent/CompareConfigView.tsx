import { importComponentFromFELibrary } from '@Components/common'
import { ReactComponent as ICCheck } from '@Icons/ic-check.svg'
import { ReactComponent as ICFileEdit } from '@Icons/ic-file-edit.svg'
import { DeploymentHistoryDiffView } from '@devtron-labs/devtron-fe-common-lib'
import { CompareConfigViewProps } from './types'

const CompareFromApprovalSelector = importComponentFromFELibrary('CompareFromApprovalSelector', null, 'function')

const CompareConfigView = ({
    compareFromSelectedOptionValue,
    handleCompareFromOptionSelection,
    isApprovalView,
    currentEditorConfig,
    currentEditorTemplate,
    publishedEditorConfig,
    publishedEditorTemplate,
    selectedChartVersion,
    draftChartVersion,
    isDeleteOverrideView,
    editorKey = `${compareFromSelectedOptionValue || 'compare'}-draft-editor-key`,
    className = '',
}: CompareConfigViewProps) => (
    <div className={`flexbox-col ${className ?? ''}`}>
        <div className="dc__grid-half bcn-0 dc__position-sticky dc__top-0 dc__zi-10">
            <div className="dc__border-right px-12 py-6 flexbox dc__gap-8 dc__border-bottom dc__align-items-center">
                <ICCheck className="scn-9 icon-dim-16 dc__no-shrink" />
                <span className="cn-9 fs-12 fw-6 lh-20">Published</span>
            </div>

            <div className="px-12 py-6 dc__gap-8 dc__border-bottom flexbox dc__align-items-center">
                {isApprovalView && CompareFromApprovalSelector ? (
                    <CompareFromApprovalSelector
                        selectedOptionValue={compareFromSelectedOptionValue}
                        handleCompareFromOptionSelection={handleCompareFromOptionSelection}
                        draftChartVersion={draftChartVersion || ''}
                        currentEditorChartVersion={selectedChartVersion || ''}
                        isDeleteOverrideView={isDeleteOverrideView}
                    />
                ) : (
                    <>
                        <ICFileEdit className="scn-9 icon-dim-16 dc__no-shrink" />
                        <span className="cn-9 fs-12 fw-6 lh-20">Unsaved draft</span>
                    </>
                )}
            </div>
        </div>

        <DeploymentHistoryDiffView
            key={editorKey}
            currentConfiguration={{
                codeEditorValue: {
                    displayName: 'Data',
                    ...(publishedEditorTemplate && { value: JSON.stringify(publishedEditorTemplate) }),
                },
                values: publishedEditorConfig,
            }}
            baseTemplateConfiguration={{
                codeEditorValue: {
                    displayName: '',
                    ...(currentEditorTemplate && { value: JSON.stringify(currentEditorTemplate) }),
                },
                values: currentEditorConfig,
            }}
            previousConfigAvailable
        />
    </div>
)

export default CompareConfigView
