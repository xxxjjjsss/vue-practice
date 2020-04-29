<template>
  <div>123</div>
</template>

<script>
var myHeaders = new Headers()
myHeaders.append(
  'Authorization',
  'Basic TlpIRUFMVEhXSE9MRVNBTE5aOmNmZGNhMzRlZTA0NzQ3MmU5ZWYyZjQ5MDQwODg4OTRm'
)
myHeaders.append(
  'Cookie',
  'ApplicationGatewayAffinity=669a7da5f1189e1fae3fec5022d2aa8c4bf0480dd89507d35c28b80b3ccb73be; ApplicationGatewayAffinityCORS=669a7da5f1189e1fae3fec5022d2aa8c4bf0480dd89507d35c28b80b3ccb73be'
)
var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
}

export default {
  // data() {
  //   return {
  //     login_form: {
  //       username: 'admin',
  //       password: 'healthkiwi@2020'
  //     }
  //   }
  // },
  methods: {
    getTest() {
      return new Promise((resolve, reject) => {
        this.reqCin7Service('/SalesOrders', requestOptions, 'post')
          .then(result => {
            console.log(result)
            // resolve(result.data)
          })
          .catch(error => {
            console.log(error.result)
          })
      })
    }
  },
  created: function() {
    this.getTest()
  }
}
</script>

<style lang="less" scoped>
</style>>
