<template>
  <el-container>
    <el-header style="height: unset">
      <!-- 搜索区域 -->
      <el-form :model="adminQuery" style="margin-top: 20px" :inline="true">
        <el-form-item label="姓名:" style="margin-left: 20px;">
          <el-input
            v-model="adminQuery.name"
            clearable
            placeholder="请输入姓名"
          />
        </el-form-item>
        <el-form-item label="账号:" style="margin-left: 20px">
          <el-input
            v-model="adminQuery.account"
            clearable
            placeholder="请输入账号"
          />
        </el-form-item>
        <el-form-item label="联系电话：" style="margin-left: 20px">
          <el-input
            v-model="adminQuery.phone"
            clearable
            placeholder="请输入联系电话"
          />
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

      <!-- 添加管理员 -->
      <el-button
        class="table-up-button"
        type="primary"
        icon="el-icon-plus"
        @click="onBtnAddClick"
      >添加管理员
      </el-button>

      <!-- 管理员信息展示表格 -->
      <el-table
        id="table"
        ref="table"
        v-loading="queryLoading"
        style="margin-top: 20px"
        :data="adminVOS"
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
        <el-table-column align="center" prop="account" label="账号" />
        <el-table-column
          align="center"
          prop="phone"
          label="联系电话"
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
                id="btnPassword"
                size="mini"
                type="warning"
                @click="onBtnPasswordClick(scope.$index, scope.row)"
              >修改密码
              </el-button>
              <el-button
                id="btnDelete"
                size="mini"
                icon="icon-label-delete"
                type="danger"
                @click="onBtnDeleteClick(scope.$index, scope.row)"
              >删除</el-button>
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
          :model="admin"
          status-icon
          :rules="rules"
          label-width="110px"
          width="100px"
        >
          <div v-if="dialogType === 'ADD' || dialogType === 'EDIT' ">
            <el-row>
              <el-col :span="11">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="admin.name" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="11" :offset="1">
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="admin.phone" clearable />
                </el-form-item>
              </el-col>
            </el-row>
            <div v-if="dialogType === 'ADD' ">
              <el-row>
                <el-col :span="11">
                  <el-form-item label="账号" prop="account">
                    <el-input v-model="admin.account" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="11" :offset="1">
                  <el-form-item label="密码" prop="password">
                    <el-input v-model="admin.password" clearable />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
          <div v-if="dialogType === 'PASS'">
            <el-row>
              <el-col>
                <el-form-item label="密码" prop="password">
                  <el-input v-model="admin.password" clearable />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
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
    </el-main>

  </el-container>
</template>

<script>
import {add, commonQuery, modify, queryAdminById, remove} from '@/api/admin'
import '@/utils/dialogdrap'
import Md5 from 'js-md5'

export default {
  data() {
    return {
      // 试图可见性控制变量
      queryLoading: false, // 查询按钮动画控制
      updateLoading: false, // 修改按钮动画控制
      dialogVisible: false, // 对话框可见性控制

      // 数据资源
      admin: {
        password: ''
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      adminVOS: [],

      // 查询条件
      adminQuery: {
        id: null,
        name: null,
        phone: null,
        account: null,
        pageNum: 1,
        pageSize: 10
      },

      // 菜单相关资源
      multipleSelection: [],

      // 对话框相关
      dialogType: 'ADD', // 标记对话框处于那种状态
      dialogTitle: '添加管理员',

      // 表单校验规则
      rules: {
        name: [
          { required: true, message: '姓名不能为空', trigger: 'change' }
        ],
        phone: [
          { required: true, message: '手机号不能为空', trigger: 'change' },
          {
            pattern: /^\d{11}$/,
            message: '请输入合法的手机号',
            trigger: 'change'
          }
        ],
        account: [
          { required: true, message: '账号不能为空', trigger: 'change' },
          {
            pattern: /^[\w.]{10}$/,
            message: '账号为10位，由数字、字母、下划线或点组成',
            trigger: 'change'
          }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'change' },
          {
            pattern: /^[\d]{6}$/g,
            message: '密码为6位纯数字',
            trigger: 'change'
          }
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
      this.adminQuery.type = 1
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
      queryAdminById(row.id).then((response) => {
        if (response != null) {
          this.admin = response.data
          this.dialogType = 'EDIT'
          this.dialogTitle = '编辑管理员信息'
          this.dialogVisible = true
        } else {
          this.$message.warning('该管理员已不存在')
        }
      })
    },
    /**
     * 重置视图状态
     **/
    resetUIToInitStatus() {
      this.adminQuery = {}
      this.adminQuery.type = 1
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
      this.adminQuery.pageSize = this.pageInfo.pageSize
      this.adminQuery.pageNum = this.pageInfo.pageNum
      commonQuery(this.adminQuery)
        .then((response) => {
          this.pageInfo = response.data.pageInfo
          this.pageInfo.total = Number(this.pageInfo.total)
          this.pageInfo.startRow = Number(this.pageInfo.startRow)
          this.pageInfo.endRow = Number(this.pageInfo.endRow)
          this.adminVOS = response.data.list
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
      const selectedAdminVO = this.adminVOS[index]
      if (selectedAdminVO === undefined || selectedAdminVO === null) {
        return
      }
      this.$confirm('确定删除记录吗').then(() => {
        remove(selectedAdminVO.id)
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
     * 修改密码
     **/
    onBtnPasswordClick(index, row) {
      const selectedAdminVO = this.adminVOS[index]
      if (selectedAdminVO === undefined || selectedAdminVO == null) {
        this.$message.info('没有对应记录可以编辑')
        return
      }
      queryAdminById(selectedAdminVO.id)
        .then((response) => {
          if (response != null) {
            this.admin = response.data
            this.admin.password = ''
            this.dialogType = 'PASS'
            this.dialogTitle = '编辑密码'
            this.dialogVisible = true
          } else {
            this.$message.warning('该管理员已不存在')
          }
        })
        .catch(() => {
          this.$message.error('网络异常')
        })
    },
    /**
     * 添加居民信息
     **/
    onBtnAddClick() {
      this.dialogType = 'ADD'
      this.dialogTitle = '添加管理员'
      this.admin.password = ''
      this.dialogVisible = true
    },
    /**
     * 编辑行数据
     **/
    onBtnEditClick(index, row) {
      const selectedAdminVO = this.adminVOS[index]
      if (selectedAdminVO === undefined || selectedAdminVO == null) {
        this.$message.info('没有对应记录可以编辑')
        return
      }
      queryAdminById(selectedAdminVO.id)
        .then((response) => {
          if (response.data != null) {
            this.admin = response.data
            this.dialogType = 'EDIT'
            this.dialogTitle = '编辑管理员信息'
            this.dialogVisible = true
          } else {
            this.$message.warning('该管理员已不存在')
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
            commonQuery({ account: this.admin.account }).then((res) => {
              if (res.data.list.length > 0) {
                this.$message.warning('该账号已存在')
                return
              }
              const data = Object.assign({}, this.admin)
              data.password = Md5(data.password)
              data.type = 1
              add(data)
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
            }).catch(() => {
              this.$message.error('网络异常')
            })
          } else if (this.dialogType === 'EDIT' || this.dialogType === 'PASS') {
            const data = Object.assign({}, this.admin)
            data.password = Md5(data.password)
            modify(data)
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
      this.dialogTitle = ''
      this.dialogType = ''
    },
    /**
     * 对话框消失时重置表单
     **/
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>
<style scoped>

.table-up-button {
  margin-left: 20px;
}

</style>
