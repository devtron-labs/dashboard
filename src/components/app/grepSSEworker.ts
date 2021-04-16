import { string } from 'prop-types';
import AsyncSelect from 'react-select/async';
export default () => {
    var eventSrc
    let filteredArray = []
    self.onmessage = e => { // eslint-disable-line no-restricted-globals
        if (!e) {
            console.log('no event found');
            return
        }
        if (!e.data.type && !e.data.paylod) return
        let lastTrueIndex = -10000
        let buffer = []
        switch (e.data.type) {
            case 'start':
                const { grepTokens, url } = e.data.payload
                buffer = []
                try {
                    eventSrc.close()
                }
                catch (err) { }
                eventSrc = new EventSource(url, { withCredentials: true })
                eventSrc.addEventListener('message', function (ev) {
                    const log = JSON.parse(ev.data).result.content
                    if (!grepTokens) {
                        filteredArray = filteredArray.concat(log)
                        return
                    }

                    //check for first pipe
                    let bufferedLogs = []
                    const { _args, a = 0, b = 0 } = grepTokens[0]
                    if (new RegExp(_args, 'gi').test(log)) {
                        lastTrueIndex = 0
                        bufferedLogs = buffer.concat(log)
                        buffer = []
                    } else {
                        lastTrueIndex -= 1
                        if (b > 0) {
                            buffer = buffer.concat(log).slice(-1 * b)
                        }
                        else {
                            buffer = []
                        }
                        if (lastTrueIndex + a >= 0) {
                            bufferedLogs = [log]
                        } else { }
                    }
                    // if (grepTokens.length === 1) {
                    //     filteredArray = filteredArray.concat(bufferedLogs).map(log => log.replace(new RegExp(grepTokens[0]._args, 'gi'), m => `\x1B[1;31m${m}\x1B[0m`))
                    //     return
                    // }

                    // first pipe processed

                    for (let i = 1; i < grepTokens.length; i++) {
                        const { v, _args } = grepTokens[i]
                        bufferedLogs = bufferedLogs.filter(l => (new RegExp(_args, 'gi').test(l)))
                        if (bufferedLogs.length === 0) {
                            break
                        }
                        // else if (i === grepTokens.length - 1) {
                        //     filteredArray = filteredArray.concat(bufferedLogs).map(log => log.replace(new RegExp(_args, 'gi'), m => `\x1B[1;31m${m}\x1B[0m`))
                        //     break
                        // } else {
                        //     continue
                        // }
                    }
                    filteredArray = filteredArray.concat(bufferedLogs).map(log => log.replace(new RegExp(grepTokens[grepTokens.length - 1]._args, 'gi'), m => `\x1B[1;31m${m}\x1B[0m`))
                })
                eventSrc.addEventListener('open', function (ev) {
                    self.postMessage({ result: [], signal: 'open', readyState: eventSrc.readyState }, null); // eslint-disable-line no-restricted-globals
                })
                eventSrc.addEventListener('error', function (ev) {
                    self.postMessage({ result: [], signal: 'close', readyState: eventSrc.readyState }, null); // eslint-disable-line no-restricted-globals
                })
                break
            case 'stop':
                try {
                    eventSrc.close()
                }
                catch (err) { }
                finally {
                    lastTrueIndex = -10000
                    buffer = []
                    filteredArray = []
                }
        }

    }

    function respond() {
        if (filteredArray.length === 0) return
        self.postMessage({ result: filteredArray, readyState: eventSrc.readyState }, null);// eslint-disable-line no-restricted-globals
        filteredArray.length = 0
    }
    self.setInterval(respond, 500); // eslint-disable-line no-restricted-globals
}
