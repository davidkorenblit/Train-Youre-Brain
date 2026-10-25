import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as monacoType from "monaco-editor";
import { UserComment } from "../types";

interface CodeEditorProps {
  code: string;
  language?: string;
  comments: UserComment[];
  activeLineForComment: number | null;
  onLineClick: (lineNumber: number, topPx: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language = "python",
  comments,
  activeLineForComment,
  onLineClick,
}) => {
  const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  // Configure editor on mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Listen to mouse clicks in glyph margin or line content
    editor.onMouseDown((e) => {
      const target = e.target;
      const lineNumber = target.position?.lineNumber;

      if (lineNumber) {
        // Calculate vertical position of line inside the editor
        const topPx = editor.getTopForLineNumber(lineNumber) - editor.getScrollTop();
        onLineClick(lineNumber, topPx + 36);
      }
    });

    // Custom CSS styling for commented lines and glyph margin
    monaco.editor.defineTheme("codeReviewDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a9955" },
        { token: "keyword", foreground: "569cd6" },
        { token: "string", foreground: "ce9178" },
      ],
      colors: {
        "editor.background": "#0d1117",
        "editorGutter.background": "#0d1117",
        "editorLineNumber.foreground": "#484f58",
        "editorLineNumber.activeForeground": "#58a6ff",
      },
    });

    monaco.editor.setTheme("codeReviewDark");
  };

  // Update line decorations whenever comments change
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const newDecorations: monacoType.editor.IModelDeltaDecoration[] = comments.map((c) => ({
      range: {
        startLineNumber: c.line_number,
        startColumn: 1,
        endLineNumber: c.line_number,
        endColumn: 1,
      },
      options: {
        isWholeLine: true,
        className: "monaco-commented-line",
        glyphMarginClassName: "monaco-glyph-add-btn",
        glyphMarginHoverMessage: { value: `**הערת סקירה**: ${c.comment}` },
      },
    }));

    // If a line is currently active for adding an inline comment, highlight it
    if (activeLineForComment) {
      newDecorations.push({
        range: {
          startLineNumber: activeLineForComment,
          startColumn: 1,
          endLineNumber: activeLineForComment,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "monaco-commented-line",
        },
      });
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [comments, activeLineForComment]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "450px",
        position: "relative",
        direction: "ltr",
        textAlign: "left",
      }}
    >
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          fontSize: 14,
          fontFamily: "'Fira Code', Consolas, monospace",
          lineNumbers: "on",
          glyphMargin: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderLineHighlight: "all",
          cursorStyle: "line",
          domReadOnly: true,
          padding: { top: 12, bottom: 12 },
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};
