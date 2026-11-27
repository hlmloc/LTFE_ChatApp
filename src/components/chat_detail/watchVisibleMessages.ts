export function watchVisibleMessages(list: HTMLElement, lastRead: number, acknowledge: (index: number) => void) {
    const visible = new Set<number>();
    let retry: number | undefined;

    function report() {
        window.clearTimeout(retry);
        if (document.visibilityState !== "visible" || !document.hasFocus()) return;
        const newest = Math.max(lastRead, ...visible);
        if (newest <= lastRead) return;
        try {
            acknowledge(newest);
            lastRead = newest;
        } catch {
            retry = window.setTimeout(report, 1500);
        }
    }

    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            const index = Number((entry.target as HTMLElement).dataset.readIndex);
            if (entry.isIntersecting && entry.intersectionRect.height > 0 && entry.intersectionRect.width > 0) {
                visible.add(index);
            } else {
                visible.delete(index);
            }
        }
        report();
    }, { root: list, threshold: [0, 0.01] });

    list.querySelectorAll("[data-read-index]").forEach(node => observer.observe(node));
    window.addEventListener("focus", report);
    document.addEventListener("visibilitychange", report);
    return () => {
        window.clearTimeout(retry);
        observer.disconnect();
        visible.clear();
        window.removeEventListener("focus", report);
        document.removeEventListener("visibilitychange", report);
    };
}
