// module.exports = {
//   devServer: {
//     open: true,
//     host: 'localhost',
//     port: 5000,
//     https: false,
//     hotOnly: false,
//     proxy: { // 配置跨域
//         '/api': {
//             target: '',	//接口域名
//             ws: true,	//是否代理websockets
//             changOrigin: true,	//是否跨域
//             pathRewrite: {		//重置路径
//                 '^/api': ''
//             }
//         }
//     },
//     before: app => { }
// }
// }