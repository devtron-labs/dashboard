import React, { useContext } from 'react'
import { DeploymentConfigContextType, DeploymentTemplateReadOnlyEditorViewProps } from '../types'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { DEPLOYMENT, MODES, ROLLOUT_DEPLOYMENT } from '../../../config'
import { MarkDown } from '../../charts/discoverChartDetail/DiscoverChartDetails'
import { DeploymentConfigContext } from '../DeploymentConfig'
import DeploymentTemplateGUIView from './DeploymentTemplateGUIView'

export default function DeploymentTemplateReadOnlyEditorView({
    value,
    isEnvOverride,
}: DeploymentTemplateReadOnlyEditorViewProps) {
    const { state } = useContext<DeploymentConfigContextType>(DeploymentConfigContext)

    const renderCodeEditor = (): JSX.Element => {
        return (
            <div className="form__row--code-editor-container dc__border-top dc__border-bottom read-only-mode">
                <CodeEditor
                    value={value}
                    mode={MODES.YAML}
                    validatorSchema={state.schema}
                    loading={state.chartConfigLoading || value === undefined || value === null}
                    height={isEnvOverride ? 'calc(100vh - 251px)' : 'calc(100vh - 218px)'}
                    readOnly={true}
                />
            </div>
        )
    }

    return state.yamlMode ||
        (state.selectedChart?.name !== ROLLOUT_DEPLOYMENT && state.selectedChart?.name !== DEPLOYMENT) ? (
        <>
            {state.showReadme && (
                <div className="dt-readme dc__border-right dc__border-bottom-imp">
                    <div className="code-editor__header flex left fs-12 fw-6 cn-9">Readme</div>
                    {state.chartConfigLoading ? (
                        <Progressing pageLoader />
                    ) : (
                        <MarkDown markdown={state.readme} className="dt-readme-markdown" />
                    )}
                </div>
            )}
            {renderCodeEditor()}
        </>
    ) : (
        <DeploymentTemplateGUIView value={value} readOnly={true} />
    )
}
