import { type FormEvent, type KeyboardEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Bold, Camera, Code, Italic, Link, List, Mic, Image as ImageIcon, SmilePlus, Plus, Send, Strikethrough, Type } from "lucide-react";
import StickerPicker from "../sticker/StickerPicker";
import { createStickerMessage, type StickerId } from "../../data/stickers";
import "./ChatInput.css";

type ChatInputProps = {
    onSend: (message: string) => Promise<void>;
};

type Format = "bold" | "italic" | "strike" | "code" | "list" | "link";

const formats = [
    { id: "bold", label: "In đậm", icon: Bold },
    { id: "italic", label: "In nghiêng", icon: Italic },
    { id: "strike", label: "Gạch ngang", icon: Strikethrough },
    { id: "code", label: "Code", icon: Code },
    { id: "list", label: "Danh sách", icon: List },
    { id: "link", label: "Liên kết", icon: Link },
] as const;

export default function ChatInput({ onSend }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);
    const [toolbarOpen, setToolbarOpen] = useState(false);
    const sendingRef = useRef(false);
    const pickerAnchorRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const pendingSelection = useRef<[number, number] | null>(null);

    const closePicker = useCallback(() => setPickerOpen(false), []);

    useEffect(() => {
        if (!pickerOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (
                event.target instanceof Node &&
                !pickerAnchorRef.current?.contains(event.target)
            ) {
                closePicker();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [pickerOpen, closePicker]);

    useLayoutEffect(() => {
        const input = inputRef.current;
        if (!input) return;

        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, 120)}px`;

        if (pendingSelection.current) {
            const [start, end] = pendingSelection.current;
            input.focus();
            input.setSelectionRange(start, end);
            pendingSelection.current = null;
        }
    }, [message]);

    const sendContent = async (content: string, clearMessage: boolean) => {
        if (!content || sendingRef.current) return;

        sendingRef.current = true;
        setSending(true);
        setError("");

        try {
            await onSend(content);
            if (clearMessage) setMessage("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể gửi tin nhắn");
        } finally {
            sendingRef.current = false;
            setSending(false);
        }
    };

    const updateSelection = (start: number, end: number, replacement: string, nextStart: number, nextEnd: number) => {
        pendingSelection.current = [nextStart, nextEnd];
        setMessage(message.slice(0, start) + replacement + message.slice(end));
    };

    const applyFormat = (format: Format) => {
        const input = inputRef.current;
        if (!input || sendingRef.current) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const selected = message.slice(start, end);

        if (format === "list") {
            const lineStart = message.lastIndexOf("\n", start - 1) + 1;
            const nextLine = message.indexOf("\n", end);
            const lineEnd = nextLine === -1 ? message.length : nextLine;
            const source = message.slice(lineStart, lineEnd);
            const formatted = source.split("\n").map(line => line.startsWith("- ") ? line : `- ${line}`).join("\n");
            const offset = formatted.length - source.length;
            const cursor = start + (source.startsWith("- ") ? 0 : 2);
            updateSelection(lineStart, lineEnd, formatted, start === end ? cursor : lineStart, start === end ? cursor : end + offset);
            return;
        }

        if (format === "link") {
            const title = selected || "liên kết";
            const replacement = `[${title}](https://)`;
            const urlStart = start + title.length + 3;
            updateSelection(start, end, replacement, urlStart, urlStart + 8);
            return;
        }

        const codeBlock = selected.includes("\n");
        const markers = {
            bold: ["**", "**", "văn bản"],
            italic: ["*", "*", "văn bản"],
            strike: ["~~", "~~", "văn bản"],
            code: codeBlock
                ? [start === 0 || message[start - 1] === "\n" ? "```\n" : "\n```\n", end === message.length || message[end] === "\n" ? "\n```" : "\n```\n", "code"]
                : ["`", "`", "code"],
        } as const;
        const [before, after, placeholder] = markers[format];
        const content = selected || placeholder;
        updateSelection(start, end, before + content + after, start + before.length, start + before.length + content.length);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void sendContent(message.trim(), true);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if ((event.ctrlKey || event.metaKey) && !event.altKey) {
            const key = event.key.toLowerCase();
            if (key === "b" || key === "i") {
                event.preventDefault();
                applyFormat(key === "b" ? "bold" : "italic");
                return;
            }
        }

        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void sendContent(message.trim(), true);
        }
    };

    const handleStickerSelect = (stickerId: StickerId) => {
        closePicker();
        void sendContent(createStickerMessage(stickerId), false);
    };

    return (
        <form className="chat-input-container" onSubmit={handleSubmit}>
            <button type="button" className="btn-camera">
                <Camera size={20} strokeWidth={2.5} />
            </button>

            <div className="input-wrapper">
                {toolbarOpen && (
                    <div className="format-toolbar" role="toolbar" aria-label="Định dạng tin nhắn">
                        {formats.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                aria-label={label}
                                title={label}
                                disabled={sending}
                                onMouseDown={event => event.preventDefault()}
                                onClick={() => applyFormat(id)}
                            >
                                <Icon size={17} strokeWidth={2} />
                            </button>
                        ))}
                    </div>
                )}
                <div className="input-entry">
                    <button
                        type="button"
                        className={`format-toggle${toolbarOpen ? " format-toggle--active" : ""}`}
                        aria-label="Bật hoặc tắt thanh định dạng"
                        aria-pressed={toolbarOpen}
                        title="Định dạng tin nhắn"
                        disabled={sending}
                        onClick={() => {
                            setToolbarOpen(current => !current);
                            closePicker();
                            inputRef.current?.focus();
                        }}
                    >
                        <Type size={19} />
                    </button>
                    <textarea
                        ref={inputRef}
                        rows={1}
                        placeholder="Nhắn tin..."
                        className="text-input"
                        aria-label="Nội dung tin nhắn"
                        value={message}
                        onChange={event => setMessage(event.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                    />
                </div>
            </div>

            <div className="action-icons">
                <button type="button" aria-label="Ghi âm">
                    <Mic size={24} strokeWidth={1.5} />
                </button>

                <button type="button" aria-label="Gửi hình ảnh">
                    <ImageIcon size={24} strokeWidth={1.5} />
                </button>

                <div className="sticker-anchor" ref={pickerAnchorRef}>
                    <button
                        type="button"
                        className="sticker-trigger"
                        aria-label="Chọn sticker"
                        aria-expanded={pickerOpen}
                        aria-haspopup="dialog"
                        title="Sticker"
                        disabled={sending}
                        onClick={() => {
                            setPickerOpen(current => !current);
                            setToolbarOpen(false);
                        }}
                    >
                        <SmilePlus size={24} strokeWidth={1.5} />
                    </button>
                    {pickerOpen && (
                        <StickerPicker
                            onSelect={handleStickerSelect}
                            onClose={closePicker}
                            disabled={sending}
                        />
                    )}
                </div>

                <button type="button" aria-label="Thêm">
                    <Plus size={26} strokeWidth={1.5} />
                </button>

                <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    title="Gửi tin nhắn"
                    aria-label="Gửi tin nhắn"
                >
                    <Send size={22} />
                </button>
            </div>

            {error && <p className="send-error" role="alert">{error}</p>}
        </form>
    );
}
