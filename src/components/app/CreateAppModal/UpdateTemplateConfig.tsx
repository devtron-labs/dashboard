import { noop } from '@devtron-labs/devtron-fe-common-lib'
import { UpdateMaterial } from '@Components/material/UpdateMaterial'
import CIContainerRegistryConfig from '@Components/ciConfig/CIContainerRegistryConfig'
import { CIFormStateOptionType } from '@Components/ciConfig/types'
import { UpdateTemplateConfigProps } from './types'

const UpdateTemplateConfig = ({ formState, isJobView }: UpdateTemplateConfigProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const x = 1

    return (
        <>
            <div className="divider__secondary--horizontal" />
            <div>
                <UpdateMaterial
                    appId={formState.templateId}
                    isMultiGit={false}
                    preventRepoDelete={false}
                    providers={[]}
                    material={{
                        id: 1,
                        name: 'some-name',
                        gitProvider: { id: 1, name: 'some-name' },
                        url: 'https://www.devtron.ai',
                        checkoutPath: '',
                        active: true,
                        fetchSubmodules: false,
                    }}
                    refreshMaterials={noop}
                    isGitProviderValid={noop}
                    isCheckoutPathValid={noop}
                    isWorkflowEditorUnlocked={false}
                    reload={noop}
                    toggleRepoSelectionTippy={noop}
                    setRepo={noop}
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
