<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Username" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Type" width="120px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
          <el-tag :type="row.is_staff ? 'danger':''">{{ row | userTypeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Groups" min-width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.groups | formatGroups }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Permissions" min-width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.action_permissions | formatPermiss }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Last Login" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.last_login | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Date Joined" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.date_joined | parseTime() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="350px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleModifyStatus(row,'deleted')">
            Delete
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" status-icon :model="temp" label-position="left" label-width="105px" style="width: 61.8%; margin-left:10%;">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="temp.username" placeholder="user name" />
        </el-form-item>
        <el-form-item v-if="showPwInput" label="密码" prop="password">
          <el-input v-model="temp.password" show-password placeholder="please enter your password" />
        </el-form-item>
        <el-form-item v-if="showPwInput" label="确认密码" prop="passwordRp">
          <el-input v-model="temp.passwordRp" show-password placeholder="please enter your password again" />
        </el-form-item>
        <el-form-item label="姓" prop="firstName">
          <el-input v-model="temp.firstName" placeholder="first name" />
        </el-form-item>
        <el-form-item label="名" prop="lastName">
          <el-input v-model="temp.lastName" placeholder="last name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" placeholder="email" />
        </el-form-item>
        <el-form-item label="普通管理员" prop="isStaff">
          <el-switch v-model="temp.isStaff" />
        </el-form-item>
        <el-form-item >
          <el-button v-if="dialogStatus === 'update'" type="text" @click="updatePw = !updatePw">{{ showPwInput ? "不更改密码" : "更改用户密码" }}</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, addUser, deleteUser, updateUser } from '@/api/user'
import waves from '@/directive/waves' // waves directive
import { fTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    formatPermiss: function(permiss) {
      let s = ''
      for (const p of permiss) {
        if (s) {
          s += '; '
        }
        s += p.app + ': ' + p.codename
      }
      return s
    },
    formatGroups: function(groups) {
      if (!groups || groups.length === 0) {
        return null
      } else {
        return groups.join('; ')
      }
    },
    parseTime: fTime,
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    userTypeFilter(user) {
      if (user.is_superuser) {
        return '超级用户'
      } else if (user.is_staff) {
        return '管理员'
      } else {
        return '普通用户'
      }
    }
  },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('password is required'))
      } else if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        if (this.temp.passwordRp !== '') {
          this.$refs.dataForm.validateField('passwordRp')
        }
        callback()
      }
    }
    const validatePasswordRp = (rule, value, callback) => {
      if (!value) {
        callback(new Error('please enter your password again'))
      } else if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else if (value !== this.temp.password) {
        callback(new Error('The password is not the same as before'))
      } else {
        callback()
      }
    }
    return {
      tableKey: 0,
      list: [],
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20
      },
      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        id: undefined,
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: undefined,
        passwordRp: undefined,
        isStaff: false,
        isActive: false,
        groups: [],
        actionPermissions: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      updatePw: false,
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        username: [
          { required: true, message: 'username is required', trigger: 'change' },
          { min: 3, max: 16, trigger: 'blur' }
        ],
        password: [{ type: 'password', required: true, trigger: 'change', validator: validatePassword }],
        passwordRp: [{ type: 'password', required: true, validator: validatePasswordRp, trigger: 'change' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
        firstName: [{ max: 16, trigger: 'change' }],
        lastName: [{ max: 16, trigger: 'change' }]
      }
    }
  },
  computed: {
    total: function() {
      return this.list ? this.list.length : 0
    },
    showPwInput: function() {
      if (this.dialogStatus !== 'update') {
        return true
      } else {
        return this.updatePw
      }
    }
  },
  created() {
    this.getList()
  },

  methods: {
    getList() {
      this.listLoading = true
      getUserList().then(response => {
        this.list = response
        this.listLoading = false
      })
    },
    handleModifyStatus(row, status) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleDelete(row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: undefined,
        passwordRp: undefined,
        isStaff: false,
        isActive: false,
        groups: [],
        actionPermissions: []
      }
      this.updatePw = false
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.author = 'vue-element-admin'
          const data = {
            username: this.temp.username,
            first_name: this.temp.firstName,
            last_name: this.temp.lastName,
            password: this.temp.password,
            is_staff: this.temp.isStaff,
            groups: this.temp.groups,
            action_permissions: this.temp.actionPermissions
          }
          addUser(data).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$message({
              message: 'Created Successfully',
              type: 'success'
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp.id = row.id
      this.temp.username = row.username
      this.temp.firstName = row.first_name
      this.temp.lastName = row.last_name
      this.temp.email = row.email
      this.temp.isStaff = row.is_staff
      this.temp.groups = row.groups
      this.temp.actionPermissions = row.action_permissions
      this.temp.isActive = row.is_active
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.updatePw = false
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = {
            'username': this.temp.username,
            'password': this.temp.password,
            'first_name': this.temp.firstName,
            'last_name': this.temp.lastName,
            'email': this.temp.email,
            'is_staff': this.temp.isStaff,
            'groups': this.temp.groups,
            'actionPermissions': this.temp.actionPermissions,
            'is_active': this.temp.isActive
          }
          updateUser(this.temp.id, tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          }).catch((data) => {
            this.$message({
              type: 'error',
              message: data.detail || '修改失败!'
            })
          })
        }
      })
    },
    handleDelete(row) {
      const id = row.id
      deleteUser(id).then(() => {
        row.status = status
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getList()
      }).catch((err) => {
        this.$message({
          type: 'error',
          message: err.detail || '删除失败!'
        })
      })
    }
  }
}
</script>

<style scoped>
  .line{
    text-align: center;
  }
</style>
