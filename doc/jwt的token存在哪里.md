# jwt的token前段保存方案
jwt 的token 分两种（access 和 refresh），在通过账号密码请求登录接口的时候会同时返回这个两个token

access token的过期时间短， 用来确认用户身份
refresh token 的过期时间长， 用来获取新的access token

access token 保存在cookies里面， 这样可以实现，新建标签页也可以免登录
refresh token 保密性要求更高， 如果保存在cookies里面的话，每次请求后端，都会自动
带上这个refresh token， 和 access token 无异。refresh token 保存在 session storage
关闭会话，token 即清除， 也不会每次自动发给后端。