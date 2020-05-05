<template>
  <div>
    <iframe
      ref="printIframe"
      frameborder="0"
      scrolling="no"
      style="margin: 0px;padding: 0px;width: 0px;height: 0px;"
    ></iframe>
    <div ref="odiv" style="display:none">
      <div
        v-for="(item,index) in printInfo"
        :key="index"
        style="width: 600px;height:200px;position: relative;box-sizing: border-box;margin:auto"
      >
        <div style>
          <img :src="item.barCodeData | creatBarCode" />
          <span :src="item.barCodeData"></span>
        </div>
      </div>
    </div>
    <button @click="printpage()" style="height:40px;margin:10px;color:black;font-size:20px">打印</button>
  </div>
</template>

<script>
import JsBarcode from 'JsBarcode'
// import qrcode from 'qrcode'
export default {
  name: 'test',
  data() {
    return {
      printInfo: [
        {
          barCodeData: '9975669477001'
        }
      ]
    }
  },
  created: function() {
    this.getData()
  },
  methods: {
    getData() {
      let i = 9975669477002
      while (i <= 9975669477003) {
        this.printInfo.push({ barCodeData: i.toString() })
        i += 1
      }
    },
    printpage(id) {
      // 拿到要打印区域的dom结构并设置到Iframe的srcdoc属性上面
      var printIframe = this.$refs.printIframe
      var newstr = this.$refs.odiv.innerHTML
      printIframe.setAttribute('srcdoc', newstr)
      printIframe.onload = function() {
        console.log(printIframe.contentWindow)
        // 去掉iframe里面的dom的body的padding margin的默认数值
        printIframe.contentWindow.document.body.style.padding = '0px'
        printIframe.contentWindow.document.body.style.margin = '0px'
        // 开始打印
        printIframe.contentWindow.focus()
        printIframe.contentWindow.print()
      }
    }
  },
  filters: {
    creatBarCode(barCodeData) {
      let canvas = document.createElement('canvas')
      JsBarcode(canvas, barCodeData, {
        format: 'CODE128',
        displayValue: true,
        margin: 0,
        height: 150,
        width: 3.5,
        fontSize: 40,
        textMargin: 10,
        textAlign: 'center',
        marginTop: 20
      })
      return canvas.toDataURL('image/png')
    }
  }
}
</script>

<style>
</style>
