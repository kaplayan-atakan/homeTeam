import { Module } from '@nestjs/common';
import { DependencyController } from './dependency.controller';
import { DependencyAnalyzerService } from '@/common/services/dependency-analyzer.service';

@Module({
  controllers: [DependencyController],
  providers: [DependencyAnalyzerService],
  exports: [DependencyAnalyzerService],
})
export class AdminModule {}
