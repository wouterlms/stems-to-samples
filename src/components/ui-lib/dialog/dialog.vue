<template>
  <modal-element v-if="dialog" :show="showDialog" @close="close">
    <div class="dialog">
      <div class="dialog__header">
        <h1>{{ dialog.title }}</h1>
        <p>{{ dialog.message }}</p>
      </div>

      <!-- actions -->
      <div class="dialog__actions">
        <button-element
          class="dialog__actions__button"
          v-if="dialog.secondaryAction"
          :disabled="isDisabled"
          :ui-type="dialog.secondaryAction.type"
          :color="dialog.secondaryAction.color"
          :plain="dialog.secondaryAction.plain"
          :secondary="true"
          @click="handleSecondaryActionClick"
        >
          {{ dialog.secondaryAction.title }}
        </button-element>
        <button-element
          class="dialog__actions__button"
          v-if="dialog.primaryAction"
          :disabled="isDisabled"
          :ui-type="dialog.primaryAction.type"
          :color="dialog.primaryAction.color"
          :plain="dialog.primaryAction.plain"
          @click="handlePrimaryActionClick"
        >
          {{ dialog.primaryAction.title }}
        </button-element>
      </div>
    </div>
  </modal-element>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import modalElement from '../modal/modal.vue'
import buttonElement from '../button/button.vue'

interface ButtonAction {
  title: string
  type?: string
  plain?: boolean
  color?: string
  click: Function
}

interface Dialog {
  title: string
  message: string
  icon: string
  timeout?: number
  primaryAction?: ButtonAction
  secondaryAction?: ButtonAction
}

@Component({
  components: {
    modalElement,
    buttonElement
  }
})
export default class DialogElement extends Vue {
  dialog: Dialog | null = null
  showDialog: boolean = false
  isDisabled: boolean = false

  mounted(): void {
    Vue.prototype.$dialog = (dialog: Dialog) => {
      this.isDisabled = false
      this.dialog = dialog

      this.$nextTick(() => {
        this.showDialog = true
      })
    }
  }

  handlePrimaryActionClick(): void {
    this.isDisabled = true

    this.dialog?.primaryAction?.click(() => {
      this.showDialog = false
    })
  }

  handleSecondaryActionClick(): void {
    this.isDisabled = true

    this.dialog?.secondaryAction?.click(() => {
      this.showDialog = false
    })
  }

  close(): void {
    this.showDialog = false
  }
}
</script>

<style scoped lang="scss">
.dialog {
  max-width: 500px;

  &__header {
    padding: 2rem;

    h1 {
      font-weight: 500;
      margin-bottom: 1rem;
      font-size: 1.125rem;
    }
  }

  p {
    color: lighten($primary-text, 20);
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;

    padding: 1rem 2rem;
    background: darken($primary-light, 4);

    &__button {
      &:not(:last-of-type) {
        margin-right: 0.5rem;
      }
    }
  }
}
</style>
