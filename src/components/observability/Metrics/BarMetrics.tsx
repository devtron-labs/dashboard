import { Tooltip } from '@devtron-labs/devtron-fe-common-lib/dist'

import { BarMetricsProps } from '../types'
import { CPUCapacityCellComponent, DiskCapacityCellComponent, MemoryCapacityCellComponent } from '../utils'

export const BarMetrics = ({ data }: BarMetricsProps) => (
    <div className="flexbox-col">
        <div className="dc__grid dc__gap-24 bar-chart-table-row fs-12 fw-6 lh-20 cn-7 px-16 py-8">
            <span>TENANTS NAME</span>
            <span>CPU</span>
            <span>MEMORY</span>
            <span>DISK</span>
        </div>
        {data?.map(({ disk, name, memory, cpu }) => (
            <div key={name} className="dc__grid dc__gap-24 bar-chart-table-row p-16 dc__hover-n50">
                <Tooltip content={name}>
                    <span className="dc__truncate">{name}</span>
                </Tooltip>
                <CPUCapacityCellComponent cpu={cpu} />
                <MemoryCapacityCellComponent memory={memory} />
                <DiskCapacityCellComponent disk={disk} />
            </div>
        ))}
    </div>
)
