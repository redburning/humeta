<script setup>
import HeaderNav from '../components/layout/HeaderNav.vue'
import FooterSection from '../components/layout/FooterSection.vue'
</script>

<template>
  <div class="not-found-page">
    <HeaderNav variant="light" />

    <main class="not-found-content page-container">
      <p class="not-found-eyebrow">404 · PAGE NOT FOUND</p>
      <h1>Page not found</h1>
      <p class="not-found-copy">
        The requested Humeta resource could not be located. Check the address or continue from a verified entry point.
      </p>
      <div class="not-found-actions">
        <RouterLink to="/" class="not-found-action not-found-action--primary">Return Home</RouterLink>
        <RouterLink to="/browser" class="not-found-action">Go to Browser</RouterLink>
      </div>
    </main>

    <FooterSection />
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafb;
}

.not-found-content {
  width: min(100%, 760px);
  flex: 1;
  padding-block: clamp(84px, 12vh, 132px);
  text-align: center;
}

.not-found-eyebrow {
  color: #607984;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
}

.not-found-content h1 {
  margin-top: 13px;
  color: #203f4d;
  font-size: clamp(32px, 5vw, 46px);
  font-weight: 600;
  line-height: 1.16;
}

.not-found-copy {
  max-width: 590px;
  margin: 18px auto 0;
  color: #60727c;
  font-size: 15px;
  line-height: 1.7;
}

.not-found-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.not-found-action {
  min-width: 142px;
  min-height: 42px;
  padding: 10px 18px;
  border: 1px solid #a9c7d4;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #176f9b;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}

.not-found-action:hover,
.not-found-action:focus-visible {
  border-color: #167faf;
  color: #0b618b;
}

.not-found-action--primary {
  border-color: #147dab;
  color: #fff;
  background: #147dab;
}

.not-found-action--primary:hover,
.not-found-action--primary:focus-visible {
  border-color: #0b648d;
  color: #fff;
  background: #0b648d;
}

@media (max-width: 767px) {
  .not-found-content {
    width: calc(100% - 40px);
    padding-block: 66px 76px;
  }

  .not-found-actions {
    display: grid;
  }

  .not-found-action {
    width: min(100%, 280px);
    margin-inline: auto;
  }
}
</style>
