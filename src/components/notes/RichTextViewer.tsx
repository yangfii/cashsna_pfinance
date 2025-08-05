import { cn } from '@/lib/utils';

interface RichTextViewerProps {
  content: string;
  className?: string;
  showPreview?: boolean;
}

export function RichTextViewer({ content, className, showPreview = false }: RichTextViewerProps) {
  // Extract plain text for preview mode
  const getPlainText = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  // Handle content that might be stored in different formats
  const getHtmlContent = (content: string) => {
    if (!content) return '<p>No content</p>';
    
    // If it looks like HTML, use it directly
    if (content.includes('<') && content.includes('>')) {
      return content;
    }
    
    // Otherwise, wrap plain text in paragraph
    return `<p>${content}</p>`;
  };

  const htmlContent = getHtmlContent(content);

  if (showPreview) {
    const plainText = getPlainText(htmlContent);
    return (
      <p className={cn("text-amber-800 dark:text-amber-200 text-sm line-clamp-4 whitespace-pre-wrap", className)}>
        {plainText || 'No content'}
      </p>
    );
  }

  return (
    <div 
      className={cn(
        "prose prose-sm max-w-none text-amber-800 dark:text-amber-200",
        "prose-headings:text-amber-900 dark:prose-headings:text-amber-100",
        "prose-strong:text-amber-900 dark:prose-strong:text-amber-100",
        "prose-em:text-amber-800 dark:prose-em:text-amber-200",
        "prose-ul:text-amber-800 dark:prose-ul:text-amber-200",
        "prose-ol:text-amber-800 dark:prose-ol:text-amber-200",
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}