import { basename, dirname, extname, join, resolve } from 'path';
import {
  isImportDeclaration,
  Node,
  Program,
  SourceFile,
  TransformationContext,
  Transformer,
  TransformerFactory,
  visitEachChild,
  visitNode,
} from 'typescript';

import { transformImportDeclaration } from './transform-import-declaration';

const noopFactory = (sf: SourceFile) => sf;

const transformerFactory = (
  options: { excludeNamespace: string[] },
  program: Program
): TransformerFactory<SourceFile> => {
  return (ctx: TransformationContext): Transformer<SourceFile> => {
    const { paths, baseUrl } = ctx.getCompilerOptions();
    const directory = program.getCurrentDirectory();
    const { excludeNamespace } = options ?? {};

    if (paths === undefined) {
      return noopFactory;
    }

    const rootPath = resolve(directory, baseUrl ?? ".");
    const moduleAliases = Object.entries(paths).reduce(
      (paths, [alias, [path]]) => {
        if (excludeNamespace !== undefined) {
          const isExcluded = excludeNamespace.some((namespace) =>
            alias.startsWith(namespace)
          );

          if (isExcluded) {
            return paths;
          }
        }

        const fullPath = join(rootPath, path);
        const extension = extname(fullPath);
        const fileName = basename(fullPath, extension);
        const dirName = dirname(fullPath);
        const fullBaseName = join(dirName, fileName);
        paths.set(alias, fullBaseName);
        return paths;
      },
      new Map<string, string>()
    );

    return (sf: SourceFile) => {
      const visitor = (node: Node): Node => {
        if (isImportDeclaration(node)) {
          return transformImportDeclaration(ctx, sf, node, moduleAliases);
        }

        return visitEachChild(node, visitor, ctx);
      };

      return visitNode(sf, visitor);
    };
  };
};

// Export for nx
export const before = transformerFactory;
export const afterDeclarations = transformerFactory;

// Export for ttypescript
export default transformerFactory;
