import { Link } from 'react-router-dom'
import { ResponsiveContainer, Treemap, TreemapProps } from 'recharts'
import { followCursor } from 'tippy.js'

import { ConditionalWrap, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { ClusterStatusType } from '@Components/ClusterNodes/types'

import { getVisibleSvgTextWithEllipsis } from './utils'
import { ClusterMapProps } from './types'

import './clustermap.scss'

const renderWithLink = (href: string) => (children: JSX.Element) => (
    <Link className="anchor" to={href}>
        {children}
    </Link>
)

const ClusterTreeMapContent = ({
    x,
    y,
    width,
    height,
    status,
    name,
    value,
    href,
}: TreemapProps['content']['props']) => (
    <ConditionalWrap condition={!!href} wrap={renderWithLink(href)}>
        <Tooltip
            alwaysShowTippyOnHover
            content={
                <div className="flexbox-col dc__gap-8 fs-12 lh-18">
                    <div className="flexbox-col dc__gap-2">
                        <span className="fw-6 cn-0">{name}</span>
                        <span className="cn-50">{`${value} Nodes`}</span>
                    </div>
                    <span className={`dc__capitalize ${status === ClusterStatusType.HEALTHY ? 'cg-3' : 'cr-3'}`}>
                        {status}
                    </span>
                </div>
            }
            followCursor
            plugins={[followCursor]}
        >
            <g className="cluster-map__bar">
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    className={`cluster-map__rect ${status === 'unhealthy' ? 'cluster-map__rect--unhealthy' : ''}`}
                />
                <text x={x + 8} y={y + 22} className="cluster-map__text fcn-9 fs-13 fw-6">
                    {getVisibleSvgTextWithEllipsis(name, width, 13, 600)}
                </text>
                <text x={x + 8} y={y + 38} className="cluster-map__text fcn-9 fs-12 fw-4">
                    {value}
                </text>
            </g>
        </Tooltip>
    </ConditionalWrap>
)

export const ClusterMap = ({ treeMapData = [], isLoading = false }: ClusterMapProps) =>
    treeMapData.length ? (
        <div className="cluster-map pb-16 px-20 bcn-50">
            <div className="w-100 p-12 bcn-0 dc__border br-4 flexbox dc__align-items-center dc__gap-6">
                {isLoading ? (
                    <div className="w-100 flexbox-col dc__gap-4">
                        <div className="shimmer-loading h-16" />
                        <div className="shimmer-loading cluster-map__container" />
                    </div>
                ) : (
                    treeMapData.map(({ id, label, data }) => (
                        <div
                            key={id}
                            className="flexbox-col dc__gap-4"
                            style={{ flexGrow: data.length, minWidth: '0' }}
                        >
                            {label && (
                                <Tooltip content={label}>
                                    <p className="m-0 fs-12 lh-16 fw-6 cn-9">{label}</p>
                                </Tooltip>
                            )}
                            <div className="cluster-map__container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <Treemap
                                        data={data}
                                        stroke="var(--N0)"
                                        content={<ClusterTreeMapContent />}
                                        isAnimationActive={false}
                                    />
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    ) : null
