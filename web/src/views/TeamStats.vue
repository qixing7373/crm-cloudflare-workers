<template>
  <div class="!w-full !h-full">
    <n-card :bordered="false" class="!h-full !shadow !rounded-xl">
      <template #header>
        <n-flex align="center" justify="space-between">
          <n-text class="!text-xl !font-bold">团队统计 (Team Statistics)</n-text>
          <n-tag type="warning">完善中 (Under Construction)</n-tag>
        </n-flex>
      </template>

      <n-empty description="组织管理效能评估模块建设中..." class="!mt-20">
        <template #extra>
          <n-flex vertical align="center" :size="24" class="!mt-4 !w-full !max-w-3xl !mx-auto">
            <n-alert title="团队统计架构建设展望" type="info" :show-icon="true" class="!w-full !text-left">
              基于纵深组织节点进行多维度的绩效切片比对与横向穿透分析，旨在为管理层构建全息决策沙盘：
              <ul class="!list-disc !ml-5 !mt-2 !space-y-1">
                <li><strong>跨域效能基准 (Cross-Benchmark)：</strong> 自动计算不同部门之间的线索转化差异化指标，平滑清洗异常值，构建标准化组织基线。</li>
                <li><strong>存量吞吐预估 (Throughput Estimation)：</strong> 根据团队历史跟进速率和公海提取热度，推演下周期的饱和度及所需外部线索阈值。</li>
                <li><strong>人力资源雷达 (Resource Radar)：</strong> 根据各业务员的跟进时效与质检结果，输出团队能力的雷达图矩阵，精准聚焦管理痛点。</li>
              </ul>
            </n-alert>
          </n-flex>
        </template>
      </n-empty>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { NAlert, NCard, NEmpty, NFlex, NTag, NText } from 'naive-ui'
</script>
