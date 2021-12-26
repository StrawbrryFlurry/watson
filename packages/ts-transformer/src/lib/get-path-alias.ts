export const getPathAlias = (
  moduleAliases: Map<string, string>,
  module: string
) => {
  const aliases = [...moduleAliases.keys()];
  // Path aliases must start with a "@" symbol
  if (!module.startsWith("@")) {
    return null;
  }

  for (const alias of aliases) {
    if (!alias.endsWith("*")) {
      const hasAlias = moduleAliases.get(alias);

      if (module === alias) {
        return hasAlias!;
      }

      continue;
    }

    const pathAliasWithoutStar = alias.substring(0, alias.length - 1);

    if (!module.startsWith(pathAliasWithoutStar)) {
      continue;
    }
    const bestAliasMatch = findBestPathMatch(module, alias, aliases);
    const aliasPath = moduleAliases.get(bestAliasMatch)!;
    const moduleWithoutAlias = module.substring(
      pathAliasWithoutStar.length - 1
    );
    const aliasPathWithoutStar = aliasPath.substring(0, aliasPath.length - 1);

    return `${aliasPathWithoutStar}${moduleWithoutAlias}`;
  }

  return null;
};

const findBestPathMatch = (
  module: string,
  match: string,
  aliases: string[]
) => {
  return aliases.reduce((previousMatch, alias) => {
    const aliasWithoutStar = alias.substring(0, alias.length - 1);

    if (
      module.startsWith(aliasWithoutStar) &&
      alias.length > previousMatch.length
    ) {
      return alias;
    }

    return previousMatch;
  }, match);
};
