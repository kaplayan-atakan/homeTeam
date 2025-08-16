import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { MODULE_DEPENDENCIES, ModuleDependencyMetadata } from '../decorators/module-dependencies.decorator';

export interface DependencyGraphNode {
  name: string;
  dependencies: string[];
  dependents: string[];
  description?: string;
}

export interface DependencyGraphResult {
  nodes: DependencyGraphNode[];
  edges: { from: string; to: string }[];
}

@Injectable()
export class DependencyAnalyzerService implements OnModuleInit {
  private readonly logger = new Logger(DependencyAnalyzerService.name);
  private graphCache: DependencyGraphResult | null = null;

  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    // Warm cache on startup for fast responses
    this.graphCache = this.buildGraph();
    this.logger.log(`Dependency graph built with ${this.graphCache.nodes.length} nodes`);
  }

  public getGraph(): DependencyGraphResult {
    if (!this.graphCache) {
      this.graphCache = this.buildGraph();
    }
    return this.graphCache;
  }

  private buildGraph(): DependencyGraphResult {
    const nodesMap = new Map<string, DependencyGraphNode>();

    // Iterate all modules registered in Nest container
    for (const [token, moduleRef] of this.modulesContainer.entries()) {
      const moduleClass = moduleRef.metatype as any;
      if (!moduleClass || !moduleClass.name) continue;
      const name = moduleClass.name;

      const meta = this.reflector.get<ModuleDependencyMetadata | undefined>(
        MODULE_DEPENDENCIES,
        moduleClass,
      );

      const node: DependencyGraphNode = {
        name,
        dependencies: meta?.dependencies ?? [],
        dependents: meta?.dependents ?? [],
        description: meta?.description,
      };
      nodesMap.set(name, node);
    }

    // Infer dependents from dependencies for modules that didn't set it explicitly
    for (const node of nodesMap.values()) {
      for (const dep of node.dependencies) {
        const depNode = nodesMap.get(dep);
        if (depNode && !depNode.dependents.includes(node.name)) {
          depNode.dependents.push(node.name);
        }
      }
    }

    // Build edges (from -> to means from depends on to)
    const edges: { from: string; to: string }[] = [];
    for (const node of nodesMap.values()) {
      for (const dep of node.dependencies) {
        if (nodesMap.has(dep)) {
          edges.push({ from: node.name, to: dep });
        }
      }
    }

    return { nodes: Array.from(nodesMap.values()), edges };
  }
}
