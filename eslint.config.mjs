import nextConfig from 'eslint-config-next'

const modifiedNextConfig = nextConfig.map((entry) => {
  if (entry.plugins && entry.plugins['jsx-a11y']) {
    return {
      ...entry,
      rules: {
        ...entry.rules,
        'jsx-a11y/anchor-is-valid': [
          'error',
          {
            components: ['Link'],
            specialLink: ['hrefLeft', 'hrefRight'],
            aspects: ['invalidHref', 'preferButton'],
          },
        ],
      },
    }
  }
  return entry
})

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: ['node_modules', '.contentlayer', '.next', '.yarn'],
  },
  ...modifiedNextConfig,
  {
    rules: {
      '@next/next/no-page-custom-font': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
]

export default config
