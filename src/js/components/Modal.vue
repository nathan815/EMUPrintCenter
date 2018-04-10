<script>
export default {
    data() {
        return {
            isModalVisible: false
        }
    },
    props: {
        'show': Boolean
    },
    methods: {
    }
}
</script>
<template>
<transition name="modal">
    <div class="modal-mask" v-if="show" v-on:click="$emit('close')">

      <div class="modal-wrapper">
        <div class="modal-container" @click.stop>

          <div class="modal-header">
            <slot name="header">
              Hello world
            </slot>
            <i class="fas fa-times close" v-on:click="$emit('close')"></i>
          </div>

          <div class="modal-body">
            <slot name="body">
              How you doin'?
            </slot>
          </div>

          <div class="modal-footer">
            <button class="btn btn-light" @click="$emit('close')">
              Close
            </button>
            <slot name="buttons">
            </slot>
          </div>

        </div>
      </div>

    </div>
</transition>

</template>
<style scoped>

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 450px;
  margin: 0px auto;
  padding: 0;
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}
.modal-header {
    position: relative;
    padding: 15px 20px;
    border-bottom: 1px solid #ccc;
    background: #f5f5f5;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
}
.modal-header h3 {
    font-size: 20px;
}
.modal-header .close {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    padding: 10px;
}

.modal-body {
  padding: 20px;
  font-size: 17px;
}

.modal-footer {
    border-top: 1px solid #ddd;
    padding: 10px 20px;
    overflow: hidden;
    text-align: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
