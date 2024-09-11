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

export default () => {
    // let filteredArray = []
    const bp = {
        // let eventSrc= undefined
        // let filteredArray = []
        // let grepTokens = undefined
        // let indexFromLastMatch = -1000000
        // let buffer = []
        // let trailingLines= []
        // let prefix = "",
        eventSrc: undefined,
        filteredArray: [],
        grepTokens: undefined,
        indexFromLastMatch: -1000000,
        buffer: [],
        trailingLines: [],
        prefix: '',
        eventListener(ev) {
            let log
            try {
                log = JSON.parse(ev.data).result.content
            } catch (e) {
                log = ev.data
            }
            let bufferedLogs: Array<string> = []

            // Regex to match ANSI color code/escape sequence
            const ANSI_COLOR_ESCAPE_SEQUENCE_REGEX = /\u001b\[.*?m/g
            if (!log || log.length == 0) {
                console.log('no log lines')
            } else {
                const logTimestamp = ev.lastEventId
                    ? `[${new Date(ev.lastEventId / 1000000).toString().split(' ').splice(1, 5).join(' ')}] `
                    : ''
                log = `${logTimestamp}${this.prefix}${log}`

                if (!this.grepTokens) {
                    bufferedLogs = [log]
                } else {
                    const { _args, a = 0, b = 0 } = this.grepTokens[0]

                    if (new RegExp(_args, 'gi').test(log.replace(ANSI_COLOR_ESCAPE_SEQUENCE_REGEX, ''))) {
                        if (this.indexFromLastMatch <= 1 * (a + b)) {
                            const size = Math.min(1 * (this.indexFromLastMatch - b), this.trailingLines.length)
                            bufferedLogs = bufferedLogs.concat(this.trailingLines.slice(0, size))
                            this.trailingLines = new Array<string>()
                        }
                        this.indexFromLastMatch = 0
                        bufferedLogs = bufferedLogs.concat(this.buffer.concat(log))
                        this.buffer = []
                    } else {
                        this.indexFromLastMatch += 1
                        if (b > 0) {
                            this.buffer = this.buffer.concat(log).slice(-1 * b)
                        }
                        if (this.indexFromLastMatch <= 1 * a) {
                            this.trailingLines.push(log)
                        }
                        if (this.indexFromLastMatch == 1 * (a + b)) {
                            bufferedLogs = bufferedLogs.concat(this.trailingLines)
                            this.trailingLines = []
                        }
                    }
                    for (let i = 1; i < this.grepTokens.length; i++) {
                        const { v, _args } = this.grepTokens[i]
                        bufferedLogs = bufferedLogs.filter((l) =>
                            new RegExp(_args, 'gi').test(l.replace(ANSI_COLOR_ESCAPE_SEQUENCE_REGEX, '')),
                        )
                    }
                }
            }
            const matches = bufferedLogs
            this.filteredArray = this.filteredArray.concat(matches)
            if (this.grepTokens && this.grepTokens.length > 0) {
                this.filteredArray = this.filteredArray.map((log) =>
                    log
                        .replace(ANSI_COLOR_ESCAPE_SEQUENCE_REGEX, '')
                        .replace(
                            new RegExp(this.grepTokens[this.grepTokens.length - 1]._args, 'gi'),
                            (m) => `\x1B[1;31m${m}\x1B[0m`,
                        ),
                )
            }
        },
    }
    const wrappers = []
    self.onmessage = (e) => {
        // eslint-disable-line no-restricted-globals
        if (!e) {
            console.log('no event found')
            return
        }
        if (!e.data.type && !e.data.paylod) {
            return
        }
        switch (e.data.type) {
            case 'start':
                const { urls, grepTokens, pods } = e.data.payload
                wrappers.forEach((wrapper) => {
                    try {
                        wrapper.eventSrc.close()
                    } catch (err) {}
                })
                for (let index = 0; index < urls.length; index++) {
                    const element = urls[index]
                    wrappers[index] = { ...bp }
                    wrappers[index].prefix = `${typeof pods[index] === 'object' ? pods[index].name : pods[index]}: `
                    wrappers[index].eventSrc = new EventSource(element, { withCredentials: true })
                    wrappers[index].grepTokens = grepTokens
                    const eventListener = wrappers[index].eventListener.bind(wrappers[index])
                    wrappers[index].eventSrc.addEventListener('message', eventListener)
                    wrappers[index].eventSrc.addEventListener('open', function (ev) {
                        self.postMessage(
                            { result: [], signal: 'open', readyState: wrappers[index].eventSrc.readyState },
                            null,
                        ) // eslint-disable-line no-restricted-globals
                    })
                    wrappers[index].eventSrc.addEventListener('error', function (ev) {
                        self.postMessage(
                            { result: [], signal: 'close', readyState: wrappers[index].eventSrc.readyState },
                            null,
                        ) // eslint-disable-line no-restricted-globals
                    })
                    wrappers[index].eventSrc.addEventListener('CUSTOM_ERR_STREAM', function (ev) {
                        self.postMessage(
                            {
                                result: [ev.data],
                                signal: 'CUSTOM_ERR_STREAM',
                                readyState: wrappers[index].eventSrc.readyState,
                            },
                            null,
                        ) // eslint-disable-line no-restricted-globals
                    })
                }
                break
            case 'stop':
                // wrapper.filteredArray = logFilter.stop()
                respond()
                try {
                    wrappers.forEach((val) => val.eventSrc.close())
                } catch (err) {
                } finally {
                    wrappers.forEach((val) => (val.filteredArray = []))
                }
        }
    }

    function respond() {
        wrappers.forEach((wrapper) => {
            if (wrapper.filteredArray.length === 0) {
                return
            }
            self.postMessage({ result: wrapper.filteredArray, readyState: wrapper.eventSrc.readyState }, null) // eslint-disable-line no-restricted-globals
            wrapper.filteredArray.length = 0
        })
    }
    self.setInterval(respond, 500) // eslint-disable-line no-restricted-globals
}
