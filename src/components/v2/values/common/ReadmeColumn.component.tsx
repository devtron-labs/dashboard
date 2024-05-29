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
import ReactGA from 'react-ga4'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { DropdownIcon, Page } from '../../../common'
import { MarkDown } from '../../../charts/discoverChartDetail/DiscoverChartDetails'
import '../../../charts/modal/DeployChart.scss'
import MessageUI, { MsgUIType } from '../../common/message.ui'

const ReadmeColumn = ({ readmeCollapsed, toggleReadmeCollapsed, readme, loading = false, ...props }) => {
    return (
        <div className="deploy-chart__readme-column">
            {loading && (
                <div {...(readmeCollapsed && { style: { width: '0' } })}>
                    <Progressing pageLoader />
                </div>
            )}
            {!loading && !readme && (
                <MessageUI
                    icon={MsgUIType.ERROR}
                    msg="Readme is not available for the selected chart version"
                    size={16}
                    theme="light-gray"
                    iconClassName="no-readme-icon"
                    msgStyle={{ color: 'var(--N700)', marginTop: '0' }}
                    {...(readmeCollapsed && { bodyStyle: { width: '0' } })}
                />
            )}
            {!loading && readme && <MarkDown markdown={readme} className="deploy-chart__readme-markdown" />}
            <aside
                className="flex column"
                onClick={
                    readme
                        ? (e) => {
                              if (readmeCollapsed) {
                                  ReactGA.event({
                                      category: 'DeployChart',
                                      action: 'Readme Expands',
                                      label: '',
                                  })
                              }
                              toggleReadmeCollapsed((t) => !t)
                          }
                        : (e) => {}
                }
            >
                {readme && (
                    <DropdownIcon
                        className={`rotate ${readme ? '' : 'not-available'}`}
                        style={{ ['--rotateBy' as any]: `${readmeCollapsed ? -90 : 90}deg` }}
                        color={readmeCollapsed ? '#06c' : 'white'}
                    />
                )}
                {readmeCollapsed && (
                    <div
                        className={`rotate ${readme ? '' : 'not-available'}`}
                        style={{ ['--rotateBy' as any]: `-90deg`, width: '106px', margin: '70px' }}
                    >
                        {readme ? 'View Readme.md' : 'README.md not available'}
                    </div>
                )}
                {readmeCollapsed && <Page className="rotate" style={{ ['--rotateBy' as any]: `0deg` }} />}
            </aside>
        </div>
    )
}

export default ReadmeColumn
