import React, { useEffect, useCallback, useReducer, useRef } from 'react'
import MonacoEditor, { MonacoDiffEditor } from 'react-monaco-editor';
import { useJsonYaml, Select, RadioGroup, useWindowSize } from '../common'
import { Progressing, copyToClipboard } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ClipboardIcon } from '../../assets/icons/ic-copy.svg';
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg';
import { ReactComponent as ErrorIcon } from '../../assets/icons/ic-error-exclamation.svg';
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-warning.svg';
import YAML from 'yaml'
import './codeEditor.scss';
import ReactGA from 'react-ga4';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor';
// @ts-ignore
import 'monaco-yaml/lib/esm/monaco.contribution';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import EditorWorker from 'worker-loader!monaco-editor/esm/vs/editor/editor.worker';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import YamlWorker from 'worker-loader!monaco-yaml/lib/esm/yaml.worker';
import { MODES } from '../../../src/config/constants';
import { cleanKubeManifest } from '../../../src/util/Util';

// @ts-ignore
window.MonacoEnvironment = {
    // @ts-ignore
    getWorker(workerId, label: string) {
        if (label === MODES.YAML) {
            return new YamlWorker()
        }
        return new EditorWorker()
    },
}

// @ts-ignore
const { yaml } = monaco.languages || {};


interface InformationBarProps { text: string; className?: string; children?: React.ReactNode }

interface CodeEditorInterface {
    value?: string;
    lineDecorationsWidth?: number;
    responseType?: string;
    onChange?: (string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    children?: any;
    defaultValue?: string;
    mode?: 'json' | 'yaml' | 'shell' | 'dockerfile';
    tabSize?: number;
    readOnly?: boolean;
    noParsing?: boolean;
    minHeight?: number;
    maxHeight?: number;
    inline?: boolean;
    height?: number | string;
    shebang?: string | JSX.Element;
    diffView?: boolean;
    loading?: boolean;
    customLoader?: JSX.Element;
    theme?: string;
    original?: string;
    focus?: boolean;
    validatorSchema?: any;
    isKubernetes?: boolean;
    cleanData?: boolean;
    chartVersion?: any; 
}

interface CodeEditorHeaderInterface {
    children?: any;
    className?: string
    hideDefaultSplitHeader?: boolean;
}
interface CodeEditorComposition {
    Header?: React.FC<any>;
    LanguageChanger?: React.FC<any>;
    ThemeChanger?: React.FC<any>;
    ValidationError?: React.FC<any>;
    Clipboard?: React.FC<any>;
    Warning?: React.FC<InformationBarProps>;
    ErrorBar?: React.FC<InformationBarProps>;
    Information?: React.FC<InformationBarProps>
}
interface CodeEditorHeaderComposition {
    LanguageChanger?: React.FC<any>;
    ThemeChanger?: React.FC<any>;
    ValidationError?: React.FC<any>;
    Clipboard?: React.FC<any>;
}

const CodeEditorContext = React.createContext(null)

function useCodeEditorContext() {
    const context = React.useContext(CodeEditorContext)
    if (!context) {
        throw new Error(
            `cannot be rendered outside the component`,
        )
    }
    return context
}

type ActionTypes = 'changeLanguage' | 'setDiff' | 'setTheme' | 'setCode' | 'setHeight'
interface Action {
    type: ActionTypes;
    value: any;
}

interface CodeEditorState {
    mode: 'json' | 'yaml' | 'shell' | 'dockerfile';
    diffMode: boolean;
    theme: 'vs' | 'vs-dark';
    code: string;
    noParsing: boolean;
}
const CodeEditor: React.FC<CodeEditorInterface> & CodeEditorComposition = React.memo(function Editor({ value, mode = "json", noParsing = false, defaultValue = "", children, tabSize = 2, lineDecorationsWidth = 0, height = 450, inline = false, shebang = "", minHeight, maxHeight, onChange, readOnly, diffView, theme="", loading, customLoader, focus, validatorSchema, chartVersion ,isKubernetes = true, cleanData = false, onBlur, onFocus}) {
    if (cleanData) {
        value = cleanKubeManifest(value);
        defaultValue = cleanKubeManifest(defaultValue);
    }

    const editorRef = useRef(null)
    const monacoRef = useRef(null)
    const { width, height: windowHeight } = useWindowSize()
    const memoisedReducer = useCallback((state: CodeEditorState, action: Action) => {
        switch (action.type) {
            case 'changeLanguage':
                return { ...state, mode: action.value }
            case 'setDiff':
                return { ...state, diffMode: action.value }
            case 'setTheme':
                return { ...state, theme: action.value }
            case 'setCode':
                return { ...state, code: action.value }
            case 'setHeight':
                return { ...state, height: action.value.toString() }
            default:
                return state
        }
    }, [])
    const initialState = {
        mode,
        theme: theme || 'vs',
        code: value,
        diffMode: diffView,
        noParsing: ['json', 'yaml'].includes(mode) ? noParsing : true
    }
    const [state, dispatch] = useReducer(memoisedReducer, initialState)
    const [nativeObject, json, yamlCode, error] = useJsonYaml(state.code, tabSize, state.mode, !state.noParsing)
    const [, originalJson, originlaYaml, originalError] = useJsonYaml(defaultValue, tabSize, state.mode, !state.noParsing)
    monaco.editor.defineTheme('vs-dark--dt', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            //@ts-ignore
            { background: '#0B0F22' }
        ],
        colors: {
            'editor.background': '#0B0F22',
        }
    });

