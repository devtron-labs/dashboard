import React from 'react'
import { ServerErrors } from '../../modals/commonTypes'
import { showError } from '../common'
import { getEnvAppList } from './EnvironmentListService'

let timeoutId

export const envListOptions = (inputValue: string): Promise<[]> =>
    new Promise((resolve) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
            if (inputValue.length < 3) {
                resolve([])
                return
            }
            getEnvAppList({envName: inputValue})
                .then((response) => {
                    let appList = []
                    if (response.result) {
                        appList = response.result.map((res) => ({
                            value: res['id'],
                            label: res['environment_name'],
                            ...res,
                        }))
                    }
                    resolve(appList as [])
                })
                .catch((errors: ServerErrors) => {
                    resolve([])
                    if (errors.code) {
                        showError(errors)
                    }
                })
        }, 300)
    })
