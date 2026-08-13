<script lang="ts">
  import { goto } from '$app/navigation';
  import ApplicationForm from '$lib/components/ApplicationForm.svelte';
  import ApplicationPreview from '$lib/components/ApplicationPreview.svelte';
  import { applicationStore } from '$lib/stores/applicationStore';
  import { mockEmployees } from '$lib/utils/mockData';
  import { typeLabels } from '$lib/constants';
  import { APPLICATION_TYPES } from '$lib/constants';
  import type { Application, Applicant, ApplicationType } from '$lib/types/application';

  let step: 'form' | 'preview' = 'form';
  let applicant: Applicant = mockEmployees[0];
  let formData: { type: ApplicationType; title: string; content: Record<string, any> } = {
    type: 'travel',
    title: '',
    content: {}
  };

  // 表单校验
  function validateForm(): string | null {
    if (!formData.title.trim()) return '请填写标题';
    const type = formData.type;
    const content = formData.content;
    if (type === APPLICATION_TYPES.TRAVEL) {
      if (!content.destination) return '请填写目的地';
      if (!content.startDate) return '请选择开始日期';
      if (!content.endDate) return '请选择结束日期';
      if (!content.purpose) return '请填写出行目的';
      if (!content.estimatedCost || content.estimatedCost <= 0) return '请填写有效预估费用';
    } else if (type === APPLICATION_TYPES.PURCHASE) {
      if (!content.items?.[0]?.name) return '请填写物品名称';
      if (!content.vendor) return '请填写供应商';
    } else if (type === APPLICATION_TYPES.REIMBURSEMENT) {
      if (!content.expenses?.[0]?.category) return '请填写费用类别';
      if (!content.expenses?.[0]?.amount || content.expenses[0].amount <= 0) return '请填写有效金额';
    } else if (type === APPLICATION_TYPES.OVERTIME) {
      if (!content.date) return '请选择加班日期';
      if (!content.hours || content.hours <= 0) return '请填写有效加班时长';
    }
    return null;
  }

  function handleFieldChange(field: string, value: any) {
    if (field === 'title') {
      formData.title = value;
    } else if (field.startsWith('content.')) {
      const key = field.replace('content.', '');
      formData.content[key] = value;
    }
  }

  function handleApplicantChange(newApplicant: Applicant) {
    applicant = newApplicant;
  }

  function handleTypeChange(type: ApplicationType) {
    formData.type = type;
    formData.content = {};
  }

  function goToPreview() {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }
    step = 'preview';
  }

  function goToEdit() {
    step = 'form';
  }

  // 统一的提交函数
  function handleSubmit() {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }
    const newApp: Application = {
      id: `app_${Date.now()}`,
      type: formData.type,
      typeLabel: typeLabels[formData.type],
      applicant: { ...applicant },
      title: formData.title,
      content: { ...formData.content },
      status: 'pending',
      statusLabel: '待审批',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };
    applicationStore.addApplication(newApp);
    alert('✅ 申请已提交！');
    goto('/list');
  }
</script>

<div class="max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold text-gray-900 mb-6">发起新申请</h1>
  
  {#if step === 'form'}
    <div class="bg-white rounded-lg shadow p-6">
      <ApplicationForm 
        {applicant}
        formType={formData.type}
        title={formData.title}
        content={formData.content}
        onFieldChange={handleFieldChange}
        onApplicantChange={handleApplicantChange}
        onTypeChange={handleTypeChange}
      />
      <div class="flex justify-end gap-3 mt-6">
        <button on:click={goToPreview} class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">预览</button>
        <button on:click={handleSubmit} class="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">提交</button>
      </div>
    </div>
  {:else}
    <ApplicationPreview 
      formData={formData}
      {applicant}
      onEdit={goToEdit}
      onSubmit={handleSubmit}
    />
  {/if}
</div>