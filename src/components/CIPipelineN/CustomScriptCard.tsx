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
import { ComponentSizeType, DocLink, Icon, stopPropagation } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICCDStage } from '@Icons/ic-cd-stage.svg'

import { INLINE_PLUGIN_TEXT } from './Constants'

const CustomScriptCard = () => (
    <div
        data-testid="execute-custom-script-button"
        className="p-12 cursor flexbox dc__gap-16 plugin-card dc__visible-hover dc__visible-hover--parent dc__border-transparent dc__hover-border-n1 br-4"
    >
        <ICCDStage className="dc__no-shrink icon-dim-40 p-8 bg__secondary br-8" />

        <div className="flexbox-col dc__gap-2 w-100">
            <div className="flexbox dc__gap-6 w-100 dc__align-start dc__content-space">
                <div className="flexbox dc__gap-4">
                    <h4 className="m-0 dc__truncate cn-9 fs-13 fw-6 lh-20 plugin-card__title">
                        {INLINE_PLUGIN_TEXT.TITLE}
                    </h4>
                </div>

                <div className="flexbox dc__gap-4 dc__visible-hover--child dc__align-items-center">
                    <DocLink
                        dataTestId="custom-script-documentation"
                        docLinkKey="EXECUTE_CUSTOM_SCRIPT"
                        startIcon={<Icon name="ic-book-open" color={null} />}
                        size={ComponentSizeType.xs}
                        onClick={stopPropagation}
                        openInNewTab
                    />
                </div>
            </div>

            {/* Plugin description */}
            <p className="m-0 cn-7 fs-12 fw-4 lh-16 dc__truncate--clamp-3">{INLINE_PLUGIN_TEXT.DESCRIPTION}</p>
        </div>
    </div>
)

export default CustomScriptCard
