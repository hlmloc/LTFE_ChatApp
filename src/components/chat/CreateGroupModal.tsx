
import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import "./CreateGroupModal.css";

type CreateGroupModalProps = {
    onClose: () => void;
    onCreate: (groupName: string) => void;
    isSubmitting: boolean;
    error: string;
};

export default function CreateGroupModal({ onClose, onCreate, isSubmitting, error }: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting || !groupName.trim()) return;
        onCreate(groupName.trim());
    }

    return (
        <div
            className="create-group-overlay"
            onClick={event => {
                if (event.target === event.currentTarget && !isSubmitting) onClose();
            }}
        >
            <form
                className="create-group-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-group-title"
                onSubmit={handleSubmit}
            >
                <header className="create-group-modal__header">
                    <h2 id="create-group-title">Tạo nhóm mới</h2>

                    <button
                        type="button"
                        className="create-group-modal__close"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Đóng"
                    >
                        <X size={24} />
                    </button>
                </header>

                <div className="create-group-modal__body">
                    <div className="create-group-modal__field">
                        <label htmlFor="group-name">Tên nhóm</label>

                        <input
                            id="group-name"
                            type="text"
                            placeholder="Ví dụ: Nhóm dự án Frontend"
                            value={groupName}
                            maxLength={40}
                            autoFocus
                            disabled={isSubmitting}
                            onChange={event => setGroupName(event.target.value)}
                        />
                    </div>

                    <p className="create-group-note">
                        Sau khi tạo nhóm, bạn sẽ là thành viên đầu tiên của phòng.
                    </p>

                    {error && <p className="create-group-error" role="alert">{error}</p>}
                </div>

                <footer className="create-group-modal__footer">
                    <button
                        type="submit"
                        className="create-group-submit"
                        disabled={!groupName.trim() || isSubmitting}
                    >
                        {isSubmitting ? "Đang tạo nhóm..." : "Tạo nhóm"}
                    </button>
                </footer>
            </form>
        </div>
    );
}
