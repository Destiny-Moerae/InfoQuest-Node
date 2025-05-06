<template>
  <div class="chat-container" :style="{ backgroundColor: messages.length > 0 ? '#fff' : 'rgb(240,240,240)' }">
    <!-- 新增返回按钮 -->
    <div v-if="messages.length > 0" class="back-button">
      <el-button type="primary" @click="messages = []; showFullInput = true" circle>
        <el-icon>
          <ArrowLeft />
        </el-icon>
      </el-button>
    </div>

    <!-- 修改消息容器样式 -->
    <!-- 消息容器部分 -->
    <div class="messages" :class="{ 'has-messages': messages.length > 0 }" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <!-- 问题标题 -->
        <div v-if="msg.isQuestion" class="question-title">
          <strong>{{ msg.content }}</strong>
        </div>
        <!-- 回答内容 -->
        <div v-else class="answer-content">
          {{ msg.content }}
          <div v-if="!msg.isQuestion && index === messages.length - 1" class="similar-questions">
            <div v-for="(q, qIndex) in similarQuestions" :key="qIndex" @click="handleSimilarQuestion(q)">
              {{ q }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改输入容器样式 -->
    <div class="input-container" :class="{ 'with-messages': messages.length > 0, 'streaming-mode': isStreaming }">
      <!-- 流式输出控制 -->
      <div v-if="isStreaming" class="stream-control">
        <el-button type="danger" @click="stopStreaming">停止响应</el-button>
      </div>
      <div class="logo-image" v-if="messages.length <= 0">
        <img src="@/assets/logo.png" class="logo" alt="">
      </div>
      <div class="input-wrapper">
        <!-- 主输入框 -->
        <el-input v-model="inputMessage" type="textarea" :autosize="{ minRows: 2, maxRows: 8 }" placeholder="输入您的问题..."
          @keyup.enter.native="handleSend" ref="inputArea" class="message-input">
        </el-input>
        <!-- 模型选择 -->
        <el-select v-model="selectedModel" class="model-select" placeholder="选择模型">
          <el-option label="混元" value="hunyuan" />
          <el-option label="混元T1" value="hunyuan-t1" />
          <el-option label="DeepSeek R1" value="deepseek-r1" />
        </el-select>
        <div class="upload" @click="showUploadDialog = true">
          <el-icon class="attachment">
            <Upload />
          </el-icon>
          <div>文档解读</div>
        </div>

      </div>
    </div>

    <!-- 文档上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="文档解读" width="40%" center>
      <div class="upload-content">
        <el-upload drag action="#" accept=".docx,.pdf,.txt" :auto-upload="false">
          <el-icon class="upload-icon">
            <Upload />
          </el-icon>
          <div class="el-upload__text">
            将文档拖到此处或 <em>点击选择</em>
          </div>
        </el-upload>

        <div class="upload-options">
          <el-button type="primary">选择知识库文件</el-button>
          <el-button>选择本地文件</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ChatDotRound, Upload } from '@element-plus/icons-vue'

// 消息相关状态
const inputMessage = ref('')
// 修改消息数据结构
const messages = ref<Array<{ content: string, isQuestion?: boolean }>>([])

// 修改handleSend方法
const handleSend = async () => {
  if (!inputMessage.value.trim()) return
  isResponding.value = true

  // 添加问题消息
  messages.value.push({
    content: inputMessage.value,
    isQuestion: true
  })
  inputMessage.value = ''

  // 添加回答消息
  messages.value.push({
    content: '',
    isQuestion: false
  })

  // 开始流式响应
  isStreaming.value = true
  let response = ''

  streamInterval = setInterval(() => {
    response += '这是模拟的流式响应内容。'
    if (messages.value[messages.value.length - 1]) {
      messages.value[messages.value.length - 1].content = response
    }
    scrollToBottom()
  }, 100)

  // 模拟3秒后停止
  setTimeout(stopStreaming, 3000)
}
const isStreaming = ref(false)
let streamInterval: number

// 模型选择
const selectedModel = ref('混元')

// 上传对话框
const showUploadDialog = ref(false)

// DOM 引用
const messagesContainer = ref<HTMLElement>()
const inputArea = ref<HTMLElement>()

// 模拟数据
const similarQuestions = ref([
  '什么是人工智能？',
  '如何训练深度学习模型？',
  '常见的机器学习算法有哪些？'
])

// 发送消息
// 在script部分添加响应状态
const isResponding = ref(false)


// 停止流式输出
// 修改stopStreaming方法
const stopStreaming = () => {
  clearInterval(streamInterval)
  isStreaming.value = false
  // 移除 isResponding.value = false 保持背景色不变
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 处理相似问题点击
const handleSimilarQuestion = (question: string) => {
  inputMessage.value = question
}
</script>

<style lang="scss" scoped>
// 样式调整
.chat-container {
  width: 80%;
  padding: 0 40px;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;

  .back-button {
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 1000;
  }

  .input-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    margin-top: 50px;

    .message-input {
      width: 800px;

      :deep(.el-textarea__inner) {
        border-radius: 20px;
        border: 1px solid #ccc;
        font-size: 16px;
        padding: 20px 20px 50px;
        transition: background-color 0.3s ease;
      }


    }

    .model-select {
      width: 100px;
      position: absolute;
      bottom: 20px;
      left: 214px;

      :deep(.el-select__wrapper) {
        box-shadow: none;
        padding: 4px 0;
      }

      :deep(.el-select__selection) {
        flex: initial;
        display: inline-block;
        width: auto;
        // min-width: 100px;
        text-align: center;
      }

      :deep(.el-select__placeholder) {
        display: inline-block;
        width: auto;
      }

      :deep(.el-select__suffix) {
        display: none;
      }

      :deep(.el-select__placeholder) {
        padding: 0 10px;
        color: #079D55;
        font-size: 14px;

        &:hover {
          background-color: #F0F0F0;
        }
      }

    }

    .upload {
      position: absolute;
      bottom: 0;
      margin-bottom: -80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;

      div {
        font-size: 14px;
        color: #999;
      }
    }
  }




  .messages {
    padding: 80px 250px 160px;
    font-family: SimSun, "宋体", sans-serif;
    font-size: 10.5pt;
    max-height: 80vh;
    overflow-y: auto;

    .question-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .answer-content {
      background: #f5f7fa;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      white-space: pre-wrap;
    }

    .similar-questions {
      margin-top: 15px;
      font-weight: 300; // 字体变细

      >div {
        position: relative;
        padding-left: 20px;
        margin: 8px 0;
        cursor: pointer;
        transition: color 0.2s;

        &::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #666;
        }

        &:hover {
          color: #079D55;
        }
      }
    }

    &.has-messages {
      padding-top: 20px;
    }
  }

  .input-container {
    width: 100%;
    max-width: 100%;
    position: relative;
    background: transparent;
    padding: 20px 0;

    .logo-image {
      display: flex;
      justify-content: center;
      position: absolute;
      top: 0;
      left: 50%;
      margin-top: -140px;
      transform: translateX(-50%);

      .logo {

        width: 280px;
        height: 280px;
      }
    }

    .stream-control {
      display: flex;
      justify-content: center;
      margin-bottom: 10px;
    }

    &.with-messages {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      // 移除原 background 声明，由动态绑定控制
      // box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
    }

  }
}
</style>
