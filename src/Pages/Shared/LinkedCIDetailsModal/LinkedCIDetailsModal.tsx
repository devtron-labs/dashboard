import React from 'react'
import { Drawer, InfoColourBar, Pagination, SearchBar, getCommonSelectStyle } from '@devtron-labs/devtron-fe-common-lib'
import ReactSelect from 'react-select'
import { LinkedCIDetailsModalProps } from './types'
import { ReactComponent as Info } from '../../../assets/icons/ic-info-filled.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import LinkedCIAppList from './LinkedCIAppList'
import './linkedCIAppList.scss'

const commonStyles = getCommonSelectStyle()

const LinkedCIDetailsModal = ({ ciPipelineName, linkedWorkflowCount }: LinkedCIDetailsModalProps) => {
    return (
        <Drawer position="right" width="800px">
            <div className="bcn-0 h-100">
                <div className="flex flex-justify dc__border-bottom pt-12 pr-20 pb-12 pl-20 dc__position-sticky">
                    <h2 className="fs-16 fw-6 lh-24 m-0">{ciPipelineName}</h2>
                    <button type="button" className="dc__transparent flex icon-dim-24" aria-label="close-modal">
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div>
                    <InfoColourBar
                        message={`This build pipeline is linked as image source in ${linkedWorkflowCount} ${linkedWorkflowCount === 1 ? 'workflow.' : 'workflows.'}`}
                        classname="info_bar justify-start"
                        Icon={Info}
                    />
                    <div className="flex flex-justify-start dc__gap-8 cn-9 pl-20 pr-20 pt-8 pb-8 lh-20">
                        <div className="w-250">
                            <SearchBar />
                        </div>
                        <div className="w-200">
                            <ReactSelect
                                styles={{
                                    ...commonStyles,
                                    control: (base) => ({
                                        ...base,
                                        ...commonStyles.control,
                                        backgroundColor: 'var(--N50)',
                                    }),
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <LinkedCIAppList />
                        <div className="dc__no-shrink">
                            {/* todo (Arun) -- fix this */}
                            <Pagination
                                rootClassName="flex dc__content-space pl-20 pr-20 dc__border-top"
                                size={100}
                                offset={0}
                                pageSize={20}
                                changePage={() => {}}
                                changePageSize={() => {}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Drawer>
    )
}

export default LinkedCIDetailsModal
