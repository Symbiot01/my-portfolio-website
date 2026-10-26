// File: src/components/EditorComponent.tsx
// Description: Deep Space Observatory Editorial Workstation with frontmatter metadata bay, inline YouTube modal, live reading telemetry, and split preview.
'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import styled from '@emotion/styled';
import { TiptapImageUpload } from '@/lib/tiptapImageUpload';
import { api } from '@/lib/api';
import MarkdownRenderer from '@/components/MarkdownRenderer';

import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Image } from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import YouTube from '@tiptap/extension-youtube';

const StudioShell = styled.div`
  background: ${({ theme }) => `${theme.cardBg}e6`};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 40px ${({ theme }) => theme.shadow};
`;

const TelemetryHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: ${({ theme }) => theme.toggleBg};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  color: ${({ theme }) => theme.mutedText};
`;

const ModeSwitchGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const ModeTab = styled.button<{ active: boolean }>`
  font-family: var(--font-mono), monospace;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  border: 1px solid
    ${({ active, theme }) => (active ? theme.primary : theme.border)};
  background: ${({ active, theme }) =>
    active ? `${theme.primary}26` : theme.cardBg};
  color: ${({ active, theme }) =>
    active ? theme.headingText : theme.mutedText};
  cursor: pointer;
`;

const FrontmatterBay = styled.div`
  padding: 1.5rem 1.5rem 1.15rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TitleInput = styled.input`
  width: 100%;
  font-family: var(--font-display), 'Space Grotesk', sans-serif;
  font-size: clamp(1.65rem, 3vw, 2.25rem);
  font-weight: 700;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.headingText};

  &::placeholder {
    color: ${({ theme }) => theme.mutedText};
    opacity: 0.6;
  }

  &:focus {
    outline: none;
  }
`;

const ExcerptInput = styled.textarea`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};
  color: ${({ theme }) => theme.text};
  font-family: var(--font-sans), sans-serif;
  font-size: 0.88rem;
  resize: vertical;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetaBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-family: var(--font-mono), monospace;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${({ theme }) => theme.mutedText};
  }
`;

const TagInputRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.toggleBg};

  input {
    flex: 1;
    min-width: 120px;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 0.84rem;
    outline: none;
  }
`;

const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--font-mono), monospace;
  font-size: 0.7rem;
  padding: 0.18rem 0.5rem;
  border-radius: 5px;
  background: ${({ theme }) => `${theme.primary}22`};
  border: 1px solid ${({ theme }) => `${theme.primary}55`};
  color: ${({ theme }) => theme.headingText};

  button {
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1;
  }
`;

const CoverRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input[type='url'] {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.toggleBg};
    color: ${({ theme }) => theme.text};
    font-size: 0.82rem;
    outline: none;
  }

  label.upload-btn {
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.cardBg};
    color: ${({ theme }) => theme.headingText};
    font-family: var(--font-mono), monospace;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.38rem;
  padding: 0.65rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};

  button,
  select {
    background: ${({ theme }) => theme.toggleBg};
    color: ${({ theme }) => theme.text};
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 6px;
    padding: 0.32rem 0.62rem;
    font-family: var(--font-mono), monospace;
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.is-active {
      background: ${({ theme }) => theme.primary};
      border-color: ${({ theme }) => theme.primary};
      color: #ffffff;
    }
  }

  .divider {
    width: 1px;
    height: 1.25rem;
    background: ${({ theme }) => theme.border};
    margin: 0 0.25rem;
  }
`;

const InlineYoutubeBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: ${({ theme }) => theme.toggleBg};
  border-bottom: 1px solid ${({ theme }) => theme.border};

  input {
    flex: 1;
    padding: 0.45rem 0.75rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.cardBg};
    color: ${({ theme }) => theme.text};
    font-size: 0.84rem;
    outline: none;
  }

  button {
    padding: 0.45rem 0.85rem;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.primary};
    color: #fff;
    font-family: var(--font-mono), monospace;
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;
  }
`;

const EditorWrapper = styled.div`
  .ProseMirror {
    min-height: 420px;
    padding: 1.5rem;
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    line-height: 1.72;
    font-size: 0.98rem;

    &:focus {
      outline: none;
    }

    &:after {
      content: '';
      clear: both;
      display: table;
    }

    p {
      margin: 0 0 1rem 0;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      &.ProseMirror-selectednode {
        outline: 2px solid ${({ theme }) => theme.primary};
      }
      &[data-align='left'] {
        float: left;
        margin-right: 1rem;
        margin-bottom: 0.5rem;
      }
      &[data-align='right'] {
        float: right;
        margin-left: 1rem;
        margin-bottom: 0.5rem;
      }
      &[data-size='small'] {
        width: 33%;
      }
      &[data-size='medium'] {
        width: 50%;
      }
      &[data-size='large'] {
        width: 100%;
      }
    }

    pre {
      background: #090d1a;
      color: #e2e8f0;
      font-family: var(--font-mono), monospace;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(148, 163, 184, 0.2);

      code {
        color: inherit;
        padding: 0;
        background: none;
        font-size: 0.82rem;
      }
    }

    iframe {
      width: 100%;
      aspect-ratio: 16 / 9;
      height: auto;
      border-radius: 10px;
    }
  }
`;

