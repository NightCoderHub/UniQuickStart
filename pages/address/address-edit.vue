<template>
  <view class="address-edit-page">
    <view class="form-container">
      <wd-cell-group>
        <wd-input v-model="formData.name" required label-width="220rpx" label="收货人" placeholder="请填写收货人姓名" />
        <wd-input
          v-model="formData.phone"
          label="手机号"
          label-width="220rpx"
          required
          placeholder="请填写收货人手机号"
          type="number"
          :maxlength="11"
        />

        <!-- <wd-picker
          v-model="selectedRegionCodes"
          :columns="districtColumns"
          label="所在地区"
          :column-change="onChangeDistrict"
          :display-format="displayRegionFormat"
          placeholder="请选择省/市/区"
          value-key="value"
          label-key="label"
          clearable
          @confirm="onRegionPickerConfirm"
          @clear="onRegionPickerClear"
        /> -->
        <view class="location-container" @click="getLocation">
          <wd-textarea
            v-model="formData.detailAddress"
            required
            label-width="220rpx"
            label="详细地址"
            readonly
            auto-height
            placeholder="定位获取所在地区"
            custom-style="padding: 10px 12px;"
          >
          </wd-textarea>
          <wd-icon name="location"></wd-icon>
        </view>
        <wd-input
          v-model="formData.houseNumber"
          required
          label="楼栋门牌号"
          label-width="220rpx"
          placeholder="请填写楼栋门牌号"
          :autosize="{ minRows: 3, maxRows: 5 }"
          custom-style="padding: 10px 12px;"
        />

        <wd-cell title="设为默认地址" center>
          <wd-switch v-model="formData.isDefault" size="38rpx" active-color="#52c41a" />
        </wd-cell>
      </wd-cell-group>
    </view>
    <safe-area-footer>
      <view class="bottom-buttons">
        <wd-button type="success" block size="large" @click="saveAddress">保存地址</wd-button>
        <wd-button
          v-if="type === 'edit'"
          type="error"
          block
          size="large"
          custom-class="delete-button"
          @click="deleteCurrentAddress"
          >删除地址</wd-button
        >
      </view>
    </safe-area-footer>
  </view>
  <wd-message-box></wd-message-box>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { useMessage } from "wot-design-uni";
import { onLoad } from "@dcloudio/uni-app";

// import { districtData } from "@/utils/regionData.js";
// import { reverseGeocode } from "@/utils/getLocationAndPermission.js";

// const district = districtData;
const message = useMessage();
const type = ref("add");
const currentEditId = ref(null);
const formData = reactive({
  id: "",
  name: "",
  phone: "",
  region: "",
  provinceCode: "",
  cityCode: "",
  areaCode: "",
  detailAddress: "",
  houseNumber: "", // 新增楼栋门牌号字段
  isDefault: false,
  longitude: null,
  latitude: null,
  adcode: null,
});
// const selectedRegionCodes = ref([]);
// const districtColumns = ref([]);
// const adcode = ref('') // 行政区编码

// const initDistrictColumns = (initialValue = []) => {
//   const cols = [];

//   const getSafeData = (key, placeholder) => {
//     const data = district[key] || [];
//     return data.length > 0 ? data : [{ label: placeholder, value: "" }];
//   };

//   const provincesData = getSafeData("0", "暂无省份");
//   cols.push(provincesData);

//   let defaultProvinceCode = initialValue[0] || provincesData[0]?.value;

//   const citiesData = getSafeData(defaultProvinceCode, "暂无城市");
//   cols.push(citiesData);

//   let defaultCityCode = initialValue[1] || citiesData[0]?.value;

//   const areasData = getSafeData(defaultCityCode, "暂无区县");
//   cols.push(areasData);

//   districtColumns.value = cols;
// };

// const onChangeDistrict = (pickerInstance, value, columnIndex, resolve) => {
//   const item = value[columnIndex];

