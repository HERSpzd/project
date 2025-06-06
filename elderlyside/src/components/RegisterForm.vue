<template>
  <div>
    <h3>Register</h3>
    <el-form
      label-position="top"
      label-width="0"
      :model="registerForm"
      ref="registerFormRef"
    >
      <el-form-item label="Username" prop="username">
        <el-input
          v-model="registerForm.username"
          placeholder="Enter your user name"
        ></el-input>
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input
          v-model="registerForm.email"
          placeholder="Please enter your email address"
        ></el-input>
      </el-form-item>
      <el-form-item label="cell-phone number" prop="phone">
        <el-input
          v-model="registerForm.phone"
          placeholder="Please enter your phone number"
        ></el-input>
      </el-form-item>
      <el-form-item label="Role" prop="user_type">
        <el-select
          v-model="registerForm.user_type"
          placeholder="Please select a role"
        >
          <el-option label="Elderly" value="elderly" />
          <el-option label="Social Worker" value="social_worker" />
          <el-option label="Admin" value="admin" />
        </el-select>
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input
          type="password"
          v-model="registerForm.password"
          placeholder="Please input a password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" style="width: 100%" @click="submitForm()"
          >Register</el-button
        >
      </el-form-item>
      <el-link type="primary" :underline="false" @click="emit('back-to-login')"
        >Return to login</el-link
      >
    </el-form>
  </div>
</template>

<script>
import { defineComponent, reactive } from "vue";
import axios from "axios";
import {
  ElMessage,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElLink,
} from "element-plus";

export default defineComponent({
  name: "RegisterForm",
  components: {
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
    ElLink,
  },

  emits: ["back-to-login"],
  setup(props, { emit }) {
    const registerForm = reactive({
      username: "",
      password: "",
      email: "",
      phone: "",
    });

    const submitForm = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3060/api/homecare/register",
          registerForm
        );
        console.log(response.data);

        ElMessage({
          message: "Registered successfully",
          type: "success",
        });

        emit("back-to-login");
      } catch (error) {
        console.error("Registration failed:", error);
        ElMessage.error(
          error.response?.data?.message ||
            "Registration failed, please try again"
        );
      }
    };

    return {
      registerForm,
      submitForm,
      emit,
    };
  },
});
</script>
