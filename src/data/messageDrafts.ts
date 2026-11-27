export function getDraftKey(username: string | null | undefined, type: "direct" | "group", name: string): string | null {
    return username ? `echochat_draft:${JSON.stringify([username, type, name])}` : null;
}

export function readDraft(key: string | null): string {
    if (!key) return "";

    try {
        return localStorage.getItem(key) ?? "";
    } catch {
        return "";
    }
}

export function saveDraft(key: string | null, text: string): void {
    if (!key) return;

    try {
        if (text) {
            localStorage.setItem(key, text);
        } else {
            localStorage.removeItem(key);
        }
    } catch {
        return;
    }
}
