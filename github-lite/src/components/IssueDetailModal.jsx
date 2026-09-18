import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getIssueComments } from '../services/githubApi';
import { renderMarkdown, formatDate, formatRelativeTime } from '../utils/formatters';
import { MessageSquare, X, ExternalLink, CheckCircle2, AlertCircle, Calendar, User } from 'lucide-react';

export default function IssueDetailModal() {
  const { issueDetailModal, closeIssueDetail, language, token } = useApp();
  const { isOpen, issue, repoFullName } = issueDetailModal;

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (isOpen && issue && repoFullName) {
      const [owner, repo] = repoFullName.split('/');
      if (owner && repo && issue.number) {
        setLoadingComments(true);
        getIssueComments(owner, repo, issue.number, token)
          .then((data) => setComments(data))
          .catch(() => setComments([]))
          .finally(() => setLoadingComments(false));
      }
    } else {
      setComments([]);
    }
  }, [isOpen, issue, repoFullName, token]);

  if (!isOpen || !issue) return null;

  const t = {
    ru: {
      open: 'Открыт',
      closed: 'Закрыт',
      commentsTitle: 'Комментарии и ответы',
      noComments: 'К этому вопросу пока нет комментариев.',
      viewOnGithub: 'Открыть на GitHub.com',
      close: 'Закрыть',
    },
    en: {
      open: 'Open',
      closed: 'Closed',
      commentsTitle: 'Comments & Discussion',
      noComments: 'No comments on this issue yet.',
      viewOnGithub: 'View on GitHub.com',
      close: 'Close',
    },
  }[language];

  const isOpenState = issue.state === 'open';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-canvas border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-border bg-canvas-subtle flex items-start justify-between gap-3">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isOpenState
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                }`}
              >
                {isOpenState ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{isOpenState ? t.open : t.closed}</span>
              </span>
              <span className="text-xs font-mono text-muted">#{issue.number}</span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-fg leading-snug">
              {issue.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-muted">
              <img
                src={issue.user?.avatar_url || 'https://github.com/ghost.png'}
                alt=""
                className="w-5 h-5 rounded-full border border-border"
              />
              <span className="font-semibold text-fg">{issue.user?.login}</span>
              <span>•</span>
              <span>{formatRelativeTime(issue.created_at, language)}</span>
            </div>
          </div>

          <button
            onClick={closeIssueDetail}
            className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-canvas border border-transparent hover:border-border transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Main Issue Description */}
          <div className="p-5 rounded-xl bg-canvas-subtle border border-border">
            {issue.body ? (
              <div
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(issue.body) }}
              />
            ) : (
              <p className="text-muted italic">Без описания.</p>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-fg flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>{t.commentsTitle} ({comments.length})</span>
            </h3>

            {loadingComments ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-20 bg-canvas-subtle rounded-xl border border-border" />
                <div className="h-20 bg-canvas-subtle rounded-xl border border-border" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted italic py-4">{t.noComments}</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-xl bg-canvas-subtle border border-border space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs text-muted border-b border-border/70 pb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.user?.avatar_url || 'https://github.com/ghost.png'}
                          alt=""
                          className="w-5 h-5 rounded-full border border-border"
                        />
                        <span className="font-semibold text-fg">{comment.user?.login}</span>
                      </div>
                      <span>{formatRelativeTime(comment.created_at, language)}</span>
                    </div>

                    <div
                      className="markdown-body text-xs sm:text-sm"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.body) }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-canvas-subtle flex items-center justify-between">
          <a
            href={issue.html_url || `https://github.com/${repoFullName}/issues/${issue.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:underline font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.viewOnGithub}</span>
          </a>

          <button
            onClick={closeIssueDetail}
            className="px-4 py-2 rounded-xl bg-canvas border border-border hover:bg-canvas-muted text-fg text-xs font-semibold transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
}
