<template>
  <view>
    <block v-for="item in typeList" :key="item.mal_id">
      <anime-card :anime="item"></anime-card>
    </block>
  </view>
  <custom-tabbar current-path="pages/index/index"></custom-tabbar>
</template>

<script setup>
import { getTypeList } from "@/api";
import { ref } from "vue";
import animeCard from "@/components/anime-card/anime-card.vue";

const typeList = ref([]);

getTypeList().then((res) => {
  typeList.value = res;
});
</script>

<style lang="scss" scoped></style>
