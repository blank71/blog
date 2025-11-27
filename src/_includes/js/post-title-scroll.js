document.addEventListener('DOMContentLoaded', () => {
  const postTitle = document.querySelector('.post-title');
  const sidebar = document.querySelector('.post-sidebar');
  
  if (!postTitle || !sidebar) return;

  // Create title element for sidebar
  const sidebarTitle = document.createElement('div');
  sidebarTitle.className = 'post-title-sidebar';
  sidebarTitle.textContent = postTitle.textContent;
  
  // Insert at the beginning of sidebar
  sidebar.insertBefore(sidebarTitle, sidebar.firstChild);

  let ticking = false;

  const updateTitleVisibility = () => {
    const titleRect = postTitle.getBoundingClientRect();
    const scrollThreshold = -titleRect.height;

    if (titleRect.top <= scrollThreshold) {
      // Title scrolled out of view - show in sidebar
      sidebarTitle.style.display = 'block';
    } else {
      // Title still visible - hide from sidebar
      sidebarTitle.style.display = 'none';
    }

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateTitleVisibility);
      ticking = true;
    }
  };

  addEventListener('scroll', onScroll, { passive: true });
  
  // Initial check
  updateTitleVisibility();
});
