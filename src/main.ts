import { showToast } from './components/toast';
import './style.css';
import { renderList } from './views/list';
import { renderCreate } from './views/create';
import { renderDetail } from './views/detail';
import { renderStats } from './views/stats';

function navigate() {
  const hash = window.location.hash.slice(1) || 'list';
  const app = document.getElementById('app')!;
  // 更新导航高亮
  document.querySelectorAll('.app-nav a').forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.app-nav a[href="#${hash.split('/')[0]}"]`);
  if (activeLink) activeLink.classList.add('active');

  if (hash === 'list') {
    renderList(app);
  } else if (hash === 'create') {
    renderCreate(app);
  } else if (hash.startsWith('detail/')) {
    const id = hash.split('/')[1];
    renderDetail(app, id);
  } else if (hash === 'stats') {
    renderStats(app);
  } else {
    app.innerHTML = '<div class="card text-center"><h2>404</h2></div>';
  }
}

// ✅ 将函数挂载到window，运行时全局可用
(window as typeof window & { showToast: typeof showToast }).showToast = showToast;

window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);
