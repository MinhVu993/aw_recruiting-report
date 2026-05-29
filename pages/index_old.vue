<i18n>
    {
        "en": {
            "username": "User",
            "password": "Password",
            "login system": "Login System"
        },
        "cn": {
            "username": "使用者",
            "password": "密碼",
            "login system": "登入系統"
        },
        "vi": {
            "username": "Tài khoản",
            "password": "Mật khẩu",
            "login system": "Đăng nhập hệ thống"
        }
    }
</i18n>
<template>
    <v-row justify="center">
        <v-col sm="12" md="12" cols="12" class="d-flex align-center justify-center">
            <div>
                <v-card :loading="isLoading" class="mx-auto mt-5 elevation-20" min-width="450">
                    <v-toolbar color="teal" dense dark flat>
                        <v-toolbar-title class="text-center">
                            <i>Recruiting-report</i>
                        </v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                        <v-form ref="form" v-model="valid">
                            <v-text-field :rules="[v => !!v || 'Item is required']" required hide-details="" dense
                                class="teal--text pb-2" color="teal" v-model="username" :label="$t('username')"
                                outlined></v-text-field>
                            <v-text-field :rules="[v => !!v || 'Item is required']" required hide-details="" dense
                                class="teal--text pb-2" color="teal" @keypress.enter="doLogin()" v-model="password"
                                :label="$t('password')" type="password" outlined></v-text-field>
                        </v-form>
                        <v-divider class="mb-1"></v-divider>
                        <v-radio-group hide-details="" row v-model="lang">
                            <v-radio color="teal" @click.prevent.stop="$i18n.setLocale('en')" label="English"
                                value="en"></v-radio>
                            <v-radio color="teal" @click.prevent.stop="$i18n.setLocale('cn')" label="中文"
                                value="cn"></v-radio>
                            <v-radio color="teal" @click.prevent.stop="$i18n.setLocale('vi')" label="Tiếng Việt"
                                value="vi"></v-radio>
                        </v-radio-group>
                        <v-divider class="mt-3"></v-divider>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn :loading="isLoading" class="px-4" @click="doLogin()" color="teal" dark>
                            <v-icon left> mdi-login-variant</v-icon>
                            {{ $t('login') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </div>
        </v-col>
    </v-row>
</template>

<script>
export default {
    layout: 'blank2',
    data() {
        return {
            username: '',
            password: '',
            api: '/api/global-user/',
            data: {},
            userRole: [],
            lang: 'en',
            isLoading: false,
            valid: false,
        }
    },
    methods: {
        async doLogin() {
            if (this.$refs.form.validate()) {
                this.isLoading = true;
                let params = {
                    username: this.username,
                    password: this.password,
                    app: 'aw-recruiting-report',
                };
                // Testing with token generated
                await this.$axios.post(this.api + 'login', params).then(res => {
                    if (res.status == 200) {
                        this.data = res.data;
                        this.isLoading = false;
                        if (this.data != "wrong") {
                            localStorage.setItem("session-token", this.data.session_token);
                            this.$session.set('aw-recruiting-report', {
                                username: this.username,
                                dept: this.data.dept,
                                empno: this.data.empno,
                                name: this.data.name,
                                location: this.data.location,
                            });
                            let _apps = JSON.parse(this.data.app_roles);
                            let limit_role = JSON.parse(this.data.limit_role);
                            let authArr = ['admin', 'review'];

                            // Find matching app in both arrays
                            let appInApps = _apps.find(x => x.app === 'aw-recruiting-report');
                            let appInLimitRole = limit_role.find(x => x.app === 'aw-recruiting-report');

                            if (appInApps && appInLimitRole && authArr.includes(appInApps.role) && this.data.location === 'aw') {
                                this.$router.push({
                                    path: '/candidate-listing'
                                });
                            } else {
                                alert(`You're not authorize to access this application !\n Tài khoản của bạn không được truy cập vào ứng dụng này !\n 您無權訪問此應用程序 !`)
                            }
                        } else {
                            alert('Wrong username or password ! \n Sai tên đăng nhập hoặc mật khẩu');
                        }
                    }
                }).catch(err => {
                    alert('Your account has not been configured with role limit !\n Tài khoản của bạn bị giới hạn quyền truy cập !\n 您的账户已被限制访问权限。!');
                });
            }
        },
    },
    mounted() {
        if (
        this.$session.has("vg-portal") ) 
        { let ss = this.$session.get("vg-portal");
            if (ss.has_acc === true) {
                this.username = ss.username;
                this.password = ss.password;
                setTimeout(() => {
                    this.doLogin();
                }, 500);
            }
        }
    }
}
</script>
