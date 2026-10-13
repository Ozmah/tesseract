/**
 * Whether a keyboard event comes from a place where the user is typing,
 * so global shortcuts must not react to it.
 */
export function isTypingTarget(event: KeyboardEvent): boolean {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
    );
}

/**
 * Whether the event carries a modifier that turns it into a browser or
 * system shortcut.
 */
export function hasShortcutModifier(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.metaKey || event.altKey;
}
