const fs = require('fs');

const pricingPath = 'C:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/luggage-delivery/luggage-delivery-pricing.ts';
let pricing = fs.readFileSync(pricingPath, 'utf8');

const targetInterface = `export interface CalculateLuggageMasterQuoteInput {
  serviceId?: string;
  service?: {
    service_id?: string;
  };
  routeType?: string;
  route?: {
    route_type?: string;
    is_multi_stop?: boolean;
    stops?: any[];
  };
  luggage?: {
    total_pieces?: number;
    total_weight_kg?: number;
    items?: MasterLuggageItemInput[];
  };
  luggageItems?: MasterLuggageItemInput[];
  add_ons?: {
    selected_items?: Array<{ id?: number | string; code?: string; title?: string; quantity?: number }>;
  };
  selectedAddOns?: Array<string | { id?: number | string; code?: string; quantity?: number }>;
  luggage_protection?: {
    enabled?: boolean;
    selected_items?: any[];
  };
  selectedProtections?: any[];
  airport_assistance?: {
    enabled?: boolean;
    selected_services?: any[];
  };
  selectedAirportAssistance?: any[];
  schedule?: {
    delivery_speed?: {
      type?: string;
      label?: string;
      additional_fee?: number;
    } | string;
  };
  deliverySpeed?: string | number;
  promo?: {
    coupon_code?: string;
    apply_coupon?: boolean;
  };
  couponCode?: string;
  distance_km?: number;
  distanceKm?: number;
}`;

const replacementInterface = `export interface CalculateLuggageMasterQuoteInput {
  service_type?: string;
  serviceType?: string;
  serviceId?: string;
  service?: {
    service_id?: string;
  };
  routeType?: string;
  route?: {
    route_type?: string;
    is_multi_stop?: boolean;
    stops?: any[];
  };
  luggage?: {
    total_pieces?: number;
    total_weight_kg?: number;
    items?: MasterLuggageItemInput[];
  };
  luggageItems?: MasterLuggageItemInput[];
  luggage_items?: MasterLuggageItemInput[];
  add_ons?: {
    selected_items?: Array<{ id?: number | string; code?: string; title?: string; quantity?: number }>;
  } | any[];
  selectedAddOns?: Array<string | { id?: number | string; code?: string; quantity?: number }>;
  luggage_protection?: {
    enabled?: boolean;
    selected_items?: any[];
  } | any[];
  protections?: any[];
  selectedProtections?: any[];
  airport_assistance?: {
    enabled?: boolean;
    selected_services?: any[];
  } | any[];
  airportAssistance?: any[];
  selectedAirportAssistance?: any[];
  schedule?: {
    delivery_speed?: {
      type?: string;
      label?: string;
      additional_fee?: number;
    } | string;
  };
  deliverySpeed?: string | number;
  promo?: {
    coupon_code?: string;
    apply_coupon?: boolean;
  };
  couponCode?: string;
  coupon_code?: string;
  applied_coupon?: {
    code?: string;
    discount_type?: string;
    discount_value?: number;
    discount_amount?: number;
  };
  distance_km?: number;
  distanceKm?: number;
  [key: string]: any;
}`;

pricing = pricing.replace(targetInterface, replacementInterface);

pricing = pricing.replace(
  `  const serviceId =
    input.service?.service_id ||
    input.serviceId ||
    'home_airport';`,
  `  const serviceId =
    input.service?.service_id ||
    input.service_type ||
    input.serviceType ||
    input.serviceId ||
    'home_airport';`
);

pricing = pricing.replace(
  `  const rawLuggage = input.luggage?.items || input.luggageItems || [];`,
  `  const rawLuggage = input.luggage?.items || input.luggage_items || input.luggageItems || [];`
);

fs.writeFileSync(pricingPath, pricing, 'utf8');
console.log('Successfully patched CalculateLuggageMasterQuoteInput');
