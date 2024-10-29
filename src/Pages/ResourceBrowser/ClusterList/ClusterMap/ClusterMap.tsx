import { Link } from 'react-router-dom'
import { ResponsiveContainer, Treemap, TreemapProps } from 'recharts'

import { ConditionalWrap, Tooltip } from '@devtron-labs/devtron-fe-common-lib'

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
        <Tooltip alwaysShowTippyOnHover content={name} placement="bottom">
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    className={`cluster-map__rect ${status === 'unhealthy' ? 'cluster-map__rect--unhealthy' : ''}`}
                />
                <text x={x + 4} y={y + 15} className="cluster-map__text fcn-9 fs-11 fw-6">
                    {getVisibleSvgTextWithEllipsis(name, width, 11, 600)}
                </text>
                <text x={x + 4} y={y + 28} className="cluster-map__text fcn-9 fs-9 fw-4">
                    {value}
                </text>
            </g>
        </Tooltip>
    </ConditionalWrap>
)

export const ClusterMap = ({ treeMapData = [] }: ClusterMapProps) =>
    treeMapData.length ? (
        <div className="cluster-map pb-16 px-20 bcn-50">
            <div className="w-100 p-12 bcn-0 dc__border br-4 flexbox dc__align-items-center dc__gap-6">
                {treeMapData.map(({ id, label, data }) => (
                    <div key={id} className="flexbox-col dc__gap-4" style={{ flexGrow: data.length }}>
                        {label && (
                            <Tooltip content={label}>
                                <p className="m-0 fs-13 lh-18 fw-6 cn-9">{label}</p>
                            </Tooltip>
                        )}
                        <div className="cluster-map__container">
                            <ResponsiveContainer width="100%" height="100%">
                                <Treemap
                                    data={data}
                                    stroke="var(--N0)"
                                    content={<ClusterTreeMapContent />}
                                    animationDuration={200}
                                />
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ) : null
