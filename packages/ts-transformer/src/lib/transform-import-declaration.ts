import { dirname, relative } from 'path';
import { ImportDeclaration, SourceFile, TransformationContext } from 'typescript';

import { getPathAlias } from './get-path-alias';
import { slash } from './slash';

export const transformImportDeclaration = (
  ctx: TransformationContext,
  sf: SourceFile,
  node: ImportDeclaration,
  moduleAliases: Map<string, string>
): ImportDeclaration => {
  const { moduleSpecifier } = node;
  const moduleText = moduleSpecifier.getText();
  const module = moduleText.substring(1, moduleText.length - 1);
  const knownPathAlias = getPathAlias(moduleAliases, module);

  if (knownPathAlias === null) {
    return node;
  }

  const fileDirectory = dirname(sf.fileName);
  const relativePath = relative(fileDirectory, knownPathAlias);
  const relativeModulePath = relativePath === "" ? "." : slash(relativePath);

  const declaration = ctx.factory.updateImportDeclaration(
    node,
    node.decorators,
    node.modifiers,
    node.importClause,
    ctx.factory.createStringLiteral(relativeModulePath),
    node.assertClause
  );

  return declaration;
};
