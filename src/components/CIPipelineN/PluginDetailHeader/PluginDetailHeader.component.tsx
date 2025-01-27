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

import { useContext } from 'react'
import {
    TippyCustomized,
    TippyTheme,
    PluginTagsContainer,
    PluginImageContainer,
    PluginDetailType,
    PluginType,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'
import { pipelineContext } from '@Components/workflowEditor/workflowEditor'
import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { ReactComponent as ICHelp } from '@Icons/ic-help.svg'
import { ReactComponent as ICCDStage } from '@Icons/ic-cd-stage.svg'
import { DOCUMENTATION } from '@Config/constants'
import PluginVersionSelect from './PluginVersionSelect'
import CreatePluginButton from './CreatePluginButton'
import { PluginDetailHeaderProps } from '../types'
import { INLINE_PLUGIN_TEXT } from '../Constants'

const PluginDetailHeader = ({ handlePluginVersionChange }: PluginDetailHeaderProps) => {
    const { formData, activeStageName, selectedTaskIndex, pluginDataStore } = useContext(pipelineContext)
    const { stepType } = formData[activeStageName].steps[selectedTaskIndex]

    const getPluginDetails = (): Pick<PluginDetailType, 'name' | 'description' | 'icon' | 'tags' | 'docLink'> => {
        if (stepType !== PluginType.PLUGIN_REF) {
            return {
                name: INLINE_PLUGIN_TEXT.TITLE,
                description: INLINE_PLUGIN_TEXT.DESCRIPTION,
                icon: '',
                tags: [],
                docLink: DOCUMENTATION.EXECUTE_CUSTOM_SCRIPT,
            }
        }
        const selectedPluginId = formData[activeStageName].steps[selectedTaskIndex].pluginRefStepDetail.pluginId
        const { icon, name, description, tags, docLink } = pluginDataStore.pluginVersionStore[selectedPluginId]
        return { name, description, icon, tags, docLink }
    }

    const { name, description, icon, tags, docLink } = getPluginDetails()

    const renderPluginImageContainer = (): JSX.Element => {
        if (stepType === PluginType.INLINE) {
            return <ICCDStage className="dc__no-shrink icon-dim-24 p-2" />
        }

        return (
            <PluginImageContainer
                fallbackImageClassName="icon-dim-24 p-2"
                imageProps={{
                    src: icon,
                    alt: name,
                    width: 24,
                    height: 24,
                    className: 'p-2 dc__no-shrink',
                }}
            />
        )
    }

    return (
        <div className="flexbox dc__align-items-center dc__content-space py-10 px-20 dc__border-bottom-n1">
            <div className="flexbox dc__gap-8 dc__align-items-center">
                {renderPluginImageContainer()}
                <Tooltip content={name}>
                    <h4 className="cn-9 fs-13 fw-4 lh-24 dc__truncate dc__mxw-180 m-0">{name}</h4>
                </Tooltip>

                {stepType === PluginType.PLUGIN_REF && (
                    <>
                        <span className="fs-13 cn-7 lh-20">/</span>
                        <PluginVersionSelect handlePluginVersionChange={handlePluginVersionChange} />
                    </>
                )}
            </div>

            <div className="flexbox dc__align-items-center dc__gap-8">
                {stepType === PluginType.INLINE && <CreatePluginButton />}

                <TippyCustomized
                    theme={TippyTheme.white}
                    Icon={ICHelp}
                    className="w-300"
                    heading={name}
                    infoText={description}
                    additionalContent={
                        <PluginTagsContainer tags={tags} rootClassName={`px-12 ${description ? 'pb-12' : 'py-12'}`} />
                    }
                    iconClass="fcv-5"
                    showCloseButton
                    trigger="click"
                    interactive
                    documentationLink={docLink}
                    documentationLinkText="View documentation"
                >
                    <button
                        type="button"
                        className="p-0 dc__no-background dc__no-border dc__outline-none-imp flex dc__tab-focus icon-dim-24"
                        aria-label="Info Icon"
                    >
                        <ICBookOpen className="dc__no-shrink icon-dim-16 scn-6" />
                    </button>
                </TippyCustomized>
            </div>
        </div>
    )
}

export default PluginDetailHeader
