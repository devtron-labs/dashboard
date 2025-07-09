import { useMemo } from 'react'
import { useRouteMatch } from 'react-router-dom'
import moment from 'moment'

import {
    Button,
    ButtonComponentType,
    ComponentSizeType,
    handleAnalyticsEvent,
    Icon,
    ImageWithFallback,
    InfoBlock,
} from '@devtron-labs/devtron-fe-common-lib'

import { ChartDetailsAboutProps } from './types'
import { getParsedChartYAML } from './utils'

const AboutHeaderLoadingSkeleton = () => (
    <div className="flexbox-col dc__gap-16">
        <div className="shimmer-loading chart-details__loading-icon" />
        <div className="shimmer-loading w-150 h-20" />
        <div className="flexbox-col dc__gap-8">
            <div className="shimmer-loading w-250 h-16" />
            <div className="shimmer-loading w-100 h-16" />
        </div>
    </div>
)

const AboutBodyLoadingSkeleton = () => (
    <div className="flexbox-col dc__gap-12">
        <div className="shimmer-loading w-250 h-16" />
        <div className="shimmer-loading w-200 h-16" />
        <div className="shimmer-loading w-100 h-16" />
    </div>
)

const ChartMetaData = ({
    title,
    subtitle,
    isLink,
}: {
    title: string
    subtitle: string | string[]
    isLink?: boolean
}) => {
    const renderSubtitle = () => {
        if (Array.isArray(subtitle)) {
            return subtitle.map((item) =>
                isLink && item ? (
                    <a className="m-0 fs-13 lh-20 fw-4 dc__break-word" href={item} target="_blank" rel="noreferrer">
                        {item}
                    </a>
                ) : (
                    <p key={item} className="m-0 fs-13 lh-20 fw-4 cn-9 dc__break-word">
                        {item}
                    </p>
                ),
            )
        }

        return isLink ? (
            <a className="m-0 fs-13 lh-20 fw-4 dc__break-word" href={subtitle} target="_blank" rel="noreferrer">
                {subtitle}
            </a>
        ) : (
            <p className="m-0 fs-13 lh-20 fw-4 cn-9 dc__break-word">{subtitle}</p>
        )
    }

    return (
        <div className="flexbox-col dc__gap-4">
            <h5 className="m-0 fs-13 lh-20 fw-4 cn-7">{title}</h5>
            {renderSubtitle()}
        </div>
    )
}

export const ChartDetailsAbout = ({ chartDetails, isLoading }: ChartDetailsAboutProps) => {
    const { url } = useRouteMatch()

    const {
        icon,
        name,
        description,
        chartName,
        created,
        appVersion,
        deprecated,
        digest,
        home,
        isOCICompliantChart,
        chartYaml,
    } = chartDetails ?? {}

    const parsedChartYaml = useMemo(() => getParsedChartYAML(chartYaml), [chartYaml])

    const handleDeploy = () => {
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_CHART_CONFIGURE_&_DEPLOY' })
    }

    if (isLoading && !chartDetails) {
        return (
            <div className="flexbox-col dc__gap-20 mw-none">
                <AboutHeaderLoadingSkeleton />
                <div className="divider__secondary--horizontal" />
                <AboutBodyLoadingSkeleton />
            </div>
        )
    }

    return (
        <div className="flexbox-col dc__gap-20 mw-none">
            <div className="flexbox-col dc__gap-12">
                <ImageWithFallback
                    imageProps={{
                        src: icon,
                        alt: 'chart-icon',
                        height: 48,
                        width: 48,
                    }}
                    fallbackImage={<Icon name="ic-helm" color="N700" size={48} />}
                />
                <h2 className="m-0 fs-16 lh-24 fw-6 cn-9">{name}</h2>
                <p className="m-0 fs-13 lh-20 cn-9">{description}</p>
            </div>
            <div>
                <Button
                    dataTestId="deploy-chart-button"
                    startIcon={<Icon name="ic-rocket-launch" color={null} />}
                    text="Deploy Chart..."
                    size={ComponentSizeType.medium}
                    component={ButtonComponentType.link}
                    linkProps={{
                        to: `${url}/deploy-chart`,
                    }}
                    onClick={handleDeploy}
                />
            </div>
            <div className="divider__secondary--horizontal" />
            {isLoading ? (
                <AboutBodyLoadingSkeleton />
            ) : (
                <>
                    {deprecated && (
                        <InfoBlock
                            variant="warning"
                            heading="Deprecated Chart"
                            description="This chart is no longer maintained and may not receive updates or support from the publisher."
                        />
                    )}
                    <div className="flexbox-col dc__gap-12">
                        <ChartMetaData title="Chart source" subtitle={chartName} />
                        <ChartMetaData title="Home" subtitle={home} isLink />
                        <ChartMetaData
                            title="Application Version"
                            subtitle={appVersion?.startsWith('v') ? appVersion.slice(1) : appVersion}
                        />
                        <ChartMetaData
                            title="Created"
                            subtitle={isOCICompliantChart ? '-' : moment(created).fromNow()}
                        />
                        <ChartMetaData title="Digest" subtitle={digest} />
                        {!!parsedChartYaml && (
                            <ChartMetaData title="Source" subtitle={parsedChartYaml.sources} isLink />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
