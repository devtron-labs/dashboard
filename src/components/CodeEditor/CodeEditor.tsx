import React, { useEffect, useCallback, useReducer, useRef } from 'react'
import MonacoEditor, { MonacoDiffEditor } from 'react-monaco-editor';
import { useJsonYaml, Select, RadioGroup, Progressing, useWindowSize, copyToClipboard } from '../common'
import { ReactComponent as ClipboardIcon } from '../../assets/icons/ic-copy.svg';
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg';
import YAML from 'yaml'
import './codeEditor.scss';
import ReactGA from 'react-ga';
import { editor } from 'monaco-editor';

interface WarningProps { text: string }

interface InformationProps { text: string }

interface CodeEditorInterface {
    value?: string;
    lineDecorationsWidth?: number;
    responseType?: string;
    onChange?: (string) => void;
    children?: any;
    defaultValue?: string;
    mode?: 'json' | 'yaml' | 'shell';
    tabSize?: number;
    readOnly?: boolean;
    noParsing?: boolean;
    autoResize?: boolean;
    minHeight?: number;
    maxHeight?: number;
    inline?: boolean;
    height?: number;
    shebang?: string | JSX.Element;
    diffView?: boolean;
    loading?: boolean;
    theme?: string;
    original?: string;
}

interface CodeEditorHeaderInterface {
    children?: any;
}
interface CodeEditorComposition {
    Header?: React.FC<any>;
    LanguageChanger?: React.FC<any>;
    ThemeChanger?: React.FC<any>;
    ValidationError?: React.FC<any>;
    Clipboard?: React.FC<any>;
    Warning?: React.FC<{ text: string }>;
    Information?: React.FC<InformationProps>
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
    mode: 'json' | 'yaml' | 'shell';
    diffMode: boolean;
    theme: 'vs' | 'vs-dark';
    code: string;
    height: string;
    noParsing: boolean;
}
const CodeEditor: React.FC<CodeEditorInterface> & CodeEditorComposition = React.memo(function Editor({ value, mode = "json", noParsing = false, defaultValue = "", children, tabSize = 2, lineDecorationsWidth = 0, height = 450, inline = false, shebang = "", minHeight, maxHeight, onChange, readOnly, diffView, loading, theme=""}) {
    const editorRef = useRef(null)
    const monacoRef = useRef(null)
    const { width, height: windowHeight } = useWindowSize()
    const prevHeight = useRef<number>(0)
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
        height: height.toString(),
        diffMode: diffView,
        noParsing: ['json', 'yaml'].includes(mode) ? noParsing : true
    }
    const [state, dispatch] = useReducer(memoisedReducer, initialState)
    const [nativeObject, json, yaml, error] = useJsonYaml(state.code, tabSize, state.mode, !state.noParsing)
    const [, originalJson, originlaYaml, originalError] = useJsonYaml(defaultValue, tabSize, state.mode, !state.noParsing)
   
    function editorDidMount(editor, monaco) {
        editorRef.current = editor
        monacoRef.current = monaco
        if (inline) {
            updateEditorHeight();
            editor.onDidChangeModelDecorations(() => {
                updateEditorHeight(); // typing
                requestAnimationFrame(updateEditorHeight); // folding
            });
        }
    }

    const updateEditorHeight = () => {
        const editorElement = editorRef.current.getDomNode();
        if (!editorElement) {
            return;
        }

        const lineHeight: number = editorRef.current.getOption(monacoRef.current.editor.EditorOption.lineHeight);
        const lineCount: number = editorRef.current.getModel()?.getLineCount() || 1;
        const height: number = editorRef.current.getTopForLineNumber(lineCount + 1) + lineHeight;

        if (prevHeight.current !== height) {
            if (minHeight > height) {
                prevHeight.current = minHeight
                dispatch({ type: 'setHeight', value: minHeight });
            }
            else if (maxHeight < height) {
                prevHeight.current = maxHeight
                dispatch({ type: 'setHeight', value: maxHeight })
            }
            else {
                prevHeight.current = height;
                dispatch({ type: 'setHeight', value: height })
            }
        }
    };

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
            final = state.mode === 'json' ? JSON.stringify(obj, null, tabSize) : YAML.stringify(obj, { indent: 4 })
        }
        dispatch({ type: 'setCode', value: final })
    }, [value, noParsing])


    useEffect(() => {
        if (prevHeight.current !== height) {
            prevHeight.current = height;
            dispatch({ type: 'setHeight', value: height })
        }
    }, [height])

    function handleOnChange(newValue, e) {
        dispatch({ type: 'setCode', value: newValue })
    }

    function handleLanguageChange(mode: 'json' | 'yaml') {
        dispatch({ type: 'changeLanguage', value: mode })
        dispatch({ type: 'setCode', value: mode === 'json' ? json : yaml })
    }

    const options: editor.IEditorConstructionOptions = {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly,
        lineDecorationsWidth: lineDecorationsWidth,
        automaticLayout: false,
        scrollBeyondLastLine: false,
        minimap: {
            enabled: false
        },
        scrollbar: {
            alwaysConsumeMouseWheel: false,
            vertical: inline ? 'hidden' : 'auto'
        }
    };
    return (
        <CodeEditorContext.Provider value={{ dispatch, state, handleLanguageChange, error, defaultValue, height }}>
            {children}
            {loading ?
                <CodeEditorPlaceholder />
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
                            height={state.height || "100%"}
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
                            height={state.height || "100%"}
                            width="100%"
                        />
                    }
                </>
            }
        </CodeEditorContext.Provider>
    );
})

const Header: React.FC<CodeEditorHeaderInterface> & CodeEditorHeaderComposition = ({ children }) => {
    const { defaultValue } = useCodeEditorContext()
    return <div className="code-editor__header flex left">
        {children}
        {defaultValue && <SplitPane />}
    </div>
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
            <Select.Button><span className="ellipsis-right">{state.theme}</span></Select.Button>
            <Select.Search placeholder="select theme" />
            {themes.map(theme => <Select.Option name={theme} key={theme} value={theme}><span className="ellipsis-right">{theme}</span></Select.Option>)}
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

const Warning: React.FC<WarningProps> = function (props) {
    return <div className="code-editor__warning">{props.text}</div>
}

const Information: React.FC<InformationProps> = function (props) {
    return <div className="code-editor__information">
        <Info className="code-editor__information-info-icon" />
        {props.text}
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
function CodeEditorPlaceholder({ className = "", style = {} }) {
    const { height } = useCodeEditorContext()
    return (
        <div className={`code-editor code-editor--placeholder disabled ${className}`} style={{ ...style }}>
            <div className="flex" style={{ height: height || '100%' }}>
                <div className="flex">
                    <Progressing pageLoader />
                </div>
            </div>
        </div>
    )
}

CodeEditor.LanguageChanger = LanguageChanger
CodeEditor.ThemeChanger = ThemeChanger
CodeEditor.ValidationError = ValidationError
CodeEditor.Clipboard = Clipboard
CodeEditor.Header = Header
CodeEditor.Warning = Warning;
CodeEditor.Information = Information;

export default CodeEditor