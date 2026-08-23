'use client';

import { FormEvent, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Camera, Plus, Save, X } from 'lucide-react';
import { wl } from '@/styles/wishlistTheme';
import { api } from '@/lib/api';
import { WishlistMemberInfo, WishlistProduct, WishlistProductCreate } from '@/types';
import { WlGhostButton, WlOutlineButton, WlPrimaryButton } from './WlButtons';

type StoreOptionDraft = { title: string; url: string; price: string };

type Props = {
  open: boolean;
  onClose: () => void;
  members: WishlistMemberInfo[];
  defaultMemberId?: string;
  /** When set, modal edits this open product instead of creating. */
  editing?: WishlistProduct | null;
  onSubmit: (payload: WishlistProductCreate & { owner_member_id: string }) => Promise<void>;
  onUpdate?: (productId: string, payload: WishlistProductCreate) => Promise<void>;
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(26, 26, 26, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  font-family: ${wl.font.family};

  @media (min-width: 768px) {
    align-items: center;
    padding: ${wl.space(3)};
  }
`;

const Sheet = styled.div`
  background: ${wl.surface};
  width: 100%;
  max-height: 94vh;
  overflow-y: auto;
  border-radius: ${wl.radiusLg}px ${wl.radiusLg}px 0 0;
  padding: ${wl.space(2)} ${wl.space(2)} calc(${wl.space(3)} + env(safe-area-inset-bottom));
  box-shadow: ${wl.shadowHover};

  @media (min-width: 768px) {
    max-width: 880px;
    border-radius: ${wl.radiusLg}px;
    padding: ${wl.space(3)};
  }
`;

const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${wl.space(1.5)};
  margin-bottom: ${wl.space(2)};

  @media (min-width: 768px) {
    display: none;
  }

  h2 {
    margin: 0;
    font: ${wl.font.headlineSm};
    color: ${wl.primaryDeep};
  }
`;

const DesktopGrid = styled.div`
  display: grid;
  gap: ${wl.space(3)};

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1.2fr;
    align-items: start;
  }
`;

const ImageDrop = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${wl.space(1)};
  min-height: 160px;
  border: 2px dashed ${wl.borderStrong};
  border-radius: ${wl.radiusMd}px;
  background: ${wl.secondarySoft};
  color: ${wl.inkMuted};
  font: ${wl.font.bodySm};
  text-align: center;
  cursor: pointer;
  padding: ${wl.space(2)};
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    min-height: 280px;
    background: ${wl.canvas};
  }

  input {
    display: none;
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const HintMobile = styled.span`
  @media (min-width: 768px) {
    display: none;
  }
`;

const HintDesktop = styled.span`
  display: none;
  @media (min-width: 768px) {
    display: inline;
  }
`;

const DesktopTitle = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: block;
    margin-bottom: ${wl.space(2)};
  }
  h2 {
    margin: 0 0 4px;
    font: ${wl.font.headlineSm};
    color: ${wl.primaryDeep};
  }
  p {
    margin: 0;
    font: ${wl.font.bodySm};
    color: ${wl.inkMuted};
  }
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  font: ${wl.font.label};
  color: ${wl.ink};
  margin-bottom: ${wl.space(2)};

  input,
  textarea,
  select {
    font: ${wl.font.body};
    padding: ${wl.space(1.5)} ${wl.space(2)};
    border-radius: ${wl.radiusSm}px;
    border: 1px solid ${wl.borderStrong};
    background: ${wl.canvas};
    color: ${wl.ink};
  }
  textarea {
    min-height: 72px;
    resize: vertical;
  }
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: ${wl.space(1)} 0 ${wl.space(1.5)};
  font: ${wl.font.label};
  color: ${wl.ink};
`;

const Count = styled.span`
  font: ${wl.font.labelSm};
  color: ${wl.inkMuted};
`;

const StoreCard = styled.div`
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusSm}px;
  padding: ${wl.space(1.5)};
  margin-bottom: ${wl.space(1.5)};
  background: ${wl.canvasWarm};
  display: grid;
  gap: ${wl.space(1)};
