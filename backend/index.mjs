import { Client } from '@elastic/elasticsearch'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.min.mjs'
import { split } from "sentence-splitter"
import fs from "fs"
import process from "process"
import OpenAI from "openai"
import { v4 } from "uuid"
import 'dotenv/config'


const es = new Client({ node: 'http://localhost:9200' })

const exists = await es.indices.exists({ index: 'my_index4' })

if (exists) {
  await es.indices.delete({ index: 'my_index4' })
}

await es.indices.create({
  index: 'my_index4',
  aliases: {
    'mi4': {},
  },
  mappings: {
    properties: {
      id: { type: 'text' },
      content: {
        type: 'text',
        analyzer: "ik_max_word",
        fields: { keyword: { type: 'keyword' } },
      },
      content_vector: {
        type: "dense_vector",
        dims: 1536,
        index: true,  // 启用对 content_vector 字段的索引功能
        similarity: "cosine", // 使用余弦相似度来评估不同向量之间的相似性
      },
    }
  },
  settings: {
    number_of_replicas: 1,
    number_of_shards: 1,
  },
})

// 加载PDF文件
const uint8Array = new Uint8Array(fs.readFileSync('龚德江-开题报告.pdf'))
const pdf = await pdfjsLib.getDocument(uint8Array).promise

let article = ''
let finish = false
let page = 1
do {
  try {
    const res = await pdf.getPage(page++)
    const textContent = await res.getTextContent()
    const str = textContent.items.reduce((sum, item) => {
      if (!('str' in item)) {
        return sum
      } else {
        return sum + item.str
      }
    }, '')
    article += str
  } catch {
    finish = true
  }
} while (!finish)


let PDFContent = split(article)

const openai = new OpenAI(
  {
    // apiKey: process.env.DASHSCOPE_API_KEY,
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
  }
)

// async function getEmbedding (text) {
//   console.log('getEmbedding中', text)
//   const response = await openai.embeddings.create({
//     model: String(process.env.OPEN_MODEL_EMBEDDING),  // 使用嵌入模型
//     input: [text],
//   })
//   console.log('getEmbedding完成', response)
//   return response.data  // 返回向量
// }

async function getEmbedding (text) {
  const apiUrl = process.env.OPENAI_BASE_URL + '/v1/embeddings'
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPEN_MODEL_EMBEDDING
  const requestBody = {
    input: [text],
    model: model
  }
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('获取嵌入向量时出错:', error)
    return null
  }
}

PDFContent = PDFContent.flatMap((doc) => {
  if ('children' in doc && Array.isArray(doc.children)) {
    const tmp = doc.children.filter((text) => text?.type === 'Str')
    // console.log(tmp);
    // const embedding = await getEmbedding(doc.raw);
    return tmp
  } else {
    return null
  }
}).filter(item => item)

const operations = (await Promise.all(
  PDFContent.map(async (doc) => {
    try {
      const content = (doc).value
      const content_vector = (await getEmbedding(content))[0].embedding
      // console.log("content_vector", content_vector)
      return [
        { index: { _index: "my_index4" } },
        {
          id: v4(),
          content,
          content_vector
        },
      ]
    } catch {
      return false
    }
  })
)).filter(item => item).flat(9)

// 调试信息：检查 operations 数组是否为空
console.log('operations 数组内容:', operations)
if (operations.length === 0) {
  console.log('operations 数组为空，无法进行批量操作。')
} else {
  // 批量添加
  await es.bulk({
    refresh: true,
    operations,
  })
}

// async function get_completion (prompt, model = String(process.env.OPENAI_MODEL)) {
//   const response = await openai.chat.completions.create({
//     model,
//     temperature: 0,
//     messages: [{ "role": "user", "content": prompt }],
//   })
//   console.log("response", response)
//   return response.choices[0].message.content
// }

async function get_completion (prompt, model = String(process.env.OPENAI_MODEL)) {
  const apiUrl = `${process.env.OPENAI_BASE_URL}/v1/chat/completions`
  const apiKey = process.env.OPENAI_API_KEY
  const requestBody = {
    model,
    temperature: 0,
    messages: [{ role: "user", content: prompt }]
  }
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    console.log("response", data)
    return data.choices[0].message.content
  } catch (error) {
    console.error('获取完成结果时出错:', error)
    return null
  }
}

const query = '选题的依据是什么？'

// const context = await es.search({
//   index: 'my_index4',
//   body: {
//     knn: {
//       field: 'content_vector',  // 向量字段名
//       query_vector: (await getEmbedding(query))[0].embedding,
//       k: 5,                     // 返回最近邻数量
//       num_candidates: 100,      // 候选池大小（精度与性能的平衡）
//     },
//     _source: ['id', 'content'], // 返回的字段
//   }
// });


// 混合检索
const context = await es.search({
  index: 'my_index4',
  body: {
    query: {
      bool: {
        should: [
          // 语义搜索部分
          {
            knn: {
              field: 'content_vector',
              query_vector: (await getEmbedding(query))[0].embedding,
              k: 50,
              //  定义了候选文档的数量。num_candidates: 100，那么 Elasticsearch 会首先从 100 个候选文档中选择最相似的。
              // 这个数量的选择会影响 KNN 查询的性能与准确性。较大的候选数量可以增加精度，但也会增加计算量。
              num_candidates: 100,
              boost: 0.5 // 权重
            }
          },
          // 文本搜索部分
          {
            match: {
              content: {
                query: query,
                boost: 0.5
              }
            }
          }
        ]
      }
    },
    _source: ['id', 'content'],
    size: 5
  }
})

console.log("context", context)
const promptTemplate = `
你是一个问答机器人。
你的任务是根据下述给定的已知信息回答用户问题。
已知信息:
${JSON.stringify(context)}
用户问：
${query}
如果已知信息不包含用户问题的答案，或者已知信息不足以回答用户的问题，请直接回复"我无法回答您的问题"。
请不要输出已知信息中不包含的信息或答案。
请用中文回答用户问题。
`

console.log(await get_completion(promptTemplate))