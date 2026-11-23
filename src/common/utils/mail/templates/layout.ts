export const emailButton = (href: string, label: string): string => `
    <a href="${href}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">
        ${label}
    </a>`;

export const emailLayout = (content: string): string => `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        ${content}
    </div>`;

export const emailFootnote = (text: string): string => `
    <p style="color:#666;font-size:12px;margin-top:20px;">
        ${text}
    </p>`;