`;

const StoreInput = styled.input`
  font: ${wl.font.bodySm};
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid ${wl.border};
  background: ${wl.surface};
  color: ${wl.ink};
  width: 100%;
`;

const DesktopStoreRow = styled.div`
  display: none;
  margin-bottom: ${wl.space(1.5)};

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 100px auto;
    gap: ${wl.space(1)};
    align-items: start;
  }
`;

const MobileStores = styled.div`
  @media (min-width: 768px) {
    display: none;
  }
`;

const DesktopStores = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: block;
  }
`;

const Footer = styled.div`
  display: grid;
  gap: ${wl.space(1.5)};
  margin-top: ${wl.space(3)};

  @media (min-width: 768px) {
    display: flex;
    justify-content: flex-end;
  }
`;

const IconBtn = styled.button`
  border: none;
  background: transparent;
  color: ${wl.inkMuted};
  cursor: pointer;
  padding: ${wl.space(1)};
  border-radius: ${wl.radiusSm}px;
  &:hover {
    color: ${wl.danger};
    background: ${wl.dangerSoft};
  }
`;

const LinkBtn = styled.button`
  border: none;
  background: transparent;
  color: ${wl.primary};
  font: ${wl.font.label};
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const CompactFields = styled.div`
  display: grid;
  gap: 6px;
