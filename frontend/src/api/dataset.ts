import axios from "axios"

export const fetchDatasets = async () => {
  const { data } = await axios.get("/api/datasets")
  return data.data
}

export const createDataset = async (payload) => {
  return axios.post("/api/datasets", payload)
}

export const updateDatasetConfig = async (datasetId, config) => {
  return axios.put(`/api/datasets/${datasetId}/config`, config)
}
