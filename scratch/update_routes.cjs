const fs = require('fs');
const routesPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/routes.ts';
let routes = fs.readFileSync(routesPath, 'utf8');

// 1. Add imports if not present
if (!routes.includes('courierDeliveryDispatcherRouter')) {
  routes = `import { courierDeliveryDispatcherRouter } from './modules/confidential-courier/courier-delivery-dispatcher.router.js';\nimport { vaultCourierRouter } from './modules/confidential-courier/vault-courier.routes.js';\n` + routes;
}

// 2. Replace the route bindings for courier-delivery and confidential
routes = routes.replace(
  "apiRouter.use('/courier-delivery', personalCourierRouter);",
  "apiRouter.use('/courier-delivery', courierDeliveryDispatcherRouter);"
);

if (!routes.includes("apiRouter.use('/confidential-delivery', vaultCourierRouter);")) {
  routes = routes.replace(
    "apiRouter.use('/confidential-delivery', confidentialDeliveryRouter);",
    "apiRouter.use('/confidential-delivery', vaultCourierRouter);\napiRouter.use('/confidential-delivery', confidentialDeliveryRouter);"
  );
}

if (!routes.includes("apiRouter.use('/confidential-courier', vaultCourierRouter);")) {
  routes = routes.replace(
    "apiRouter.use('/confidential-courier', confidentialCourierRouter);",
    "apiRouter.use('/confidential-courier', vaultCourierRouter);\napiRouter.use('/confidential-courier', confidentialCourierRouter);"
  );
}

if (!routes.includes("apiRouter.use('/vault', vaultCourierRouter);")) {
  routes = routes.replace(
    "apiRouter.use('/vault', confidentialDeliveryRouter);",
    "apiRouter.use('/vault', vaultCourierRouter);\napiRouter.use('/vault', confidentialDeliveryRouter);"
  );
}

fs.writeFileSync(routesPath, routes, 'utf8');
console.log('Successfully updated backend routes.ts');
