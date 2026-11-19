import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Camera, Mic, Image as ImageIcon, SmilePlus, Plus, Send } from "lucide-react";
import StickerPicker from "../sticker/StickerPicker";
import { createStickerMessage, type StickerId } from "../../data/stickers";
import "./ChatInput.css";

type ChatInputProps = {
    onSend: (message: string) => Promise<void>;
};

export default function ChatInput({ onSend }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);
    const sendingRef = useRef(false);
    const pickerAnchorRef = useRef<HTMLDivElement>(null);

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

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void sendContent(message.trim(), true);
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
                <input
                    type="text"
                    placeholder="Nhắn tin..."
                    className="text-input"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    disabled={sending}
                />
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
                        onClick={() => setPickerOpen((current) => !current)}
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
