import React from 'react'
import { ReactComponent as Close } from '../assets/icons/ic-close.svg'
import docker from '../../../assets/icons/misc/docker.svg'

export default function DockerListModal({ closeTab, dockerList }) {
    return (
        <div className="docker-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="docker-header flex-align-center fs-16 fw-6 pl-20 pr-20 pt-17 pb-17">
                <span className='cn-9'>Deployed images</span>
                <button type="button" className="transparent flex" onClick={() => closeTab()}>
                    <Close />
                </button>
            </div>
            <div className='pt-20 pb-6 docker-body'>
                {dockerList.map((list) => (
                    <div className='flexbox mb-14 ml-20'>
                        <span className='app-commit__hash mr-8'>
                            <img src={docker} className="commit-hash__icon grayscale" />
                            <span className="ml-3">{list.split(':')[1] || list}</span>
                        </span>
                        <span className='fs-13 fw-4'>{list}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
