/**
 * Keyboard behaviour for dialogs (WCAG 2.1.2, 2.4.3): on open, focus moves into the dialog; Escape
 * closes it; when it closes, focus returns to the control that opened it. A modal dialog also keeps
 * Tab and Shift+Tab inside itself (`trap`).
 */
import { RefObject, useEffect, useRef, useState } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusableIn(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.hasAttribute('hidden') && el.getClientRects().length > 0);
}

export function useDialogFocus(ref: RefObject<HTMLElement | null>, onClose: () => void, opts: { trap: boolean; returnFocusTo?: () => HTMLElement | null }): void {
  const close = useRef(onClose);
  close.current = onClose;
  const returnTo = useRef(opts.returnFocusTo);
  returnTo.current = opts.returnFocusTo;
  // read during the first render, before an autoFocus inside the dialog moves focus
  const [opener] = useState(() => (document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null));
  useEffect(() => {
    const root = ref.current;
    if (root && !root.contains(document.activeElement)) (root.querySelector<HTMLElement>('[autofocus]') ?? focusableIn(root)[0] ?? root).focus();
    const onKey = (e: KeyboardEvent) => {
      const r = ref.current;
      if (!r) return;
      if (e.key === 'Escape') {
        // a non-modal panel only closes when the key is pressed inside it
        if (!opts.trap && !r.contains(e.target as Node)) return;
        e.preventDefault();
        e.stopPropagation();
        close.current();
        return;
      }
      if (e.key !== 'Tab' || !opts.trap) return;
      const items = focusableIn(r);
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !r.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !r.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      // back to the control that opened the dialog (or a replacement for it, if it was re-created)
      requestAnimationFrame(() => {
        // not when the dialog is still on the page (React's development double-mount)
        if (ref.current?.isConnected) return;
        // the opener, unless it is gone or was disabled (then the caller's replacement)
        const usable = (el: HTMLElement | null | undefined) => !!el && el.isConnected && !(el as HTMLButtonElement).disabled;
        const target = usable(opener) ? opener : returnTo.current?.() ?? null;
        target?.focus();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
