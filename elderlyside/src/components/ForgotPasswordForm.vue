<template>
    <div>
      <h3>忘记密码</h3>
      <el-form label-position="top" label-width="0">
        <el-form-item label="邮箱">
          <el-input placeholder="请输入注册邮箱"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%;">重置密码</el-button>
        </el-form-item>
        <el-link type="primary" :underline="false" @click="emit('back-to-login')">返回登录</el-link>  <!-- 使用 el-link -->
      </el-form>
    </div>
  </template>
 
  <script>
  import { defineComponent } from 'vue';
 
  export default defineComponent({
    name: 'ForgotPasswordForm',
    emits: ['back-to-login'], // 声明要发出的事件
    setup(props, { emit }) {
      return {
        emit
      };
    }
  });
  </script>