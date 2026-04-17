<template>
  <div class="app-layout">
    <!-- Navigation -->
    <header class="app-header">
      <div class="container header-content">
        <NuxtLink to="/" class="logo" id="nav-logo">
          <span class="logo-icon">🎧</span>
          <span class="logo-text">Audiary</span>
        </NuxtLink>
        <nav class="nav-links">
          <NuxtLink to="/" class="nav-link" id="nav-library">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            <span>Library</span>
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Page Content -->
    <main class="app-main">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container footer-content">
        <p>Audiary — Personal AI Audiobook Player</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 20, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-primary);
  font-weight: 700;
  font-size: var(--font-size-xl);
  transition: opacity var(--transition-fast);
}

.logo:hover {
  opacity: 0.8;
  color: var(--color-text-primary);
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.nav-link:hover,
.nav-link.router-link-active {
  background: var(--color-bg-glass);
  color: var(--color-text-primary);
}

.app-main {
  flex: 1;
  padding: var(--space-8) 0;
}

.app-footer {
  border-top: 1px solid var(--color-border);
  padding: var(--space-6) 0;
}

.footer-content {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .header-content {
    height: 56px;
  }

  .nav-link span {
    display: none;
  }
}
</style>
