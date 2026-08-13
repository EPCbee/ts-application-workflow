<script lang="ts">
  import { onMount } from 'svelte';
  import { statsStore } from '$lib/stores/applicationStore';
  import ApplicationStats from '$lib/components/ApplicationStats.svelte';
  import type { ApplicationStats as StatsType } from '$lib/types/application';

  let stats: StatsType | null = null;

  onMount(() => {
    const unsubscribe = statsStore.subscribe(value => {
      stats = value;
    });
    return () => unsubscribe();
  });
</script>

<div class="max-w-6xl mx-auto">
  <h1 class="text-2xl font-bold text-gray-900 mb-6">统计报表</h1>
  {#if stats}
    <ApplicationStats stats={stats} />
  {:else}
    <div class="text-center py-8">加载中...</div>
  {/if}
</div>