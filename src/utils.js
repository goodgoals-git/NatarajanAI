export const createThreadId = () => `thread-${Date.now()}-${crypto.randomUUID()}`;

export const titleCase = (value = '') =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const flattenTree = (tree = {}) =>
  Object.entries(tree).flatMap(([groupName, threads]) =>
    threads.map((thread) => ({ ...thread, groupName: thread.groupName || groupName }))
  );

export const getThreadPath = (thread) => `${slugify(thread.groupName)}/${slugify(thread.title)}`;

export const formatRelativeTime = (value) => {
  if (!value) return 'Just now';

  const timestamp = new Date(value).getTime();
  const delta = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(delta / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const synthesizeAssistantReply = (prompt, contextMessages = []) => {
  const contextNote = contextMessages.length
    ? ` I also found ${contextMessages.length} recalled memory item${contextMessages.length === 1 ? '' : 's'} to keep this grounded in your workspace.`
    : '';

  return [
    `I have captured this in the permanent memory stream and prepared it for folder-aware recall.${contextNote}`,
    `Here is the executive synthesis: ${prompt.trim()}`,
    'Next, I can deepen the answer, compare alternatives, or turn this into an action plan while preserving the conversation in MongoDB.'
  ].join('\n\n');
};
