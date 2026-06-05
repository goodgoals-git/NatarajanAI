import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BrainCircuit,
  ChevronDown,
  FolderKanban,
  Gem,
  Loader2,
  LogOut,
  MessageSquarePlus,
  Network,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  WandSparkles
} from 'lucide-react';
import { API_BASE_URL, authApi, chatApi } from './api';
import { clearSession, loadSession, saveSession } from './storage';
import {
  createThreadId,
  flattenTree,
  formatRelativeTime,
  getThreadPath,
  synthesizeAssistantReply,
  titleCase
} from './utils';

const welcomeMessages = [
  {
    role: 'assistant',
    content:
      'Welcome to NatarajanAI Reformed. Start a conversation and I will sync it into MongoDB-backed permanent memory with folder-aware organization.'
  }
];

const initialMemoryStats = [
  { label: 'Folders', value: '0' },
  { label: 'Threads', value: '0' },
  { label: 'Recall', value: 'Ready' }
];

function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = mode === 'login' ? await authApi.login(email, password) : await authApi.register(email, password);
      saveSession(response);
      onAuthenticated(response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="aurora-card auth-hero">
        <div className="brand-mark">
          <Sparkles size={28} />
        </div>
        <p className="eyebrow">NatarajanAI Reformed</p>
        <h1>Permanent-memory intelligence, wrapped in a cinematic workspace.</h1>
        <p>
          Authenticate with the backend, reopen MongoDB-backed conversations, and let related chats gather into refined topic folders.
        </p>
        <div className="hero-metrics">
          <span><ShieldCheck size={18} /> JWT secured</span>
          <span><FolderKanban size={18} /> Foldered memory</span>
          <span><BrainCircuit size={18} /> Context recall</span>
        </div>
      </section>

      <form className="aurora-card auth-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Secure access</p>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your core identity'}</h2>
        </div>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            minLength={6}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="spin" size={18} /> : <Gem size={18} />}
          {mode === 'login' ? 'Enter workspace' : 'Create account'}
        </button>
        <button className="ghost-button" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account? Register' : 'Already registered? Log in'}
        </button>
        <p className="endpoint-note">Connected to {API_BASE_URL}</p>
      </form>
    </main>
  );
}

function Sidebar({ tree, activeThreadId, onNewThread, onSelectThread, isLoading }) {
  const groups = Object.entries(tree || {});

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-lockup">
          <div className="brand-mark small"><Sparkles size={20} /></div>
          <div>
            <strong>NatarajanAI</strong>
            <span>Reformed Core</span>
          </div>
        </div>
        <button className="icon-button" onClick={onNewThread} aria-label="New thread">
          <MessageSquarePlus size={19} />
        </button>
      </div>

      <button className="new-chat" onClick={onNewThread}>
        <WandSparkles size={18} /> New premium chat
      </button>

      <div className="sidebar-search">
        <Search size={16} />
        <span>Smart memory folders</span>
      </div>

      <div className="folder-list">
        {isLoading && <p className="muted-row"><Loader2 className="spin" size={16} /> Loading memory tree…</p>}
        {!isLoading && groups.length === 0 && <p className="empty-state">No folders yet. Start a chat and the backend will classify it.</p>}
        {groups.map(([groupName, threads]) => (
          <section className="folder-group" key={groupName}>
            <header>
              <span><FolderKanban size={16} /> {titleCase(groupName)}</span>
              <ChevronDown size={16} />
            </header>
            {threads.map((thread) => (
              <button
                className={`thread-row ${activeThreadId === thread.threadId ? 'active' : ''}`}
                key={thread.threadId}
                onClick={() => onSelectThread(thread)}
              >
                <span>{thread.title || 'Untitled thread'}</span>
                <small>{formatRelativeTime(thread.updatedAt)}</small>
              </button>
            ))}
          </section>
        ))}
      </div>
    </aside>
  );
}

