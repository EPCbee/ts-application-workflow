<script lang="ts">
  import ApplicationList from '$lib/components/ApplicationList.svelte';
  import type { ApplicationStatus } from '$lib/types/application';

  let statusFilter: ApplicationStatus | 'all' = 'all';
  let startDate = '';
  let endDate = '';

  function handleStatusFilterChange(status: ApplicationStatus | 'all') {
    statusFilter = status;
  }

  function handleDateFilterChange(start: string, end: string) {
    startDate = start;
    endDate = end;
  }
</script>

<div class="max-w-6xl mx-auto">
  <h1 class="text-2xl font-bold text-gray-900 mb-6">申请列表</h1>
  <ApplicationList
    {statusFilter}
    {startDate}
    {endDate}
    onStatusFilterChange={handleStatusFilterChange}
    onDateFilterChange={handleDateFilterChange}
  />
</div>