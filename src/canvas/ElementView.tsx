import type React from 'react';
import type { SiteElement } from '@/types/document';
import { isBox, isTree, isText, isPoly, isDimension } from '@/types/document';
import { BoxView } from './elements/BoxView';
import { TreeView } from './elements/TreeView';
import { TextView } from './elements/TextView';
import { PolyView } from './elements/PolyView';
import { DimensionView } from './elements/DimensionView';

interface Props {
  el: SiteElement;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

export const ElementView: React.FC<Props> = ({
  el,
  isSelected,
  isHovered,
  isEditing,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
}) => {
  if (isBox(el)) {
    return (
      <BoxView
        el={el}
        isSelected={isSelected}
        isHovered={isHovered}
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
    );
  }
  if (isTree(el)) {
    return (
      <TreeView
        el={el}
        isSelected={isSelected}
        isHovered={isHovered}
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
    );
  }
  if (isText(el)) {
    return (
      <TextView
        el={el}
        isSelected={isSelected}
        isHovered={isHovered}
        isEditing={isEditing}
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
    );
  }
  if (isPoly(el)) {
    return (
      <PolyView
        el={el}
        isSelected={isSelected}
        isHovered={isHovered}
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
    );
  }
  if (isDimension(el)) {
    return (
      <DimensionView
        el={el}
        isSelected={isSelected}
        isHovered={isHovered}
        isEditing={isEditing}
        onPointerDown={onPointerDown}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
    );
  }
  return null;
};
