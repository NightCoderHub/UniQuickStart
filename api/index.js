import request from "@/utils/request";

export function getTypeList() {
  return request.get(
    "/v4/top/anime",
    { type: "ova", limit: 10 },
    {
      showLoading: false,
    },
  );
}
