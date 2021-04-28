import { string } from 'prop-types';
import AsyncSelect from 'react-select/async';
import { LogFilter } from './LogFilter';
import { Legend } from 'recharts';
export default () => {
    var eventSrc
    let filteredArray = []
    self.onmessage = e => { // eslint-disable-line no-restricted-globals
        if (!e) {
            console.log('no event found');
            return
        }
        if (!e.data.type && !e.data.paylod) return
        let logFilter: LogFilter
        switch (e.data.type) {
            case 'start':
                const { grepTokens, url } = e.data.payload
                logFilter = new LogFilter(grepTokens)
                try {
                    eventSrc.close()
                }
                catch (err) { }
                eventSrc = new EventSource(url, { withCredentials: true })
                eventSrc.addEventListener('message', function (ev) {
                    const log = JSON.parse(ev.data).result.content
                    let matches = logFilter.filter(log)
                    filteredArray = filteredArray.concat(matches)
                    if (grepTokens.length > 0) {
                        filteredArray = filteredArray.map(log => log.replace(new RegExp(grepTokens[grepTokens.length - 1]._args, 'gi'), m => `\x1B[1;31m${m}\x1B[0m`))
                    }
                })
                eventSrc.addEventListener('open', function (ev) {
                    self.postMessage({ result: [], signal: 'open', readyState: eventSrc.readyState }, null); // eslint-disable-line no-restricted-globals
                })
                eventSrc.addEventListener('error', function (ev) {
                    self.postMessage({ result: [], signal: 'close', readyState: eventSrc.readyState }, null); // eslint-disable-line no-restricted-globals
                })
                break
            case 'stop':
                filteredArray = logFilter.stop()
                respond()
                logFilter = undefined
                try {
                    eventSrc.close()
                }
                catch (err) { }
                finally {
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
