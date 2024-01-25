import { ConditionalWrap, Toggle } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import Tippy from '@tippyjs/react'
import { ReactComponent as DockerWithImage } from '../../assets/icons/ic-docker-with-image.svg'
import { PullImageDigestToggleType } from './types'
import { DIGEST_DISABLE_TOGGLE_MESSAGE } from '../../config'

function PullImageDigestToggle({ formData, setFormData }: PullImageDigestToggleType): JSX.Element {
    const handleImageDigestToggle = (): void => {
        const _formData = { ...formData }
        _formData.isDigestEnforcedForEnv = !_formData.isDigestEnforcedForEnv
        setFormData(_formData)
    }

    const renderDogestToggle = () => {
        return (
            <ConditionalWrap
                condition={formData.isDigestEnforcedForPipeline}
                wrap={(children) => (
                    <Tippy className="default-tt w-200" content={DIGEST_DISABLE_TOGGLE_MESSAGE}>
                        <div>{children}</div>
                    </Tippy>
                )}
            >
                <div className={`w-32 h-20 ${formData.isDigestEnforcedForPipeline ? 'dc__opacity-0_4' : ''}`}>
                    <Toggle
                        selected={formData.isDigestEnforcedForEnv}
                        onSelect={handleImageDigestToggle}
                        dataTestId="create-build-pipeline-image-pull-digest-toggle"
                        disabled={formData.isDigestEnforcedForEnv}
                    />
                </div>
            </ConditionalWrap>
        )
    }

    const renderImageDigestBody = (): JSX.Element => {
        return (
            <div className="fs-13">
                <div className="flex dc__content-space w-100 cursor flex top">
                    <div className="flex left">
                        <div className="pc-icon-container bcn-1 br-8 mr-16 flexbox">
                            <DockerWithImage className="icon-dim-24" />
                        </div>
                        <div>
                            <span className="fw-6">Pull container image with image digest</span>
                            <div className="cn-7 ">
                                When enabled, image will be pulled with image digest to ensure uniqueness of image.
                            </div>
                        </div>
                    </div>
                    {renderDogestToggle()}
                </div>
                <hr />
            </div>
        )
    }

    return renderImageDigestBody()
}
export default PullImageDigestToggle
