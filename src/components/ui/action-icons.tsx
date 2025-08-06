import React from 'react';
import { AnimatedIcon, AnimatedIconProps } from './animated-icon';
import { cn } from '@/lib/utils';

interface ActionIconProps extends Omit<AnimatedIconProps, 'src'> {
  variant?: 'button' | 'inline';
}

// Lordicon Wired/Outline Icon URLs for Financial App
const ICON_URLS = {
  // Basic Actions (Wired/Outline style)
  add: 'https://cdn.lordicon.com/wired/outline/186-plus.json',
  delete: 'https://cdn.lordicon.com/wired/outline/498-trash-2.json', 
  success: 'https://cdn.lordicon.com/wired/outline/1103-check.json',
  loading: 'https://cdn.lordicon.com/wired/outline/1469-refresh.json',
  edit: 'https://cdn.lordicon.com/wired/outline/1891-edit.json',
  save: 'https://cdn.lordicon.com/wired/outline/433-save.json',
  search: 'https://cdn.lordicon.com/wired/outline/1498-search.json',
  settings: 'https://cdn.lordicon.com/wired/outline/1640-settings.json',
  
  // Financial Icons (Wired/Outline style)
  bitcoin: 'https://cdn.lordicon.com/wired/outline/2665-logo-circle-bitcoin.json',
  coin: 'https://cdn.lordicon.com/wired/outline/290-coin.json',
  wallet: 'https://cdn.lordicon.com/wired/outline/421-wallet-purse.json',
  creditCard: 'https://cdn.lordicon.com/wired/outline/799-credit-card.json',
  bank: 'https://cdn.lordicon.com/wired/outline/1022-business-bank.json',
  chart: 'https://cdn.lordicon.com/wired/outline/1143-analytics-pie-chart.json',
  dashboard: 'https://cdn.lordicon.com/wired/outline/1141-analytics.json',
  trendingUp: 'https://cdn.lordicon.com/wired/outline/1152-trending-up.json',
  trendingDown: 'https://cdn.lordicon.com/wired/outline/1153-trending-down.json',
  portfolio: 'https://cdn.lordicon.com/wired/outline/1144-analytics-bar-chart.json',
  money: 'https://cdn.lordicon.com/wired/outline/346-money-dollar.json',
  notification: 'https://cdn.lordicon.com/wired/outline/371-notification.json',
  calendar: 'https://cdn.lordicon.com/wired/outline/258-calendar.json',
  transactions: 'https://cdn.lordicon.com/wired/outline/397-exchange.json',
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