interface MenuTitleProps {
  label: string;
}

export function MenuTitle({ label }: MenuTitleProps) {
  return (
    <p className="px-2.5 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 select-none first:pt-2">
      {label}
    </p>
  );
}