const PreviewViewport = styled.div`
  min-height: 420px;
  padding: 1.75rem;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  line-height: 1.75;
`;

const ImageBubbleMenu = styled.div`
  display: flex;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 0.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  button {
    background: transparent;
    border: none;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    color: ${({ theme }) => theme.text};
    font-size: 0.75rem;

    &.is-active {
      background: ${({ theme }) => theme.primary};
      color: white;
      border-radius: 4px;
    }
  }
`;

const StudioFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.toggleBg};
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const PublishButton = styled.button`
  padding: 0.68rem 1.4rem;
  border-radius: 9px;
  border: none;
  background: ${({ theme }) => theme.gradient};
  color: #ffffff;
  font-family: var(--font-mono), monospace;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export interface EditorSavePayload {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  cover_image_url?: string;
}

interface EditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialExcerpt?: string;
  initialTags?: string[];
  initialCoverUrl?: string;
  onSave: (data: EditorSavePayload) => Promise<void>;
  isSaving: boolean;
}

export default function EditorComponent({
  initialTitle = '',
  initialContent = '',
  initialExcerpt = '',
  initialTags = ['Systems', 'AI'],
  initialCoverUrl = '',
  onSave,
  isSaving,
}: EditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagDraft, setTagDraft] = useState('');
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [ytModalOpen, setYtModalOpen] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: {} }),
      Link.configure({ openOnClick: false }),
      TiptapImageUpload,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      TextStyle,
      FontFamily,
      Color,
      Underline,
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            'data-align': { default: 'center' },
            'data-size': { default: 'large' },
          };
        },
      }).configure({ inline: true, allowBase64: false }),
      YouTube.configure({ controls: true, modestBranding: true }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'prose-mirror-editor' },
    },
    onUpdate: ({ editor }) => {
      setHtmlContent(editor.getHTML());
    },
  });

  useEffect(() => {
    setTitle(initialTitle);
    if (editor && initialContent && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
      setHtmlContent(initialContent);
    }
  }, [initialTitle, initialContent, editor]);

  const plainText = htmlContent.replace(/<[^>]+>/g, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = plainText.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const handleAddTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagDraft.replace(/^#/, '').trim();
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagDraft('');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setValidationError(null);
    try {
      const res = await api.uploadImage(file);
      setCoverUrl(res.url);
    } catch (err: any) {
      setValidationError(err?.message || 'Cover image upload failed.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleInsertYoutube = () => {
    if (!ytUrl.trim() || !editor) return;
    editor.chain().focus().setYoutubeVideo({ src: ytUrl.trim() }).run();
    setYtUrl('');
    setYtModalOpen(false);
  };

  const handleSave = () => {
    setValidationError(null);
    if (!editor || !title.trim()) {
      setValidationError('Please provide a post title before submitting.');
      return;
    }
    const currentHtml = editor.getHTML();
    if (!currentHtml || currentHtml === '<p></p>') {
      setValidationError('Article body cannot be empty.');
      return;
    }
    onSave({
      title: title.trim(),
      content: currentHtml,
      excerpt: excerpt.trim() || plainText.slice(0, 160),
      tags,
      cover_image_url: coverUrl.trim() || undefined,
    });
  };

  if (!editor) {
    return (
      <StudioShell style={{ padding: '2rem' }}>
        Initializing Editorial Studio...
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      <TelemetryHeader>
        <span>
          TELEMETRY // {wordCount} WORDS • {charCount} CHARS • ~{readTimeMin} MIN READ
        </span>

        <ModeSwitchGroup>
          <ModeTab
            type="button"
            active={mode === 'write'}
            onClick={() => setMode('write')}
          >
            ✎ Write Workstation
          </ModeTab>
          <ModeTab
            type="button"
            active={mode === 'preview'}
            onClick={() => setMode('preview')}
          >
            ◉ Live Reader Preview
          </ModeTab>
        </ModeSwitchGroup>
      </TelemetryHeader>

      <FrontmatterBay>
        <TitleInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter specification or article title..."
          maxLength={100}
        />

        <ExcerptInput
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short executive summary / excerpt (up to 300 chars)..."
          maxLength={300}
        />

        <MetaGrid>
          <MetaBox>
            <label>Tags (press Enter or comma to add)</label>
            <TagInputRow>
              {tags.map((t) => (
                <TagChip key={t}>
                  #{t}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    aria-label={`Remove tag ${t}`}
                  >
                    ×
                  </button>
                </TagChip>
              ))}
              <input
                type="text"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={handleAddTagKeyDown}
                placeholder="Add tag..."
              />
            </TagInputRow>
          </MetaBox>

          <MetaBox>
            <label>Cover Image URL or Upload</label>
            <CoverRow>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
              />
              <label className="upload-btn">
                {uploadingCover ? 'Uploading...' : 'Upload ↗'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </CoverRow>
          </MetaBox>
        </MetaGrid>
      </FrontmatterBay>

      {mode === 'write' ? (
        <>
          <Toolbar>
            <select
              onChange={(e) =>
                editor.chain().focus().setFontFamily(e.target.value).run()
              }
              value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
              aria-label="Font family"
            >
              <option value="Inter">Inter Sans</option>
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
            </select>
            <div className="divider" />
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive('heading', { level: 1 }) ? 'is-active' : ''
              }
            >
              H1
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive('heading', { level: 2 }) ? 'is-active' : ''
              }
            >
              H2
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={
                editor.isActive('heading', { level: 3 }) ? 'is-active' : ''
              }
            >
              H3
            </button>
            <div className="divider" />
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'is-active' : ''}
            >
              U
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active' : ''}
            >
              S
            </button>
            <div className="divider" />
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'is-active' : ''}
            >
              • List
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'is-active' : ''}
            >
              1. List
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'is-active' : ''}
            >
              ❝ Quote
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'is-active' : ''}
            >
              {'</>'} Code
            </button>
            <div className="divider" />
            <button
              type="button"
              onClick={() => setYtModalOpen((v) => !v)}
              className={ytModalOpen ? 'is-active' : ''}
            >
              ▶ YouTube
            </button>
            <div className="divider" />
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={
                editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''
              }
            >
              Left
            </button>
            <button
              type="button"
              onClick={() =>
                editor.chain().focus().setTextAlign('center').run()
              }
              className={
                editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''
              }
            >
              Center
            </button>
          </Toolbar>

          {ytModalOpen && (
            <InlineYoutubeBar>
              <input
                type="url"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="Paste YouTube video URL (https://www.youtube.com/watch?v=...)"
              />
              <button type="button" onClick={handleInsertYoutube}>
                Embed Video
              </button>
              <button
                type="button"
                onClick={() => setYtModalOpen(false)}
                style={{ background: 'transparent', color: 'inherit' }}
              >
                Cancel
              </button>
            </InlineYoutubeBar>
          )}

          {editor && (
            <BubbleMenu
              editor={editor}
              updateDelay={100}
              shouldShow={({ editor }) => editor.isActive('image')}
            >
              <ImageBubbleMenu>
                <button
                  type="button"
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .updateAttributes('image', { 'data-align': 'left' })
                      .run()
                  }
                  className={
                    editor.isActive('image', { 'data-align': 'left' })
                      ? 'is-active'
                      : ''
                  }
                >
                  Left
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .updateAttributes('image', { 'data-align': 'center' })
                      .run()
                  }
                  className={
                    editor.isActive('image', { 'data-align': 'center' })
                      ? 'is-active'
                      : ''
                  }
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .updateAttributes('image', { 'data-align': 'right' })
                      .run()
                  }
                  className={
                    editor.isActive('image', { 'data-align': 'right' })
                      ? 'is-active'
                      : ''
                  }
                >
                  Right
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .updateAttributes('image', { 'data-size': 'small' })
                      .run()
                  }
                  className={
                    editor.isActive('image', { 'data-size': 'small' })
                      ? 'is-active'
                      : ''
                  }
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .updateAttributes('image', { 'data-size': 'medium' })
                      .run()
                  }
                  className={
                    editor.isActive('image', { 'data-size': 'medium' })
                      ? 'is-active'
                      : ''
                  }
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .updateAttributes('image', { 'data-size': 'large' })
                      .run()
                  }
                  className={
                    editor.isActive('image', { 'data-size': 'large' })
                      ? 'is-active'
                      : ''
                  }
                >
                  L
                </button>
              </ImageBubbleMenu>
            </BubbleMenu>
          )}

          <EditorWrapper>
            <EditorContent editor={editor} />
          </EditorWrapper>
        </>
      ) : (
        <PreviewViewport>
          <h1 style={{ marginBottom: '0.75rem' }}>
            {title || 'Untitled Specification'}
          </h1>
          {excerpt && (
            <p
              style={{
                opacity: 0.75,
                marginBottom: '1.25rem',
                fontStyle: 'italic',
              }}
            >
              {excerpt}
            </p>
          )}
          <MarkdownRenderer content={htmlContent} />
        </PreviewViewport>
      )}

      <StudioFooter>
        <div>
          {validationError ? (
            <span style={{ color: '#f87171', fontSize: '0.84rem' }}>
              ⚠ {validationError}
            </span>
          ) : (
            <span
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '0.74rem',
                opacity: 0.75,
              }}
            >
              STATUS: READY_FOR_COMMIT
            </span>
          )}
        </div>

        <PublishButton type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Submitting to Queue...' : 'Submit Specification →'}
        </PublishButton>
      </StudioFooter>
    </StudioShell>
  );
}
