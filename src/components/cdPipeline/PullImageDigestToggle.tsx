import { Toggle } from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { ReactComponent as DockerWithImage } from '../../assets/icons/ic-docker-with-image.svg'
import { PullImageDigestToggleType } from './types'

function PullImageDigestToggle({ formData, setFormData }: PullImageDigestToggleType): JSX.Element {
    const handleCustomTagToggle = (): void => {
        const _formData = { ...formData }
        _formData.isDigestEnforcedForPipeline = !_formData.isDigestEnforcedForPipeline
        setFormData(_formData)
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
                                Learn more
                            </div>
                        </div>
                    </div>
                    <div className="ic-toggle-dim">
                        <Toggle
                            selected={formData.isDigestEnforcedForPipeline}
                            onSelect={handleCustomTagToggle}
                            dataTestId="create-build-pipeline-image-pull-digest-toggle"
                        />
                    </div>
                </div>
                <hr />
            </div>
        )
    }

    return renderImageDigestBody()
}

export default PullImageDigestToggle
