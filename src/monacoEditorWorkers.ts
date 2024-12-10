// eslint-disable-next-line @typescript-eslint/no-unused-vars
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// NOTE: a workaround from https://github.com/remcohaszing/monaco-yaml?tab=readme-ov-file#why-doesnt-it-work-with-vite
import YamlWorker from './yaml.worker?worker'
import 'monaco-editor'

// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
    getWorker(_, label) {
        switch (label) {
            case 'json':
                return new JsonWorker()
            case 'yaml':
            case 'yml':
                return new YamlWorker()
            default:
                return new EditorWorker()
        }
    },
}
