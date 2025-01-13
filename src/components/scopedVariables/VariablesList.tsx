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
import Tippy from '@tippyjs/react'
import { GenericFilterEmptyState, Grid } from '@devtron-labs/devtron-fe-common-lib'
import { VariableType, VariablesListItemProps } from './types'
import {
    TABLE_LIST_HEADINGS,
    NO_DESCRIPTION_MESSAGE,
    SENSITIVE_VARIABLE_DESCRIPTION,
    IN_SENSITIVE_VARIABLE_DESCRIPTION,
} from './constants'
import { ReactComponent as ICVisibilityOn } from '../../assets/icons/ic-visibility-on.svg'
import { ReactComponent as ICVisibilityOff } from '../../assets/icons/ic-visibility-off.svg'

export default function VariablesList({ variablesList, handleClearFilters }: { variablesList: VariableType[], handleClearFilters: () => void }) {
    const renderVariablesListItem = ({ data, classes, tooltip }: VariablesListItemProps) => (
        <div className={classes}>
            {tooltip ? (
                <Tippy
                    content={data?.length ? data : NO_DESCRIPTION_MESSAGE}
                    className="default-tt dc__word-break-all"
                    placement="top"
                >
                    {data?.length ? (
                        <p data-testid={data} className="dc__ellipsis-right cn-9 fs-13 fw-4 lh-20 m-0">
                            {data}
                        </p>
                    ) : (
                        <i className="dc__ellipsis-right cn-9 fs-13 fw-4 lh-20 m-0">{NO_DESCRIPTION_MESSAGE}</i>
                    )}
                </Tippy>
            ) : (
                <p className="dc__ellipsis-right cn-7 fs-12 fw-6 lh-20 m-0 dc__uppercase">{data}</p>
            )}
        </div>
    )

    if (!variablesList?.length) {
        return <GenericFilterEmptyState handleClearFilters={handleClearFilters} />
    }

    return (
        <div className="dc__overflow-scroll h-100 flex column dc__content-start dc__align-start bg__primary dc__align-self-stretch flex-grow-1 dc__no-shrink">
            <Grid container spacing={0} containerClass="w-100">
                <Grid item xs={3} itemClass="dc__ellipsis-right">
                    {renderVariablesListItem({
                        data: TABLE_LIST_HEADINGS[0],
                        classes: 'pt-8 pb-8 pl-20 pr-20 flexbox dc__align-items-center',
                    })}
                </Grid>

                <Grid item xs={8} itemClass="dc__ellipsis-right">
                    {renderVariablesListItem({
                        data: TABLE_LIST_HEADINGS[1],
                        classes: 'pt-8 pb-8 pl-20 pr-20 flexbox dc__align-items-center',
                    })}
                </Grid>

                <Grid item xs={1} itemClass="dc__ellipsis-right dc__content-start">
                    {renderVariablesListItem({
                        data: TABLE_LIST_HEADINGS[2],
                        classes: 'pt-8 pb-8 flexbox dc__align-items-center',
                    })}
                </Grid>

                {variablesList?.map((variable) => (
                    <Grid
                        container
                        spacing={0}
                        containerClass="w-100 dc__overflow-hidden dc__hover-n50"
                        key={variable.name}
                    >
                        <Grid item xs={3} itemClass="dc__ellipsis-right">
                            {renderVariablesListItem({
                                data: variable.name,
                                classes: 'pt-12 pb-12 pl-20 pr-20 flexbox dc__align-items-center dc__border-bottom-n1',
                                tooltip: true,
                            })}
                        </Grid>

                        <Grid item xs={8} itemClass="dc__ellipsis-right">
                            {renderVariablesListItem({
                                data: variable.description,
                                classes: 'pt-12 pb-12 pl-20 pr-20 flexbox dc__align-items-center dc__border-bottom-n1',
                                tooltip: true,
                            })}
                        </Grid>

                        <Grid item xs={1} itemClass="flex center dc__border-bottom-n1 dc__content-start">
                            {variable.isSensitive ? (
                                <Tippy
                                    content={<div className="dc__mxw-200">{SENSITIVE_VARIABLE_DESCRIPTION}</div>}
                                    className="default-tt"
                                    placement="left"
                                >
                                    {/* Some bug in tippy i have to wrap it in div otherwise outline comes */}
                                    <div className="flex center dc__content-start">
                                        <ICVisibilityOff
                                            className="icon-dim-20 scn-6"
                                            data-testid="visibility-off"
                                        />
                                    </div>
                                </Tippy>
                            ) : (
                                <Tippy
                                    content={<div className="dc__mxw-200">{IN_SENSITIVE_VARIABLE_DESCRIPTION}</div>}
                                    className="default-tt"
                                    placement="left"
                                >
                                    <div className="flex center dc__content-start">
                                        <ICVisibilityOn className="icon-dim-20 scn-6 dc__no-shrink" data-testid="visibility-on" />
                                    </div>
                                </Tippy>
                            )}
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}
