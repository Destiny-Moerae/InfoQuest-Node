<template>
  <div class="dataset-container">
    <el-tabs v-model="activeTab" type="card">
      <!-- 数据集列表 -->
      <el-tab-pane label="我的数据集" name="list">
        <div class="header-toolbar">
          <el-button type="primary" @click="activeTab = 'create'">新建数据集</el-button>
          <el-input v-model="searchQuery" placeholder="搜索数据集" style="width: 300px" clearable>
            <template #append>
              <el-button :icon="Search" />
            </template>
          </el-input>
        </div>

        <el-table :data="filteredDatasets" height="calc(100vh - 220px)">
          <el-table-column prop="name" label="名称" width="200" />
          <el-table-column prop="fileCount" label="文件数" width="120" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button type="primary" link @click="openConfig(row)">配置</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 数据集创建 -->
      <el-tab-pane label="新建数据集" name="create">
        <el-form :model="newDataset" label-width="120px">
          <el-form-item label="数据集名称" required>
            <el-input v-model="newDataset.name" />
          </el-form-item>

          <el-form-item label="上传文档">
            <el-upload multiple :limit="10" :on-exceed="handleExceed" :before-upload="beforeUpload"
              :on-success="handleUploadSuccess" :on-error="handleUploadError" :file-list="fileList"
              accept=".docx,.txt,.pdf,.md" action="/api/datasets/upload">
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持格式：docx/txt/pdf/md，单个文件不超过50MB</div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitDataset">创建数据集</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 数据集配置 -->
      <el-tab-pane :label="`配置 - ${selectedDataset?.name}`" name="config" :disabled="!selectedDataset">
        <div v-if="selectedDataset" class="config-content">
          <el-form :model="configForm" label-width="160px">
            <!-- 文本清洗配置 -->
            <el-form-item label="文本清洗规则">
              <el-checkbox-group v-model="configForm.cleanOptions">
                <el-checkbox label="removeEmptyLines">移除空行</el-checkbox>
                <el-checkbox label="removeSpecialChars">移除特殊字符</el-checkbox>
                <el-checkbox label="normalizeWhitespace">合并空白符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- 分块策略 -->
            <el-form-item label="分块大小">
              <el-input-number v-model="configForm.chunkSize" :min="256" :max="2048" :step="128"
                controls-position="right" suffix="tokens" />
            </el-form-item>

            <el-form-item label="分块重叠">
              <el-input-number v-model="configForm.chunkOverlap" :min="0" :max="configForm.chunkSize" :step="64"
                controls-position="right" suffix="tokens" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Search } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { fetchDatasets } from '@/api/dataset'

// 数据集列表相关逻辑
const searchQuery = ref('')
const datasets = ref([]) // 从API获取的数据
const filteredDatasets = computed(() => {
  return datasets.value.filter(d =>
    d.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 新建数据集相关逻辑
const activeTab = ref('list')
const newDataset = ref({
  name: '',
  files: []
})
const fileList = ref<UploadUserFile[]>([])

const handleExceed: UploadProps['onExceed'] = (files) => {
  ElMessage.warning(`最多上传10个文件，已选择 ${files.length} 个文件`)
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isValidType = ['.docx', '.txt', '.pdf', '.md'].some(ext =>
    file.name.toLowerCase().endsWith(ext)
  )
  if (!isValidType) {
    ElMessage.error('不支持的文件格式')
    return false
  }
  return true
}

// 数据集配置相关逻辑
const selectedDataset = ref(null)
const configForm = ref({
  cleanOptions: [],
  chunkSize: 1024,
  chunkOverlap: 256
})

const openConfig = (dataset) => {
  selectedDataset.value = dataset
  activeTab.value = 'config'
}

const saveConfig = async () => {
  // 保存配置到API的逻辑
}

// 新增文件上传处理逻辑
const handleUploadSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  if (response.code === 200) {
    newDataset.value.files.push({
      name: uploadFile.name,
      url: response.data.url,
      size: uploadFile.size
    })
    ElMessage.success(`${uploadFile.name} 上传成功`)
  }
}

// 新增文件上传失败处理
const handleUploadError: UploadProps['onError'] = (error) => {
  ElMessage.error(`文件上传失败: ${error.message}`)
}

// 补充数据集创建提交逻辑
const submitDataset = async () => {
  if (!newDataset.value.name) {
    return ElMessage.warning('请输入数据集名称')
  }
  if (newDataset.value.files.length === 0) {
    return ElMessage.warning('请至少上传一个文件')
  }

  try {
    const { data } = await axios.post('/api/datasets', {
      name: newDataset.value.name,
      files: newDataset.value.files
    })

    ElMessage.success('数据集创建成功')
    // 重置表单
    newDataset.value = { name: '', files: [] }
    fileList.value = []
    activeTab.value = 'list'
    // 刷新列表
    datasets.value = await fetchDatasets()
  } catch (error) {
    ElMessage.error('数据集创建失败')
  }
}

// 在现有代码中添加删除功能
const handleDelete = async (dataset) => {
  try {
    await axios.delete(`/api/datasets/${dataset.id}`)
    datasets.value = datasets.value.filter(d => d.id !== dataset.id)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}
// 在onMounted中加载数据
onMounted(async () => {
  datasets.value = await fetchDatasets()
})
</script>

<style lang="scss" scoped>
.dataset-container {
  padding: 20px;

  .header-toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .config-content {
    padding: 20px;
    max-width: 800px;
  }

  :deep(.el-tabs__content) {
    padding: 20px 0;
  }
}
</style>