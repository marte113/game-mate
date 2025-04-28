import axios from "axios";
import { toast } from "react-hot-toast";
import { redirect } from "next/navigation";
import config from "@/config";

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};

const ERROR_MESSAGES = {
  [HTTP_STATUS.UNAUTHORIZED]: "로그인이 필요합니다",
  [HTTP_STATUS.FORBIDDEN]: "이 기능을 사용하려면 요금제를 선택해주세요",
  DEFAULT: "문제가 발생했습니다...",
};

const apiClient = axios.create({
  baseURL: "/api",
});

function handleErrorMessage(error) {
  if (!error) return ERROR_MESSAGES.DEFAULT;

  const status = error.response?.status;

  if (status === HTTP_STATUS.UNAUTHORIZED) {
    toast.error(ERROR_MESSAGES[HTTP_STATUS.UNAUTHORIZED]);
    redirect(config.auth.loginUrl);
  }

  if (status === HTTP_STATUS.FORBIDDEN) {
    return ERROR_MESSAGES[HTTP_STATUS.FORBIDDEN];
  }

  return error?.response?.data?.error || error.message || error.toString();
}

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = handleErrorMessage(error);
    const formattedMessage =
      typeof message === "string" ? message : JSON.stringify(message);

    console.error(formattedMessage);
    toast.error(formattedMessage);

    return Promise.reject(new Error(formattedMessage));
  }
);

export default apiClient;
