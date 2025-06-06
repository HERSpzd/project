<template>
  <div
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f0f2f5;
    "
  >
    <el-card class="login-card">
      <template #header>
        <div style="text-align: left">
          <h2 style="margin: 0">Welcome, admin</h2>
          <p style="color: #999">Smart Home Elderly Care System</p>
        </div>
      </template>

      <div class="login-content">
        <!-- Image -->
        <div class="image-container">
          <img src="../assets/login.png" alt="Logo" class="logo-image" />
        </div>

        <!-- Login form -->
        <el-form
          v-if="currentForm === 'login'"
          label-position="top"
          label-width="0"
          class="login-form"
          @submit.prevent="login"
        >
          <el-form-item label="Account Number">
            <el-input
              v-model="form.username"
              placeholder="Please enter your account"
            >
              <template #append>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="Password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="Please input a password"
              show-password
            >
              <template #append>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              style="width: 100%"
              @click="login"
              :loading="loading"
            >
              {{ loading ? "Logging in" : "Log on" }}
            </el-button>
          </el-form-item>

          <div
            style="
              display: flex;
              justify-content: space-between;
              font-size: 12px;
            "
          >
            <el-link
              type="primary"
              :underline="false"
              @click="currentForm = 'register'"
              >Free registration</el-link
            >
            <el-link
              type="primary"
              :underline="false"
              @click="currentForm = 'forgotPassword'"
              >Forgot password</el-link
            >
          </div>
        </el-form>

        <!-- register form -->
        <RegisterForm
          v-if="currentForm === 'register'"
          class="login-form"
          @back-to-login="currentForm = 'login'"
        />

        <ForgotPasswordForm
          v-if="currentForm === 'forgotPassword'"
          class="login-form"
          @back-to-login="currentForm = 'login'"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { defineComponent, reactive, ref } from "vue";
import { User, Lock } from "@element-plus/icons-vue";
import RegisterForm from "./RegisterForm.vue";
import ForgotPasswordForm from "./ForgotPasswordForm.vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import { ElMessage } from "element-plus";

export default defineComponent({
  components: {
    User,
    Lock,
    RegisterForm,
    ForgotPasswordForm,
  },
  setup() {
    const form = reactive({
      username: "",
      password: "",
    });

    const currentForm = ref("login");
    const router = useRouter();
    const store = useStore();
    const loading = ref(false);

    const login = async () => {
      loading.value = true;
      try {
        const response = await axios.post(
          "http://localhost:3060/api/homecare/login",
          {
            username: form.username,
            password: form.password,
          }
        );

        const { token, user } = response.data;

        if (user.role !== "admin") {
          ElMessage.error("Only administrators can log in");
          return;
        }

        store.dispatch("login", { userInfo: user, token: token });

        router.push("/home");
        ElMessage.success("Login succeeded");
      } catch (error) {
        console.error("Login failed:", error);
        let errorMessage = "Login failed, please try again later";
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        }
        ElMessage.error(errorMessage);
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      currentForm,
      login,
      loading,
    };
  },
});
</script>

<style scoped>
.login-card {
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 900px;
}

.login-content {
  display: flex;
  align-items: center;
}

.image-container {
  width: 50%;

  padding-right: 20px;
}

.logo-image {
  width: 100%;

  display: block;
}

.login-form {
  width: 50%;
}
</style>
