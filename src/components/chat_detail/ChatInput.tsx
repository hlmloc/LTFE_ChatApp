
import {type FormEvent, useState} from "react";
import { Camera, Mic, Image as ImageIcon, SmilePlus, Plus, Send } from "lucide-react";

import "./ChatInput.css";

type ChatInputProps = {
    onSend: (message: string) => Promise<void>;
};

export default function ChatInput({ onSend }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const content = message.trim();

        if (!content || sending) return;

        try {
            setSending(true);
            setError("");

            await onSend(content);

            setMessage("");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể gửi tin nhắn"
            );
        } finally {
            setSending(false);
        }
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
                <button type="button">
                    <Mic size={24} strokeWidth={1.5} />
                </button>

                <button type="button">
                    <ImageIcon size={24} strokeWidth={1.5} />
                </button>

                <button type="button">
                    <SmilePlus size={24} strokeWidth={1.5} />
                </button>

                <button type="button">
                    <Plus size={26} strokeWidth={1.5} />
                </button>

                <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    title="Gửi tin nhắn"
                >
                    <Send size={22} />
                </button>
            </div>

            {error && <p className="send-error">{error}</p>}
        </form>
    );
}
