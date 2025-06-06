<template>
  <div v-if="isLoggedIn" class="page">
    <!-- Left Sidebar -->
    <el-aside width="220px" class="side">
      <!-- System Name -->
      <div class="sTitle">Smart Home Elderly Care System</div>

      <div class="menuWrap">
        <el-menu
          default-active="/ai-consultation"
          class="el-menu-1"
          :router="true"
        >
          <el-menu-item index="/home">
            <el-icon><Platform /></el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          <el-menu-item index="/health-monitoring">
            <el-icon><Monitor /></el-icon>
            <span>Health monitoring</span>
          </el-menu-item>
          <el-menu-item index="/health-knowledge">
            <el-icon><DocumentCopy /></el-icon>
            <span>Health Knowledge</span>
          </el-menu-item>
          <el-menu-item index="/user-settings">
            <el-icon><Setting /></el-icon>
            <span>User Settings</span>
          </el-menu-item>
          <el-menu-item index="/ai-consultation">
            <el-icon><ChatDotRound /></el-icon>
            <span>AI Consultation</span>
          </el-menu-item>
          <el-menu-item index="/diet-management">
            <el-icon><Food /></el-icon>
            <span>Diet Management</span>
          </el-menu-item>
          <el-menu-item index="/sport-management">
            <el-icon><Basketball /></el-icon>
            <span>Sports Management</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- User Info (Bottom) -->
      <div class="uInfo" v-if="userInfo">
        <el-avatar :size="40" :src="userInfo.avatar"></el-avatar>
        <span>{{ userInfo.username }}</span>
      </div>
    </el-aside>

    <!-- Main Content (AI Consultation Page) -->
    <div class="main">
      <!-- Page Title -->
      <div class="pHeader">
        <div class="hTitle">
          <h1>AI Consultation</h1>
          <span class="sub-title">Chat with AI for health advice</span>
        </div>
      </div>

      <el-card class="ai-consultation-card">
        <template #header>
          <div class="card-header">
            Chat with your health assistant
            <!-- Mute Button -->
            <el-button type="info" size="small" @click="toggleMute">
              <!-- Icon Component -->
              <el-icon v-if="isMuted"><Microphone /></el-icon>
              <el-icon v-else><Mute /></el-icon>
              {{ isMuted ? "Unmute" : "Mute" }}
            </el-button>
          </div>
        </template>

        <div class="chat-area">
          <div class="messages-list" ref="messagesList">
            <div
              v-for="(message, index) in conversationHistory"
              :key="index"
              :class="['message-item', message.role]"
            >
              <div class="message-content">
                <p>{{ message.content }}</p>
              </div>
            </div>
            <div
              v-if="consulting"
              class="loading-message message-item assistant"
            >
              <div class="message-content">
                <p>AI is thinking...</p>
              </div>
            </div>
          </div>

          <div class="input-area">
            <el-input
              v-model="userQuestion"
              :rows="2"
              type="textarea"
              placeholder="Enter your message..."
              @keyup.enter="startAiConsultation"
              :disabled="consulting || isListening"
            />
            <!-- Microphone Button -->
            <el-button
              type="danger"
              @click="startSpeechRecognition"
              :loading="isListening"
              :disabled="consulting || !recognition"
            >
              <el-icon><Microphone /></el-icon>
              {{ isListening ? "Stop Recording" : "Voice Input" }}
            </el-button>
            <el-button
              type="primary"
              @click="startAiConsultation"
              :loading="consulting"
              :disabled="!userQuestion.trim() || consulting || isListening"
            >
              Send
            </el-button>
          </div>
        </div>

        <!-- Speech Playback Control Area -->
        <div class="speech-controls">
          <!-- Removed speech rate control -->
          <div class="control-item">
            <span>Volume:</span>
            <el-slider
              v-model="speechVolume"
              :min="0"
              :max="1"
              :step="0.01"
              style="width: 150px; margin-left: 10px"
              @input="handleVolumeChange"
            ></el-slider>
            <span>{{ speechVolume.toFixed(2) }}</span>
          </div>
          <div class="control-item">
            <span>Voice Tone:</span>
            <el-select
              v-model="selectedVoice"
              placeholder="Select Voice Tone"
              size="small"
              style="width: 150px; margin-left: 10px"
              value-key="name"
            >
              <el-option
                v-for="voice in voices"
                :key="voice.name"
                :label="`${voice.name} (${voice.lang})`"
                :value="voice"
              ></el-option>
            </el-select>
          </div>
          <!-- Added: Speech Recognition Language Selection -->
          <div class="control-item">
            <span>Recognition Language:</span>
            <el-select
              v-model="selectedRecognitionLang"
              placeholder="Select Language"
              size="small"
              style="width: 120px; margin-left: 10px"
            >
              <el-option label="Chinese" value="zh-CN"></el-option>
              <el-option label="English" value="en-US"></el-option>
              <!-- You can add more language options as needed -->
            </el-select>
          </div>
        </div>

        <div v-if="consultationError || recognitionError" class="error-message">
          {{ consultationError || recognitionError }}
        </div>
      </el-card>
    </div>
  </div>
  <div v-else>
    <h1>Please log in</h1>
    <el-button type="primary" @click="goToLogin">Go to Login</el-button>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  Platform,
  DocumentCopy,
  Setting,
  Monitor,
  ChatDotRound,
  Food,
  Basketball,
  Mute,
  VolumeUp,
  Microphone,
} from "@element-plus/icons-vue";
import {
  ElMessage,
  ElSlider,
  ElSelect,
  ElOption,
  ElButton,
} from "element-plus";
import axios from "axios";

