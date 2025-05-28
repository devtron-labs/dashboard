/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Tippy from '@tippyjs/react'

import { ConditionalWrap, Toggle } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as DockerWithImage } from '../../assets/icons/ic-docker-with-image.svg'
import { DIGEST_DISABLE_TOGGLE_MESSAGE_FOR_PIPELINE, DIGEST_DISABLE_TOGGLE_MESSAGE_GLOBAL_ONLY } from '../../config'
import { PullImageDigestToggleType } from './types'

function PullImageDigestToggle({ formData, setFormData }: PullImageDigestToggleType): JSX.Element {
    const handleImageDigestToggle = (): void => {
        const _formData = { ...formData }
        _formData.isDigestEnforcedForPipeline = !_formData.isDigestEnforcedForPipeline
        setFormData(_formData)
    }

    const getContentText = () => {
        let text = ''
        if (formData.isDigestEnforcedForPipeline && formData.isDigestEnforcedForEnv) {
            text = DIGEST_DISABLE_TOGGLE_MESSAGE_FOR_PIPELINE
        } else if (formData.isDigestEnforcedForEnv) {
            text = DIGEST_DISABLE_TOGGLE_MESSAGE_GLOBAL_ONLY
        }
        return text
    }

    const renderDogestToggle = () => (
        <ConditionalWrap
            condition={formData.isDigestEnforcedForEnv}
            wrap={(children) => (
                <Tippy className="default-tt w-200" content={getContentText()}>
                    <div>{children}</div>
                </Tippy>
            )}
        >
            <div className={`w-32 h-20 ${formData.isDigestEnforcedForEnv ? 'dc__opacity-0_4' : ''}`}>
                <Toggle
                    selected={formData.isDigestEnforcedForPipeline || formData.isDigestEnforcedForEnv}
                    onSelect={handleImageDigestToggle}
                    dataTestId="create-build-pipeline-image-pull-digest-toggle"
                    disabled={formData.isDigestEnforcedForEnv}
                />
            </div>
        </ConditionalWrap>
    )

    const renderImageDigestBody = (): JSX.Element => (
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

    return renderImageDigestBody()
}
export default PullImageDigestToggle
