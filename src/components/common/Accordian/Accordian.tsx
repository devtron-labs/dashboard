import React, { useEffect, useState } from 'react'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'
import { Checkbox } from '../formFields/Checkbox'

export function Accordian({ header, options, value, onChange }) {
    const [collapsed, setCollapse] = useState<boolean>(true)
    const [showMore, setShowMore] = useState<boolean>(false)

    const showdata = () => {
        if (showMore) {
            return options
        }
        return options.slice(0, 6)
    }

    const toggleAccordian = () => {
        setCollapse(!collapsed)
        if (collapsed) {
            setShowMore(false)
        }
    }

    return (
        <div>
            <div className="flex fs-12 fw-6 ml-8 md-8 content-space cursor" onClick={toggleAccordian}>
                {header}
                <Dropdown
                    className="icon-dim-24 rotate"
                    style={{ ['--rotateBy' as any]: collapsed ? '180deg' : '0deg' }}
                />
            </div>
            {collapsed && (
                <div>
                    {showdata().map((e) => (
                        <div className="position-rel flex left cursor">
                            <Checkbox
                                rootClassName="cursor bcn-0 ml-10 mr-10 date-align-left--deprecate"
                                isChecked={(value.filter((event) => event === e)).length}
                                value={'CHECKED'}
                                onChange={() => onChange(e)}
                            >
                                <div className="ml-5">{e.label}</div>
                            </Checkbox>
                        </div>
                    ))}
                    {options.length > 6 && !showMore && (
                        <div className="flex pl-8 left cursor" onClick={() => setShowMore(true)}>
                            Show more <Dropdown className="icon-dim-20" />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
