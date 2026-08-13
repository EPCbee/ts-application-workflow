<script lang="ts">
  import { page } from '$app/stores';
  import ApplicationDetail from '$lib/components/ApplicationDetail.svelte';

  $: id = $page.params.id;
</script>

<ApplicationDetail {id} />