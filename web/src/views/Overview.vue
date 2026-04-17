<template>
  <div class="!w-full !h-full">
    <n-card :bordered="false" class="!h-full !shadow !rounded-xl">
      <template #header>
        <n-flex align="center" justify="space-between">
          <n-text class="!text-xl !font-bold">工作台 (Workbench)</n-text>
          <n-tag type="warning">完善中 (Under Construction)</n-tag>
        </n-flex>
      </template>

      <n-empty description="核心业务模块开发中..." class="!mt-20">
        <template #extra>
          <n-flex vertical align="center" :size="24" class="!mt-4 !w-full !max-w-3xl !mx-auto">
            <n-alert title="工作台功能建设展望" type="info" :show-icon="true" class="!w-full !text-left">
              工作台扮演着数据中枢与业务驱动引擎的核心角色，旨在为不同角色提供智能化的决策支持与异常拦截：
              <ul class="!list-disc !ml-5 !mt-2 !space-y-1">
                <li><strong>管理视图 (Executive Dashboard)：</strong> 实时呈现全局资源流转链路，宏观监控核心转化率、资产留存率及资源投入产出比（ROI）。</li>
                <li><strong>业务视图 (Operational Board)：</strong> 聚焦一线资产跟进周期，自动化推送 SLA 告警（如逾期未联络资源退回公海倒计时），驱动闭环高效落地。</li>
                <li><strong>安全风控巡检 (Risk Auditing)：</strong> 基于行为埋点的大数据模型，前置预警诸如高频越权巡查、规模化数据爬取等高危行为。</li>
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
