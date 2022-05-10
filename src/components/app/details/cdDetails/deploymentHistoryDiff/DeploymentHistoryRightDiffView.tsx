import React from 'react'
import CodeEditor from '../../../../CodeEditor/CodeEditor'
import { DeploymentTemplateHistoryType } from '../cd.type'
import YAML from 'yaml'
import { Progressing } from '../../../../common'

export default function DeploymentHistoryRightDiffView({
    currentConfiguration,
    baseTemplateConfiguration,
    codeEditorLoading,
}: DeploymentTemplateHistoryType) {
    const renderDeploymentDiffViaCodeEditor = () => {
        return codeEditorLoading ? (
            <div className="w-100 flex" style={{ minHeight: '500px' }}>
                <Progressing pageLoader />
            </div>
        ) : (
            <>
                {baseTemplateConfiguration?.template && currentConfiguration?.template && (
                    <CodeEditor
                        value={YAML.stringify(JSON.parse(baseTemplateConfiguration.template))}
                        defaultValue={currentConfiguration.template}
                        height={600}
                        mode="yaml"
                        diffView={true}
                        readOnly={true}
                        loading={codeEditorLoading}
                    ></CodeEditor>
                )}
            </>
        )
    }
    return (
        <div>
            <div className="en-2 bw-1 br-4 deployment-diff__upper bcn-0 mt-20 mb-16 mr-20 ml-20 pt-2 pb-2">
                {Object.keys(currentConfiguration || {}).map((config) => {
                    if (config === 'template') return <></>
                    const changeBGColor = currentConfiguration[config] !== baseTemplateConfiguration[config]
                    const titleStyle = 'cn-6 pt-8 pl-16 pr-16 lh-16'
                    const descriptionStyle = 'cn-9 fs-13 pb-8 pl-16 pr-16 lh-20 mh-28'
                    const baseTemplateBGStyle = changeBGColor ? ' bcg-1' : ''
                    const currentTemplateBGStyle = changeBGColor ? ' bcr-1' : ''
                    return (
                        <>
                            <div className={`${titleStyle} ${baseTemplateBGStyle}`}>{config}</div>
                            <div className={`${titleStyle} ${currentTemplateBGStyle}`}>{config}</div>
                            <div className={`${descriptionStyle} ${baseTemplateBGStyle}`}>
                                {currentConfiguration[config] + ''}
                            </div>
                            <div className={`${descriptionStyle} ${currentTemplateBGStyle}`}>
                                {baseTemplateConfiguration[config] + ''}
                            </div>
                        </>
                    )
                })}
            </div>

            <div className=" form__row form__row--code-editor-container en-2 bw-1 br-4 mb-20 mr-20 ml-20">
                <div className="code-editor-header-value pl-16 pr-16 pt-12 pb-12 fs-13 fw-6 cn-9 bcn-0">
                    values.yaml
                </div>
                {renderDeploymentDiffViaCodeEditor()}
            </div>
        </div>
    )
}
