import sanitizeHtml from "sanitize-html";

export function sanitizeContent(content: string) {
  return sanitizeHtml(content, {
    allowedAttributes: {
      code: ['class'],
      span: ['class'],
    },
    allowedClasses: {
      'code': ['language-*', 'lang-*'],
      'span': ['hljs-*'],
    },
    allowedTags: ['pre', 'code', 'p', 'span'],
  });
}

export function ensureContentLength(content: string) {
  const maxContentLength = 1200;
  const maxTextLength = 300;
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