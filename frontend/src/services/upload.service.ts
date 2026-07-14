import axios from 'axios';
import { API_BASE_URL } from '@/lib/api/constants';
import { getApiErrorMessage } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import { runTokenRefresh } from '@/lib/api/token-refresh';

export interface UploadedReceipt {
  path: string;
  originalName: string;
  mimeType: string;
  size: number;
}

async function postReceiptUpload(
  formData: FormData,
  onProgress?: (progress: number) => void,
) {
  const token = getAccessToken();

  return axios.post<{ success: true; data: UploadedReceipt }>(
    `${API_BASE_URL}/uploads/receipt`,
    formData,
    {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) {
          return;
        }

        onProgress(Math.round((event.loaded * 100) / event.total));
      },
    },
  );
}

export const uploadService = {
  async uploadReceipt(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<UploadedReceipt> {
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      let response = await postReceiptUpload(formData, onProgress);

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await runTokenRefresh();
        const response = await postReceiptUpload(formData, onProgress);
        return response.data.data;
      }

      throw new Error(getApiErrorMessage(error, 'Failed to upload receipt'));
    }
  },
};
