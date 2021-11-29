import { Providable } from '@watsonjs/common';

export class DependencyGraph {
  private _dependencies: Providable[];

  public add(dependency: Providable) {
    this._dependencies.push(dependency);
  }

  public remove(dependency: Providable) {
    const idx = this._dependencies.indexOf(dependency);

    if (idx !== -1) {
      this._dependencies.splice(idx, 1);
    }
  }

  /**
   * Checks whether the graph already
   * contains `dependency` and if so
   * throws a CircularDependencyException.
   */
  public checkAndThrow(dependency: Providable) {
    if (this._dependencies.indexOf(dependency) !== -1) {
      throw `Circular dependency detected for ${dependency.name}: ${this}`;
    }
  }

  public toString() {
    return this._dependencies.join(" => ");
  }
}
