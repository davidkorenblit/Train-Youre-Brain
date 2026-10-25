import React from "react";
import { getChallengeHebrewSummary } from "../data/challengeSummaries";

interface MarkdownViewerProps {
  content: string;
  slug?: string;
  challengeTitle?: string;
  showHebrewIntro?: boolean;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  slug,
  challengeTitle,
  showHebrewIntro = false,
}) => {
  const hebrewSummary = showHebrewIntro ? getChallengeHebrewSummary(slug) : null;

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
    // Regex matching inline code, bold text, and markdown links
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="markdown-link"
          >
            {linkMatch[1]} ↗
          </a>
        );
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

  return (
    <div className="instructions-view">
      {hebrewSummary && (
        <div className="hebrew-mission-brief">
          <div className="mission-brief-header">
            <div className="mission-brief-badge">
              <span>🎯 תדריך משימה בעברית</span>
            </div>
            <span className="mission-brief-category">{hebrewSummary.category}</span>
          </div>

          <h2 className="mission-brief-title">
            {hebrewSummary.hebrewTitle} {challengeTitle && `(${challengeTitle})`}
          </h2>

          <p className="mission-brief-summary">{hebrewSummary.summary}</p>

          <div className="mission-brief-box">
            <strong>התנהגות צפויה / דוגמה:</strong>
            <p>{hebrewSummary.expectedBehavior}</p>
          </div>

          <div className="mission-brief-checklist">
            <strong>דגשים מומלצים לביקורת הקוד:</strong>
            <ul>
              {hebrewSummary.reviewTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="mission-brief-divider">
            <span>📖 מפרט טכני והוראות מקוריות באנגלית (Original Specification):</span>
          </div>
        </div>
      )}

      {renderedElements}
    </div>
  );
};
