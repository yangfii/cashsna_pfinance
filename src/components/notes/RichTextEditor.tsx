import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Type,
  Palette
} from 'lucide-react';
import { useState } from 'react';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const iPhoneColors = [
  '#FFFFFF', // White
  '#FF9F00', // Orange
  '#FFD700', // Gold
  '#00CED1', // Dark Turquoise
  '#20B2AA', // Light Sea Green
  '#FF69B4', // Hot Pink
  '#FF1493', // Deep Pink
  '#9932CC', // Dark Orchid
  '#32CD32', // Lime Green
  '#FF4500', // Orange Red
];

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 p-0 transition-colors",
        isActive && "bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100"
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className={cn("border border-input rounded-md bg-background", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border flex-wrap">
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            title="Paragraph"
          >
            <Type className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="relative">
          <ToolbarButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </ToolbarButton>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 z-50 mt-1 p-2 bg-background border border-border rounded-md shadow-lg">
              <div className="grid grid-cols-5 gap-1">
                {iPhoneColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setShowColorPicker(false);
                    }}
                    title={`Set color to ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="min-h-[120px]"
        placeholder={placeholder}
      />
      
      {showColorPicker && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
}