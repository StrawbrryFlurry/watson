import { Providable } from "@di/providers";
import { stringify } from "@di/utils";

export class DependencyGraph {
  public dependencies: Providable[] = [];

  public add(dependency: Providable) {
    this.dependencies.push(dependency);
  }

  public remove(dependency: Providable) {
    const idx = this.dependencies.indexOf(dependency);

    if (idx !== -1) {
      this.dependencies.splice(idx, 1);
    }
  }

  /**
   * Checks whether the graph already
   * contains `dependency` and if so
   * throws a CircularDependencyException.
   */
  public checkAndThrow(dependency: Providable) {
    if (this.dependencies.indexOf(dependency) !== -1) {
      throw `Circular dependency detected for ${stringify(
        dependency.name
      )}: ${this}`;
    }
  }

  public toString() {
    return this.dependencies.join(" => ");
  }
}
