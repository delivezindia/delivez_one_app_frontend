const fs = require('fs');

// Fix 1: luggage-delivery-pricing.ts
const pricingPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery-pricing.ts';
let pricingContent = fs.readFileSync(pricingPath, 'utf8');
pricingContent = pricingContent.replace(
  `  const speedObj = input.schedule?.delivery_speed;
  const speedType = (typeof speedObj === 'object' ? speedObj?.type : (speedObj || input.deliverySpeed || 'standard')).toString().toLowerCase();`,
  `  const speedObj = input.schedule?.delivery_speed;
  const speedType = (typeof speedObj === 'object' && speedObj !== null ? (speedObj as any).type : (speedObj || input.deliverySpeed || 'standard')).toString().toLowerCase();`
);
fs.writeFileSync(pricingPath, pricingContent, 'utf8');

// Fix 2: luggage-delivery.controller.ts
const ctrlPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery.controller.ts';
let ctrlContent = fs.readFileSync(ctrlPath, 'utf8');
ctrlContent = ctrlContent.replace(
  `  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {`,
  `  if (String(req.user?.role) !== 'ADMIN' && String(req.user?.role) !== 'SUPER_ADMIN') {`
);

ctrlContent = ctrlContent.replace(
  `export const verifyLuggageDeliveryOtpHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;`,
  `export const verifyLuggageDeliveryOtpHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');`
);

ctrlContent = ctrlContent.replace(
  `export const submitLuggageDeliveryPodHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;`,
  `export const submitLuggageDeliveryPodHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');`
);

ctrlContent = ctrlContent.replace(
  `export const advanceLuggageDeliveryMilestoneHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;`,
  `export const advanceLuggageDeliveryMilestoneHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');`
);

ctrlContent = ctrlContent.replace(
  `export const processLuggageDeliverySandboxPaymentHandler: RequestHandler = async (req, res) => {
  const id = req.params.id;`,
  `export const processLuggageDeliverySandboxPaymentHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');`
);

fs.writeFileSync(ctrlPath, ctrlContent, 'utf8');
console.log('Applied fixes to pricing and controller.');
