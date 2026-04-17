<template>
  <div class="!w-full !h-full">
    <n-card :bordered="false" class="!h-full !shadow !rounded-xl">
      <template #header>
        <n-flex align="center" justify="space-between">
          <n-text class="!text-xl !font-bold">我的报表 (My Reports)</n-text>
          <n-tag type="warning">完善中 (Under Construction)</n-tag>
        </n-flex>
      </template>

      <n-empty description="个人效能分析模块设计中..." class="!mt-20">
        <template #extra>
          <n-flex vertical align="center" :size="24" class="!mt-4 !w-full !max-w-3xl !mx-auto">
            <n-alert title="报表功能建设展望" type="info" :show-icon="true" class="!w-full !text-left">
              本模块致力于个人效能矩阵的精细化建模，以微观视角追踪转化链路每一步骤的指标健康度：
              <ul class="!list-disc !ml-5 !mt-2 !space-y-1">
                <li><strong>漏斗流转分析 (Funnel Analytics)：</strong> 动态追踪分配、联系、意向至最终成单的核心漏斗断层，定位转化瓶颈。</li>
                <li><strong>周期效率 (Cycle Efficiency)：</strong> 多维度打平工作周期的耗时数据，计算触达响应时间及跟进滞留率。</li>
                <li><strong>资产构成矩阵 (Portfolio Composition)：</strong> 对个人当前拥有的私域资产量级、分类比例、活跃状态分布做深度透视，形成个人画像。</li>
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
