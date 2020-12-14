import React, { useState } from 'react';
import { DropdownIcon } from '../../common';
import moment from 'moment';

export function About({ description = "", home = "", chartYaml, appVersion = "", created = "", digest = "", source = "", ...rest }) {
    return <div className="flex column left about white-card white-card--no-padding">
        <div className="chart-store-card__header">About</div>
        <div className="chart-store-card__body">
            <span className="chart-store-card__subtitle">Description</span>
            <div className="chart-store-card__text">{description}</div>
            <span className="chart-store-card__subtitle">Home</span>
            <div className="mb-16">
                <a rel="noreferrer noopener" className="chart-store-card__text homepage anchor" href={home} target="_blank">{home}</a>
            </div>
            <Detailed {...{ appVersion, created, digest, home, source, chartYaml }} />
        </div>
    </div>
}

function Detailed({ appVersion = "", created = "", digest = "", home = "", source = "", chartYaml, ...rest }) {
    const [detailed, toggleDetailed] = useState(false)
    return (
        <div className="detailed-container flex column left detailed">
            {detailed && <>
                <span className="chart-store-card__subtitle">Application version</span>
                <div className="chart-store-card__text ellipsis-right">{appVersion}</div>
                <span className="chart-store-card__subtitle">Created</span>
                <div className="chart-store-card__text ellipsis-right">{moment(created).fromNow()}</div>
                <span className="chart-store-card__subtitle">Digest</span>
                <div className="chart-store-card__text digest">{digest}</div>
                {chartYaml && <>
                    <span className="chart-store-card__subtitle">Source</span>
                    {Array.isArray(chartYaml.sources) && chartYaml.sources.map(source => <a className="chart-store-card__text anchor" href={source} rel="noopener noreferrer"  target="_blank">{source}</a>)}
                </>}
            </>}
            <div className="chart-store-card__text chart-store-card__text--see-more pointer anchor flex" onClick={e => toggleDetailed(d => !d)}><span>{detailed ? 'Read less' : 'Read more'}</span><DropdownIcon className="rotate" style={{ ['--rotateBy' as any]: `${Number(detailed) * 180}deg` }} /></div>
        </div>
    )
}
