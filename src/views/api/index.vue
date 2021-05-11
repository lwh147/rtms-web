<template>
  <div class="container">
    <el-container>
      <el-header>
        <h3> 本页面用来测试体温及人脸数据录入接口 </h3>
      </el-header>
      <div class="divider" />
      <el-main>
        <el-form
          ref="tempInfoForm"
          status-icon
          :model="formData"
          :rules="rules"
        >
          <el-row>
            <el-form-item label="检测时间：" prop="time">
              <el-date-picker
                v-model="formData.time"
                type="datetime"
                placeholder="请选择日期时间"
              />
            </el-form-item>
            <el-form-item label="体温：" prop="temp">
              <el-input-number
                v-model="formData.temp"
                :precision="1"
                :step="0.1"
                :min="35.0"
                :max="41.0"
              />
            </el-form-item>
            <el-form-item label="抓拍到的人脸照片：">
              <el-upload
                list-type="picture-card"
                :on-preview="handlePicturePreview"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                :on-exceed="handleFaceExceed"
                :on-change="handleChange"
                :file-list="pictureList"
                :limit="1"
                multiple
                :auto-upload="false"
                action=""
              >
                <i class="el-icon-plus" />
              </el-upload>
            </el-form-item>
          </el-row>
          <el-row>
            <el-button @click="reset">重置表单</el-button>
            <el-button v-loading="queryLoading" type="primary" @click="save">提交</el-button>
          </el-row>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import {search} from '@/api/face'
import {add} from '@/api/temp'

export default {
  name: 'Index',
  data() {
    return {
      queryLoading: false,
      pictureList: [],
      formData: {
        temp: 36.5,
        time: new Date()
      },
      rules: {
        time: [
          { required: true, message: '时间不能为空', trigger: 'change' }
        ],
        temp: [
          { required: true, message: '温度不能为空', trigger: 'change' }
        ]
      },
      group_id_list_1: '1_1,1_2,3_1,3_2,5_1,5_2,7_1,7_2,9_1,9_2',
      group_id_list_2: '2_1,2_2,4_1,4_2,6_1,6_2,8_1,8_2,10_1,10_2'
    }
  },
  methods: {
    /**
     * 将图片从图片列表中删除
     **/
    handleRemove(file, fileList) {
      this.pictureList = fileList
    },
    /**
     * 人脸数量超出
     **/
    handleFaceExceed() {
      this.$message.warning('当前人脸数量已超出限制！')
    },
    /**
     * 预览图片
     **/
    handlePicturePreview(file) {
      window.open(file.url)
    },
    /**
     * 成功回调
     **/
    handleSuccess(res) {
      this.$message.success('上传成功')
    },
    /**
     * 图片列表改变
     **/
    handleChange(file, fileList) {
      this.pictureList = fileList
    },
    /**
     * 人脸操作对话框消失处理
     **/
    handleClose() {
      this.faceDialogVisible = false
      this.pictureList = []
    },
    /**
     * 重置表单
     **/
    reset() {
      this.$refs['tempInfoForm'].resetFields()
    },
    /**
     * 提交数据
     **/
    save() {
      this.$refs['tempInfoForm'].validate((valid) => {
        if (valid) {
          if (this.pictureList.length !== 1) {
            this.$message.warning('请上传抓拍到的人脸照片')
            return
          }
          this.queryLoading = true
          this.getBase64(this.pictureList[0].raw).then((res) => {
            const data = {
              image: res,
              image_type: 'BASE64',
              group_id_list: this.group_id_list_2
            }
            search(data).then((res) => {
              const userList = res.result.user_list
              if (userList.length > 0 && userList[0].score > 80.0) {
                console.log('第一次找到了匹配人脸')
                const tempInfo = {
                  time: this.getFormateDate(this.formData.time),
                  temp: this.formData.temp,
                  residentId: userList[0].user_id
                }
                add(tempInfo).then((res) => {
                  this.$message.success('添加体温信息成功')
                  this.queryLoading = false
                }).catch(() => {
                  this.$message.error('体温所属居民已确定，但添加体温信息时遭遇网络错误')
                  this.queryLoading = false
                })
              } else {
                data.group_id_list = this.group_id_list_1
                search(data).then((res) => {
                  const userList2 = res.result.user_list
                  if (userList2.length > 0 && userList2[0].score > 80.0) {
                    console.log('第二次找到了匹配人脸')
                    const tempInfo2 = {
                      time: this.getFormateDate(this.formData.time),
                      temp: this.formData.temp,
                      residentId: userList2[0].user_id
                    }
                    add(tempInfo2).then((res) => {
                      this.$message.success('添加体温信息成功')
                      this.queryLoading = false
                    }).catch(() => {
                      this.$message.error('体温所属居民已确定，但添加体温信息时遭遇网络错误')
                      this.queryLoading = false
                    })
                  } else {
                    this.$message.warning('所上传的人脸并非小区内居民人脸，体温信息拒绝录入')
                    this.queryLoading = false
                  }
                }).catch(() => {
                  this.$message.error('网络异常')
                  this.queryLoading = false
                })
              }
            }).catch(() => {
              this.$message.error('网络异常')
              this.queryLoading = false
            })
          }).catch(() => {
            this.$message.error('人脸图片上传失败')
            this.queryLoading = false
          })
        } else {
          this.$message.error('请按规则填写表格')
        }
      })
    },
    /**
     * 把图片转换为base64编码
     **/
    getBase64(file) {
      return new Promise(function(resolve, reject) {
        const reader = new FileReader()
        let imgResult = ''
        reader.readAsDataURL(file)
        reader.onload = function() {
          imgResult = reader.result.split(',')[1]
        }
        reader.onerror = function(error) {
          reject(error)
        }
        reader.onloadend = function() {
          resolve(imgResult)
        }
      })
    },
    /**
     * 将时间戳转换为常用日期格式
     * @param time 有效的时间类型，字符串、时间戳或者Date对象
     * @return {string} yyyy/mm/dd hh:mm:ss格式化的日期
     **/
    getFormateDate(time) {
      if (!time) {
        throw new Error('argument "time" is required !')
      }
      const date = new Date(time)
      const Y = date.getFullYear() + '/'
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/'
      const D = date.getDate() + ' '
      const h = date.getHours() + ':'
      const m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':'
      const s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds())
      return Y + M + D + h + m + s
    }
  }
}
</script>

<style scoped>

div.container {
  width: 600px;
  margin: 20px auto;
}

div.divider {
  margin-bottom: 50px;
}

</style>
