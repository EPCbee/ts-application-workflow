<script lang="ts">
  import { goto } from '$app/navigation';
  import { applicationStore } from '$lib/stores/applicationStore';
  import { formatContentFields } from '$lib/utils/mockData';
  import type { Application, ApplicationStatus } from '$lib/types/application';

  export let id: string;

  // 获取应用数据
  let app: Application | undefined = applicationStore.getApplicationById(id);
  $: fields = app ? formatContentFields(app.content, app.type) : [];

  function getStatusColor(status: ApplicationStatus) {
    const colors = {
      draft: 'bg-gray-200 text-gray-800',
      pending: 'bg-yellow-200 text-yellow-800',
      approved: 'bg-green-200 text-green-800',
      rejected: 'bg-red-200 text-red-800',
      cancelled: 'bg-gray-300 text-gray-800'
    };
    return colors[status] || colors.draft;
  }

  function updateStatus(status: ApplicationStatus, label: string) {
    if (!app) return;
    applicationStore.updateApplication(id, { status, statusLabel: label });
    if (status === 'approved') {
      applicationStore.updateApplication(id, { approvedAt: new Date().toISOString(), comments: '审批通过' });
    } else if (status === 'rejected') {
      applicationStore.updateApplication(id, { approvedAt: new Date().toISOString(), comments: '审批驳回' });
    }
    alert(`✅ 状态已更新为：${label}`);
    goto('/list');
  }

  function handleSubmit() { updateStatus('pending', '待审批'); }
  function handleCancel() { updateStatus('cancelled', '已取消'); }
  function handleApprove() { updateStatus('approved', '已批准'); }
  function handleReject() { updateStatus('rejected', '已驳回'); }
</script>

{#if !app}
  <div class="card text-center text-red-500">申请不存在</div>
{:else}
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-start mb-4">
      <h2 class="text-2xl font-bold text-gray-900">{app.title}</h2>
      <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full {getStatusColor(app.status)}">{app.statusLabel}</span>
    </div>
    <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
      <div><span class="text-sm font-medium text-gray-500">编号</span><p class="text-gray-900">{app.id}</p></div>
      <div><span class="text-sm font-medium text-gray-500">类型</span><p class="text-gray-900">{app.typeLabel}</p></div>
      <div><span class="text-sm font-medium text-gray-500">申请人</span><p class="text-gray-900">{app.applicant.name}</p></div>
      <div><span class="text-sm font-medium text-gray-500">部门</span><p class="text-gray-900">{app.applicant.department}</p></div>
      <div><span class="text-sm font-medium text-gray-500">创建时间</span><p class="text-gray-900">{new Date(app.createdAt).toLocaleString()}</p></div>
      {#if app.submittedAt}
        <div><span class="text-sm font-medium text-gray-500">提交时间</span><p class="text-gray-900">{new Date(app.submittedAt).toLocaleString()}</p></div>
      {/if}
      {#if app.approvedAt}
        <div><span class="text-sm font-medium text-gray-500">审批时间</span><p class="text-gray-900">{new Date(app.approvedAt).toLocaleString()}</p></div>
      {/if}
      {#if app.comments}
        <div class="col-span-2"><span class="text-sm font-medium text-gray-500">审批意见</span><p class="text-gray-900">{app.comments}</p></div>
      {/if}
    </div>
    <div class="p-4 bg-gray-50 rounded-lg mb-4">
      <h4 class="text-sm font-medium text-gray-500 mb-2">申请内容</h4>
      <div class="grid grid-cols-2 gap-4">
        {#each fields as field}
          <div><span class="text-xs font-medium text-gray-400">{field.label}</span><p class="text-gray-900 text-sm">{field.value}</p></div>
        {/each}
      </div>
    </div>
    <div class="flex gap-2 mt-4">
      {#if app.status === 'draft'}
        <button on:click={handleSubmit} class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">提交审批</button>
        <button on:click={handleCancel} class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">取消</button>
      {/if}
      {#if app.status === 'pending'}
        <button on:click={handleApprove} class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">批准</button>
        <button on:click={handleReject} class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">驳回</button>
      {/if}
      <button on:click={() => goto('/list')} class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">返回列表</button>
    </div>
  </div>
{/if}