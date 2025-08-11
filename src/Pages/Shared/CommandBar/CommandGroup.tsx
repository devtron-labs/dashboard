import { Icon } from '@devtron-labs/devtron-fe-common-lib'

import { CommandGroupProps } from './types'

const CommandGroup = ({ groupDetails }: CommandGroupProps) => (
    <div className="flexbox-col p-8">
        <div className="flexbox px-16 py-6 dc__gap-4">
            <h2 className="m-0 cn-7 fs-13 fw-6 lh-20 dc__uppercase font-ibm-plex-mono" id={groupDetails.id}>
                {groupDetails.title}
            </h2>
        </div>

        {/* TODO: Empty/Loading/Error state */}
        <div className="flexbox-col" key={groupDetails.id} role="group" aria-labelledby={groupDetails.id}>
            {groupDetails.items.map((item) => (
                <div
                    className="flexbox px-16 py-12 dc__align-items-center dc__gap-8"
                    role="option"
                    // TODO: Fix later
                    aria-selected="false"
                >
                    <div className="flexbox dc__align-items-center dc__gap-12">
                        <Icon name={item.icon} size={24} color="N700" />
                        <h3 className="m-0 cn-9 fs-14 fw-4 lh-20 dc__truncate">{item.title}</h3>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

export default CommandGroup