const router = useRouter();
const store = useStore();

const isLoggedIn = computed(() => store.getters.isLoggedIn);
const userInfo = computed(() => store.getters.userInfo);

const goToLogin = () => {
  router.push("/");
};

const userQuestion = ref("");
const conversationHistory = ref([]);
const consulting = ref(false);
const consultationError = ref(null);
const messagesList = ref(null);

const aiConsultationApiUrl = ref(
  "http://localhost:3060/api/homecare2/ai-consultation"
);

// --- Speech Playback related state and variables ---
const synth = window.speechSynthesis;
const voices = ref([]);
const selectedVoice = ref(null);
const isSpeaking = ref(false);

// Removed speech rate variable
// const speechRate = ref(1); // Default speech rate
const speechVolume = ref(1); // Default volume

let currentUtterance = null; // Variable to store the current SpeechSynthesisUtterance object

// Mute related variables
const isMuted = ref(false); // Whether muted
const lastVolume = ref(1); // Volume before muting

// --- Speech Recognition related state and variables ---
const recognition = ref(null); // Stores the SpeechRecognition object
const isListening = ref(false); // Flag indicating if listening
const transcript = ref(""); // Stores the recognized text
const recognitionError = ref(null); // Stores speech recognition error information

// Added: Selected speech recognition language
const selectedRecognitionLang = ref("zh-CN"); // Default Chinese

// --- Speech Playback related functions ---
const loadVoices = () => {
  voices.value = synth.getVoices();
  // If voices are already fetched, try to select a default Chinese voice
  if (voices.value.length > 0) {
    selectedVoice.value =
      voices.value.find((voice) => voice.lang === "zh-CN") || voices.value[0];
  }
};

const speakText = (text) => {
  if (!synth || isSpeaking.value) {
    return;
  }

  // Before starting a new playback, stop speech recognition if it's active
  if (isListening.value) {
    stopSpeechRecognition();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice.value; // Set the voice
  utterance.pitch = 1; // Pitch (0 to 2)
  utterance.rate = 1; // Set speech rate to a fixed value of 1
  utterance.volume = speechVolume.value; // Use the volume variable

  // Store the current utterance object
  currentUtterance = utterance;

  utterance.onstart = () => {
    isSpeaking.value = true;
  };

  utterance.onend = () => {
    isSpeaking.value = false;
    currentUtterance = null; // Clear currentUtterance after speaking ends
  };

  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event);
    // Check if the error was caused by cancel(), if so, don't show an error message
    if (event.error !== "canceled") {
      ElMessage.error(
        "Speech playback failed, please check browser settings or try again."
      );
    }
    isSpeaking.value = false;
    currentUtterance = null;
  };

  synth.speak(utterance);
};

const stopSpeaking = () => {
  if (synth && isSpeaking.value) {
    if (currentUtterance) {
      currentUtterance.onerror = null; // Remove onerror listener before canceling to avoid triggering error due to cancel
    }
    synth.cancel();
    isSpeaking.value = false;
    currentUtterance = null;
  }
};

const toggleMute = () => {
  if (isMuted.value) {
    speechVolume.value = lastVolume.value;
    isMuted.value = false;
  } else {
    lastVolume.value = speechVolume.value;
    speechVolume.value = 0;
    isMuted.value = true;
    stopSpeaking(); // Stop current playback when muted
  }
};

