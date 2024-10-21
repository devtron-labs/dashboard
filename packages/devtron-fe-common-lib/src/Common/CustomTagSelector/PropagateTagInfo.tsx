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

import React from 'react'
import { ReactComponent as InjectTag } from '../../Assets/Icon/inject-tag.svg'
import { ReactComponent as ICHelpOutline } from '../../Assets/Icon/ic-help-outline.svg'
import { TippyCustomized } from '../TippyCustomized'
import { TippyTheme } from '../Types'
import { DOCUMENTATION } from '../Constants'

export default function PropagateTagInfo({ isCreateApp }: { isCreateApp: boolean }) {
    const additionalInfo = () => (
        <div className="p-12 fs-13">
            <div className="mb-20">
                <span className="flex left">
                    Add a tag and click on the
                    <InjectTag className="icon-dim-16 ml-4 mr-4" />
                    icon to
                </span>
                propagate tags as labels to Kubernetes resources
            </div>
            <div>Use these tags to filter/identify resources via CLI or in other Kubernetes tools.</div>
        </div>
    )
    return (
        <TippyCustomized
            theme={TippyTheme.white}
            className="w-300"
            placement="top"
            Icon={InjectTag}
            heading="Propagate tags to K8s resources"
            infoText=""
            additionalContent={additionalInfo()}
            showCloseButton
            trigger="click"
            interactive
            documentationLink={isCreateApp ? DOCUMENTATION.APP_TAGS : DOCUMENTATION.APP_OVERVIEW_TAGS}
            documentationLinkText="View Documentation"
        >
            <div className="flexbox cursor">
                <InjectTag className="icon-dim-16 mt-2 mr-4" />
                <span>Propagate tags</span>
                <ICHelpOutline className="icon-dim-16 mt-2 ml-4" />
            </div>
        </TippyCustomized>
    )
}
