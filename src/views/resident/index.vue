<template>
  <el-container>
    <el-header style="height: unset">
      <!-- 搜索区域 -->
      <el-form :model="residentQuery" style="margin-top: 20px" :inline="true">
        <el-form-item label="姓名:" style="margin-left: 20px;">
          <el-input
            v-model="residentQuery.name"
            clearable
            placeholder="请输入姓名"
          />
        </el-form-item>
        <el-form-item label="电话:" style="margin-left: 20px">
          <el-input
            v-model="residentQuery.phone"
            clearable
            placeholder="请输入联系电话"
          />
        </el-form-item>
        <el-form-item label="楼号：" style="margin-left: 20px">
          <el-select
            v-model="residentQuery.building"
            placeholder="请选择楼栋号"
          >
            <el-option
              v-for="item in buildingOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单元号" style="margin-left: 20px">
          <el-select
            v-model="residentQuery.entrance"
            placeholder="请选择单元号"
          >
            <el-option
              v-for="item in entranceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房间号" style="margin-left: 20px">
          <el-select
            v-model="residentQuery.room"
            placeholder="请选择房间号"
          >
            <el-option
              v-for="item in roomOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-button
          id="btnQuery"
          v-loading="queryLoading"
          style="margin-left: 20px"
          type="primary"
          icon="el-icon-search"
          @click="onBtnQueryClick"
        >查询
        </el-button>
        <el-button
          v-loading="queryLoading"
          style="margin-left: 20px"
          @click="resetUIToInitStatus"
        >初始化查询条件
        </el-button>
      </el-form>
    </el-header>

    <el-main>

      <!-- 添加居民 -->
      <el-button
        class="table-up-button"
        type="primary"
        icon="el-icon-plus"
        @click="onBtnAddClick"
      >添加居民信息
      </el-button>

      <!-- 居民信息展示表格 -->
      <el-table
        id="table"
        ref="table"
        v-loading="queryLoading"
        style="margin-top: 20px"
        :data="residentVOS"
        element-loading-text="Loading"
        fit
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
        @row-dblclick="handleRowDoubleClick"
      >
        <el-table-column align="center" type="selection" />
        <el-table-column align="center" label="序号">
          <template slot-scope="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="name" label="姓名" />
        <el-table-column align="center" prop="sex" label="性别" :formatter="sexFormatter" />
        <el-table-column
          align="center"
          prop="phone"
          label="联系电话"
        />
        <el-table-column
          align="center"
          prop="building"
          label="楼号"
        />
        <el-table-column
          align="center"
          prop="entrance"
          label="单元号"
        />
        <el-table-column
          prop="room"
          header-align="center"
          align="center"
          label="房间号"
        />
        <!--操作区-->
        <el-table-column
          fixed="right"
          header-align="center"
          align="center"
          prop="operation"
          label="操作"
          width="300"
        >
          <template slot-scope="scope">
            <div>
              <el-button
                id="btnEdit"
                size="mini"
                type="primary"
                @click="onBtnEditClick(scope.$index, scope.row)"
              >编辑
              </el-button>
              <el-button
                id="btnDelete"
                size="mini"
                icon="icon-label-delete"
                type="danger"
                @click="onBtnDeleteClick(scope.$index, scope.row)"
              >删除</el-button>
              <el-button
                id="btnImageEdit"
                size="mini"
                @click="onBtnFaceEditClick(scope.$index, scope.row)"
              >人脸管理
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!---分页-->
      <el-pagination
        style="margin: 20px auto"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageInfo.total"
        :page-size="pageInfo.pageSize"
        :page-sizes="[5, 10, 20, 50, 100]"
        :current-page.sync="pageInfo.pageNum"
        @current-change="onPageChanged"
        @size-change="sizeChangeHandle"
      />

      <!-- 操作对话框 -->
      <el-dialog
        v-dialog-drag
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        @closed="resetForm('addForm')"
      >
        <el-form
          ref="addForm"
          :model="resident"
          status-icon
          :rules="rules"
          label-width="110px"
          width="100px"
        >
          <el-row>
            <el-col :span="11">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="resident.name" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="11" :offset="1">
              <el-form-item label="性别" prop="sex">
                <el-select
                  v-model="resident.sex"
                  placeholder="请选择性别"
                >
                  <el-option
                    v-for="item in sexOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="11">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="resident.phone" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="11" :offset="1">
              <el-form-item label="楼号" prop="building">
                <el-select
                  v-model="resident.building"
                  placeholder="请选择楼栋号"
                >
                  <el-option
                    v-for="item in buildingOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="11">
              <el-form-item label="单元号" prop="entrance">
                <el-select
                  v-model="resident.entrance"
                  placeholder="请选择单元号"
                >
                  <el-option
                    v-for="item in entranceOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="11" :offset="1">
              <el-form-item label="房间号" prop="room">
                <el-select
                  v-model="resident.room"
                  placeholder="请选择房间号"
                >
                  <el-option
                    v-for="item in roomOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button id="btnCancel" @click="onBtnCancelClick">取 消</el-button>
          <el-button
            id="btnOK"
            type="primary"
            @click="addOrEdit('addForm')"
          >确 定</el-button>
        </span>
      </el-dialog>

      <!-- 人脸操作对话框 -->
      <el-dialog
        v-dialog-drag
        title="人脸信息"
        :visible.sync="faceDialogVisible"
        @close="handleClose"
      >
        <el-form
          ref="faceForm"
          status-icon
          label-width="140px"
        >
          <el-row>
            <div>
              <el-form-item label="已拥有人脸数量：">
                <div>
                  {{ faceInfo.faceCount }}
                </div>
              </el-form-item>
            </div>
            <div v-if="faceInfo.faceCount < 3">
              <el-form-item label="添加人脸：">
                <el-upload
                  list-type="picture-card"
                  :on-preview="handlePicturePreview"
                  :on-remove="handleRemove"
                  :on-success="handleSuccess"
                  :on-exceed="handleFaceExceed"
                  :on-change="handleChange"
                  :file-list="pictureList"
                  :limit="3 - faceInfo.faceCount"
                  multiple
                  :auto-upload="false"
                  action=""
                >
                  <i class="el-icon-plus" />
                </el-upload>
              </el-form-item>
            </div>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label-width="220px" label="提示：每个人最多拥有3张人脸" /></el-col>
          </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="danger" @click="onBtnClearFaceClick">清空现存人脸数据</el-button>
          <el-button @click="onBtnCancelClick">取 消</el-button>
          <el-button type="primary" @click="saveFace('addForm')">保存</el-button>
        </span>
      </el-dialog>
    </el-main>

  </el-container>