    monaco.editor.defineTheme('delete-draft', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
            'diffEditor.insertedTextBackground': '#ffd4d1',
            'diffEditor.removedTextBackground': '#ffffff33',
        },
    })

    monaco.editor.defineTheme('unpublished', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
            'diffEditor.insertedTextBackground': '#eaf1dd',
            'diffEditor.removedTextBackground': '#ffffff33',
        },
    })


    function editorDidMount(editor, monaco) {
        if (
            mode === 'yaml' &&
            editor &&
            typeof editor.getModel === 'function' &&
            typeof editor.getModel().updateOptions === 'function'
        ) {
            editor.getModel().updateOptions({ tabSize: 2 });
        }

        if (editor) {
            if (typeof editor.onDidFocusEditorWidget === 'function' && typeof onFocus === 'function') {
                editor.onDidFocusEditorWidget(onFocus)
            }

            if (typeof editor.onDidBlurEditorWidget === 'function' && typeof onBlur === 'function') {
                editor.onDidBlurEditorWidget(onBlur)
            }
        }

        editorRef.current = editor
        monacoRef.current = monaco

    }

    useEffect(() => {
        if (!validatorSchema) return;
        yaml &&
            yaml.yamlDefaults.setDiagnosticsOptions({
                validate: true,
                enableSchemaRequest: true,
                hover: true,
                completion: true,
                isKubernetes: isKubernetes,
                format: true,
                schemas:[
                    {
                        uri: `https://github.com/devtron-labs/devtron/tree/main/scripts/devtron-reference-helm-charts/reference-chart_${chartVersion}/schema.json`, // id of the first schema
                        fileMatch: ['*'], // associate with our model
                        schema: validatorSchema,
                    }]
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validatorSchema, chartVersion]);
    useEffect(() => {
        if (!editorRef.current) return
        editorRef.current.updateOptions({ readOnly })
    }, [readOnly])

    useEffect(() => {
        if (!editorRef.current) return
        editorRef.current.layout()
    }, [width, windowHeight])

    useEffect(() => {
        if (onChange) onChange(state.code)
    }, [state.code])

    useEffect(() => {
        if (noParsing) {
            dispatch({ type: 'setCode', value })

            return;
        }
        let obj
        if (value === state.code) return
        try {
            obj = JSON.parse(value)
        }
        catch (err) {
            try {
                obj = YAML.parse(value)
            }
            catch (err) {

            }
        }
        let final = value
        if (obj) {
            final = state.mode === 'json' ? JSON.stringify(obj, null, tabSize) : YAML.stringify(obj, { indent: 2 })
        }
        dispatch({ type: 'setCode', value: final })
    }, [value, noParsing])

    useEffect(() => {
      dispatch({ type: 'setDiff', value: diffView })
    }, [diffView])

    useEffect(() => {
      if(focus){
        editorRef.current.focus();
      }
    }, [focus]);

    function handleOnChange(newValue, e) {
        dispatch({ type: 'setCode', value: newValue })
    }

    function handleLanguageChange(mode: 'json' | 'yaml') {
        dispatch({ type: 'changeLanguage', value: mode })
        dispatch({ type: 'setCode', value: mode === 'json' ? json : yamlCode })
    }

    const options: monaco.editor.IEditorConstructionOptions = {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly,
        lineDecorationsWidth: lineDecorationsWidth,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        minimap: {
            enabled: false
        },
        scrollbar: {
            alwaysConsumeMouseWheel: false,
            vertical: inline ? 'hidden' : 'auto'
        },
        lineNumbers: function (lineNumber) {
            return `<span style="padding-right:6px">${lineNumber}</span>`
        },
    };
    return (
        <CodeEditorContext.Provider value={{ dispatch, state, handleLanguageChange, error, defaultValue, height }}>
            {children}
            {loading ?
                <CodeEditorPlaceholder customLoader={customLoader} />
             :
                <>
                    {shebang && <div className="shebang">{shebang}</div>}
                    {state.diffMode ?
                        <MonacoDiffEditor
                            original={noParsing ? defaultValue : state.mode === 'json' ? originalJson : originlaYaml}
                            value={state.code}
                            language={state.mode}
                            onChange={handleOnChange}
                            options={options}
                            theme={state.theme.toLowerCase().split(" ").join("-")}
                            editorDidMount={editorDidMount}
                            height={height}
                            width="100%"
                        />
                        :
                        <MonacoEditor
                            language={state.mode}
                            value={state.code}
                            theme={state.theme.toLowerCase().split(" ").join("-")}
                            options={options}
                            onChange={handleOnChange}
                            editorDidMount={editorDidMount}
                            height={height}
                            width="100%"
                        />
                    }
                </>
            }
        </CodeEditorContext.Provider>
    );
})

