// Shared UI kit. OWNER: infra (team lead). Propose additions through a cross-module request.
export { Badge, type BadgeProps } from "./Badge";
export { Button, type ButtonProps } from "./Button";
export { ChoiceList, type ChoiceListProps } from "./ChoiceList";
export { Checkbox, type CheckboxProps } from "./Checkbox";
export { ComingSoon } from "./ComingSoon";
export { ConfirmDialog, type ConfirmDialogProps } from "./ConfirmDialog";
export { DisplaySettings, type DisplaySettingsProps } from "./DisplaySettings";
export { ElderHeader, type ElderHeaderProps } from "./ElderHeader";
export { EmptyState, type EmptyStateProps } from "./EmptyState";
export { ListRow, type ListRowProps } from "./ListRow";
export { Notice, type NoticeProps } from "./Notice";
export { Meter, type MeterProps } from "./Meter";
export { NumberField, type NumberFieldProps } from "./NumberField";
export { PinPad, type PinPadProps } from "./PinPad";
export { ResultBanner, type ResultBannerProps } from "./ResultBanner";
export { Section, type SectionProps } from "./Section";
export { Select, type SelectProps } from "./Select";
export { StepProgress, stepLabel, type StepProgressProps } from "./StepProgress";
export { TextField, type TextFieldProps } from "./TextField";
export { TabBar, type TabBarItem, type TabBarProps } from "./TabBar";
export { Textarea, type TextareaProps } from "./Textarea";
export { Toast, type ToastProps } from "./Toast";
export { Table, TBody, Td, Th, THead, Tr, type TdProps, type ThProps } from "./DataTable";
export { Pagination, type PaginationProps } from "./Pagination";
export { StatusDot, type StatusDotProps } from "./StatusDot";
export { Tabs, type TabsProps } from "./Tabs";
export { Tag, type TagProps } from "./Tag";
export { PageHeader, type PageHeaderProps } from "./PageHeader";
export { SaveBar, type SaveBarProps } from "./SaveBar";
export { SegmentedControl, type SegmentedControlProps } from "./SegmentedControl";
export { StatTile, type StatTileProps } from "./StatTile";
export { AdminShell, type AdminShellProps } from "./AdminShell";

// admin shell (Task 19)
export {
  findActiveNav,
  sectionHref,
  type AdminNavGroup,
  type AdminNavItem,
  type AdminNavSection,
} from "./admin-nav";

// admin layout (Tasks 20, 21)
export { AdminSection, type AdminSectionProps } from "./AdminSection";
export { TableCard, type TableCardProps } from "./TableCard";
export { RowActions, type RowAction, type RowActionsProps } from "./RowActions";

// skeleton (Task 22)

// motion (Task 23)
