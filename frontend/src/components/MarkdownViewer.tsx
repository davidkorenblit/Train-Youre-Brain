import React from "react";

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  // Simple, robust zero-dependency parser for exercise README markdown
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      renderedElements.push(
        <ul key={`list-${renderedElements.length}`}>
          {listBuffer.map((item, idx) => (
            <li key={idx}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const parseInline = (text: string): React.ReactNode => {
    // Bold **text**
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start / end
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        renderedElements.push(
          <pre key={`code-${renderedElements.length}`}>
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Unordered list
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      listBuffer.push(line.trim().slice(2));
      continue;
    } else {
      flushList();
    }

    // Headings
    if (line.startsWith("# ")) {
      renderedElements.push(<h1 key={i}>{parseInline(line.slice(2))}</h1>);
    } else if (line.startsWith("## ")) {
      renderedElements.push(<h2 key={i}>{parseInline(line.slice(3))}</h2>);
    } else if (line.startsWith("### ")) {
      renderedElements.push(<h3 key={i}>{parseInline(line.slice(4))}</h3>);
    } else if (line.trim() === "") {
      // Empty line space
      renderedElements.push(<div key={i} style={{ height: "8px" }} />);
    } else {
      renderedElements.push(<p key={i}>{parseInline(line)}</p>);
    }
  }

  flushList();

  return <div className="instructions-view">{renderedElements}</div>;
};