function MessageBubble({ message }) {
  return (
    <article className={`message ${message.role}`}>
      <div className="message-avatar">{message.role === 'user' ? 'You' : 'AI'}</div>
      <div className="message-card">
        {message.content.split('\n').map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
    </article>
  );
}

function MemoryPanel({ tree, activeThread, onResolveReference, referencePath, setReferencePath, referenceStatus }) {
  const threads = useMemo(() => flattenTree(tree), [tree]);
  const stats = [
    { label: 'Folders', value: Object.keys(tree || {}).length.toString() },
    { label: 'Threads', value: threads.length.toString() },
    { label: 'Recall', value: activeThread ? 'Live' : 'Ready' }
  ];

  return (
    <aside className="memory-panel">
      <div className="panel-card glass">
        <p className="eyebrow">Permanent memory</p>
        <h3>MongoDB workspace graph</h3>
        <div className="stat-grid">
          {(threads.length ? stats : initialMemoryStats).map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-card">
        <p className="eyebrow">Current context</p>
        <h3>{activeThread?.title || 'New untitled thread'}</h3>
        <p className="panel-copy">
          {activeThread
            ? `Path: ${getThreadPath(activeThread)}`
            : 'Once synced, the backend can classify this chat into a folder such as Computer Talk.'}
        </p>
      </div>

      <form className="panel-card reference-card" onSubmit={onResolveReference}>
        <p className="eyebrow">Context reference</p>
        <h3>Pull a prior memory</h3>
        <input
          value={referencePath}
          onChange={(event) => setReferencePath(event.target.value)}
          placeholder="computer-talk/gpu-upgrades"
        />
        <button className="secondary-button" type="submit">
          <Network size={16} /> Resolve reference
        </button>
        {referenceStatus && <p className="reference-status">{referenceStatus}</p>}
      </form>
    </aside>
  );
}

function Workspace({ session, onLogout }) {
  const [tree, setTree] = useState({});
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState(welcomeMessages);
  const [prompt, setPrompt] = useState('');
  const [referencePath, setReferencePath] = useState('');
  const [referenceStatus, setReferenceStatus] = useState('');
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState('');
  const messagesEndRef = useRef(null);

  const loadSidebar = useCallback(async () => {
    setIsSidebarLoading(true);
    try {
      const response = await chatApi.sidebar(session.token);
      setTree(response.tree || {});
    } catch (requestError) {
      setToast(requestError.message);
    } finally {
      setIsSidebarLoading(false);
    }
  }, [session.token]);

  useEffect(() => {
    void loadSidebar();
  }, [loadSidebar]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewThread = () => {
    const thread = {
      threadId: createThreadId(),
      title: 'Untitled thread',
      groupName: 'uncategorized',
      updatedAt: new Date().toISOString()
    };
    setActiveThread(thread);
    setMessages(welcomeMessages);
    setToast('New memory stream initialized.');
  };

  const handleSelectThread = async (thread) => {
    setActiveThread(thread);
    setReferenceStatus('');
    setMessages([{ role: 'assistant', content: `Resolving ${getThreadPath(thread)} from permanent memory…` }]);

    try {
      const response = await chatApi.resolveReference(session.token, getThreadPath(thread));
      setMessages(response.messages?.length ? response.messages : welcomeMessages);
    } catch (requestError) {
      setMessages([{ role: 'assistant', content: requestError.message }]);
    }
  };

  const handleResolveReference = async (event) => {
    event.preventDefault();
    setReferenceStatus('Resolving memory reference…');

    try {
      const response = await chatApi.resolveReference(session.token, referencePath);
      const recalled = response.messages || [];
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: `Recalled ${recalled.length} message${recalled.length === 1 ? '' : 's'} from ${referencePath}.`
        }
      ]);
      setReferenceStatus('Reference attached to the active chat canvas.');
    } catch (requestError) {
      setReferenceStatus(requestError.message);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const currentPrompt = prompt.trim();
    if (!currentPrompt || isSending) return;

    setIsSending(true);
    setPrompt('');

    const thread = activeThread || {
      threadId: createThreadId(),
      title: 'Untitled thread',
      groupName: 'uncategorized',
      updatedAt: new Date().toISOString()
    };
    const outgoingMessages = [...messages, { role: 'user', content: currentPrompt }];
    const assistantMessage = { role: 'assistant', content: synthesizeAssistantReply(currentPrompt, messages) };
    const nextMessages = [...outgoingMessages, assistantMessage];

    setActiveThread(thread);
    setMessages(nextMessages);

    try {
      const response = await chatApi.sync(session.token, {
        threadId: thread.threadId,
        messages: nextMessages,
        currentPrompt
      });
      setActiveThread(response.thread);
      setToast(response.status || 'Synced to permanent memory.');
      await loadSidebar();
    } catch (requestError) {
      setToast(requestError.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        tree={tree}
        activeThreadId={activeThread?.threadId}
        onNewThread={handleNewThread}
        onSelectThread={handleSelectThread}
        isLoading={isSidebarLoading}
      />

      <main className="chat-stage">
        <header className="topbar">
          <div>
            <p className="eyebrow">Premium chatbot workspace</p>
            <h1>{activeThread?.title || 'Ask anything with folder-aware memory'}</h1>
          </div>
          <div className="topbar-actions">
            <span className="user-chip"><ShieldCheck size={16} /> {session.user?.email}</span>
            <button className="ghost-button compact" onClick={onLogout}><LogOut size={16} /> Logout</button>
          </div>
        </header>

        <section className="conversation">
          {messages.map((message, index) => (
            <MessageBubble message={message} key={`${message.role}-${index}`} />
          ))}
          {isSending && (
            <article className="message assistant">
              <div className="message-avatar">AI</div>
              <div className="message-card typing"><Loader2 className="spin" size={18} /> Syncing memory…</div>
            </article>
          )}
          <div ref={messagesEndRef} />
        </section>

        <form className="composer" onSubmit={handleSend}>
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask about computers, strategy, research, or anything worth remembering…"
          />
          <button className="primary-button send-button" type="submit" disabled={isSending || !prompt.trim()}>
            <Send size={18} /> Send
          </button>
        </form>

        {toast && <button className="toast" onClick={() => setToast('')}>{toast}</button>}
      </main>

      <MemoryPanel
        tree={tree}
        activeThread={activeThread}
        onResolveReference={handleResolveReference}
        referencePath={referencePath}
        setReferencePath={setReferencePath}
        referenceStatus={referenceStatus}
      />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() => loadSession());

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  if (!session?.token) {
    return <AuthPanel onAuthenticated={setSession} />;
  }

  return <Workspace session={session} onLogout={handleLogout} />;
}
