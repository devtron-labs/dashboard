import React from 'react'
import { groupStyle } from "../secrets/secret.utils"
import { GroupHeading } from "../v2/common/ReactSelect.utils"

export const groupHeading = (props) => {
    return <GroupHeading {...props} />
}

export const buildStageStyles = {
    ...groupStyle(),
    container: (base) => ({ ...base, paddingRight: '20px' }),
    control: (base) => ({ ...base, border: '1px solid #d6dbdf', minHeight: '20px', height: '30px', marginTop: '4px' }),
    valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px' }),
    indicatorsContainer: (base) => ({ ...base, height: '28px' }),
}

export const triggerStageStyles = {
    ...groupStyle(),
    container: (base) => ({ ...base }),
    control: (base) => ({ ...base, border: 'none', borderRadius: '0px', minHeight: '20px', height: '32px', width: '199px' }),
    valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px' }),
    indicatorsContainer: (base) => ({ ...base, height: '28px' }),
}