//   const getSafeDataForPicker = (key, placeholder) => {
//     const data = district[key] || [];
//     return data.length > 0 ? data : [{ label: placeholder, value: "" }];
//   };

//   if (columnIndex === 0) {
//     const nextCitiesData = getSafeDataForPicker(item.value, "暂无城市");
//     pickerInstance.setColumnData(1, nextCitiesData);

//     const firstCityOfNewProvinceCode = nextCitiesData[0]?.value;
//     const nextAreasData = getSafeDataForPicker(
//       firstCityOfNewProvinceCode,
//       "暂无区县",
//     );
//     pickerInstance.setColumnData(2, nextAreasData);
//   } else if (columnIndex === 1) {
//     const nextAreasData = getSafeDataForPicker(item.value, "暂无区县");
//     pickerInstance.setColumnData(2, nextAreasData);
//   }
//   resolve();
// };

// const displayRegionFormat = (items) => {
//   if (!items || items.length === 0) {
//     return "";
//   }
//   return items
//     .map((item) => {
//       return item && item.label && !item.label.startsWith("暂无")
//         ? item.label
//         : "";
//     })
//     .filter(Boolean)
//     .join(" ");
// };

// const onRegionPickerConfirm = ({ value, selectedItems }) => {
//   const selectedLabels = Array.isArray(selectedItems)
//     ? selectedItems.map((item) => item.label)
//     : [];

//   selectedRegionCodes.value = value;

//   formData.region = selectedLabels
//     .filter((text) => text && !text.startsWith("暂无"))
//     .join(" ");
//   formData.provinceCode = value[0] || "";
//   formData.cityCode = value[1] || "";
//   formData.areaCode = value[2] || "";
// };

const getLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      formData.detailAddress = res.address;
      formData.latitude = res.latitude;
      formData.longitude = res.longitude;
      // reverseGeocode(res.latitude, res.longitude).then((result) => {
      //   formData.adcode = result.ad_info.adcode
      // })
    },
  });
};

// const onRegionPickerClear = () => {
//   selectedRegionCodes.value = [];
//   formData.region = "";
//   formData.provinceCode = "";
//   formData.cityCode = "";
//   formData.areaCode = "";

//   initDistrictColumns();

//   uni.showToast({ title: "已清空选择", icon: "none" });
// };

onLoad((options) => {
  if (options.type === "edit" && options.id) {
    type.value = "edit";
    currentEditId.value = options.id;

    // const mockAddress = {
    //   id: options.id,
    //   name: "王小明",
    //   phone: "13500001234",
    //   region: "贵州省 铜仁市 碧江区",
    //   provinceCode: "520000",
    //   cityCode: "520600",
    //   areaCode: "520602",
    //   detailAddress: "河西街道中华路123号某小区B栋301",
    //   isDefault: false,
    // };
    // Object.assign(formData, mockAddress);

    // let initialCodesForPicker = [
    //   formData.provinceCode,
    //   formData.cityCode,
    //   formData.areaCode,
    // ].filter(Boolean);

    // let validInitialCodes = [];
    // let currentCheckData = district["0"];
    // for (let i = 0; i < initialCodesForPicker.length; i++) {
    //   const code = initialCodesForPicker[i];
    //   if (
    //     currentCheckData &&
    //     Array.isArray(currentCheckData) &&
    //     currentCheckData.some((item) => item.value === code)
    //   ) {
    //     validInitialCodes.push(code);
    //     currentCheckData = district[code];
    //   } else {
    //     break;
    //   }
    // }
    // selectedRegionCodes.value = validInitialCodes;

    // initDistrictColumns(selectedRegionCodes.value);
  } else {
    type.value = "add";
    // initDistrictColumns();
  }
});

