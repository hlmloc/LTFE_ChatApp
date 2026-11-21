import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MarkdownMessage.css";

type MarkdownMessageProps = {
    text: string;
};

export default function MarkdownMessage({ text }: MarkdownMessageProps) {
    return (
        <div className="markdown-message">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                skipHtml
                components={{
                    img: () => null,
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
