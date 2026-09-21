"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";

/**
 * Dropdown premium berbasis Base UI (headless, aksesibel penuh).
 * Gaya & animasi ada di CSS (app/globals.css, bagian "Select premium").
 *
 * Trigger    : tombol pembuka menu; memuat nilai terpilih + ikon.
 * Positioner : penempat popup (side bottom, align center).
 * Popup      : panel menu; Base UI menempel data-open/data-closed saat
 *              transisi buka/tutup — dipakai CSS untuk spring + stagger opsi.
 * Item       : opsi pilihan; data-selected untuk tanda terpilih.
 */
function Select(props: SelectPrimitive.Root.Props<string>) {
  return <SelectPrimitive.Root {...props} />;
}

function SelectTrigger({ className = "", children, ...props }: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger className={`collab-select-trigger ${className}`} {...props}>
      {children}
    </SelectPrimitive.Trigger>
  );
}

function SelectValue(props: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value {...props} />;
}

function SelectIcon({ className = "", children, ...props }: SelectPrimitive.Icon.Props) {
  return (
    <SelectPrimitive.Icon className={`collab-chevron ${className}`} {...props}>
      {children}
    </SelectPrimitive.Icon>
  );
}

function SelectPositioner(props: SelectPrimitive.Positioner.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        className="collab-select-positioner"
        side="bottom"
        align="center"
        sideOffset={10}
        {...props}
      />
    </SelectPrimitive.Portal>
  );
}

function SelectPopup({ className = "", children, ...props }: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Popup className={`collab-select-menu ${className}`} {...props}>
      <SelectPrimitive.List className="collab-select-list">{children}</SelectPrimitive.List>
    </SelectPrimitive.Popup>
  );
}

function SelectItem({ className = "", children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      className={`collab-select-option ${className}`}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="collab-select-check">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path d="m5 12.5 5 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectTrigger, SelectValue, SelectIcon, SelectPositioner, SelectPopup, SelectItem };
