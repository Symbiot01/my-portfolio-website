'use client';

import styled from '@emotion/styled';
import { Check, Lock, Pencil } from 'lucide-react';
import { WishlistProduct } from '@/types';
import { wl } from '@/styles/wishlistTheme';
import { WlGhostButton, WlOutlineButton, WlPrimaryButton } from './WlButtons';

const Card = styled.article`
  background: ${wl.surface};
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusMd}px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${wl.font.family};
  box-shadow: ${wl.shadow};
`;

const Media = styled.div<{ $blur?: boolean }>`
  position: relative;
  aspect-ratio: 16 / 10;
  background: linear-gradient(145deg, ${wl.primarySoft}, ${wl.secondarySoft} 60%, ${wl.tertiarySoft});
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: ${({ $blur }) => ($blur ? 'blur(6px) brightness(0.75)' : 'none')};
    transform: ${({ $blur }) => ($blur ? 'scale(1.08)' : 'none')};
  }
`;

const OpenBadge = styled.span`
  position: absolute;
  top: ${wl.space(1.5)};
  right: ${wl.space(1.5)};
  background: ${wl.surface};
  color: ${wl.primaryDeep};
  font: ${wl.font.labelSm};
  padding: 4px 10px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  z-index: 2;
`;

const StatusOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${wl.space(1)};
  z-index: 2;
  color: #fff;
  text-align: center;
`;

const StatusIcon = styled.div<{ $tone: 'reserved' | 'bought' }>`
  width: 48px;
  height: 48px;
  border-radius: ${wl.radiusSm}px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $tone }) => ($tone === 'reserved' ? wl.reserved : wl.secondary)};
  color: #fff;
`;

const StatusLabel = styled.div`
  font: ${wl.font.label};
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
`;

const ByPill = styled.span`
  background: ${wl.surface};
  color: ${wl.ink};
  font: ${wl.font.labelSm};
  padding: 4px 10px;
  border-radius: ${wl.radiusPill}px;
`;

const Body = styled.div`
  padding: ${wl.space(2)};
  display: flex;
  flex-direction: column;
  gap: ${wl.space(1)};
  flex: 1;
`;

const Title = styled.h3`
  margin: 0;
  font: ${wl.font.headlineSm};
  font-size: 1.05rem;
  color: ${wl.ink};
`;

const Price = styled.p`
  margin: 0;
  font: ${wl.font.bodySm};
  color: ${wl.inkMuted};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${wl.border};
  margin: ${wl.space(0.5)} 0;
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`;

const PillLabel = styled.span`
  font: ${wl.font.labelSm};
  color: ${wl.inkMuted};
  width: 100%;
`;

const Pill = styled.span`
  font: ${wl.font.labelSm};
  color: ${wl.inkMuted};
  background: ${wl.canvas};
  border: 1px solid ${wl.border};
  border-radius: ${wl.radiusPill}px;
  padding: 4px 10px;
`;

const Actions = styled.div`
  padding: 0 ${wl.space(2)} ${wl.space(2)};
  display: grid;
  gap: ${wl.space(1)};
`;

type Props = {
  product: WishlistProduct;
  canUnreserve?: boolean;
  canEdit?: boolean;
  onReserve?: () => void;
  onUnreserve?: () => void;
  onPurchase?: () => void;
  onEdit?: () => void;
  busy?: boolean;
};

function formatPrice(product: WishlistProduct): string | null {
  const priced = product.options.find((o) => o.price != null);
  if (priced?.price == null) return null;
  const cur = priced.currency && priced.currency !== '$' ? `${priced.currency} ` : '$';
  return `${cur}${Number(priced.price).toFixed(2)}`;
}

function coverUrl(product: WishlistProduct): string | null {
  return (
    product.options.find((o) => o.image_url)?.image_url ||
    null
  );
}

export function WishlistProductCard({
  product,
  canUnreserve,
  canEdit,
  onReserve,
  onUnreserve,
  onPurchase,
  onEdit,
  busy,
}: Props) {
  const status = product.status;
  const img = coverUrl(product);
  const price = formatPrice(product);
  const blurred = status === 'reserved' || status === 'bought';

  return (
    <Card>
      <Media $blur={blurred}>
        {img ? <img src={img} alt="" /> : null}

        {status === 'open' && <OpenBadge>Open</OpenBadge>}

        {status === 'reserved' && (
          <StatusOverlay>
            <StatusIcon $tone="reserved">
              <Lock size={22} />
            </StatusIcon>
            <StatusLabel>Reserved</StatusLabel>
            <ByPill>by {product.reservation?.reserved_as_name || 'Someone'}</ByPill>
          </StatusOverlay>
        )}

        {status === 'bought' && (
          <StatusOverlay>
            <StatusIcon $tone="bought">
              <Check size={22} />
            </StatusIcon>
            <StatusLabel>Bought</StatusLabel>
          </StatusOverlay>
        )}
      </Media>

      <Body>
        <Title>{product.title}</Title>
        {price && <Price>{price}</Price>}
        {product.description && status === 'open' && (
          <Price style={{ marginTop: -4 }}>{product.description}</Price>
        )}

        {status === 'open' && product.options.length > 0 && (
          <>
            <Divider />
            <Pills>
              <PillLabel>Store Options:</PillLabel>
              {product.options.slice(0, 4).map((o) => (
                <Pill key={o.option_id || o.title}>
                  {o.url ? (
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {o.title}
                    </a>
                  ) : (
                    o.title
                  )}
                </Pill>
              ))}
            </Pills>
          </>
        )}
      </Body>

      {status === 'open' && (
        <Actions>
          {canEdit && onEdit && (
            <WlOutlineButton type="button" onClick={onEdit} disabled={busy}>
              <Pencil size={16} /> Edit
            </WlOutlineButton>
          )}
          {onReserve && (
            <WlPrimaryButton type="button" onClick={onReserve} disabled={busy}>
              Reserve
            </WlPrimaryButton>
          )}
        </Actions>
      )}

      {status === 'reserved' && (
        <Actions>
          {canUnreserve && onUnreserve && (
            <WlGhostButton type="button" onClick={onUnreserve} disabled={busy}>
              Unreserve
            </WlGhostButton>
          )}
          {onPurchase && (
            <WlPrimaryButton type="button" onClick={onPurchase} disabled={busy}>
              Mark bought
            </WlPrimaryButton>
          )}
        </Actions>
      )}
    </Card>
  );
}

/** Circular avatar with initial — for list section headers */
export function MemberAvatar({
  name,
  tone = 0,
  size = 36,
}: {
  name: string;
  tone?: number;
  size?: number;
}) {
  const colors = [wl.primaryDeep, wl.secondary, wl.reserved, wl.primary];
  const bg = colors[tone % colors.length];
  const initial = (name.trim()[0] || '?').toUpperCase();
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: wl.font.family,
        fontWeight: 700,
        fontSize: size <= 24 ? '0.7rem' : '0.95rem',
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  );
}
