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

import React, { useState } from 'react'
import moment from 'moment'
import { DropdownIcon } from '../../common'

export const About = ({
    description = '',
    home = '',
    chartYaml,
    appVersion = '',
    created = '',
    digest = '',
    source = '',
    isOCICompliantChart = false,
    ...rest
}) => {
    return (
        <div className="flex column left about white-card white-card--no-padding">
            <div className="chart-store-card__header" data-testid="single-chart-about-heading">
                About
            </div>
            <div className="chart-store-card__body">
                <span className="chart-store-card__subtitle">Description</span>
                <div className="chart-store-card__text">{description || '-'}</div>
                <span className="chart-store-card__subtitle">Home</span>
                <div className="mb-16">
                    <a
                        rel="noreferrer noopener"
                        className="chart-store-card__text homepage anchor"
                        href={home}
                        target="_blank"
                        data-testid="home-chart-deploy-link"
                    >
                        {home || '-'}
                    </a>
                </div>
                <Detailed {...{ appVersion, created, digest, home, source, chartYaml, isOCICompliantChart }} />
            </div>
        </div>
    )
}

const Detailed = ({
    appVersion = '',
    created = '',
    digest = '',
    home = '',
    source = '',
    chartYaml,
    isOCICompliantChart,
    ...rest
}) => {
    const [detailed, toggleDetailed] = useState(false)
    return (
        <div className="detailed-container flex column left detailed">
            {detailed && (
                <>
                    <span className="chart-store-card__subtitle">Application version</span>
                    <div className="chart-store-card__text dc__ellipsis-right">{appVersion || '-'}</div>
                    <span className="chart-store-card__subtitle">Created</span>
                    <div className="chart-store-card__text dc__ellipsis-right">
                        {isOCICompliantChart ? '-' : moment(created).fromNow()}
                    </div>
                    <span className="chart-store-card__subtitle">Digest</span>
                    <div className="chart-store-card__text digest">{digest || '-'}</div>
                    {chartYaml && (
                        <>
                            <span className="chart-store-card__subtitle">Source</span>
                            {Array.isArray(chartYaml.sources) &&
                                chartYaml.sources.map((source) => (
                                    <a
                                        className="chart-store-card__text anchor"
                                        href={source}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        data-testid="chart-source-link"
                                    >
                                        {source}
                                    </a>
                                ))}
                        </>
                    )}
                </>
            )}
            <div
                className="chart-store-card__text chart-store-card__text--see-more pointer anchor flex"
                onClick={(e) => toggleDetailed((d) => !d)}
                data-testid="extend-read-more"
            >
                <span className="cb-5">{detailed ? 'Read less' : 'Read more'}</span>
                <DropdownIcon className="rotate" style={{ ['--rotateBy' as any]: `${Number(detailed) * 180}deg` }} />
            </div>
        </div>
    )
}
