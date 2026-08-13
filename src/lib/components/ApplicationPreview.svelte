<script lang="ts">
  import type { ApplicationFormData, Applicant, ApplicationType } from '$lib/types/application';
  import { formatContentFields, typeLabels } from '$lib/utils/mockData';
  export let formData: { type: ApplicationType; title: string; content: Record<string, any> };
  export let applicant: Applicant;
  export let onEdit: () => void;
  export let onSubmit: () => void;

  $: fields = formatContentFields(formData.content, formData.type);
</script>

<div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
  <h3 class="text-lg font-semibold text-gray-900 mb-4">📋 预览申请</h3>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
      <div><span class="text-sm font-medium text-gray-500">申请人</span><p class="text-gray-900">{applicant.name}</p></div>
      <div><span class="text-sm font-medium text-gray-500">部门</span><p class="text-gray-900">{applicant.department}</p></div>
      <div><span class="text-sm font-medium text-gray-500">邮箱</span><p class="text-gray-900">{applicant.email}</p></div>
      <div><span class="text-sm font-medium text-gray-500">电话</span><p class="text-gray-900">{applicant.phone}</p></div>
    </div>
    <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
      <div><span class="text-sm font-medium text-gray-500">申请类型</span><p class="text-gray-900">{typeLabels[formData.type]}</p></div>
      <div><span class="text-sm font-medium text-gray-500">标题</span><p class="text-gray-900">{formData.title}</p></div>
    </div>
    <div class="p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-500 mb-2">申请内容</h4>
      <div class="grid grid-cols-2 gap-4">
        {#each fields as field}
          <div>
            <label class="text-xs font-medium text-gray-400">{field.label}</label>
            <p class="text-gray-900 text-sm">{field.value}</p>
          </div>
        {/each}
      </div>
    </div>
    <div class="flex justify-end gap-2 mt-4">
      <button on:click={onEdit} class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">返回修改</button>
      <button on:click={onSubmit} class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">确认提交</button>
    </div>
  </div>
</div>