`;

export function AddProductModal({
  open,
  onClose,
  members,
  defaultMemberId,
  editing,
  onSubmit,
  onUpdate,
}: Props) {
  const isEdit = !!editing;
  const [ownerId, setOwnerId] = useState(defaultMemberId || members[0]?.member_id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<StoreOptionDraft[]>([{ title: '', url: '', price: '' }]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setOwnerId(editing.owner_member_id);
      setTitle(editing.title);
      setDescription(editing.description || '');
      setOptions(
        editing.options.length
          ? editing.options.map((o) => ({
              title: o.title,
              url: o.url || '',
              price: o.price != null ? String(o.price) : '',
            }))
          : [{ title: '', url: '', price: '' }]
      );
      setImageUrl(editing.options.find((o) => o.image_url)?.image_url || null);
    } else {
      setOwnerId(defaultMemberId || members[0]?.member_id || '');
      setTitle('');
      setDescription('');
      setOptions([{ title: '', url: '', price: '' }]);
      setImageUrl(null);
    }
  }, [open, editing, defaultMemberId, members]);

  if (!open) return null;

  const updateOption = (idx: number, patch: Partial<StoreOptionDraft>) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  };

  const removeOption = (idx: number) => {
    setOptions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const addOption = () => setOptions((p) => [...p, { title: '', url: '', price: '' }]);

  const onFile = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const { url } = await api.uploadImage(file);
      setImageUrl(url);
    } catch {
      setError('Image upload failed — sign in to upload, or continue without a photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = options
      .map((o, i) => ({
        title: o.title.trim(),
        url: o.url.trim() || null,
        price: o.price.trim() ? Number(o.price) : null,
        image_url: i === 0 && imageUrl ? imageUrl : null,
      }))
      .filter((o) => o.title);
    if (!title.trim() || cleaned.length === 0) {
      setError('Title and at least one store option name are required');
      return;
    }
    if (cleaned.some((o) => o.price != null && Number.isNaN(o.price))) {
      setError('Price must be a number');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const body: WishlistProductCreate = {
        title: title.trim(),
        description: description.trim() || null,
        options: cleaned,
      };
      if (isEdit && editing && onUpdate) {
        await onUpdate(editing.id, body);
      } else {
        await onSubmit({ ...body, owner_member_id: ownerId });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setBusy(false);
    }
  };

  const filledCount = options.filter((o) => o.title.trim()).length;

  return (
    <Backdrop
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Sheet onClick={(e) => e.stopPropagation()}>
        <MobileHeader>
          <IconBtn type="button" aria-label="Close" onClick={onClose}>
            <X size={22} />
          </IconBtn>
          <h2 id="add-product-title">{isEdit ? 'Edit Product' : 'Add to List'}</h2>
        </MobileHeader>

        <form onSubmit={handleSubmit}>
          <DesktopGrid>
            <ImageDrop>
              {imageUrl ? <img src={imageUrl} alt="" /> : null}
              {!imageUrl && (
                <>
                  <Camera size={28} color={wl.primary} />
                  <HintMobile>{isEdit ? 'Change Product Photo' : 'Add Product Photo'}</HintMobile>
                  <HintDesktop>Click to upload image. JPEG, PNG up to 5MB.</HintDesktop>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
              />
              {uploading && <span>Uploading…</span>}
            </ImageDrop>

            <div>
              <DesktopTitle>
                <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
                <p>
                  {isEdit
                    ? 'Update details while the item is still open.'
                    : 'Fill in the details for your wishlist item.'}
                </p>
              </DesktopTitle>

              <Field>
                Whose list
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  required
                  disabled={isEdit}
                >
                  {members.map((m) => (
                    <option key={m.member_id} value={m.member_id}>
                      {m.display_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field>
                Product Title
                <input
                  placeholder="Product Title (e.g., Artisan Toaster)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Field>

              <Field>
                Description
                <textarea
                  placeholder="Description (e.g., 4-slice die-cast…)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>

              <SectionHead>
                <span>Store Options</span>
                <Count>{filledCount} added</Count>
              </SectionHead>

              <MobileStores>
                {options.map((o, idx) => (
                  <StoreCard key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ font: wl.font.label }}>{o.title || `Option ${idx + 1}`}</strong>
                      <IconBtn type="button" aria-label="Remove option" onClick={() => removeOption(idx)}>
                        <X size={16} />
                      </IconBtn>
                    </div>
                    <StoreInput
                      placeholder="Store name (e.g., MegaMart)"
                      value={o.title}
                      onChange={(e) => updateOption(idx, { title: e.target.value })}
                    />
                    <StoreInput
                      placeholder="https://…"
                      value={o.url}
                      onChange={(e) => updateOption(idx, { url: e.target.value })}
                    />
                    <StoreInput
                      placeholder="Price (optional)"
                      value={o.price}
                      onChange={(e) => updateOption(idx, { price: e.target.value })}
                      inputMode="decimal"
                    />
                  </StoreCard>
                ))}
                <WlOutlineButton type="button" onClick={addOption}>
                  <Plus size={16} /> Add Another Option
                </WlOutlineButton>
              </MobileStores>

              <DesktopStores>
                <SectionHead style={{ marginTop: 0 }}>
                  <span />
                  <LinkBtn type="button" onClick={addOption}>
                    <Plus size={14} /> Add Store
                  </LinkBtn>
                </SectionHead>
                {options.map((o, idx) => (
                  <DesktopStoreRow key={idx}>
                    <CompactFields>
                      <StoreInput
                        placeholder="Store Name"
                        value={o.title}
                        onChange={(e) => updateOption(idx, { title: e.target.value })}
                      />
                      <StoreInput
                        placeholder="https://"
                        value={o.url}
                        onChange={(e) => updateOption(idx, { url: e.target.value })}
                      />
                    </CompactFields>
                    <StoreInput
                      placeholder="Price"
                      value={o.price}
                      onChange={(e) => updateOption(idx, { price: e.target.value })}
                      inputMode="decimal"
                    />
                    <IconBtn type="button" aria-label="Remove store" onClick={() => removeOption(idx)}>
                      <X size={18} />
                    </IconBtn>
                  </DesktopStoreRow>
                ))}
              </DesktopStores>

              <Footer>
                <WlGhostButton type="button" onClick={onClose} style={{ width: 'auto', minWidth: 100 }}>
                  Cancel
                </WlGhostButton>
                <WlPrimaryButton type="submit" disabled={busy} style={{ width: 'auto', minWidth: 148 }}>
                  <Save size={16} /> {busy ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Product'}
                </WlPrimaryButton>
              </Footer>
              {error && (
                <p style={{ color: wl.danger, font: wl.font.bodySm, marginTop: wl.space(1) }}>{error}</p>
              )}
            </div>
          </DesktopGrid>
        </form>
      </Sheet>
    </Backdrop>
  );
}
