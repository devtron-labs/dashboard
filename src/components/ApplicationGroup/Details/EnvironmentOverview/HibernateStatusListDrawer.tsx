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

import React, { useEffect } from 'react'
import {
    Drawer,
    GenericEmptyState,
    ImageType,
    InfoColourBar,
    Progressing,
    usePrompt,
} from '@devtron-labs/devtron-fe-common-lib'
import { Prompt } from 'react-router-dom'
import { HibernateStatusRow } from './HibernateStatusRow'
import { DEFAULT_ROUTE_PROMPT_MESSAGE } from '../../../../config'
import { ReactComponent as Close } from '../../../../assets/icons/ic-cross.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as MechanicalOperation } from '../../../../assets/img/ic-mechanical-operation.svg'

export default function HibernateStatusListDrawer({
    closePopup,
    responseList,
    envName,
    getAppListData,
    showHibernateStatusDrawer,
    hibernateInfoMap,
    isDeploymentWindowLoading,
}) {
    const { hibernationOperation: isHibernating, inProgress: isHibernationStatusLoading } = showHibernateStatusDrawer

    usePrompt({ shouldPrompt: isHibernationStatusLoading })

    useEffect(() => {
        return () => {
            getAppListData().then(() => {})
        }
    }, [])

    const renderHeaderSection = (): JSX.Element => {
        return (
            <div className="flex flex-align-center flex-justify dc__border-bottom bg__primary pt-16 pr-20 pb-16 pl-20">
                <h2 className="fs-16 fw-6 lh-1-43 m-0">
                    {isHibernating ? 'Hibernate applications' : 'Unhibernate applications'}
                </h2>
                <button
                    type="button"
                    className="dc__transparent flex icon-dim-24"
                    onClick={closePopup}
                    disabled={isHibernationStatusLoading}
                >
                    <Close className="icon-dim-24" />
                </button>
            </div>
        )
    }

    const renderBody = (): JSX.Element => {
        if (isHibernationStatusLoading) {
            return (
                <>
                    <GenericEmptyState
                        classname="dc__text-center"
                        title={`Initiating ${isHibernating ? 'hibernation' : 'unhibernation'} for selected application(s) on ${envName}`}
                        subTitle="It might take some time depending upon the number of applications"
                        SvgImage={MechanicalOperation}
                        imageType={ImageType.Large}
                    >
                        <InfoColourBar
                            message={DEFAULT_ROUTE_PROMPT_MESSAGE}
                            classname="warn cn-9 lh-2 w-100 dc__align-left"
                            Icon={Error}
                            iconClass="warning-icon icon-dim-20-imp"
                            iconSize={20}
                        />
                    </GenericEmptyState>

                    <Prompt when message={DEFAULT_ROUTE_PROMPT_MESSAGE} />
                </>
            )
        }

        if (isDeploymentWindowLoading) {
            return <Progressing pageLoader />
        }

        return (
            <>
                <div className="response-list-container bg__primary dc__height-inherit dc__overflow-auto pr-20 pb-16 pl-20">
                    <div
                        className="dc__position-sticky fs-12 fw-6 cn-7 dc__top-0 bg__primary dc__border-bottom response-row dc__border-bottom pt-24 pb-8 dc__uppercase"
                        style={{ zIndex: 1 }}
                    >
                        <div>Application</div>
                        <div>Status</div>
                        <div>Message</div>
                    </div>
                    {responseList.map((response, index) => (
                        <HibernateStatusRow
                            key={response.id}
                            rowData={response}
                            index={index}
                            isHibernateOperation={isHibernating}
                            hibernateInfoMap={hibernateInfoMap}
                        />
                    ))}
                </div>
                <div className="dc__border-top flex bg__primary pt-16 pr-20 pb-16 pl-20 dc__position-fixed dc__bottom-0 env-modal-width right">
                    <button className="cta cancel flex h-36" data-testid="close-popup" onClick={closePopup}>
                        Close
                    </button>
                </div>
            </>
        )
    }

    return (
        <Drawer position="right" width="75%" minWidth="1024px" maxWidth="1200px">
            <div className="bg__tertiary h-100 bulk-ci-trigger-container">
                {renderHeaderSection()}
                {renderBody()}
            </div>
        </Drawer>
    )
}
