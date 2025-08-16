import { Controller, Get } from '@nestjs/common';
import { DependencyAnalyzerService } from '@/common/services/dependency-analyzer.service';

@Controller('admin/dependencies')
export class DependencyController {
  constructor(private readonly analyzer: DependencyAnalyzerService) {}

  @Get()
  getGraph() {
    return this.analyzer.getGraph();
  }
}
