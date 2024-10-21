/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect } from 'react'
import { VisibleModal } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as Close } from '../assets/icons/ic-close.svg'
import docker from '../../../assets/icons/misc/docker.svg'
import { useKeyDown } from '../../common'

export default function DockerListModal({ closeTab, dockerList }: { closeTab: () => void; dockerList: string[] }) {
    const key = useKeyDown()
    useEffect(() => {
        if (key.join().includes('Escape')) {
            closeTab()
        }
    }, [key.join()])

    return (
        <VisibleModal className="">
            <div className="docker-wrapper">
                <div className="docker-header flex-align-center fs-16 fw-6 pl-20 pr-20 pt-17 pb-17">
                    <span className="cn-9">Deployed images</span>
                    <button type="button" className="dc__transparent flex" onClick={closeTab}>
                        <Close />
                    </button>
                </div>
                <div className="pt-20 pb-6 docker-body">
                    {dockerList.map((list) => (
                        <div className="flexbox mb-14 ml-20">
                            <span className="dc__app-commit__hash mr-8">
                                <img src={docker} className="commit-hash__icon grayscale" />
                                <span className="ml-3">{list.split(':')[1] || list}</span>
                            </span>
                            <span className="fs-13 fw-4">{list}</span>
                        </div>
                    ))}
                </div>
            </div>
        </VisibleModal>
    )
}
