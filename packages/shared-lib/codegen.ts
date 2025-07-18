import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'src/api/graphql/schema.graphql',
  documents: 'src/api/graphql/**/*.graphql',
  generates: {
    'src/api/graphql/generated/': {
      preset: 'client',
      plugins: [],
      config: {
        strictScalars: true,
        scalars: {
          DateTime: 'string',
          URL: 'string',
          ID: 'string',
          HtmlEncodedString: 'string',
          ISO8601DateTime: 'string',
          ISO8601Duration: 'string',
          JSON: 'unknown',
        },
        useTypeImports: true,
        skipTypename: true,
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
          defaultValue: false,
        },
      },
    },
  },
};

export default config;
