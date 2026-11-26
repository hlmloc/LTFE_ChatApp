import {
    type FormEvent,
    type KeyboardEvent,
    type ChangeEvent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import { Bold, Camera, Check, Code, Italic, Link, List, Mic, Image as ImageIcon, SmilePlus, Plus, Send, Strikethrough, Type, X } from "lucide-react";
import StickerPicker from "../sticker/StickerPicker";
import { createStickerMessage, type StickerId } from "../../data/stickers";
import "./ChatInput.css";
import { uploadImage, type UploadedImage } from "../../services/MediaService";
type ChatInputProps = {
    onSend: (message: string) => Promise<void>;
    edit?: {
        targetId: string;
        originalText: string;
        text: string;
        error?: string;
        onChange: (text: string) => void;
        onSave: (text: string) => void;
        onCancel: () => void;
    };
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

export default function ChatInput({ onSend, edit }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [toolbarOpen, setToolbarOpen] = useState(false);
    const sendingRef = useRef(false);
    const pickerAnchorRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const pendingSelection = useRef<[number, number] | null>(null);

    const editTargetId = edit?.targetId;
    const text = edit?.text ?? message;
    const setText = edit?.onChange ?? setMessage;
    const content = text.trim();
    const canSubmit = Boolean(content) && content !== edit?.originalText.trim() && !sending;
    const submitLabel = edit ? "Lưu chỉnh sửa" : "Gửi tin nhắn";

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
    }, [text]);

    useLayoutEffect(() => {
        const input = inputRef.current;
        if (!input || !editTargetId || sending) return;

        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }, [editTargetId, sending]);

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

    const handleImageSelect = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setError("");
        setUploadedImage(null);
        setUploadingImage(true);

        try {
            const result = await uploadImage(file);

            setUploadedImage(result);

            console.log("Upload ảnh thành công:", result);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể upload hình ảnh"
            );
        } finally {
            setUploadingImage(false);

            event.target.value = "";
        }
    };

    const updateSelection = (start: number, end: number, replacement: string, nextStart: number, nextEnd: number) => {
        pendingSelection.current = [nextStart, nextEnd];
        setText(text.slice(0, start) + replacement + text.slice(end));
    };

    const applyFormat = (format: Format) => {
        const input = inputRef.current;
        if (!input || sendingRef.current) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const selected = text.slice(start, end);

        if (format === "list") {
            const lineStart = text.lastIndexOf("\n", start - 1) + 1;
            const nextLine = text.indexOf("\n", end);
            const lineEnd = nextLine === -1 ? text.length : nextLine;
            const source = text.slice(lineStart, lineEnd);
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
                ? [start === 0 || text[start - 1] === "\n" ? "```\n" : "\n```\n", end === text.length || text[end] === "\n" ? "\n```" : "\n```\n", "code"]
                : ["`", "`", "code"],
        } as const;
        const [before, after, placeholder] = markers[format];
        const content = selected || placeholder;
        updateSelection(start, end, before + content + after, start + before.length, start + before.length + content.length);
    };

    const submitText = () => {
        if (!canSubmit) return;

        if (edit) edit.onSave(content);
        else void sendContent(content, true);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitText();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (edit && event.key === "Escape" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            edit.onCancel();
            return;
        }

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
            submitText();
        }
    };

    const handleStickerSelect = (stickerId: StickerId) => {
        closePicker();
        void sendContent(createStickerMessage(stickerId), false);
    };

    return (
        <form
            className={edit ? "chat-input-container chat-input-container--editing" : "chat-input-container"}
            onSubmit={handleSubmit}
        >
            <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={handleImageSelect}
            />
            <button type="button" className="btn-camera">
                <Camera size={20} strokeWidth={2.5} />
            </button>

            <div className="input-wrapper">
                {uploadingImage && (
                    <p className="upload-status">Đang tải hình ảnh lên...</p>
                )}

                {uploadedImage && (
                    <div className="uploaded-image-preview">
                        <img
                            src={uploadedImage.url}
                            alt={uploadedImage.name}
                            title={uploadedImage.name}
                        />
                        <button
                            type="button"
                            className="remove-preview-btn"
                            aria-label="Xóa ảnh"
                            onClick={() => setUploadedImage(null)}
                        >
                            <X size={13} strokeWidth={2.5} />
                        </button>
                    </div>
                )}

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
                        aria-label={edit ? "Nội dung chỉnh sửa" : "Nội dung tin nhắn"}
                        aria-describedby={edit ? "edit-draft-label" : undefined}
                        value={text}
                        onChange={event => setText(event.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                    />

                    {/* Đưa toàn bộ action-icons vào bên trong input-entry giống IG */}
                    <div className="action-icons">
                        {!edit && (
                            <>
                                <button type="button" aria-label="Ghi âm">
                                    <Mic size={22} strokeWidth={1.75} />
                                </button>

                                <button
                                    type="button"
                                    aria-label="Gửi hình ảnh"
                                    title="Gửi hình ảnh"
                                    disabled={uploadingImage || sending}
                                    onClick={() => imageInputRef.current?.click()}
                                >
                                    <ImageIcon size={22} strokeWidth={1.75} />
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
                                        <SmilePlus size={22} strokeWidth={1.75} />
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
                                    <Plus size={24} strokeWidth={1.75} />
                                </button>
                            </>
                        )}

                        <button
                            type="submit"
                            className={edit ? "save-edit-button" : "send-button"}
                            disabled={!canSubmit}
                            title={submitLabel}
                            aria-label={submitLabel}
                        >
                            {edit ? <Check size={18} aria-hidden="true" /> : <Send size={20} strokeWidth={1.75} />}
                        </button>
                    </div>
                </div>

                {edit?.error && <p className="send-error" role="alert">{edit.error}</p>}
            </div>

            {!edit && error && <p className="send-error" role="alert">{error}</p>}
        </form>
    );
}
