"use client";

import React from "react";

/**
 * Renders assistant text with basic formatting: bold, lists, paragraphs.
 * Handles **bold**, bullet lists (- ), numbered lists (1. ), and line breaks.
 */

interface FormattedContentProps {
  content: string;
  className?: string;
}

function formatInlineText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function FormattedContent({
  content,
  className = "",
}: FormattedContentProps) {
  const formatText = (text: string): React.ReactNode[] => {
    const paragraphs = text.split(/\n\n+/);

    return paragraphs.map((para, i) => {
      const lines = para.split("\n");

      // Check if this paragraph is a bullet list
      const isBulletList =
        lines.every(
          (line) => line.trim().startsWith("- ") || line.trim() === ""
        ) && lines.some((line) => line.trim().startsWith("- "));
      if (isBulletList) {
        return (
          <ul
            key={i}
            className="my-2 list-inside list-disc space-y-1 text-sm text-gray-800"
          >
            {lines
              .filter((l) => l.trim().startsWith("- "))
              .map((line, j) => (
                <li key={j}>
                  {formatInlineText(line.replace(/^-\s+/, ""))}
                </li>
              ))}
          </ul>
        );
      }

      // Check if this paragraph is a numbered list
      const isNumberedList =
        lines.every(
          (line) => /^\d+\.\s/.test(line.trim()) || line.trim() === ""
        ) && lines.some((line) => /^\d+\.\s/.test(line.trim()));
      if (isNumberedList) {
        return (
          <ol
            key={i}
            className="my-2 list-inside list-decimal space-y-1 text-sm text-gray-800"
          >
            {lines
              .filter((l) => /^\d+\.\s/.test(l.trim()))
              .map((line, j) => (
                <li key={j}>
                  {formatInlineText(line.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
          </ol>
        );
      }

      // Regular paragraph — handle single line breaks within
      return (
        <p
          key={i}
          className="my-2 text-sm leading-relaxed text-gray-800"
        >
          {lines.map((line, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              {formatInlineText(line)}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  return <div className={`leading-relaxed ${className}`}>{formatText(content)}</div>;
}
