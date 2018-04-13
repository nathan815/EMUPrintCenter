<script>
export default {
    data() {
        return {
            isModalVisible: false
        }
    },
    props: {
        'show': Boolean,
        'classes': Array
    },
    methods: {
    }
}
</script>
<template>
<transition name="modal">
    <div class="modal-mask" :class="classes" v-if="show" v-on:click="$emit('close')">

      <div class="modal-wrapper">
        <div class="modal-container" @click.stop>

          <div class="modal-header">
            <slot name="header">
              Modal Title
            </slot>
            <i class="far fa-times-circle close" v-on:click="$emit('close')"></i>
          </div>

          <div class="modal-body">
            <slot name="body">
              Modal Body
            </slot>
          </div>

          <div class="modal-footer">
            <button class="btn btn-light" @click="$emit('close')">
              <slot name="close-btn">Close</slot>
            </button>
            <slot name="buttons"></slot>
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
  padding: 15px 0;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 450px;
  max-height: 100%;
  overflow-y: scroll;
  margin: 0 auto;
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
    border-bottom: 1px solid #ddd;
    background: #f5f5f5;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
}
.modal-header h3 {
    font-size: 20px;
}
.modal-header .close {
    position: absolute;
    top: 13px;
    right: 15px;
    cursor: pointer;
    padding: 0;
    text-align: center;
    color: #555;
    font-size: 25px;
}
.modal-header .close:hover {
  color: #555;
}

.modal-body {
  padding: 20px;
  font-size: 17px;
}

.modal-footer {
    border-top: 1px solid #ddd;
    background: #f5f5f5;
    padding: 15px 20px;
    overflow: hidden;
    text-align: right;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container {
  -webkit-transform: scale(0.9);
  transform: scale(0.9);
}
.modal-leave-active .modal-container {
  -webkit-transform: scale(0.9);
  transform: scale(0.9);
}
</style>
