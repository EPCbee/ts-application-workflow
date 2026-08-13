<script lang="ts">
  import { goto } from '$app/navigation';
  import ApplicationForm from '$lib/components/ApplicationForm.svelte';
  import ApplicationPreview from '$lib/components/ApplicationPreview.svelte';
  import { applicationStore } from '$lib/stores/applicationStore';
  import { mockEmployees } from '$lib/utils/mockData';
  import { typeLabels } from '$lib/constants';
  import { type Application, type Applicant, type ApplicationType } from '$lib/types/application';

  let step: 'form' | 'preview' = 'form';
  let applicant: Applicant = mockEmployees[0];
  let formData: { type: ApplicationType; title: string; content: Record<string, any> } = {
    type: 'travel',
    title: '',
    content: {}
  };

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
    if (!formData.title.trim()) {
      alert('请填写标题');
      return;
    }
    step = 'preview';
  }

  function goToEdit() {
    step = 'form';
  }

  function submitApplication() {
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
      <div class="flex justify-end mt-6">
        <button on:click={goToPreview} class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">预览</button>
      </div>
    </div>
  {:else}
    <ApplicationPreview 
      formData={formData}
      {applicant}
      onEdit={goToEdit}
      onSubmit={submitApplication}
    />
  {/if}
</div>