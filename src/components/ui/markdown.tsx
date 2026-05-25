import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

const cleanMarkdown = (text: string): string => {
  if (!text) return '';
  let cleaned = text.trim();

  if (cleaned.startsWith('```markdown')) {
    cleaned = cleaned.substring(11);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  return cleaned.trim();
};

export function Markdown({ content, className }: MarkdownProps) {
  const cleanedContent = cleanMarkdown(content);
  if (!cleanedContent) return null;

  return (
    <div className={cn("prose prose-sm prose-slate max-w-none text-slate-800", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-base sm:text-lg font-black text-slate-900 mt-4 mb-2 tracking-tight" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-3 mb-1.5 tracking-tight" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xs sm:text-sm font-bold text-slate-800 mt-2 mb-1" {...props} />,
          p: ({ node, ...props }) => <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed mb-2 last:mb-0" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 mb-2 text-xs sm:text-sm text-slate-800 font-semibold" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 mb-2 text-xs sm:text-sm text-slate-800 font-semibold" {...props} />,
          li: ({ node, ...props }) => <li className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-slate-950" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 border border-slate-200 rounded-xl shadow-2xs">
              <table className="min-w-full divide-y divide-slate-200 bg-white" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-slate-50/70" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-100 bg-white" {...props} />,
          tr: ({ node, ...props }) => <tr className="hover:bg-slate-50/30 transition-colors" {...props} />,
          th: ({ node, ...props }) => <th className="px-4 py-2.5 text-left text-xs font-black text-slate-500 uppercase tracking-wider" {...props} />,
          td: ({ node, ...props }) => <td className="px-4 py-2.5 text-xs font-semibold text-slate-700 whitespace-normal" {...props} />,
        }}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}
