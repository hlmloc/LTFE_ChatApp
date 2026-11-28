import { useEffect, useRef, useState } from "react";

export function useClipboardFeedback() {
    const [feedback, setFeedback] = useState("");
    const timer = useRef<number | undefined>(undefined);
    const requestId = useRef(0);

    useEffect(() => () => {
        requestId.current += 1;
        window.clearTimeout(timer.current);
    }, []);

    async function copy(text: string) {
        const id = ++requestId.current;
        window.clearTimeout(timer.current);
        setFeedback("");

        let result: string;
        try {
            await navigator.clipboard.writeText(text);
            result = "Đã sao chép";
        } catch {
            result = "Không thể sao chép";
        }

        if (id !== requestId.current) return;
        setFeedback(result);
        timer.current = window.setTimeout(() => setFeedback(""), 2200);
    }

    return { copy, feedback };
}
