import { useNotes } from '@/hooks/useNotes';
import { NoteCard } from './NoteCard';
import { CreateNoteDialog } from './CreateNoteDialog';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function NotesGrid() {
  const { notes, loading } = useNotes();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notes</h2>
          <p className="text-muted-foreground">
            Capture your thoughts and ideas
          </p>
        </div>
        <CreateNoteDialog>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </CreateNoteDialog>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No notes yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first note to get started
          </p>
          <CreateNoteDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Note
            </Button>
          </CreateNoteDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}