</template>

<script>
import {add, commonQuery, modify, queryResidentById, remove} from '@/api/resident'
import '@/utils/dialogdrap'
import {addUserFace, deleteUser, getUserFaceList} from '@/api/face'

export default {
  data() {
    return {
      // 试图可见性控制变量
      queryLoading: false, // 查询按钮动画控制
      updateLoading: false, // 修改按钮动画控制
      dialogVisible: false, // 对话框可见性控制
      faceDialogVisible: false,

      // 数据资源
      resident: {},
      pictureList: [],
      pageInfo: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      residentVOS: [],
      faceInfo: {
        faceCount: 0
      },

      // 查询条件
      residentQuery: {
        name: null,
        phone: null,
        building: null,
        entrance: null,
        room: null,
        pageNum: 1,
        pageSize: 10
      },

      // 菜单相关资源
      multipleSelection: [],
      buildingOptions: [
        { value: 1, label: '#01' },
        { value: 2, label: '#02' },
        { value: 3, label: '#03' },
        { value: 4, label: '#04' },
        { value: 5, label: '#05' },
        { value: 6, label: '#06' },
        { value: 7, label: '#07' },
        { value: 8, label: '#08' },
        { value: 9, label: '#09' },
        { value: 10, label: '#10' },
        { value: null, label: '不限' }
      ],
      entranceOptions: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: null, label: '不限' }
      ],
      roomOptions: [
        { value: 101, label: '101' },
        { value: 102, label: '102' },
        { value: 201, label: '201' },
        { value: 202, label: '201' },
        { value: 301, label: '301' },
        { value: 302, label: '302' },
        { value: 401, label: '401' },
        { value: 402, label: '402' },
        { value: 501, label: '501' },
        { value: 502, label: '502' },
        { value: 601, label: '601' },
        { value: 602, label: '602' },
        { value: null, label: '不限' }
      ],
      sexOptions: [
        { value: 0, label: '男' },
        { value: 1, label: '女' }
      ],

      // 对话框相关
      dialogType: 'ADD', // 标记对话框处于那种状态
      dialogTitle: '添加居民信息',

      // 表单校验规则
      rules: {
        name: [
          { required: true, message: '姓名不能为空', trigger: 'change' }
        ],
        sex: [
          { required: true, message: '性别不能为空', trigger: 'change' }
        ],
        phone: [
          { required: true, message: '手机号不能为空', trigger: 'change' },
          {
            pattern: /^\d{11}$/,
            message: '请输入合法的手机号',
            trigger: 'change'
          }
        ],
        building: [
          { required: true, message: '楼号不能为空', trigger: 'change' }
        ],
        entrance: [
          { required: true, message: '单元号不能为空', trigger: 'change' }
        ],
        room: [
          { required: true, message: '房间号不能为空', trigger: 'change' }
        ]
      }
    }
  },
  beforeMount() {
    this.initUI()
  },
  methods: {
    /**
     * 初始化区
     */
    initUI() {
      this.queryLoading = false
      this.updateLoading = false
      this.pageInfo.pageSize = 10
      this.pageInfo.pageNum = 1
      this.onBtnQueryClick()
    },
    /**
     * 多选选择对象更新
     **/
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    /**
     * 性别格式化显示
     **/
    sexFormatter(row, column, cellValue, index) {
      return cellValue === 0 ? '男' : '女'
    },
    /**
     * 表行元素双击事件处理
     **/
    handleRowDoubleClick(row) {
      queryResidentById(row.id).then((response) => {
        if (response != null) {
          this.resident = response.data
          this.dialogType = 'EDIT'
          this.dialogTitle = '编辑居民信息'
          this.dialogVisible = true
        } else {
          this.$message.warning('该居民已不存在')
        }
      })
    },
    /**
     * 重置视图状态
     **/
    resetUIToInitStatus() {
      this.residentQuery = {}
      this.queryLoading = false
      this.updateLoading = false
      this.pageInfo.pageSize = 10
      this.pageInfo.pageNum = 1
      this.onBtnQueryClick()
    },
    /**
     * 业务方法区  按查询区  操作区  展示区  分别组织代码
     */
    onBtnQueryClick() {
      this.queryLoading = true
      this.residentQuery.pageSize = this.pageInfo.pageSize
      this.residentQuery.pageNum = this.pageInfo.pageNum
      commonQuery(this.residentQuery)
        .then((response) => {
          this.pageInfo = response.data.pageInfo
          this.pageInfo.total = Number(this.pageInfo.total)
          this.pageInfo.startRow = Number(this.pageInfo.startRow)
          this.pageInfo.endRow = Number(this.pageInfo.endRow)
          this.residentVOS = response.data.list
          this.queryLoading = false
        })
        .catch(() => {
          this.queryLoading = false
          this.$message.error('网络异常')
        })
    },
    /**
     * 页码改变监听事件
     **/
    onPageChanged() {
      this.queryLoading = true
      this.onBtnQueryClick()
    },
    /**
     * 每页条数变化
     **/
    sizeChangeHandle(val) {
      this.pageInfo.pageSize = val
      this.pageInfo.pageNum = 1
      this.onBtnQueryClick()
    },
    /**
     * 删除
     */
    onBtnDeleteClick(index, row) {
      const selectedResidentVO = this.residentVOS[index]
      if (selectedResidentVO === undefined || selectedResidentVO === null) {
        return
      }
      this.$confirm('确定删除记录吗？').then(() => {
        remove(selectedResidentVO.id)
          .then(() => {
            this.$message.success('删除成功')
            this.onBtnQueryClick()
          })
          .catch(() => {
            this.$message.error('网络错误')
          })
      })
    },
    /**
     * 添加居民信息
     **/
    onBtnAddClick() {
      this.dialogType = 'ADD'
      this.dialogTitle = '添加居民信息'
      this.dialogVisible = true
    },
    /**
     * 编辑行数据
     **/
    onBtnEditClick(index, row) {
      const selectedResidentVO = this.residentVOS[index]
      if (selectedResidentVO === undefined || selectedResidentVO == null) {
        this.$message.info('没有对应记录可以编辑')
        return
      }
      queryResidentById(selectedResidentVO.id)
        .then((response) => {
          if (response != null) {
            this.resident = response.data
            this.dialogType = 'EDIT'
            this.dialogTitle = '编辑居民信息'
            this.dialogVisible = true
          } else {
            this.$message.warning('该居民已不存在')
          }
        })
        .catch(() => {
          this.$message.error('网络异常')
        })
    },
    /**
     * 修改、保存弹出框确定按钮点击事件处理
     **/
    addOrEdit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.dialogType === 'ADD') {
            add(this.resident)
              .then(() => {
                // 显示保存成功并且返回
                this.$message.success('保存成功')
                this.dialogVisible = false
                this.dialogType = ''
                this.dialogTitle = ''
                this.onBtnQueryClick()
              })
              .catch(() => {
                this.$message.error('网络异常')
              })
          } else if (this.dialogType === 'EDIT') {
            modify(this.resident)
              .then(() => {
                // 显示修改成功并且返回
                this.$message.success('修改成功')
                // 自动关闭对话框
                this.dialogVisible = false
                this.dialogType = ''
                this.dialogTitle = ''
                this.onBtnQueryClick()
              })
              .catch(() => {
                this.$message.error('网络异常')
              })
          }
        } else {
          this.$message.error('请按规则填写表格')
        }
      })
    },
    /**
     * 修改、保存弹出框取消按钮点击事件处理
     **/
    onBtnCancelClick() {
      this.dialogVisible = false
      this.faceDialogVisible = false
      this.dialogTitle = ''
      this.dialogType = ''
    },
    /**
     * 对话框消失时重置表单
     **/
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    /**
     * 删除人脸
     **/
    onBtnClearFaceClick() {
      if (this.faceInfo.faceCount === 0) {
        this.$message.warning('当前用户没有人脸数据')
        return
      }
      this.$confirm('确定清空人脸数据吗？').then(() => {
        const data = {
          user_id: this.resident.id,
          group_id: this.resident.building + '_' + this.resident.entrance
        }
        deleteUser(data).then((res) => {
          if (res.error_code === 0 || res.error_code === 223103) {
            this.$message.success('人脸数据已清空')
            this.faceInfo.face = []
            this.faceInfo.faceCount = 0
            return
          }
          this.$message.error('清空失败')
        }).catch(() => {
          this.$message.error('网络错误')
        })
      })
    },
    /**
     * 管理人脸图片数据按钮点击
     **/
    onBtnFaceEditClick(index, row) {
      const selectedResidentVO = this.residentVOS[index]
      if (selectedResidentVO === undefined || selectedResidentVO == null) {
        this.$message.info('没有对应记录可以编辑')
        return
      }
      queryResidentById(selectedResidentVO.id)
        .then((response) => {
          if (response != null) {
            this.resident = response.data
            const data = {
              user_id: this.resident.id,
              group_id: this.resident.building + '_' + this.resident.entrance
            }
            getUserFaceList(data).then((res) => {
              if (res.result) {
                this.faceInfo.face = res.result.face_list
                this.faceInfo.faceCount = res.result.face_list.length
              } else {
                this.faceInfo.face = []
                this.faceInfo.faceCount = 0
              }
              this.faceDialogVisible = true
            }).catch(() => {
              this.$message.error('网络异常')
            })
          } else {
            this.$message.warning('该居民已不存在')
          }
        })
        .catch(() => {
          this.$message.error('网络异常')
        })
    },
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
     * 保存人脸数据
     **/
    saveFace() {
      if (this.pictureList.length === 0) {
        this.$message.warning('请至少添加一张人脸照片')
      }
      console.log('人脸数据：', this.pictureList)
      for (let i = 0; i < this.pictureList.length; i++) {
        this.getBase64(this.pictureList[i].raw).then((res) => {
          const data = {
            image_type: 'BASE64',
            image: res,
            user_id: this.resident.id,
            group_id: this.resident.building + '_' + this.resident.entrance
          }
          addUserFace(data).then((res) => {
            if (res.error_code === 222203) {
              this.$message.error('第' + (i + 1) + '张照片不符合要求')
            } else if (res.error_code === 0) {
              this.$message.success('第' + (i + 1) + '张照片添加成功')
              this.handleClose()
            } else {
              this.$message.error('第' + (i + 1) + '张照片添加失败')
            }
          }).catch(() => {
            this.$message.error('第' + (i + 1) + '张照片添加失败')
          })
        }).catch(() => {
          this.$message.error('第' + (i + 1) + '张照片添加失败')
        })
      }
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
    }
  }
}
</script>
<style scoped>

.table-up-button {
  margin-left: 20px;
}

</style>
