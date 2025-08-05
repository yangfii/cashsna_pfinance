import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, Heart, Save, X, Calendar } from 'lucide-react';
import { Note, useNotes } from '@/hooks/useNotes';
import { format } from 'date-fns';
import { RichTextEditor } from './RichTextEditor';
import { RichTextViewer } from './RichTextViewer';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(() => {
    // Use the rich content if available, otherwise convert plain text to HTML
    if (note.content && typeof note.content === 'object' && 'content' in note.content) {
      return JSON.stringify(note.content);
    }
    return note.plain_text_content ? `<p>${note.plain_text_content}</p>` : '<p></p>';
  });
  const { updateNote, deleteNote, toggleFavorite } = useNotes();

  const handleSave = async () => {
    // Extract plain text from HTML for search
    const temp = document.createElement('div');
    temp.innerHTML = content;
    const plainText = temp.textContent || temp.innerText || '';

    await updateNote(note.id, {
      title: title || 'Untitled Note',
      plain_text_content: plainText,
      content: {
        type: "html",
        html: content
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title || '');
    // Reset to original content
    if (note.content && typeof note.content === 'object' && 'content' in note.content) {
      setContent(JSON.stringify(note.content));
    } else {
      setContent(note.plain_text_content ? `<p>${note.plain_text_content}</p>` : '<p></p>');
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(note.id);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-300 group">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium bg-transparent border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Note title..."
            />
          ) : (
            <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 line-clamp-1">
              {note.title || 'Untitled Note'}
            </h3>
          )}
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleFavorite(note.id)}
              className={`h-8 w-8 p-0 ${note.is_favorite ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`h-4 w-4 ${note.is_favorite ? 'fill-current' : ''}`} />
            </Button>
            
            {isEditing ? (
              <>
                <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0 text-green-600">
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0 text-red-600">
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDelete} className="h-8 w-8 p-0 text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {isEditing ? (
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your note..."
              className="min-h-[100px] bg-transparent border-none"
            />
          ) : (
            <RichTextViewer
              content={content}
              showPreview={true}
              className="text-sm"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(note.updated_at), 'MMM d, yyyy')}</span>
          </div>
          
          {note.tags && note.tags.length > 0 && (
            <div className="flex gap-1">
              {note.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{note.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}