const handleVolumeChange = (value) => {
  // Use value because we need to determine if muted based on the slider value
  if (value > 0) {
    isMuted.value = false;
    lastVolume.value = value;
  } else {
    isMuted.value = true;
  }

  // If currently speaking, stop and restart with the new volume
  if (isSpeaking.value && currentUtterance) {
    const textToSpeak = currentUtterance.text;
    stopSpeaking();
    setTimeout(() => {
      speakText(textToSpeak);
    }, 200); // Delay restarting to give the system time to process the cancel operation
  }
};

// Removed handleRateChange function
// const handleRateChange = (_value) => { ... };

// --- Speech Recognition related functions ---
const initSpeechRecognition = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    recognitionError.value =
      "Your browser does not support speech recognition.";
    ElMessage.warning(recognitionError.value);
    return;
  }

  // If there is already a recognition instance, stop and clear it first
  if (recognition.value) {
    recognition.value.stop();
    recognition.value = null;
  }

  recognition.value = new SpeechRecognition();
  recognition.value.lang = selectedRecognitionLang.value; // Use the selected language
  recognition.value.continuous = false; // Set to non-continuous recognition
  recognition.value.interimResults = true; // Allow getting interim results

  recognition.value.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }
    // Update input box content in real-time
    userQuestion.value = finalTranscript || interimTranscript;
  };

  recognition.value.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    // Check if the error was caused by stop(), if so, don't show an error message
    if (event.error !== "aborted") {
      recognitionError.value = `Speech recognition error: ${event.error}`;
      ElMessage.error(recognitionError.value);
    }
    isListening.value = false;
  };

  recognition.value.onend = () => {
    isListening.value = false;
    console.log("Speech recognition ended.");
    // If there is a final recognition result and the user hasn't manually stopped recording, automatically send
    // Use userQuestion.value to check if there is a final recognition result
    if (userQuestion.value.trim() && !consulting.value) {
      startAiConsultation();
    }
  };

  recognition.value.onstart = () => {
    isListening.value = true;
    console.log("Speech recognition started.");
    recognitionError.value = null;
  };
};

const startSpeechRecognition = () => {
  if (!recognition.value) {
    ElMessage.warning("Speech recognition feature is not available.");
    return;
  }
  if (isListening.value) {
    stopSpeechRecognition();
  } else {
    // --- Added logic: Stop speech playback before starting speech recognition ---
    if (isSpeaking.value) {
      stopSpeaking();
    }
    // --------------------------------------------------------------------------

    transcript.value = "";
    userQuestion.value = ""; // Clear input box
    recognition.value.start();
  }
};

const stopSpeechRecognition = () => {
  if (recognition.value && isListening.value) {
    recognition.value.stop();
    isListening.value = false;
  }
};

// Listen for voiceschanged event, fetch voices again after they are loaded
if (synth) {
  synth.onvoiceschanged = loadVoices;
}

// Watch for voices changes, try to select a default voice after voices are loaded
watch(
  voices,
  (newVoices) => {
    if (newVoices.length > 0 && !selectedVoice.value) {
      selectedVoice.value =
        newVoices.find((voice) => voice.lang === "zh-CN") || newVoices[0];
    }
  },
  { immediate: true }
);

// Added: Watch for changes in selected recognition language and reinitialize speech recognition
watch(selectedRecognitionLang, (newLang, oldLang) => {
  if (newLang !== oldLang) {
    initSpeechRecognition();
  }
});

// Removed watch for speechVolume and speechRate
// watch(speechVolume, (newVolume) => { ... });
// watch(speechRate, (newRate) => { ... });

const startAiConsultation = async () => {
  // Before sending the request, ensure userQuestion has a value
  if (!userQuestion.value.trim() || consulting.value) {
    return;
  }

  const question = userQuestion.value;
  userQuestion.value = "";

  conversationHistory.value.push({ role: "user", content: question });
  scrollToBottom();

  consulting.value = true;
  consultationError.value = null;

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      aiConsultationApiUrl.value,
      {
        question: question,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      const aiResponse = response.data.response;
      conversationHistory.value.push({
        role: "assistant",
        content: aiResponse,
      });
      scrollToBottom();
      // Check if muted before speaking
      if (!isMuted.value) {
        speakText(aiResponse);
      }
    } else {
      consultationError.value =
        response.data.message || "AI consultation failed.";
      ElMessage.error(consultationError.value);
      conversationHistory.value.push({
        role: "error",
        content: consultationError.value,
      });
      scrollToBottom();
    }
  } catch (error) {
    console.error("An error occurred during AI consultation:", error);
    let errorMessage =
      "A network error occurred during AI consultation, please try again later.";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    consultationError.value = errorMessage;
    ElMessage.error(consultationError.value);
    conversationHistory.value.push({
      role: "error",
      content: consultationError.value,
    });
    scrollToBottom();
  } finally {
    consulting.value = false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesList.value) {
      messagesList.value.scrollTop = messagesList.value.scrollHeight;
    }
  });
};

