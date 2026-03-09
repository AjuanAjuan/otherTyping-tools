import { CodeDiff as VCodeDiff } from 'v-code-diff'
import CodeD from 'v-code-diff'
import typescript from 'highlight.js/lib/languages/typescript'
import csharp from 'highlight.js/lib/languages/csharp'

CodeD.hljs.registerLanguage('typescript', typescript)
CodeD.hljs.registerLanguage('csharp', csharp)

export { VCodeDiff }