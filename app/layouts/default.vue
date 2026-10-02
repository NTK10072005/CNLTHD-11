<template>
  <div style="min-height: 100vh; display: flex; flex-direction: column">
    <Navbar />
    <main
      style="
        flex: 1;
        max-width: 1280px;
        margin: 0 auto;
        width: 100%;
        padding: 2rem 1rem;
      "
    >
      <slot />
    </main>
    <Footer />
  </div>
</template>
