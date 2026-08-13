<script lang="ts">
  import { mockEmployees, typeLabels } from '$lib/utils/mockData';
  import { APPLICATION_TYPES } from '$lib/constants';
  import type { ApplicationType, Applicant } from '$lib/types/application';

  export let applicant: Applicant;
  export let formType: ApplicationType;
  export let title: string;
  export let content: Record<string, any>;
  
  export let onFieldChange: (field: string, value: any) => void;
  export let onApplicantChange: (applicant: Applicant) => void;
  export let onTypeChange: (type: ApplicationType) => void;

  const typeOptions = Object.entries(typeLabels).map(([key, label]) => ({ value: key as ApplicationType, label }));

  $: currentType = formType;

  // 通用字段更新（单值）
  function handleFieldUpdate(key: string, value: any) {
    onFieldChange(`content.${key}`, value);
  }

  // 采购：更新物品名称
  function updateItemName(e: Event) {
    const target = e.target as HTMLInputElement;
    const items = [...(content.items || [])];
    if (items.length === 0) items.push({});
    items[0].name = target.value;
    handleFieldUpdate('items', items);
  }

  // 报销：更新费用类别
  function updateExpenseCategory(e: Event) {
    const target = e.target as HTMLInputElement;
    const expenses = [...(content.expenses || [])];
    if (expenses.length === 0) expenses.push({});
    expenses[0].category = target.value;
    handleFieldUpdate('expenses', expenses);
  }

  // 报销：更新费用金额
  function updateExpenseAmount(e: Event) {
    const target = e.target as HTMLInputElement;
    const expenses = [...(content.expenses || [])];
    if (expenses.length === 0) expenses.push({});
    expenses[0].amount = Number(target.value);
    const total = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    handleFieldUpdate('expenses', expenses);
    handleFieldUpdate('totalAmount', total);
  }

  // 自定义：更新字段标签
  function updateCustomLabel(e: Event) {
    const target = e.target as HTMLInputElement;
    const fields = [...(content.customFields || [])];
    if (fields.length === 0) fields.push({});
    fields[0].label = target.value;
    handleFieldUpdate('customFields', fields);
  }

  // 自定义：更新字段值
  function updateCustomValue(e: Event) {
    const target = e.target as HTMLInputElement;
    const fields = [...(content.customFields || [])];
    if (fields.length === 0) fields.push({});
    fields[0].value = target.value;
    handleFieldUpdate('customFields', fields);
  }

  function handleApplicantChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selected = mockEmployees.find(e => e.id === select.value);
    if (selected) onApplicantChange(selected);
  }

  function handleTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const type = select.value as ApplicationType;
    onTypeChange(type);
  }
</script>

<div class="space-y-4">
  <div class="form-group">
    <label class="form-label">申请人</label>
    <select class="form-control" value={applicant.id} on:change={handleApplicantChange}>
      {#each mockEmployees as emp}
        <option value={emp.id}>{emp.name} - {emp.department}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label class="form-label">申请类型</label>
    <select class="form-control" value={currentType} on:change={handleTypeChange}>
      {#each typeOptions as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label class="form-label">标题 <span class="text-red-500">*</span></label>
    <input class="form-control" type="text" value={title} on:input={(e) => onFieldChange('title', e.target.value)} placeholder="请输入标题" />
  </div>

  <div id="dynamicFields" class="space-y-4">
    {#if currentType === APPLICATION_TYPES.TRAVEL}
      <div class="form-group"><label class="form-label">目的地 <span class="text-red-500">*</span></label><input class="form-control" type="text" value={content.destination || ''} on:input={(e) => handleFieldUpdate('destination', e.target.value)} /></div>
      <div class="form-group"><label class="form-label">开始日期 <span class="text-red-500">*</span></label><input class="form-control" type="date" value={content.startDate || ''} on:input={(e) => handleFieldUpdate('startDate', e.target.value)} /></div>
      <div class="form-group"><label class="form-label">结束日期 <span class="text-red-500">*</span></label><input class="form-control" type="date" value={content.endDate || ''} on:input={(e) => handleFieldUpdate('endDate', e.target.value)} /></div>
      <div class="form-group"><label class="form-label">出行目的 <span class="text-red-500">*</span></label><input class="form-control" type="text" value={content.purpose || ''} on:input={(e) => handleFieldUpdate('purpose', e.target.value)} /></div>
      <div class="form-group"><label class="form-label">预估费用 <span class="text-red-500">*</span></label><input class="form-control" type="number" value={content.estimatedCost || ''} on:input={(e) => handleFieldUpdate('estimatedCost', Number(e.target.value))} /></div>
      <div class="form-group"><label class="form-label">交通方式</label><select class="form-control" value={content.transportation || ''} on:change={(e) => handleFieldUpdate('transportation', e.target.value)}><option value="飞机">飞机</option><option value="高铁">高铁</option><option value="汽车">汽车</option></select></div>

    {:else if currentType === APPLICATION_TYPES.PURCHASE}
      <div class="form-group"><label class="form-label">物品名称 <span class="text-red-500">*</span></label><input class="form-control" type="text" value={content.items?.[0]?.name || ''} on:input={updateItemName} /></div>
      <div class="form-group"><label class="form-label">供应商 <span class="text-red-500">*</span></label><input class="form-control" type="text" value={content.vendor || ''} on:input={(e) => handleFieldUpdate('vendor', e.target.value)} /></div>

    {:else if currentType === APPLICATION_TYPES.REIMBURSEMENT}
      <div class="form-group"><label class="form-label">费用类别 <span class="text-red-500">*</span></label><input class="form-control" type="text" value={content.expenses?.[0]?.category || ''} on:input={updateExpenseCategory} /></div>
      <div class="form-group"><label class="form-label">金额 <span class="text-red-500">*</span></label><input class="form-control" type="number" value={content.expenses?.[0]?.amount || ''} on:input={updateExpenseAmount} /></div>

    {:else if currentType === APPLICATION_TYPES.OVERTIME}
      <div class="form-group"><label class="form-label">加班日期 <span class="text-red-500">*</span></label><input class="form-control" type="date" value={content.date || ''} on:input={(e) => handleFieldUpdate('date', e.target.value)} /></div>
      <div class="form-group"><label class="form-label">加班时长（小时） <span class="text-red-500">*</span></label><input class="form-control" type="number" value={content.hours || ''} on:input={(e) => handleFieldUpdate('hours', Number(e.target.value))} /></div>

    {:else if currentType === APPLICATION_TYPES.CUSTOM}
      <div class="form-group"><label class="form-label">自定义字段名</label><input class="form-control" type="text" value={content.customFields?.[0]?.label || ''} on:input={updateCustomLabel} /></div>
      <div class="form-group"><label class="form-label">自定义值</label><input class="form-control" type="text" value={content.customFields?.[0]?.value || ''} on:input={updateCustomValue} /></div>
    {/if}
  </div>
</div>

<style>
  .form-group { margin-bottom: 1rem; }
  .form-label { display: block; font-weight: 500; margin-bottom: 0.25rem; }
  .form-control { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem; }
  .form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.5); }
</style>