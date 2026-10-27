<script setup>
import { testingServiceContact } from '../../data/testingServiceData'

const emit = defineEmits(['request'])
</script>

<template>
  <section class="service-contact" aria-labelledby="service-contact-title">
    <div class="page-container service-contact__inner">
      <div class="service-contact__heading">
        <p>PROJECT CONTACT</p>
        <h2 id="service-contact-title">需要进一步沟通？</h2>
        <p>{{ testingServiceContact.workflowNote }}</p>
      </div>

      <dl class="service-contact__details">
        <div>
          <dt>项目咨询电话</dt>
          <dd><a :href="`tel:${testingServiceContact.phone}`">{{ testingServiceContact.phone }}</a></dd>
        </div>
        <div>
          <dt>项目咨询邮箱</dt>
          <dd><a :href="`mailto:${testingServiceContact.email}`">{{ testingServiceContact.email }}</a></dd>
        </div>
        <div>
          <dt>公司地址</dt>
          <dd>
            <span v-for="line in testingServiceContact.addressLines" :key="line">{{ line }}</span>
          </dd>
        </div>
      </dl>

      <button type="button" @click="emit('request')">填写咨询需求</button>
    </div>
  </section>
</template>

<style scoped>
.service-contact {
  border-top: 1px solid #ccdde3;
  background: #edf5f6;
}

.service-contact__inner {
  min-height: 216px;
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.5fr) auto;
  align-items: center;
  gap: 48px;
  padding-block: 38px;
}

.service-contact__heading > p:first-child {
  color: #167ea6;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.14em;
}

.service-contact h2 {
  margin-top: 8px;
  color: #173f51;
  font-size: 28px;
}

.service-contact__heading > p:last-child {
  margin-top: 10px;
  color: #647b84;
  font-size: 13px;
  line-height: 1.65;
}

.service-contact__details {
  min-width: 0;
  display: grid;
  grid-template-columns: 0.8fr 1.15fr 1.4fr;
  gap: 28px;
  margin: 0;
}

.service-contact__details > div {
  min-width: 0;
  padding-left: 22px;
  border-left: 1px solid #c6d9df;
}

.service-contact dt {
  color: #607983;
  font-size: 13px;
  font-weight: 700;
}

.service-contact dd {
  margin-top: 8px;
  color: #345968;
  font-size: 14px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.service-contact dd span {
  display: block;
}

.service-contact a {
  color: #087fbe;
  text-underline-offset: 4px;
}

.service-contact button {
  min-height: 48px;
  padding: 0 21px;
  border: 1px solid #087fbe;
  border-radius: 4px;
  color: #087fbe;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.service-contact button:hover,
.service-contact button:focus-visible {
  color: white;
  background: #087fbe;
}

@media (max-width: 1050px) {
  .service-contact__inner {
    grid-template-columns: minmax(240px, 0.65fr) minmax(0, 1.35fr);
    gap: 34px;
  }

  .service-contact button {
    grid-column: 1 / -1;
    width: fit-content;
  }
}

@media (max-width: 760px) {
  .service-contact__inner {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-block: 46px;
  }

  .service-contact__details {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .service-contact__details > div {
    padding: 18px 0 0;
    border-top: 1px solid #c6d9df;
    border-left: 0;
  }

  .service-contact button {
    grid-column: auto;
    width: 100%;
  }
}
</style>
