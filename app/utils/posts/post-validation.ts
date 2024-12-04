import sanitizeHtml from "sanitize-html";

export function sanitizeContent(content: string) {
  return sanitizeHtml(content, {
    allowedAttributes: {
      p: ['style'],
      code: ['class'],
      span: ['class', 'style'],
      ul: ['class'],
      blockquote: ['class'],
    },
    allowedClasses: {
      'code': ['language-*', 'lang-*'],
      'span': ['hljs-*'],
      'ul': ['tiptap-bullet-list'],
      'blockquote': ['tiptap-blockquote'],
    },
    allowedStyles: {
      '*': {
        // Match HEX and RGB
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'font-family': [/.*/],
        'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
        // Match any number with px, em, or %
        'font-size': [/^\d+(?:px|em|%)$/],
      },
    },
    allowedTags: ['pre', 'code', 'p', 'span', 'ul', 'li', 'hr', 'blockquote', 'strong', 'em', 's', 'u'],
  });
}

export function ensureContentLength(content: string) {
  const maxContentLength = 65536;
  const maxTextLength = 32768;
  if (content.length === 0) {
    return 'Post content is required';
  } else if (content.length > maxContentLength) {
    return `Post content and nodes must be less than ${maxContentLength} characters`;
  }
  const textContent = sanitizeHtml(content, {
    allowedAttributes: {},
    allowedTags: []
  });
  if (textContent.length === 0) {
    return 'Post content is required';
  } else if (textContent.length > maxTextLength) {
    return `Post content must be less than ${maxTextLength} characters`;
  }
}