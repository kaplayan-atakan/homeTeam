import { SetMetadata } from '@nestjs/common';

export interface ModuleDependencyMetadata {
  /** Names of modules this module depends on (by class name) */
  dependencies: string[];
  /** Optional: Names of modules that depend on this module (can be inferred) */
  dependents?: string[];
  /** Optional description for context */
  description?: string;
}

export const MODULE_DEPENDENCIES = 'MODULE_DEPENDENCIES';

export const ModuleDependencies = (metadata: ModuleDependencyMetadata) =>
  SetMetadata(MODULE_DEPENDENCIES, metadata);
