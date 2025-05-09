/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		animation: {
			'spin-once': 'spin 0.3s ease-in-out',
			'wiggle-once': 'wiggle 0.5s ease-in-out',
			'shimmer': 'shimmer 2s linear infinite',
			'glow': 'glow 1.5s ease-in-out infinite alternate',
			'slideDown': 'slideDown 0.3s ease-out forwards',
			'fadeIn': 'fadeIn 0.3s ease-out forwards',
			'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
		  },
		keyframes: {
			wiggle: {
			  '0%, 100%': { transform: 'rotate(0deg)' },
			  '25%': { transform: 'rotate(-10deg)' },
			  '75%': { transform: 'rotate(10deg)' },
			},
			shimmer: {
			  '0%': { backgroundPosition: '0% 0%' },
			  '100%': { backgroundPosition: '100% 0%' },
			},
			glow: {
			  '0%': { opacity: 0.6, boxShadow: '0 0 5px 1px rgba(79,70,229,0.4)' },
			  '100%': { opacity: 1, boxShadow: '0 0 10px 3px rgba(79,70,229,0.8)' },
			},
			slideDown: {
			  '0%': { opacity: 0, transform: 'translateY(-10px)' },
			  '100%': { opacity: 1, transform: 'translateY(0)' },
			},
			fadeIn: {
			  '0%': { opacity: 0, transform: 'translateX(-10px)' },
			  '100%': { opacity: 1, transform: 'translateX(0)' },
			}
		},
		backgroundSize: {
			'shimmer': '200% 100%',
		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}