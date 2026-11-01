import './ChatInput.css';
import { Camera, Mic, Image as ImageIcon, SmilePlus, Plus } from 'lucide-react';

export default function ChatInput() {
    return (
        <div className="chat-input-container">

            <button className="btn-camera">
                <Camera size={20} strokeWidth={2.5} />
            </button>

            <div className="input-wrapper">
                <input
                    type="text"
                    placeholder="Nhắn tin..."
                    className="text-input"
                />
            </div>

            <div className="action-icons">
                <button><Mic size={24} strokeWidth={1.5} /></button>
                <button><ImageIcon size={24} strokeWidth={1.5} /></button>
                <button><SmilePlus size={24} strokeWidth={1.5} /></button>
                <button><Plus size={26} strokeWidth={1.5} /></button>
            </div>

        </div>
    );
}