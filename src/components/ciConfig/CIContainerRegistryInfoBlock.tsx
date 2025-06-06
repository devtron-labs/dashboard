import { generatePath, Link } from 'react-router-dom'

import { Button, ButtonVariantType, InfoBlock, URLS } from '@devtron-labs/devtron-fe-common-lib'

import { Routes } from '@Config/constants'

import { ReactComponent as ArrowIcon } from '../../assets/icons/ic-arrow-left.svg'
import { CIContainerRegistryInfoBlockProps } from './types'

export const CIContainerRegistryInfoBlock = ({
    configOverriddenPipelines,
    toggleConfigOverrideDiffModal,
    isCDPipeline,
    isTemplateView,
    appId,
    onClickRedirectLink,
}: CIContainerRegistryInfoBlockProps) => {
    const configOverriddenPipelineCount = configOverriddenPipelines?.length

    return (
        <InfoBlock
            description={
                configOverriddenPipelineCount > 0 ? (
                    <div className="flexbox">
                        <span className="fw-6">Overrides:</span>&nbsp;
                        <span className="mr-4">This configuration is overridden for build pipeline of</span>
                        <Button
                            onClick={toggleConfigOverrideDiffModal}
                            dataTestId="info-bar-redirectLink"
                            variant={ButtonVariantType.text}
                            endIcon={<ArrowIcon className="icon-dim-16 fcb-5 dc__flip-180" />}
                            text={`${configOverriddenPipelineCount} Workflow${configOverriddenPipelineCount > 1 ? 's' : ''}`}
                        />
                    </div>
                ) : (
                    <div className="flexbox">
                        <span className="fw-6">Overrides:</span>&nbsp;
                        <span>Container registry & docker file location for build pipelines can be overridden.</span>
                        &nbsp;
                        {isCDPipeline && (
                            <Link
                                to={`${
                                    isTemplateView
                                        ? generatePath(URLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP_DETAIL, {
                                              appId,
                                          })
                                        : `/${Routes.APP}/${appId}`
                                }/${Routes.WORKFLOW_EDITOR}`}
                                onClick={onClickRedirectLink}
                            >
                                Take me there
                            </Link>
                        )}
                    </div>
                )
            }
        />
    )
}