const Header: React.FC<CodeEditorHeaderInterface> & CodeEditorHeaderComposition = ({ children, className, hideDefaultSplitHeader }) => {
    const { defaultValue } = useCodeEditorContext()
    return (
        <div className={className || 'code-editor__header flex left'}>
            {children}
            {!hideDefaultSplitHeader && defaultValue && <SplitPane />}
        </div>
    )
}

function ThemeChanger({ }) {
    const { readOnly, state, dispatch } = useCodeEditorContext()
    function handleChangeTheme(e) {
        dispatch({ type: 'setTheme', value: e.target.value })
    }

    const themes = [
        "vs",
        "vs-dark"
    ]
    return (
        <Select onChange={handleChangeTheme} rootClassName="select-theme" value={state.theme} disabled={readOnly}>
            <Select.Button><span className="dc__ellipsis-right">{state.theme}</span></Select.Button>
            <Select.Search placeholder="select theme" />
            {themes.map(theme => <Select.Option name={theme} key={theme} value={theme}><span className="dc__ellipsis-right">{theme}</span></Select.Option>)}
        </Select>
    )
}

function LanguageChanger({ }) {
    const { readOnly, handleLanguageChange, state } = useCodeEditorContext()
    if (state.noParsing) return null
    return (
        <div className="code-editor__toggle flex left">
            <RadioGroup name="selectedTab" disabled={readOnly} initialTab={state.mode} className="flex left"
                onChange={(event) => {
                    ReactGA.event({
                        'category': 'JSON-YAML Switch',
                        'action': `${event.target.value} view`,
                    })
                    handleLanguageChange(event.target.value)
                }} >
                <RadioGroup.Radio value="json">JSON</RadioGroup.Radio>
                <RadioGroup.Radio value="yaml">YAML</RadioGroup.Radio>
            </RadioGroup>
        </div>
    )
}

function ValidationError() {
    const { error } = useCodeEditorContext()
    return (
        error ? <div className="form__error">{error}</div> : null
    )
}

const Warning: React.FC<InformationBarProps> = function (props) {
    return <div className={`code-editor__warning ${props.className || ''}`}>
        <WarningIcon className="code-editor__information-info-icon" />
        {props.text}
        {props.children}
    </div>
}

const ErrorBar: React.FC<InformationBarProps> = function (props) {
    return (
        <div className={`code-editor__error ${props.className || ''}`}>
            <ErrorIcon className="code-editor__information-info-icon" />
            {props.text}
            {props.children}
        </div>
    );
};

const Information: React.FC<InformationBarProps> = function (props) {
    return <div className={`code-editor__information ${props.className || ''}`}>
        <Info className="code-editor__information-info-icon" />
        {props.text}
        {props.children}
    </div>
}

function Clipboard() {
    const { state } = useCodeEditorContext()
    return <button type="button" className="clipboard" onClick={e => copyToClipboard(state.code)}><ClipboardIcon /></button>
}

function SplitPane({ }) {
    const { state, dispatch, readOnly } = useCodeEditorContext()
    function handleToggle(e) {
        if (readOnly) return
        dispatch({ type: 'setDiff', value: !state.diffMode })
    }
    return (
        <div className="code-editor__split-pane flex pointer" onClick={handleToggle}>
            <div className="diff-icon"></div>
            {state.diffMode ? 'Hide comparison' : 'Compare with default'}
        </div>
    )
}
//TODO: CodeEditor should be composed of CodeEditorPlaceholder
function CodeEditorPlaceholder({ className = "", style = {}, customLoader }): JSX.Element {
    const { height } = useCodeEditorContext();

    if (customLoader) {
        return customLoader;
    }

    return (
        <div className={`code-editor code-editor--placeholder disabled ${className}`} style={{ ...style }}>
            <div className="flex" style={{ height: height || '100%' }}>
                <div className="flex">
                    <Progressing pageLoader />
                </div>
            </div>
        </div>
    );
}

CodeEditor.LanguageChanger = LanguageChanger
CodeEditor.ThemeChanger = ThemeChanger
CodeEditor.ValidationError = ValidationError
CodeEditor.Clipboard = Clipboard
CodeEditor.Header = Header
CodeEditor.Warning = Warning;
CodeEditor.ErrorBar = ErrorBar;
CodeEditor.Information = Information;

export default CodeEditor