const validateForm = () => {
  if (!formData.name) {
    uni.showToast({ title: "请填写收货人姓名", icon: "none" });
    return false;
  }
  if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({ title: "请填写正确的手机号", icon: "none" });
    return false;
  }
  // if (!formData.region || formData.region.includes("暂无")) {
  //   uni.showToast({ title: "请选择完整的所在地区", icon: "none" });
  //   return false;
  // }
  if (!formData.detailAddress) {
    uni.showToast({ title: "请填写详细地址", icon: "none" });
    return false;
  }
  if (!formData.houseNumber) {
    uni.showToast({ title: "请填写楼栋门牌号", icon: "none" });
    return false;
  }
  return true;
};

const saveAddress = () => {
  if (!validateForm()) {
    return;
  }

  console.log("保存地址数据:", formData);
  // 注意：如果 isDefault 被监听并发送了请求，这里保存时可以省略 isDefault 的处理
  // 也可以在这里统一发送地址信息，包括 isDefault
  if (type.value === "add") {
    uni.showToast({ title: "新增地址成功", icon: "success" });
  } else {
    uni.showToast({ title: "编辑地址成功", icon: "success" });
  }
  uni.navigateBack();
};

const deleteCurrentAddress = () => {
  message
    .confirm({
      title: "确认删除",
      msg: "确定要删除该地址吗？",
    })
    .then(() => {
      uni.showToast({
        title: "删除成功",
        icon: "success",
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1000);
    })
    .catch(() => {
      console.log("取消删除");
    });
};

// --- 完善“设为默认地址”的交互逻辑 ---
watch(
  () => formData.isDefault,
  async (newValue, oldValue) => {
    // 只有在编辑模式下，且地址有ID时才发送请求
    if (type.value === "edit" && formData.id) {
      uni.showLoading({ title: "设置中...", mask: true });
      try {
        // 模拟异步请求，实际替换为你的API调用
        // await yourApi.updateAddressDefaultStatus(formData.id, newValue);
        await new Promise((resolve) => setTimeout(resolve, 500)); // 模拟网络延迟

        if (newValue) {
          uni.showToast({ title: "已设为默认地址", icon: "success" });
        } else {
          uni.showToast({ title: "已取消默认状态", icon: "success" });
        }
        // 理论上，后端会处理将其他地址取消默认的逻辑。
        // 如果前端需要立即更新其他页面的默认地址状态（比如地址列表页），
        // 可以使用 uni.$emit 或更新全局状态管理。
      } catch (error) {
        console.error("设置默认地址失败:", error);
        uni.hideLoading();
        uni.showToast({ title: "设置失败，请重试", icon: "none" });
        // 发生错误时，将开关状态回滚到旧值，保持UI与数据一致性
        formData.isDefault = oldValue;
      } finally {
        uni.hideLoading();
      }
    } else if (type.value === "add" && newValue) {
      // 在新增地址时，如果勾选了默认，通常表示新增后直接设为默认
      // 此时不需要单独发送请求，最终在 saveAddress 时一起提交
      uni.showToast({ title: "地址保存后将设为默认", icon: "none" });
    }
  },
  {
    immediate: false, // 不在组件创建时立即执行一次，只在 isDefault 实际改变时执行
  },
);

// --- 监听 type 变化并设置导航栏标题 ---
watch(
  type,
  (newType) => {
    const title = newType === "add" ? "新增收货地址" : "编辑收货地址";
    uni.setNavigationBarTitle({
      title: title,
    });
  },
  {
    immediate: true, // 立即执行一次，确保页面加载时设置正确的标题
  },
);
</script>

<style lang="scss" scoped>
.address-edit-page {
  display: flex;
  flex-direction: column;
}

.form-container {
  flex: 1;
  padding-bottom: 150rpx;
}

.bottom-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 24rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 8rpx rgb(0 0 0 / 5%);

  .delete-button {
    color: #fff;
    background-color: #f5222d;
  }
}

.location-container {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .wd-textarea {
    flex: 1;
  }

  .wd-icon {
    margin-right: 24rpx;
  }
}
</style>
