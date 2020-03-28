<template>
  <div>
    <div class="search-bar">
      <van-row class="row">
        <van-col span="3">
          <img :src="locationicon" width="50%" style="padding:20%" alt />
        </van-col>
        <van-col span="16">
          <input type="text" class="search-input" />
        </van-col>
        <van-col span="5">
          <van-button size="mini" style="margin-top:0.6rem">搜索</van-button>
        </van-col>
      </van-row>
    </div>
    <!--swiper area-->
    <div class="swiper-area">
      <van-swipe :autoplay="2000">
        <van-swipe-item v-for="(banner , index) in banners " :key="index">
          <img v-lazy="banner.imageUrl" alt style="max-width:100%" />
        </van-swipe-item>
      </van-swipe>
    </div>
    <!--produt area-->
    <div class="recommend-area">
      <div class="recommend-title">商品推荐</div>
      <div class="recommend-body">
        <swiper :options="swiperOption">
          <swiper-slide v-for="(product,index) in products" :key="index">
            <div v-for="(imageUrl, cindex) in product.images" :key="cindex" class="recommend-item">
              <img v-lazy="imageUrl.src" alt style="max-width:100%" />
              <span>{{product.name}}</span>
              <span>{{product.price}}</span>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default
const WooCommerce = new WooCommerceRestApi({
  url: 'https://healthkiwi.co.nz',
  consumerKey: 'ck_d416ab3b13118bb0cfb6e0ae57b63e2df398e748',
  consumerSecret: 'cs_82df873a23d2cdedef4b4e726b96e019787d2419',
  version: 'wc/v3',
  queryStringAuth: true
})
export default {
  name: 'mall',
  data () {
    return {
      swiperOption: {
        slidesPerView: 3
      },
      components: {
        Swiper,
        SwiperSlide
      },
      msg: 'shopping mall',
      locationicon: require('../../assets/img/搜索.png'),
      banners: [
        {
          imageUrl:
            'https://kiwi.cdnchina365.com/uploads/banner/jpg_20200319/39f222778f38dc87023ee2ea5711a25d5081.jpg'
        },
        {
          imageUrl:
            'https://kiwi.cdnchina365.com/uploads/banner/jpg_20200319/39f222778f38dc87023ee2ea5711a25d5081.jpg'
        },
        {
          imageUrl:
            'https://kiwi.cdnchina365.com/uploads/banner/jpg_20200214/e99711c9d7968f073654d063fcccebf84847.jpg'
        }
      ],
      products: []
    }
  },
  created: function () {
    WooCommerce.get('products?per_page=50')
      .then(response => {
        console.log(response.data)
        this.products = response.data
      })
      .catch(error => {
        console.log(error.response.data)
      })
  }
}
</script>

<style>
.row {
  text-align: center;
}
.search-bar {
  height: 2.2rem;
  background-color: #74c774;
}
.search-input {
  width: 100%;
  height: 1.8rem;
  border-width: 0px 0px 1px 0px;
  background-color: #74c774;
}
.swiper-area {
  clear: both;
  max-height: 10rem;
  overflow: hidden;
}
.recommend-area {
  background-color: #eee;
  margin-top: 0.5rem;
}
.recommend-title {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  color: #74c774;
}
.recommend-body{
  border-bottom: 1px solid #eee;
}
.recommend-item{
  width:99%;
  border-right: 1px solid #fff;
  text-align: center;
  font-size: 0.5rem;
}
</style>
