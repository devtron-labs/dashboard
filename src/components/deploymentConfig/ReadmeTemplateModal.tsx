import React, { Component } from 'react'
import { VisibleModal } from '../common';
import './deploymentConfig.scss'

export default class ReadmeDeploymentTemplate extends Component {
    render() {
        return (
            <VisibleModal className="app-status__material-modal">
                <div className="modal__body " style={{ width: "1266px" }}>
                    <div className="modal__title mb-4">Deployment Template</div>
                    <div className="cb-5 mb-16">Chart version (3.5.0)</div>
                    <div>
                        <div className="readme top flex">
                            <div className="readme__wrap">
                                <div className="readme__header bcn-1 pb-12 pt-12 pl-16 pr-16 cn-7 fw-6">Readme.md (3.5.0)</div>
                                <div className="readme__overflow p-20">

                                    Veggies es bonus vobis, proinde vos postulo essum magis kohlrabi
                                    welsh onion daikon amaranth tatsoi tomatillo melon azuki bean garlic.
                                    Gumbo beet greens corn soko endive gumbo gourd. Parsley shallot courgette
                                    tatsoi pea sprouts fava bean collard greens dandelion okra wakame tomato.
                                    Dandelion cucumber earthnut pea peanut soko zucchini.

                                </div>
                            </div>
                            <div className="readme__wrap">
                                <div className="readme__header bcn-1 pb-12 pt-12 pl-16 pr-16 cn-7 fw-6">json/yaml</div>
                                <div className="readme__overflow p-20">

                                    Veggies es bonus vobis, proinde vos postulo essum magis kohlrabi
                                    welsh onion daikon amaranth tatsoi tomatillo melon azuki bean garlic.
                                    Gumbo beet greens corn soko endive gumbo gourd. Parsley shallot courgette
                                    tatsoi pea sprouts fava bean collard greens dandelion okra wakame tomato.
                                    Dandelion cucumber earthnut pea peanut soko zucchini.

                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </VisibleModal>
        )
    }
}
