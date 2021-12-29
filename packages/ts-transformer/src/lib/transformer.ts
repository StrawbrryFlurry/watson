import { basename, dirname, extname, join, resolve } from 'path';
import {
  isImportClause,
  isImportDeclaration,
  isImportSpecifier,
  isTypeOnlyImportOrExportDeclaration,
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

const FILE_EXTENSIONS = ["js", "ts", "jsx", "tsx"];
const noopFactory = (sf: SourceFile) => sf;

interface TransformerOptions {
  excludeNamespace: string[];
}

const transformerFactory = (
  options: TransformerOptions,
  program: Program,
  isAfterDeclarations: boolean = false
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
        let extension: string | undefined = extname(fullPath);

        // Don't remove extensions such as .util
        if (!FILE_EXTENSIONS.some((ext) => ext === extension!.toLowerCase())) {
          extension = undefined;
        }

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
        if (
          isImportClause(node) ||
          isImportSpecifier(node) ||
          isTypeOnlyImportOrExportDeclaration(node)
        ) {
          console.log(node.getText());
          return node;
        }

        if (isImportDeclaration(node)) {
          const { importClause } = node;

          // Skip type only imports when compiling regular files
          if (importClause && importClause.isTypeOnly && !isAfterDeclarations) {
            return node;
          }

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
export const afterDeclarations = (
  options: TransformerOptions,
  program: Program
) => transformerFactory(options, program, true);

// Export for ttypescript
export default (program: Program, options: any) =>
  transformerFactory(options, program);
