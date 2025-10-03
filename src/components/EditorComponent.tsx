'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import styled from '@emotion/styled';
import { useState, useEffect, useCallback } from 'react';
import { TiptapImageUpload } from '@/lib/tiptapImageUpload';

// Import all the extensions we need for a rich editing experience
import { TextAlign } from '@tiptap/extension-text-align';
import  TextStyle  from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Image } from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import YouTube from '@tiptap/extension-youtube';

const EditorContainer = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 1.5rem;
`;

const TitleInput = styled.input`
  width: 100%;
  font-size: 2.5rem;
  font-weight: 700;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;
  &:focus {
    outline: none;
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px 8px 0 0;
  background: ${({ theme }) => theme.cardBg};

  button, select {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 4px;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &.is-active {
      background: ${({ theme }) => theme.primary};
      color: white;
    }
  }
  
  .divider {
    width: 1px;
    height: 1.25rem;
    background: ${({ theme }) => theme.border};
    margin: 0 0.5rem;
  }
`;

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  display: block;
  position: absolute;
  background-color: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  min-width: 120px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 4px;

  button {
    width: 100%;
    text-align: left;
    border: none;
    border-radius: 0;
  }
`;

const EditorWrapper = styled.div`
  .ProseMirror {
    min-height: 400px;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.border};
    border-top: none;
    border-radius: 0 0 8px 8px;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    
    &:focus {
      outline: none;
    }

    /* Clearfix for floated elements */
    &:after {
      content: "";
      clear: both;
      display: table;
    }

    p {
      margin: 0 0 1rem 0;
    }
    
    img {
      max-width: 100%;
      height: auto;
      &.ProseMirror-selectednode {
        outline: 3px solid ${({ theme }) => theme.primary};
      }
      &[data-align="left"] { float: left; margin-right: 1rem; margin-bottom: 0.5rem; }
      &[data-align="right"] { float: right; margin-left: 1rem; margin-bottom: 0.5rem; }
      &[data-size="small"] { width: 33%; }
      &[data-size="medium"] { width: 50%; }
      &[data-size="large"] { width: 100%; }
    }

    pre {
      background: #0D0D0D;
      color: #FFF;
      font-family: 'JetBrainsMono', monospace;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;

      code {
        color: inherit;
        padding: 0;
        background: none;
        font-size: 0.8rem;
      }
    }

    iframe {
      width: 100%;
      aspect-ratio: 16 / 9;
      height: auto;
      border-radius: 8px;
    }
  }
`;

const ImageBubbleMenu = styled.div`
  display: flex;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 0.25rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  button {
    background: transparent;
    border: none;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    &.is-active {
        background: ${({ theme }) => theme.primary};
        color: white;
    }
  }
`;

interface EditorProps {
  initialTitle?: string;
  initialContent?: string;
  onSave: (data: { title: string; content: string }) => Promise<void>;
  isSaving: boolean;
}

export default function EditorComponent({ initialTitle = '', initialContent = '', onSave, isSaving }: EditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isListDropdownOpen, setListDropdownOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ image: false, codeBlock: {} }),
      Link.configure({ openOnClick: false }),
      TiptapImageUpload,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      TextStyle,
      FontFamily,
      Color,
      Underline,
      Image.extend({
        addAttributes() {
          return { ...this.parent?.(), 'data-align': { default: 'center' }, 'data-size': { default: 'large' } };
        },
      }).configure({ inline: true, allowBase64: false }),
      YouTube.configure({ controls: true, modestBranding: true, width: '100%' }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'prose-mirror-editor' },
    },
  });

  const addYoutubeVideo = useCallback(() => {
    const url = prompt('Enter YouTube URL:');
    if (url && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  useEffect(() => {
    setTitle(initialTitle);
    if (editor && initialContent && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialTitle, initialContent, editor]);

  const handleSave = () => {
    if (!editor || !title.trim()) {
      alert('Title and content are required.');
      return;
    }
    onSave({ title, content: editor.getHTML() });
  };

  if (!editor) return <div>Loading Editor...</div>;

  return (
    <EditorContainer>
      <TitleInput
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post Title..."
      />

      <Toolbar>
        <select onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()} value={editor.getAttributes('textStyle').fontFamily || 'Inter'}>
          <option value="Inter">Inter</option>
          <option value="Georgia">Georgia</option>
          <option value="monospace">Monospace</option>
        </select>
        <div className="divider" />
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}>H3</button>
        <button onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''}>Text</button>
        <div className="divider" />
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}>U</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>Strike</button>
        <div className="divider" />
        <Dropdown onMouseLeave={() => setListDropdownOpen(false)}>
          <button onMouseEnter={() => setListDropdownOpen(true)}>Lists</button>
          {isListDropdownOpen && (
            <DropdownContent>
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>Bullet List</button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}>Numbered List</button>
            </DropdownContent>
          )}
        </Dropdown>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'is-active' : ''}>Quote</button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'is-active' : ''}>Code Block</button>
        <div className="divider" />
        <button onClick={addYoutubeVideo}>YouTube</button>
        <div className="divider" />
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}>Left</button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}>Center</button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}>Right</button>
        <div className="divider" />
        <input type="color" onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor.getAttributes('textStyle').color || '#000000'} />
      </Toolbar>
      
      {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} shouldShow={({ editor }) => editor.isActive('image')}>
        <ImageBubbleMenu>
            <button onClick={() => editor.chain().focus().updateAttributes('image', { 'data-align': 'left' }).run()} className={editor.isActive('image', { 'data-align': 'left' }) ? 'is-active' : ''}>Align Left</button>
            <button onClick={() => editor.chain().focus().updateAttributes('image', { 'data-align': 'center' }).run()} className={editor.isActive('image', { 'data-align': 'center' }) ? 'is-active' : ''}>Center</button>
            <button onClick={() => editor.chain().focus().updateAttributes('image', { 'data-align': 'right' }).run()} className={editor.isActive('image', { 'data-align': 'right' }) ? 'is-active' : ''}>Align Right</button>
            <div className="divider" />
            <button onClick={() => editor.chain().focus().updateAttributes('image', { 'data-size': 'small' }).run()} className={editor.isActive('image', { 'data-size': 'small' }) ? 'is-active' : ''}>S</button>
            <button onClick={() => editor.chain().focus().updateAttributes('image', { 'data-size': 'medium' }).run()} className={editor.isActive('image', { 'data-size': 'medium' }) ? 'is-active' : ''}>M</button>
            <button onClick={() => editor.chain().focus().updateAttributes('image', { 'data-size': 'large' }).run()} className={editor.isActive('image', { 'data-size': 'large' }) ? 'is-active' : ''}>L</button>
        </ImageBubbleMenu>
      </BubbleMenu>}

      <EditorWrapper>
        <EditorContent editor={editor} />
      </EditorWrapper>

      <button onClick={handleSave} disabled={isSaving} style={{ marginTop: '1rem' }}>
        {isSaving ? 'Saving...' : 'Save Post'}
      </button>
    </EditorContainer>
  );
}
