import React, { useState } from 'react'

import { EditCatalogModal } from './EditCatalogModal'
import { ReactComponent as EditIcon } from '../../../assets/icons/ic-pencil.svg'
import { CatalogProps } from './types'

export const Catalog = (props: CatalogProps) => {
    const { updatedBy, updatedOn } = props
    const [editModalOpen, setEditModalOpen] = useState(false)

    return (
        <>
            <section className="bcn-0 en-2 br-4 bw-1 fs-13 fw-4 lh-20 cn-7">
                <div className="dc__border-bottom flex flex-justify pl-16 pr-16 pt-8 pb-8">
                    <div>
                        <span className="fw-6 cn-9 mr-8">Catalog</span>
                        <span>
                            Last updated by {updatedBy} on {updatedOn}
                        </span>
                    </div>
                    <div
                        className="fw-6 cursor flex dc__gap-6"
                        onClick={() => {
                            setEditModalOpen(true)
                        }}
                    >
                        <EditIcon className="icon-dim-16 mw-16 scn-7" />
                        <span>Edit</span>
                    </div>
                </div>
                <div className="pl-16 pr-16 pt-16 pb-16">Contents goes here</div>
            </section>
            {editModalOpen && (
                <EditCatalogModal
                    onClose={() => {
                        setEditModalOpen(false)
                    }}
                />
            )}
        </>
    )
}
