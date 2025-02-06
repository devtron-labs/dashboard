import { noop } from '@devtron-labs/devtron-fe-common-lib'
import CIContainerRegistryConfig from '@Components/ciConfig/CIContainerRegistryConfig'
import { CIFormStateOptionType } from '@Components/ciConfig/types'
import MaterialList from '@Components/material/MaterialList'
import { UpdateTemplateConfigProps } from './types'

const UpdateTemplateConfig = ({ formState, isJobView }: UpdateTemplateConfigProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const x = 1

    return (
        <>
            <div className="divider__secondary--horizontal" />
            <div className="br-8 border__secondary bg__primary p-20 flexbox-col dc__gap-16">
                <h4 className="fs-14 fw-6 lh-20 cn-9 m-0">Code Source</h4>
                <MaterialList
                    isCreateAppView
                    respondOnSuccess={noop}
                    isWorkflowEditorUnlocked
                    toggleRepoSelectionTippy={noop}
                    setRepo={noop}
                    appId="1"
                    isJobView={isJobView}
                />
            </div>
            <div>
                <CIContainerRegistryConfig
                    appId={formState.templateId?.toString()}
                    configOverrideView={false}
                    ciConfig={{
                        id: 1,
                        appId: formState.templateId,
                        dockerRegistry: '',
                        dockerRepository: '',
                        ciBuildConfig: null,
                        ciPipelines: [],
                        appName: formState.name,
                        version: null,
                        materials: [],
                        scanEnabled: false,
                        appWorkflowId: 0,
                    }}
                    allowOverride={false}
                    configOverridenPipelines={[]}
                    toggleConfigOverrideDiffModal={noop}
                    updateDockerConfigOverride={noop}
                    dockerRegistries={[]}
                    registry={{} as CIFormStateOptionType}
                    repository_name={{} as CIFormStateOptionType}
                    currentRegistry={{}}
                    handleOnChangeConfig={noop}
                    isCDPipeline={false}
                />
            </div>
        </>
    )
}

export default UpdateTemplateConfig
