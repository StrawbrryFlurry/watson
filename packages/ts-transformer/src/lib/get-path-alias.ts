export const getPathAlias = (
  moduleAliases: Map<string, string>,
  module: string
) => {
  // Path aliases must start with a "@" symbol
  if (!module.startsWith("@")) {
    return null;
  }

  for (const alias of moduleAliases.keys()) {
    if (!alias.endsWith("*")) {
      const hasAlias = moduleAliases.get(alias);

      if (module === alias) {
        return hasAlias!;
      }

      continue;
    }

    const pathAliasWithoutStar = alias.substring(0, alias.length - 1);

    if (module.startsWith(pathAliasWithoutStar)) {
      const aliasPath = moduleAliases.get(alias)!;
      const moduleWithoutAlias = module.substring(
        pathAliasWithoutStar.length - 1
      );
      const aliasPathWithoutStar = aliasPath.substring(0, aliasPath.length - 1);

      return `${aliasPathWithoutStar}${moduleWithoutAlias}`;
    }
  }

  return null;
};
