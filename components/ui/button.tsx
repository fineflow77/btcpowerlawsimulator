import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          // 基本のスタイル
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // サイズバリエーション
          {
            'px-4 py-2 text-sm': size === 'default',
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-6 py-3 text-base': size === 'lg',
          },

          // カラーバリエーション
          {
            // プライマリーボタン
            'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary':
              variant === 'primary',

            // セカンダリーボタン
            'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary':
              variant === 'secondary',

            // アウトラインボタン
            'border border-primary text-primary hover:bg-primary/10 focus:ring-primary':
              variant === 'outline',

            // ゴーストボタン
            'text-foreground hover:bg-muted focus:ring-muted':
              variant === 'ghost',
          },

          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
