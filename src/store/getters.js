const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  access: state => state.user.access,
  avatar: state => state.user.avatar,
  name: state => state.user.username,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes
}
export default getters
