const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
const { addDynamicIconSelectors } = require('@iconify/tailwind')

/** @type {import("tailwindcss/types").Config } */
module.exports = {
    content: [
        './node_modules/pliny/**/*.js',
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,tsx}',
        './components/**/*.{js,ts,tsx}',
        './layouts/**/*.{js,ts,tsx}',
        './data/**/*.mdx',
    ],
    darkMode: 'class',
    mode: 'jit',
    theme: {
        extend: {
            lineHeight: {
                11: '2.75rem',
                12: '3rem',
                13: '3.25rem',
                14: '3.5rem',
                16: '4rem',
            },
            fontFamily: {
                sans: ['var(--font-noto-sans-sc)', ...fontFamily.sans],
                wenkai: ['"LXGW WenKai TC"', 'sans-serif'],
            },
            colors: {
                transparent: 'transparent',
                primary: colors.blue,
                gray: colors.neutral,
                customIndigo: {
                    100: '#fbfbf0',
                    200: '#f6f6dc',
                    300: '#f2f2f2',
                },
                customGrey: {
                    100: '#2f2f2f',
                    200: '#3f3f3f',
                    300: '#4f4f4f',
                },
                line: 'rgb( 204, 204, 204, 0.2)',
                origin: 'rgb(238, 199, 99)',
            },
            opacity: {
                0: '0',
                20: '0.2',
                40: '0.4',
                60: '0.6',
                80: '0.8',
                100: '1',
            },
            typography: ({ theme }) => ({
                DEFAULT: {
                    css: {
                        a: {
                            color: theme('colors.primary.500'),
                            '&:hover': {
                                color: `${theme('colors.primary.600')}`,
                            },
                            code: { color: theme('colors.primary.400') },
                        },
                        'h1,h2': {
                            fontWeight: '700',
                            letterSpacing: theme('letterSpacing.tight'),
                        },
                        h3: {
                            fontWeight: '600',
                        },
                        code: {
                            color: theme('colors.indigo.500'),
                        },
                    },
                },
                invert: {
                    css: {
                        a: {
                            color: theme('colors.primary.500'),
                            '&:hover': {
                                color: `${theme('colors.primary.400')}`,
                            },
                            code: { color: theme('colors.primary.400') },
                        },
                        'h1,h2,h3,h4,h5,h6': {
                            color: theme('colors.gray.100'),
                        },
                    },
                },
            }),
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            animation: {
                'fade-up': 'fade-up 0.5s ease-in-out',
                'infinite-scroll': 'infinite-scroll 100s linear infinite',
                'infinite-scroll-reverse': 'infinite-scroll-reverse 100s linear infinite',
            },
            keyframes: {
                'infinite-scroll': {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-100%)' },
                },
                'infinite-scroll-reverse': {
                    from: { transform: 'translateX(-100%)' },
                    to: { transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('tailwindcss-animate'),
        addDynamicIconSelectors(),
    ],
}
