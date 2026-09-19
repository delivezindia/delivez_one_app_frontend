import 'dart:convert';

/// Delivez Luggage Delivery Master Contract Models (Flutter / Dart)
/// Strictly aligns with MASTER BOOKING CONTRACT JSON.

// ==========================================
// 1. CONTACT & ADDRESS
// ==========================================
class LuggageContact {
  final String fullName;
  final String mobile;
  final String? alternateMobile;
  final String? email;
  final String? notes;

  LuggageContact({
    required this.fullName,
    required this.mobile,
    this.alternateMobile,
    this.email,
    this.notes,
  });

  factory LuggageContact.fromJson(Map<String, dynamic> json) {
    return LuggageContact(
      fullName: json['full_name'] ?? json['fullName'] ?? '',
      mobile: json['mobile'] ?? '',
      alternateMobile: json['alternate_mobile'] ?? json['alternateMobile'],
      email: json['email'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() => {
    'full_name': fullName,
    'mobile': mobile,
    if (alternateMobile != null) 'alternate_mobile': alternateMobile,
    if (email != null) 'email': email,
    if (notes != null) 'notes': notes,
  };
}

class AirportSpecificDetails {
  final String? airlineName;
  final String? flightNumber;
  final String? pnr;
  final String? terminal;
  final String? departureTime;
  final String? arrivalTime;
  final String? gateNumber;
  final String? meetingPoint;

  AirportSpecificDetails({
    this.airlineName,
    this.flightNumber,
    this.pnr,
    this.terminal,
    this.departureTime,
    this.arrivalTime,
    this.gateNumber,
    this.meetingPoint,
  });

  factory AirportSpecificDetails.fromJson(Map<String, dynamic> json) {
    return AirportSpecificDetails(
      airlineName: json['airline_name'] ?? json['airlineName'],
      flightNumber: json['flight_number'] ?? json['flightNumber'],
      pnr: json['pnr'],
      terminal: json['terminal'],
      departureTime: json['departure_time'] ?? json['departureTime'],
      arrivalTime: json['arrival_time'] ?? json['arrivalTime'],
      gateNumber: json['gate_number'] ?? json['gateNumber'],
      meetingPoint: json['meeting_point'] ?? json['meetingPoint'],
    );
  }

  Map<String, dynamic> toJson() => {
    if (airlineName != null) 'airline_name': airlineName,
    if (flightNumber != null) 'flight_number': flightNumber,
    if (pnr != null) 'pnr': pnr,
    if (terminal != null) 'terminal': terminal,
    if (departureTime != null) 'departure_time': departureTime,
    if (arrivalTime != null) 'arrival_time': arrivalTime,
    if (gateNumber != null) 'gate_number': gateNumber,
    if (meetingPoint != null) 'meeting_point': meetingPoint,
  };
}

class HotelSpecificDetails {
  final String? hotelName;
  final String? roomNumber;
  final String? guestName;
  final bool frontDeskHandover;
  final String? checkInDate;
  final String? checkOutDate;

  HotelSpecificDetails({
    this.hotelName,
    this.roomNumber,
    this.guestName,
    this.frontDeskHandover = false,
    this.checkInDate,
    this.checkOutDate,
  });

  factory HotelSpecificDetails.fromJson(Map<String, dynamic> json) {
    return HotelSpecificDetails(
      hotelName: json['hotel_name'] ?? json['hotelName'],
      roomNumber: json['room_number'] ?? json['roomNumber'],
      guestName: json['guest_name'] ?? json['guestName'],
      frontDeskHandover: json['front_desk_handover'] ?? json['frontDeskHandover'] ?? false,
      checkInDate: json['check_in_date'] ?? json['checkInDate'],
      checkOutDate: json['check_out_date'] ?? json['checkOutDate'],
    );
  }

  Map<String, dynamic> toJson() => {
    if (hotelName != null) 'hotel_name': hotelName,
    if (roomNumber != null) 'room_number': roomNumber,
    if (guestName != null) 'guest_name': guestName,
    'front_desk_handover': frontDeskHandover,
    if (checkInDate != null) 'check_in_date': checkInDate,
    if (checkOutDate != null) 'check_out_date': checkOutDate,
  };
}

class LuggageAddressPoint {
  final String locationType; // 'home' | 'airport' | 'hotel' | 'office' | 'custom'
  final String fullAddress;
  final String? addressLine2;
  final String? landmark;
  final String city;
  final String? state;
  final String pincode;
  final double? latitude;
  final double? longitude;
  final LuggageContact contact;
  final AirportSpecificDetails? airportSpecific;
  final HotelSpecificDetails? hotelSpecific;

  LuggageAddressPoint({
    required this.locationType,
    required this.fullAddress,
    this.addressLine2,
    this.landmark,
    required this.city,
    this.state,
    required this.pincode,
    this.latitude,
    this.longitude,
    required this.contact,
    this.airportSpecific,
    this.hotelSpecific,
  });

  factory LuggageAddressPoint.fromJson(Map<String, dynamic> json) {
    return LuggageAddressPoint(
      locationType: json['location_type'] ?? json['locationType'] ?? 'home',
      fullAddress: json['full_address'] ?? json['fullAddress'] ?? '',
      addressLine2: json['address_line_2'] ?? json['addressLine2'],
      landmark: json['landmark'],
      city: json['city'] ?? '',
      state: json['state'],
      pincode: json['pincode'] ?? '',
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      contact: LuggageContact.fromJson(json['contact'] ?? {}),
      airportSpecific: json['airport_specific'] != null
          ? AirportSpecificDetails.fromJson(json['airport_specific'])
          : null,
      hotelSpecific: json['hotel_specific'] != null
          ? HotelSpecificDetails.fromJson(json['hotel_specific'])
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'location_type': locationType,
    'full_address': fullAddress,
    if (addressLine2 != null) 'address_line_2': addressLine2,
    if (landmark != null) 'landmark': landmark,
    'city': city,
    if (state != null) 'state': state,
    'pincode': pincode,
    if (latitude != null) 'latitude': latitude,
    if (longitude != null) 'longitude': longitude,
    'contact': contact.toJson(),
    if (airportSpecific != null) 'airport_specific': airportSpecific!.toJson(),
    if (hotelSpecific != null) 'hotel_specific': hotelSpecific!.toJson(),
  };
}

class LuggageStopPoint {
  final int stopNumber;
  final String locationType;
  final String fullAddress;
  final String? landmark;
  final String pincode;
  final String contactName;
  final String contactMobile;
  final String action; // 'pickup' | 'drop' | 'inspection'

  LuggageStopPoint({
    required this.stopNumber,
    required this.locationType,
    required this.fullAddress,
    this.landmark,
    required this.pincode,
    required this.contactName,
    required this.contactMobile,
    this.action = 'drop',
  });

  factory LuggageStopPoint.fromJson(Map<String, dynamic> json) {
    return LuggageStopPoint(
      stopNumber: json['stop_number'] ?? json['stopNumber'] ?? 1,
      locationType: json['location_type'] ?? json['locationType'] ?? 'custom',
      fullAddress: json['full_address'] ?? json['fullAddress'] ?? '',
      landmark: json['landmark'],
      pincode: json['pincode'] ?? '',
      contactName: json['contact_name'] ?? json['contactName'] ?? '',
      contactMobile: json['contact_mobile'] ?? json['contactMobile'] ?? '',
      action: json['action'] ?? 'drop',
    );
  }

  Map<String, dynamic> toJson() => {
    'stop_number': stopNumber,
    'location_type': locationType,
    'full_address': fullAddress,
    if (landmark != null) 'landmark': landmark,
    'pincode': pincode,
    'contact_name': contactName,
    'contact_mobile': contactMobile,
    'action': action,
  };
}

// ==========================================
// 2. LUGGAGE ITEMS & SPECS
// ==========================================
class LuggageItemDimensions {
  final double lengthCm;
  final double widthCm;
  final double heightCm;

  LuggageItemDimensions({
    this.lengthCm = 45,
    this.widthCm = 30,
    this.heightCm = 20,
  });

  factory LuggageItemDimensions.fromJson(Map<String, dynamic> json) {
    return LuggageItemDimensions(
      lengthCm: (json['length_cm'] as num?)?.toDouble() ?? 45,
      widthCm: (json['width_cm'] as num?)?.toDouble() ?? 30,
      heightCm: (json['height_cm'] as num?)?.toDouble() ?? 20,
    );
  }

  Map<String, dynamic> toJson() => {
    'length_cm': lengthCm,
    'width_cm': widthCm,
    'height_cm': heightCm,
  };
}

class LuggageItem {
  final String itemId;
  final String bagType; // 'small' | 'medium' | 'large' | 'extra_large' | 'odd_size'
  final int quantity;
  final double declaredWeightKg;
  final double? measuredWeightKg;
  final LuggageItemDimensions dimensions;
  final bool isFragile;
  final bool isValuable;
  final String description;
  final String? securitySealNumber;
  final String? tagBarcode;
  final List<String> photoUrls;

  LuggageItem({
    required this.itemId,
    required this.bagType,
    this.quantity = 1,
    required this.declaredWeightKg,
    this.measuredWeightKg,
    required this.dimensions,
    this.isFragile = false,
    this.isValuable = false,
    this.description = '',
    this.securitySealNumber,
    this.tagBarcode,
    this.photoUrls = const [],
  });

  factory LuggageItem.fromJson(Map<String, dynamic> json) {
    return LuggageItem(
      itemId: json['item_id'] ?? json['itemId'] ?? 'item_1',
      bagType: json['bag_type'] ?? json['type'] ?? 'medium',
      quantity: json['quantity'] ?? 1,
      declaredWeightKg: (json['declared_weight_kg'] ?? json['weight_kg'] ?? 15).toDouble(),
      measuredWeightKg: (json['measured_weight_kg'] as num?)?.toDouble(),
      dimensions: LuggageItemDimensions.fromJson(json['dimensions'] ?? {}),
      isFragile: json['is_fragile'] ?? json['isFragile'] ?? false,
      isValuable: json['is_valuable'] ?? json['isValuable'] ?? false,
      description: json['description'] ?? '',
      securitySealNumber: json['security_seal_number'] ?? json['securitySealNumber'],
      tagBarcode: json['tag_barcode'] ?? json['tagBarcode'],
      photoUrls: List<String>.from(json['photo_urls'] ?? []),
    );
  }

  Map<String, dynamic> toJson() => {
    'item_id': itemId,
    'bag_type': bagType,
    'quantity': quantity,
    'declared_weight_kg': declaredWeightKg,
    if (measuredWeightKg != null) 'measured_weight_kg': measuredWeightKg,
    'dimensions': dimensions.toJson(),
    'is_fragile': isFragile,
    'is_valuable': isValuable,
    'description': description,
    if (securitySealNumber != null) 'security_seal_number': securitySealNumber,
    if (tagBarcode != null) 'tag_barcode': tagBarcode,
    'photo_urls': photoUrls,
  };
}

// ==========================================
// 3. SCHEDULE & SPEED
// ==========================================
class LuggageDeliverySpeed {
  final String type; // 'standard' | 'express' | 'precise_time' | 'schedule_later'
  final String label;
  final double surcharge;

  LuggageDeliverySpeed({
    required this.type,
    required this.label,
    this.surcharge = 0,
  });

  factory LuggageDeliverySpeed.fromJson(Map<String, dynamic> json) {
    return LuggageDeliverySpeed(
      type: json['type'] ?? 'standard',
      label: json['label'] ?? 'Standard (3-4 hrs)',
      surcharge: (json['surcharge'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'type': type,
    'label': label,
    'surcharge': surcharge,
  };
}

class LuggageSchedule {
  final String pickupType; // 'instant' | 'scheduled'
  final String scheduledPickupTime;
  final String? scheduledDeliveryTime;
  final LuggageDeliverySpeed deliverySpeed;
  final String? flightDepartureTime;
  final String? flightArrivalTime;
  final int bufferMinutes;

  LuggageSchedule({
    this.pickupType = 'scheduled',
    required this.scheduledPickupTime,
    this.scheduledDeliveryTime,
    required this.deliverySpeed,
    this.flightDepartureTime,
    this.flightArrivalTime,
    this.bufferMinutes = 180,
  });

  factory LuggageSchedule.fromJson(Map<String, dynamic> json) {
    return LuggageSchedule(
      pickupType: json['pickup_type'] ?? 'scheduled',
      scheduledPickupTime: json['pickup_time'] ?? json['scheduled_pickup_time'] ?? DateTime.now().toIso8601String(),
      scheduledDeliveryTime: json['delivery_time'] ?? json['scheduled_delivery_time'],
      deliverySpeed: LuggageDeliverySpeed.fromJson(
        json['delivery_speed'] is Map<String, dynamic> ? json['delivery_speed'] : {'type': json['delivery_speed'] ?? 'standard', 'label': 'Standard'}
      ),
      flightDepartureTime: json['flight_departure_time'],
      flightArrivalTime: json['flight_arrival_time'],
      bufferMinutes: json['buffer_minutes'] ?? 180,
    );
  }

  Map<String, dynamic> toJson() => {
    'pickup_type': pickupType,
    'pickup_time': scheduledPickupTime,
    if (scheduledDeliveryTime != null) 'delivery_time': scheduledDeliveryTime,
    'delivery_speed': deliverySpeed.toJson(),
    if (flightDepartureTime != null) 'flight_departure_time': flightDepartureTime,
    if (flightArrivalTime != null) 'flight_arrival_time': flightArrivalTime,
    'buffer_minutes': bufferMinutes,
  };
}

// ==========================================
// 4. ADD-ONS, PROTECTIONS & ASSISTANCE
// ==========================================
class LuggageProtectionItem {
  final String id;
  final String title;
  final double price;
  final String? description;

  LuggageProtectionItem({
    required this.id,
    required this.title,
    required this.price,
    this.description,
  });

  factory LuggageProtectionItem.fromJson(Map<String, dynamic> json) {
    return LuggageProtectionItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      description: json['description'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'price': price,
    if (description != null) 'description': description,
  };
}

class AirportAssistanceItem {
  final String id;
  final String title;
  final double price;
  final String? description;

  AirportAssistanceItem({
    required this.id,
    required this.title,
    required this.price,
    this.description,
  });

  factory AirportAssistanceItem.fromJson(Map<String, dynamic> json) {
    return AirportAssistanceItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      description: json['description'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'price': price,
    if (description != null) 'description': description,
  };
}

class LuggageAddOnItem {
  final dynamic id;
  final String code;
  final String title;
  final double price;
  final int quantity;
  final String? description;

  LuggageAddOnItem({
    this.id,
    required this.code,
    required this.title,
    required this.price,
    this.quantity = 1,
    this.description,
  });

  factory LuggageAddOnItem.fromJson(Map<String, dynamic> json) {
    return LuggageAddOnItem(
      id: json['id'],
      code: json['code'] ?? String(json['id'] ?? ''),
      title: json['title'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      quantity: json['quantity'] ?? 1,
      description: json['description'],
    );
  }

  Map<String, dynamic> toJson() => {
    if (id != null) 'id': id,
    'code': code,
    'title': title,
    'price': price,
    'quantity': quantity,
    if (description != null) 'description': description,
  };
}

// ==========================================
// 5. PRICING, TAX & DISCOUNT
// ==========================================
class LuggageTaxBreakdown {
  final String taxType;
  final double taxRate;
  final double cgstRate;
  final double sgstRate;
  final double igstRate;
  final double cgstAmount;
  final double sgstAmount;
  final double igstAmount;
  final double totalTax;

  LuggageTaxBreakdown({
    this.taxType = 'GST',
    this.taxRate = 18,
    this.cgstRate = 9,
    this.sgstRate = 9,
    this.igstRate = 0,
    required this.cgstAmount,
    required this.sgstAmount,
    this.igstAmount = 0,
    required this.totalTax,
  });

  factory LuggageTaxBreakdown.fromJson(Map<String, dynamic> json) {
    return LuggageTaxBreakdown(
      taxType: json['tax_type'] ?? 'GST',
      taxRate: (json['tax_rate'] as num?)?.toDouble() ?? 18,
      cgstRate: (json['cgst_rate'] as num?)?.toDouble() ?? 9,
      sgstRate: (json['sgst_rate'] as num?)?.toDouble() ?? 9,
      igstRate: (json['igst_rate'] as num?)?.toDouble() ?? 0,
      cgstAmount: (json['cgst_amount'] as num?)?.toDouble() ?? 0,
      sgstAmount: (json['sgst_amount'] as num?)?.toDouble() ?? 0,
      igstAmount: (json['igst_amount'] as num?)?.toDouble() ?? 0,
      totalTax: (json['total_tax'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'tax_type': taxType,
    'tax_rate': taxRate,
    'cgst_rate': cgstRate,
    'sgst_rate': sgstRate,
    'igst_rate': igstRate,
    'cgst_amount': cgstAmount,
    'sgst_amount': sgstAmount,
    'igst_amount': igstAmount,
    'total_tax': totalTax,
  };
}

class LuggageDiscountBreakdown {
  final String? couponCode;
  final String? discountType;
  final double discountAmount;

  LuggageDiscountBreakdown({
    this.couponCode,
    this.discountType,
    this.discountAmount = 0,
  });

  factory LuggageDiscountBreakdown.fromJson(Map<String, dynamic> json) {
    return LuggageDiscountBreakdown(
      couponCode: json['coupon_code'],
      discountType: json['discount_type'],
      discountAmount: (json['discount_amount'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'coupon_code': couponCode,
    'discount_type': discountType,
    'discount_amount': discountAmount,
  };
}

class LuggagePricingBreakdown {
  final String currency;
  final double distanceKm;
  final double baseFare;
  final double distanceFee;
  final double luggageHandlingFee;
  final double airportHandlingFee;
  final double hotelHandlingFee;
  final double deliverySpeedFee;
  final double luggageProtectionFee;
  final double airportAssistanceFee;
  final double addOnFee;
  final double subtotal;
  final LuggageTaxBreakdown tax;
  final LuggageDiscountBreakdown discount;
  final double totalAmount;

  LuggagePricingBreakdown({
    this.currency = 'INR',
    required this.distanceKm,
    required this.baseFare,
    this.distanceFee = 0,
    this.luggageHandlingFee = 0,
    this.airportHandlingFee = 0,
    this.hotelHandlingFee = 0,
    this.deliverySpeedFee = 0,
    this.luggageProtectionFee = 0,
    this.airportAssistanceFee = 0,
    this.addOnFee = 0,
    required this.subtotal,
    required this.tax,
    required this.discount,
    required this.totalAmount,
  });

  factory LuggagePricingBreakdown.fromJson(Map<String, dynamic> json) {
    return LuggagePricingBreakdown(
      currency: json['currency'] ?? 'INR',
      distanceKm: (json['distance_km'] as num?)?.toDouble() ?? 0,
      baseFare: (json['base_fare'] as num?)?.toDouble() ?? 0,
      distanceFee: (json['distance_fee'] as num?)?.toDouble() ?? 0,
      luggageHandlingFee: (json['luggage_handling_fee'] as num?)?.toDouble() ?? 0,
      airportHandlingFee: (json['airport_handling_fee'] as num?)?.toDouble() ?? 0,
      hotelHandlingFee: (json['hotel_handling_fee'] as num?)?.toDouble() ?? 0,
      deliverySpeedFee: (json['delivery_speed_fee'] as num?)?.toDouble() ?? 0,
      luggageProtectionFee: (json['luggage_protection_fee'] as num?)?.toDouble() ?? 0,
      airportAssistanceFee: (json['airport_assistance_fee'] as num?)?.toDouble() ?? 0,
      addOnFee: (json['add_on_fee'] as num?)?.toDouble() ?? 0,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0,
      tax: LuggageTaxBreakdown.fromJson(json['tax'] ?? {}),
      discount: LuggageDiscountBreakdown.fromJson(json['discount'] ?? {}),
      totalAmount: (json['total_amount'] as num?)?.toDouble() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'currency': currency,
    'distance_km': distanceKm,
    'base_fare': baseFare,
    'distance_fee': distanceFee,
    'luggage_handling_fee': luggageHandlingFee,
    'airport_handling_fee': airportHandlingFee,
    'hotel_handling_fee': hotelHandlingFee,
    'delivery_speed_fee': deliverySpeedFee,
    'luggage_protection_fee': luggageProtectionFee,
    'airport_assistance_fee': airportAssistanceFee,
    'add_on_fee': addOnFee,
    'subtotal': subtotal,
    'tax': tax.toJson(),
    'discount': discount.toJson(),
    'total_amount': totalAmount,
  };
}

// ==========================================
// 6. GST INVOICE & PAYMENT
// ==========================================
class LuggageGstInvoice {
  final bool required;
  final String? companyName;
  final String? gstin;
  final String? billingAddress;
  final String? stateCode;
  final String? invoiceNumber;
  final String? invoiceUrl;

  LuggageGstInvoice({
    this.required = false,
    this.companyName,
    this.gstin,
    this.billingAddress,
    this.stateCode,
    this.invoiceNumber,
    this.invoiceUrl,
  });

  factory LuggageGstInvoice.fromJson(Map<String, dynamic> json) {
    return LuggageGstInvoice(
      required: json['required'] ?? false,
      companyName: json['company_name'] ?? json['companyName'],
      gstin: json['gstin'],
      billingAddress: json['billing_address'] ?? json['billingAddress'],
      stateCode: json['state_code'] ?? json['stateCode'],
      invoiceNumber: json['invoice_number'] ?? json['invoiceNumber'],
      invoiceUrl: json['invoice_url'] ?? json['invoiceUrl'],
    );
  }

  Map<String, dynamic> toJson() => {
    'required': required,
    if (companyName != null) 'company_name': companyName,
    if (gstin != null) 'gstin': gstin,
    if (billingAddress != null) 'billing_address': billingAddress,
    if (stateCode != null) 'state_code': stateCode,
    if (invoiceNumber != null) 'invoice_number': invoiceNumber,
    if (invoiceUrl != null) 'invoice_url': invoiceUrl,
  };
}

class LuggagePaymentDetails {
  final String paymentId;
  final String gateway;
  final String paymentMethod;
  final String status;
  final String currency;
  final double amountPaid;
  final String paidAt;
  final String receiptNumber;
  final String? transactionRef;

  LuggagePaymentDetails({
    required this.paymentId,
    this.gateway = 'razorpay',
    required this.paymentMethod,
    required this.status,
    this.currency = 'INR',
    required this.amountPaid,
    required this.paidAt,
    required this.receiptNumber,
    this.transactionRef,
  });

  factory LuggagePaymentDetails.fromJson(Map<String, dynamic> json) {
    return LuggagePaymentDetails(
      paymentId: json['payment_id'] ?? json['paymentId'] ?? '',
      gateway: json['gateway'] ?? 'razorpay',
      paymentMethod: json['payment_method'] ?? json['paymentMethod'] ?? 'upi',
      status: json['status'] ?? 'pending',
      currency: json['currency'] ?? 'INR',
      amountPaid: (json['amount_paid'] as num?)?.toDouble() ?? 0,
      paidAt: json['paid_at'] ?? '',
      receiptNumber: json['receipt_number'] ?? '',
      transactionRef: json['transaction_ref'] ?? json['transactionRef'],
    );
  }

  Map<String, dynamic> toJson() => {
    'payment_id': paymentId,
    'gateway': gateway,
    'payment_method': paymentMethod,
    'status': status,
    'currency': currency,
    'amount_paid': amountPaid,
    'paid_at': paidAt,
    'receipt_number': receiptNumber,
    if (transactionRef != null) 'transaction_ref': transactionRef,
  };
}

// ==========================================
// 7. TIMELINE & FULL MASTER BOOKING
// ==========================================
class LuggageTimelineMilestone {
  final int step;
  final String code;
  final String title;
  final String? description;
  final String? timestamp;
  final bool completed;
  final String? location;
  final String? performedBy;

  LuggageTimelineMilestone({
    required this.step,
    required this.code,
    required this.title,
    this.description,
    this.timestamp,
    this.completed = false,
    this.location,
    this.performedBy,
  });

  factory LuggageTimelineMilestone.fromJson(Map<String, dynamic> json) {
    return LuggageTimelineMilestone(
      step: json['step'] ?? 1,
      code: json['code'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? json['subtitle'],
      timestamp: json['timestamp'],
      completed: json['completed'] ?? false,
      location: json['location'],
      performedBy: json['performed_by'],
    );
  }

  Map<String, dynamic> toJson() => {
    'step': step,
    'code': code,
    'title': title,
    if (description != null) 'description': description,
    if (timestamp != null) 'timestamp': timestamp,
    'completed': completed,
    if (location != null) 'location': location,
    if (performedBy != null) 'performed_by': performedBy,
  };
}

class LuggageMasterBooking {
  final String apiVersion;
  final String clientRequestId;
  final String bookingId;
  final String bookingNumber;
  final String status;
  final Map<String, dynamic> customer;
  final Map<String, dynamic> service;
  final Map<String, dynamic> route;
  final LuggageAddressPoint pickup;
  final LuggageAddressPoint delivery;
  final List<LuggageStopPoint> multiStops;
  final List<LuggageItem> luggageItems;
  final LuggageSchedule schedule;
  final Map<String, dynamic> luggageProtection;
  final Map<String, dynamic> airportAssistance;
  final Map<String, dynamic> addOns;
  final LuggagePricingBreakdown pricing;
  final LuggageGstInvoice gstInvoice;
  final LuggagePaymentDetails payment;
  final List<LuggageTimelineMilestone> timeline;
  final Map<String, dynamic>? tracking;

  LuggageMasterBooking({
    this.apiVersion = '1.0',
    required this.clientRequestId,
    required this.bookingId,
    required this.bookingNumber,
    required this.status,
    required this.customer,
    required this.service,
    required this.route,
    required this.pickup,
    required this.delivery,
    this.multiStops = const [],
    required this.luggageItems,
    required this.schedule,
    required this.luggageProtection,
    required this.airportAssistance,
    required this.addOns,
    required this.pricing,
    required this.gstInvoice,
    required this.payment,
    required this.timeline,
    this.tracking,
  });

  factory LuggageMasterBooking.fromJson(Map<String, dynamic> json) {
    return LuggageMasterBooking(
      apiVersion: json['api_version'] ?? '1.0',
      clientRequestId: json['client_request_id'] ?? '',
      bookingId: (json['booking_id'] ?? json['id'] ?? '').toString(),
      bookingNumber: json['booking_number'] ?? json['bookingNumber'] ?? '',
      status: json['status'] ?? 'pending',
      customer: json['customer'] ?? {},
      service: json['service'] ?? {},
      route: json['route'] ?? {},
      pickup: LuggageAddressPoint.fromJson(json['pickup'] ?? {}),
      delivery: LuggageAddressPoint.fromJson(json['delivery'] ?? {}),
      multiStops: (json['multi_stops'] as List? ?? [])
          .map((s) => LuggageStopPoint.fromJson(s))
          .toList(),
      luggageItems: (json['luggage_items'] as List? ?? [])
          .map((i) => LuggageItem.fromJson(i))
          .toList(),
      schedule: LuggageSchedule.fromJson(json['schedule'] ?? {}),
      luggageProtection: json['luggage_protection'] ?? {},
      airportAssistance: json['airport_assistance'] ?? {},
      addOns: json['add_ons'] ?? {},
      pricing: LuggagePricingBreakdown.fromJson(json['pricing'] ?? {}),
      gstInvoice: LuggageGstInvoice.fromJson(json['gst_invoice'] ?? {}),
      payment: LuggagePaymentDetails.fromJson(json['payment'] ?? {}),
      timeline: (json['timeline'] as List? ?? [])
          .map((m) => LuggageTimelineMilestone.fromJson(m))
          .toList(),
      tracking: json['tracking'],
    );
  }

  Map<String, dynamic> toJson() => {
    'api_version': apiVersion,
    'client_request_id': clientRequestId,
    'booking_id': bookingId,
    'booking_number': bookingNumber,
    'status': status,
    'customer': customer,
    'service': service,
    'route': route,
    'pickup': pickup.toJson(),
    'delivery': delivery.toJson(),
    'multi_stops': multiStops.map((s) => s.toJson()).toList(),
    'luggage_items': luggageItems.map((i) => i.toJson()).toList(),
    'schedule': schedule.toJson(),
    'luggage_protection': luggageProtection,
    'airport_assistance': airportAssistance,
    'add_ons': addOns,
    'pricing': pricing.toJson(),
    'gst_invoice': gstInvoice.toJson(),
    'payment': payment.toJson(),
    'timeline': timeline.map((m) => m.toJson()).toList(),
    if (tracking != null) 'tracking': tracking,
  };
}

// ==========================================
// 8. ONE SHARED DRAFT STATE ACROSS STEPS 1-6
// ==========================================
/// Holds the active booking state across all 6 steps of the booking flow.
/// Zero state loss when navigating backward or forward!
class LuggageBookingDraft {
  String serviceType; // 'home_airport' | 'airport_home' | 'hotel_airport' | 'airport_hotel' | 'hotel_home' | 'home_hotel' | 'multi_stop'
  LuggageAddressPoint pickup;
  LuggageAddressPoint delivery;
  AirportSpecificDetails? flightDetails;
  HotelSpecificDetails? hotelDetails;
  List<LuggageStopPoint> multiStops;
  List<LuggageItem> luggageItems;
  LuggageSchedule schedule;
  List<LuggageProtectionItem> selectedProtections;
  List<AirportAssistanceItem> selectedAirportAssistance;
  List<LuggageAddOnItem> selectedAddOns;
  String? couponCode;
  bool gstRequired;
  String? gstCompanyName;
  String? gstin;
  String? gstBillingAddress;
  String? gstStateCode;
  String paymentMethod; // 'upi' | 'card' | 'wallet' | 'netbanking' | 'cash_on_delivery'
  String? specialInstructions;
  LuggagePricingBreakdown? quote;
  String? activeBookingId;
  String? activeBookingNumber;

  LuggageBookingDraft({
    this.serviceType = 'home_airport',
    required this.pickup,
    required this.delivery,
    this.flightDetails,
    this.hotelDetails,
    this.multiStops = const [],
    this.luggageItems = const [],
    required this.schedule,
    this.selectedProtections = const [],
    this.selectedAirportAssistance = const [],
    this.selectedAddOns = const [],
    this.couponCode,
    this.gstRequired = false,
    this.gstCompanyName,
    this.gstin,
    this.gstBillingAddress,
    this.gstStateCode,
    this.paymentMethod = 'upi',
    this.specialInstructions,
    this.quote,
    this.activeBookingId,
    this.activeBookingNumber,
  });

  /// Factory for empty initial draft
  factory LuggageBookingDraft.initial() {
    return LuggageBookingDraft(
      serviceType: 'home_airport',
      pickup: LuggageAddressPoint(
        locationType: 'home',
        fullAddress: '',
        city: 'Bengaluru',
        pincode: '',
        contact: LuggageContact(fullName: '', mobile: ''),
      ),
      delivery: LuggageAddressPoint(
        locationType: 'airport',
        fullAddress: 'Kempegowda International Airport',
        city: 'Bengaluru',
        pincode: '560300',
        contact: LuggageContact(fullName: '', mobile: ''),
      ),
      schedule: LuggageSchedule(
        scheduledPickupTime: DateTime.now().add(const Duration(hours: 2)).toIso8601String(),
        deliverySpeed: LuggageDeliverySpeed(type: 'standard', label: 'Standard (3-4 hrs)'),
      ),
      luggageItems: [
        LuggageItem(
          itemId: 'item_1',
          bagType: 'large',
          quantity: 1,
          declaredWeightKg: 20,
          dimensions: LuggageItemDimensions(lengthCm: 70, widthCm: 48, heightCm: 30),
        ),
      ],
    );
  }

  /// Generates the payload required by POST /bookings/quote
  Map<String, dynamic> toQuotePayload() {
    return {
      'service_type': serviceType,
      'pickup': pickup.toJson(),
      'delivery': delivery.toJson(),
      if (flightDetails != null) 'flight_details': flightDetails!.toJson(),
      if (hotelDetails != null) 'hotel_details': hotelDetails!.toJson(),
      'multi_stops': multiStops.map((s) => s.toJson()).toList(),
      'luggage_items': luggageItems.map((i) => i.toJson()).toList(),
      'schedule': schedule.toJson(),
      'luggage_protection': {
        'enabled': selectedProtections.isNotEmpty,
        'selected_items': selectedProtections.map((p) => p.toJson()).toList(),
      },
      'airport_assistance': {
        'enabled': selectedAirportAssistance.isNotEmpty,
        'selected_services': selectedAirportAssistance.map((a) => a.toJson()).toList(),
      },
      'add_ons': {
        'selected_items': selectedAddOns.map((a) => a.toJson()).toList(),
      },
      if (couponCode != null && couponCode!.isNotEmpty)
        'applied_coupon': {'code': couponCode},
    };
  }

  /// Generates the payload required by POST /bookings (Creates Master Booking)
  Map<String, dynamic> toBookingCreatePayload({String? clientRequestId}) {
    final payload = toQuotePayload();
    payload['client_request_id'] = clientRequestId ?? 'mob_${DateTime.now().millisecondsSinceEpoch}';
    payload['payment_method'] = paymentMethod;
    if (specialInstructions != null && specialInstructions!.isNotEmpty) {
      payload['special_instructions'] = specialInstructions;
    }
    payload['gst_invoice'] = {
      'required': gstRequired,
      if (gstCompanyName != null) 'company_name': gstCompanyName,
      if (gstin != null) 'gstin': gstin,
      if (gstBillingAddress != null) 'billing_address': gstBillingAddress,
      if (gstStateCode != null) 'state_code': gstStateCode,
    };
    return payload;
  }
}