onMounted(() => {
  if (synth) {
    loadVoices();
  } else {
    ElMessage.warning("Your browser does not support speech playback.");
  }
  initSpeechRecognition(); // Initialize speech recognition
});

// This is a trick to let ESLint know that Mute, VolumeUp, Microphone are used
// They will be removed by Tree Shaking in production
// eslint-disable-next-line no-unused-vars
const _icons = { Mute, VolumeUp, Microphone };
</script>

<style scoped>
.page {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.side {
  width: 220px;
  background-color: #001529;
  border-right: none;
  transition: width 0.28s;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 10;
}

.sTitle {
  color: #fff;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.menuWrap {
  height: calc(100vh - 180px);
  overflow: auto;
}

.el-menu {
  border-right: none;
  background-color: #001529;
  flex: 1;
}

.el-menu-item,
.el-sub-menu__title {
  color: rgba(255, 255, 255, 0.65);
}

.el-menu-item:hover,
.el-sub-menu__title:hover {
  background-color: #000c17;
  color: #fff;
}

.el-menu-item.is-active {
  background-color: #1890ff;
  color: #fff;
}

.el-sub-menu.is-active .el-sub-menu__title {
  color: #fff;
}

.el-menu--inline {
  background-color: #000c17 !important;
}

.el-menu--inline .el-menu-item {
  background-color: #000c17 !important;
  color: rgba(255, 255, 255, 0.65);
}

.el-menu--inline .el-menu-item:hover {
  background-color: #001529 !important;
  color: #fff;
}

.el-menu--inline .el-menu-item.is-active {
  background-color: #1890ff !important;
  color: #fff;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 220px;
  min-height: 100%;
}

.el-menu-item .el-icon,
.el-sub-menu__title .el-icon {
  vertical-align: middle;
  margin-right: 10px;
  width: 24px;
  text-align: center;
  font-size: 18px;
}

.el-sub-menu .el-menu-item {
  min-width: 220px;
  padding-left: 48px !important;
}

.main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  margin-left: 220px;
}

.pHeader {
  margin-bottom: 24px;
}

.hTitle h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
  font-weight: 600;
}

.sub-title {
  color: #606266;
  font-size: 14px;
  margin-top: 4px;
}

.el-card {
  margin-bottom: 24px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.uInfo {
  display: flex;
  align-items: center;
  padding: 20px;
  color: #fff;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.uInfo span {
  margin-left: 10px;
  font-size: 16px;
}

.ai-consultation-card {
  margin-bottom: 20px;
}

.chat-area {
  display: flex;
  flex-direction: column;
  height: 500px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.message-item {
  margin-bottom: 10px;
  display: flex;
}

.message-item.user {
  justify-content: flex-end;
}

.message-item.assistant {
  justify-content: flex-start;
}

.message-item.error {
  justify-content: center;
}

.message-content {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 8px;
  word-break: break-word;
}

.message-item.user .message-content {
  background-color: #409eff;
  color: #fff;
}

.message-item.assistant .message-content {
  background-color: #f4f4f5;
  color: #303133;
}

.message-item.error .message-content {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.input-area {
  display: flex;
  padding: 15px;
  border-top: 1px solid #ebeef5;
  gap: 10px;
}

.input-area .el-button {
  flex-shrink: 0;
}

.loading-message {
  text-align: center;
  color: #409eff;
  margin-bottom: 15px;
}

.error-message {
  color: #f56c6c;
  text-align: center;
  padding: 15px;
  border: 1px solid #f56c6c;
  border-radius: 4px;
  margin-top: 15px;
}

.speech-controls {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.control-item {
  display: flex;
  align-items: center;
}

.control-item span {
  font-size: 14px;
  color: #606266;
}

/* Add left margin to buttons */
.card-header .el-button {
  margin-left: 10px;
}
</style>
