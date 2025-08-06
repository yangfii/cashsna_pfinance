import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '0.75rem',
				xs: '0.5rem',
				sm: '1rem',
				md: '1.5rem',
				lg: '2rem',
				xl: '2.5rem',
			},
		screens: {
			xs: '320px',
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1400px',
			'3xl': '1920px',
			'4xl': '2560px'
		}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))', 
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				constructive: {
					DEFAULT: 'hsl(var(--constructive))',
					foreground: 'hsl(var(--constructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Finance specific colors
				income: {
					DEFAULT: 'hsl(var(--income))',
					foreground: 'hsl(var(--income-foreground))'
				},
				expense: {
					DEFAULT: 'hsl(var(--expense))',
					foreground: 'hsl(var(--expense-foreground))'
				},
				balance: {
					DEFAULT: 'hsl(var(--balance))',
					foreground: 'hsl(var(--balance-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				'kantumruy': ['Kantumruy Pro', 'sans-serif'],
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-income': 'var(--gradient-income)',
				'gradient-expense': 'var(--gradient-expense)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }],
				// Mobile-optimized fluid typography
				'fluid-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
				'fluid-base': 'clamp(1rem, 2.5vw, 1.125rem)',
				'fluid-lg': 'clamp(1.125rem, 3vw, 1.25rem)',
				'fluid-xl': 'clamp(1.25rem, 3.5vw, 1.5rem)',
				'fluid-2xl': 'clamp(1.5rem, 4vw, 2rem)',
				'fluid-3xl': 'clamp(1.875rem, 5vw, 2.5rem)',
				'fluid-4xl': 'clamp(2.25rem, 6vw, 3rem)'
			},
			spacing: {
				'0': '0px',
				'px': '1px',
				'0.5': '0.125rem',
				'1': '0.25rem',
				'1.5': '0.375rem',
				'2': '0.5rem',
				'2.5': '0.625rem',
				'3': '0.75rem',
				'3.5': '0.875rem',
				'4': '1rem',
				'5': '1.25rem',
				'6': '1.5rem',
				'7': '1.75rem',
				'8': '2rem',
				'9': '2.25rem',
				'10': '2.5rem',
				'11': '2.75rem',
				'12': '3rem',
				'14': '3.5rem',
				'16': '4rem',
				'20': '5rem',
				'24': '6rem',
				'28': '7rem',
				'32': '8rem',
				'36': '9rem',
				'40': '10rem',
				'44': '11rem',
				'48': '12rem',
				'52': '13rem',
				'56': '14rem',
				'60': '15rem',
				'64': '16rem',
				'72': '18rem',
				'80': '20rem',
				'96': '24rem',
				// Mobile-specific touch targets
				'touch': '44px',
				'touch-lg': '48px'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'blink': {
					'0%, 50%': { opacity: '1' },
					'51%, 100%': { opacity: '0' }
				},
				'maskReveal': {
					'0%': {
						maskPosition: '0% 0',
						WebkitMaskPosition: '0% 0',
						opacity: '0'
					},
					'1%': {
						opacity: '1'
					},
					'100%': {
						maskPosition: '100% 0',
						WebkitMaskPosition: '100% 0',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'blink': 'blink 1s infinite',
				'maskReveal': 'maskReveal 2s ease-out forwards'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;