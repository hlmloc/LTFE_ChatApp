import { useRef, type ComponentPropsWithoutRef } from "react";
import { Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import "./MarkdownMessage.css";

type MarkdownMessageProps = {
    text: string;
};

function CopyableCodeBlock({ node: _node, children, ...props }: ComponentPropsWithoutRef<"pre"> & { node?: unknown }) {
    const preRef = useRef<HTMLPreElement>(null);
    const { copy, feedback } = useClipboardFeedback();

    return (
        <div className="markdown-code-block">
            <div className="markdown-code-block__toolbar">
                <button
                    type="button"
                    className="markdown-code-block__copy"
                    aria-label="Sao chép đoạn code"
                    onClick={() => {
                        const code = preRef.current?.textContent;
                        if (code != null) void copy(code);
                    }}
                >
                    <Copy size={13} aria-hidden="true" />
                    <span aria-live="polite">{feedback || "Sao chép"}</span>
                </button>
            </div>
            <pre {...props} ref={preRef}>{children}</pre>
        </div>
    );
}

export default function MarkdownMessage({ text }: MarkdownMessageProps) {
    return (
        <div className="markdown-message">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                skipHtml
                components={{
                    img: () => null,
                    pre: CopyableCodeBlock,
                    a: ({ node: _node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    );
}
