import React from 'react';
import { AnimatedIcon, AnimatedIconProps } from './animated-icon';
import { cn } from '@/lib/utils';

interface ActionIconProps extends Omit<AnimatedIconProps, 'src'> {
  variant?: 'button' | 'inline';
}

// Working Lordicon URLs for Financial App
const ICON_URLS = {
  // Basic Actions (Working URLs)
  add: 'https://cdn.lordicon.com/zfzufsk2.json',
  delete: 'https://cdn.lordicon.com/skkahier.json', 
  success: 'https://cdn.lordicon.com/oqdmuxru.json',
  loading: 'https://cdn.lordicon.com/xjovhxra.json',
  edit: 'https://cdn.lordicon.com/gwlusjdu.json',
  save: 'https://cdn.lordicon.com/jgnvfzqg.json',
  search: 'https://cdn.lordicon.com/xfftupfv.json',
  settings: 'https://cdn.lordicon.com/lecprnjb.json',
  
  // Financial Icons (Working URLs)
  bitcoin: 'https://cdn.lordicon.com/qhgmphtg.json',
  coin: 'https://cdn.lordicon.com/qhgmphtg.json',
  wallet: 'https://cdn.lordicon.com/qhviklyi.json',
  creditCard: 'https://cdn.lordicon.com/qhgmphtg.json',
  bank: 'https://cdn.lordicon.com/slkvcfos.json',
  chart: 'https://cdn.lordicon.com/gqdnbnwt.json',
  dashboard: 'https://cdn.lordicon.com/wmlleaaf.json',
  trendingUp: 'https://cdn.lordicon.com/nlkqgmyx.json',
  trendingDown: 'https://cdn.lordicon.com/wxnxiano.json',
  portfolio: 'https://cdn.lordicon.com/wmlleaaf.json',
  money: 'https://cdn.lordicon.com/qhgmphtg.json',
  notification: 'https://cdn.lordicon.com/vspbqszr.json',
  calendar: 'https://cdn.lordicon.com/abfverha.json',
  transactions: 'https://cdn.lordicon.com/rjzlnunf.json',
};

const baseIconProps: Partial<AnimatedIconProps> = {
  trigger: 'hover',
  colors: 'primary:hsl(var(--primary)),secondary:hsl(var(--muted-foreground))',
  size: 'md',
};

const buttonVariantProps = {
  className: 'transition-transform duration-200 hover:scale-110 cursor-pointer',
  trigger: 'hover' as const,
};

const inlineVariantProps = {
  className: 'transition-opacity duration-200',
  trigger: 'loop-on-hover' as const,
};

// Individual icon components
export const AddIcon: React.FC<ActionIconProps> = ({ variant = 'button', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.add}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const DeleteIcon: React.FC<ActionIconProps> = ({ variant = 'button', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.delete}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--destructive)),secondary:hsl(var(--muted-foreground))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const SuccessIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.success}
    {...baseIconProps}
    trigger="sequence"
    colors="primary:hsl(var(--constructive)),secondary:hsl(var(--constructive-foreground))"
    className={cn('transition-opacity duration-300', className)}
    {...props}
  />
);

export const LoadingIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.loading}
    {...baseIconProps}
    trigger="loop"
    className={cn('animate-spin', className)}
    {...props}
  />
);

export const EditIcon: React.FC<ActionIconProps> = ({ variant = 'button', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.edit}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const SaveIcon: React.FC<ActionIconProps> = ({ variant = 'button', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.save}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--constructive)),secondary:hsl(var(--muted-foreground))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const SearchIcon: React.FC<ActionIconProps> = ({ variant = 'button', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.search}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const SettingsIcon: React.FC<ActionIconProps> = ({ variant = 'button', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.settings}
    {...baseIconProps}
    trigger="hover"
    className={cn('transition-transform duration-300 hover:rotate-90', className)}
    {...props}
  />
);

export const ChartIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.chart}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--balance)),secondary:hsl(var(--muted-foreground))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const WalletIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.wallet}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--primary)),secondary:hsl(var(--primary-glow))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const PortfolioIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.portfolio}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--income)),secondary:hsl(var(--muted-foreground))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const MoneyIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.money}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--income)),secondary:hsl(var(--expense))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const NotificationIcon: React.FC<ActionIconProps> = ({ variant = 'button', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.notification}
    {...baseIconProps}
    trigger="click"
    className={cn('transition-transform duration-200 hover:scale-110 cursor-pointer', className)}
    {...props}
  />
);

// New Financial Icon Components (Wired/Outline style)
export const BitcoinIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.bitcoin}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--income)),secondary:hsl(var(--muted-foreground))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const CoinIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.coin}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--income)),secondary:hsl(var(--expense))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const CreditCardIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.creditCard}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--balance)),secondary:hsl(var(--muted-foreground))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const BankIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.bank}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--primary)),secondary:hsl(var(--muted-foreground))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const DashboardIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.dashboard}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--primary)),secondary:hsl(var(--primary-glow))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const TrendingUpIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.trendingUp}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--income)),secondary:hsl(var(--muted-foreground))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const TrendingDownIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.trendingDown}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--expense)),secondary:hsl(var(--muted-foreground))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const CalendarIcon: React.FC<ActionIconProps> = ({ variant = 'button', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.calendar}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);

export const TransactionsIcon: React.FC<ActionIconProps> = ({ variant = 'inline', className, ...props }) => (
  <AnimatedIcon
    src={ICON_URLS.transactions}
    {...baseIconProps}
    {...(variant === 'button' ? buttonVariantProps : inlineVariantProps)}
    colors="primary:hsl(var(--primary)),secondary:hsl(var(--accent))"
    className={cn(variant === 'button' ? buttonVariantProps.className : inlineVariantProps.className, className)}
    {...props}
  />
);