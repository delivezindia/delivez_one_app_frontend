import React, { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  calculateVaultQuote,
  createVaultBooking,
  DEFAULT_VAULT_OPTIONS,
  fetchVaultOptions,
} from '@/features/confidential-delivery/services/confidentialDeliveryService.js'

import ConfidentialAppBar from './components/ConfidentialAppBar.jsx'
import BookingStepper from './components/BookingStepper.jsx'
import ServiceTypeSelectionStep from './components/steps/ServiceTypeSelectionStep.jsx'
import PickupLocationStep from './components/steps/PickupLocationStep.jsx'
import RecipientDetailsStep from './components/steps/RecipientDetailsStep.jsx'
import ItemTypeSelectionStep from './components/steps/ItemTypeSelectionStep.jsx'
import PackagingOptionsStep from './components/steps/PackagingOptionsStep.jsx'
import SecurityOptionsStep from './components/steps/SecurityOptionsStep.jsx'
import VerificationMethodStep from './components/steps/VerificationMethodStep.jsx'
import ReviewConfirmStep from './components/steps/ReviewConfirmStep.jsx'
import ConfirmationTrackingStep from './components/steps/ConfirmationTrackingStep.jsx'

import styles from './ConfidentialDeliveryBookingPage.module.css'

export default function ConfidentialDeliveryBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [options, setOptions] = useState(DEFAULT_VAULT_OPTIONS)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])

  // Comprehensive Form State matching Flutter Dart source & screenshots
  const [formData, setFormData] = useState({
    // Step 1: Service
    serviceType: 'Vault Secure',

    // Step 2: Pickup
    pickup: {
      pickupType: 'Business', // Business | Home
      contactName: 'Rahul Sharma',
      mobileNumber: '9876548421',
      companyName: 'ABC Technologies Pvt Ltd',
      gstin: '',
      completeAddress: 'Tower A, 5th Floor, Block 1, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001',
      contactPerson: 'Rahul Sharma',
      designation: 'Authorized Sender',
      alternateMobile: '',
      email: 'rahul@abctech.com',
      pickupDate: new Date().toISOString().split('T')[0],
      timeWindow: '10:00 AM - 12:00 PM',
      preferredTime: '',
      specialInstructions: 'Ask for Legal Department at reception.',
      accessRequirements: ['Security Check', 'Visitor Pass', 'Lift Access'],
    },

    // Step 3: Delivery
    delivery: {
      deliveryType: 'Business', // Business | Home
      contactName: 'Anita Verma',
      mobileNumber: '9876549654',
      companyName: 'ABC Law Associates',
      gstin: '',
      completeAddress: 'Tower A, 8th Floor, Unit 801, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001',
      contactPerson: 'Anita Verma',
      designation: 'Legal Head',
      alternateMobile: '',
      email: 'anita.verma@abclaw.com',
      preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeWindow: '12:00 PM - 02:00 PM',
      customerAvailable: '',
      specialInstructions: 'Deliver to the Legal Department. Do not hand over to anyone else.',
      accessRequirements: ['Security Check', 'Visitor Pass', 'Lift Access'],
    },

    // Dynamic Service Setup Sub-Screens Data
    setups: {
      returnSetup: {
        returnType: 'Return to Sender',
        sameAsPickup: true,
        returnReason: 'Document Signature & Acknowledgement',
        rmaNumber: 'RET-2026-981',
        returnInstructions: 'Return signed execution duplicate back to origin.',
        expectedReturnDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        collectionDatePreference: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        collectionTimeWindow: '10:00 AM - 12:00 PM',
        pickupInstructionsForReturn: 'Call sender 30 mins prior to arrival.',
        customReturnAddress: '',
      },
      exchangeSetup: {
        exchangeType: 'Two-Way Document Exchange',
        sameAsPickup: true,
        exchangeReason: 'Signed Contract / Deed Swap',
        exchangeId: 'EXCH-2026-441',
        exchangeInstructions: 'Simultaneous exchange required. Verify signatures on both copies.',
        expectedExchangeDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        swapTimeWindow: '10:00 AM - 12:00 PM',
        outgoingItem: 'Master Partnership Agreement Deed',
        incomingItem: 'Counter-Signed Execution Duplicate',
        customReturnAddress: '',
      },
      multipointSetup: {
        stops: [
          {
            id: 1,
            name: 'Stop 1',
            badge: 'First Delivery',
            address: '123, MG Road, Indiranagar',
            contact: 'Rahul Sharma',
            time: '10:00 AM - 11:00 AM',
          },
          {
            id: 2,
            name: 'Stop 2',
            badge: '',
            address: '45, 2nd Cross, Koramangala',
            contact: 'Priya Nair',
            time: '12:00 PM - 01:00 PM',
          },
          {
            id: 3,
            name: 'Stop 3',
            badge: '',
            address: '78, 5th Main, HSR Layout',
            contact: 'Ankit Verma',
            time: '02:00 PM - 03:00 PM',
          },
          {
            id: 4,
            name: 'Final Stop',
            badge: 'Last Delivery',
            address: '9/1, Sarjapur Road',
            contact: 'Meera Iyer',
            time: '04:00 PM - 05:00 PM',
          },
        ],
        timeWindow: false,
        notifyRecipients: true,
        collectPod: false,
        returnOrigin: false,
        specialInstructions: 'Follow sequential order indiranagar -> koramangala -> hsr -> sarjapur.',
      },
      criticalSetup: {
        shipmentType: 'High Value',
        criticalLevel: 'Level 1 - Highest',
        declaredValue: '1,50,000',
        slaCommitment: 'Strict 2-Hour SLA',
        tamperProof: true,
        singlePointContact: true,
        secureStorage: true,
        armedEscort: false,
        noUnattended: true,
        photoProof: true,
        priorityHandling: 'Highest Priority',
        realTimeTracking: true,
        delayAlertThreshold: '15 minutes',
        specialInstructions: 'Handle with high priority and direct tracking.',
      },
      handcarrySetup: {
        handCarryType: 'Confidential Documents',
        executiveLevel: 'Verified Executive',
        declaredValue: '2,50,000',
        handoverSlot: 'Today, 02:00 PM - 04:00 PM',
        dedicatedExecutive: true,
        idCheckPickup: true,
        idCheckDelivery: true,
        signatureHandover: true,
        noUnattended: true,
        recipientPresent: false,
        realTimeTracking: true,
        chainOfCustody: true,
        photoProof: true,
        confidentialHandling: true,
        escalationContact: true,
        specialInstructions: 'Direct executive handover with personal custody log.',
      },
      preciseSetup: {
        deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeWindow: '10:00 AM - 12:00 PM',
        timezone: 'IST (GMT +05:30)',
        hardDeadline: 'None',
        earlyDeliveryNotAllowed: true,
        deliveryInstructions: 'Floor 8, reception desk.',
        landmark: 'Near City Central Metro',
        recipientName: 'Anita Verma',
        recipientContact: '9876549654',
        verificationMethod: 'OTP Verification',
        recipientMustBeAvailable: true,
        alternateContact: '',
        handlingOption: 'Precise Delivery',
        specialInstructions: 'Deliver within the exact window.',
      },
      directSetup: {
        deliveryType: 'Point-to-Point Dedicated',
        singlePointHandling: true,
        avoidHubs: true,
        sealedSecure: true,
        deliveryAlerts: true,
        recipientInformed: true,
        handlingOption: 'Direct Standard',
        specialInstructions: 'Non-stop route without warehouse transfer.',
      },
    },

    // Step 4: Item
    item: {
      selectedItemType: 'CONFIDENTIAL_DOCS',
      itemName: 'Legal Documents & Contracts',
      itemCategory: 'Legal Documents',
      itemType: 'Document', // Document | Parcel | Other
      pieces: 1,
      weightKg: '0.5',
      lengthCm: '30',
      widthCm: '22',
      heightCm: '2',
      declaredValue: '50000',
      contentType: 'Signed Agreements / Deeds',
      itemContents: 'Contract original execution copies for signature acknowledgement.',
      handlingTags: ['Fragile', 'Handle with Care'],
      customOtherDescription: '',
    },

    // Step 5: Packaging
    packaging: {
      packagingType: 'STANDARD_BOX',
      addonProtections: ['EXTRA_BUBBLE_WRAP'],
      packagingInstructions: 'Keep items upright, handle with care',
    },

    // Step 6: Security
    security: {
      securityLevel: 'ENHANCED_SECURITY',
      features: {
        realtimeGps: true,
        deliveryAlerts: true,
        armedEscort: false,
        secureStorageHubs: true,
        restrictedAccess: true,
      },
      additionalInstructions: 'Follow high security protocol during transport.',
    },

    // Step 7: Verification
    verification: {
      verificationMethod: 'OTP',
      captureRecipientPhoto: true,
      captureIdPhoto: false,
    },

    // Step 8: Terms
    termsAccepted: true,
  })

  // Quotation State
  const [quote, setQuote] = useState({
    baseFare: 49.0,
    securityHandling: 30.0,
    packagingFee: 0.0,
    serviceFee: 0.0,
    addOnServices: 20.0,
    totalAmount: 99.0,
    breakdown: { baseFare: 49, securityHandling: 30, addOnServices: 20, distanceKm: 8.5 },
    securityLevel: 'Enhanced Security',
  })

  // Created Booking Record
  const [createdBooking, setCreatedBooking] = useState(null)

  // Load backend options
  useEffect(() => {
    let active = true
    fetchVaultOptions().then((opts) => {
      if (active && opts) setOptions(opts)
    })
    return () => {
      active = false
    }
  }, [])

  // Dynamic Quote Calculation
  useEffect(() => {
    calculateVaultQuote({
      securityLevel: formData.security.securityLevel,
      packaging: formData.packaging.packagingType,
      serviceType: formData.serviceType,
      addonProtections: formData.packaging.addonProtections,
    }).then((q) => {
      if (q) setQuote(q)
    })
  }, [
    formData.serviceType,
    formData.packaging.packagingType,
    formData.packaging.addonProtections,
    formData.security.securityLevel,
  ])

  // Navigation handlers
  const goNext = () => {
    setErrorMsg('')
    if (currentStep === 1) {
      if (!formData.serviceType) {
        setErrorMsg('Please select a service type.')
        return
      }
    } else if (currentStep === 2) {
      if (!formData.pickup.contactName || !formData.pickup.mobileNumber || !formData.pickup.completeAddress) {
        setErrorMsg('Please fill in required pickup details (Contact Name, Mobile, Address).')
        return
      }
    } else if (currentStep === 3) {
      if (!formData.delivery.contactName || !formData.delivery.mobileNumber || !formData.delivery.completeAddress) {
        setErrorMsg('Please fill in required delivery details (Contact Name, Mobile, Address).')
        return
      }
    } else if (currentStep === 4) {
      if (!formData.item.itemName) {
        setErrorMsg('Please enter an item name or description.')
        return
      }
    }

    if (currentStep < 9) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goBack = () => {
    setErrorMsg('')
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigateTo('/services')
    }
  }

  const handleStepClick = (stepId) => {
    setErrorMsg('')
    setCurrentStep(stepId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadedFiles((prev) => [...prev, ...files.map((f) => f.name)])
    }
  }

  // Final booking submission in Step 8
  const handleConfirmBooking = async () => {
    if (!formData.termsAccepted) {
      setErrorMsg('Please accept the Terms & Conditions to proceed.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      const canonicalPayload = {
        service_type: formData.serviceType,
        step_0_service_type: {
          selected_service: formData.serviceType,
          available_services: (options.serviceTypes || []).map((st) => ({
            service_type: st.name,
            description: st.description,
            estimated_time: st.expectedDelivery,
            tag: st.badge || '',
          })),
        },
        step_1_pickup_location: {
          pickup_location: {
            pickup_type: formData.pickup.pickupType || 'Business',
            pickup_type_options: ['Business', 'Home'],
            contact_name: formData.pickup.contactName,
            mobile_number: formData.pickup.mobileNumber,
            company_organization: formData.pickup.companyName || '',
            gstin: formData.pickup.gstin || '',
            complete_pickup_address: formData.pickup.completeAddress,
            city: formData.pickup.city,
            state: formData.pickup.state,
            pin_code: formData.pickup.pinCode,
            use_my_location: false,
          },
          pickup_contact_person: {
            contact_person: formData.pickup.contactPerson || formData.pickup.contactName,
            designation: formData.pickup.designation || 'Authorized Sender',
            alternate_mobile: formData.pickup.alternateMobile || '',
            email: formData.pickup.email || '',
          },
          pickup_timing: {
            pickup_date: formData.pickup.pickupDate,
            pickup_time_window: formData.pickup.timeWindow,
            preferred_time: formData.pickup.preferredTime || '',
          },
          pickup_special_instructions: formData.pickup.specialInstructions || '',
          pickup_access_requirements: {
            security_check: formData.pickup.accessRequirements.includes('Security Check'),
            visitor_pass: formData.pickup.accessRequirements.includes('Visitor Pass'),
            lift_access: formData.pickup.accessRequirements.includes('Lift Access'),
            id_proof: formData.pickup.accessRequirements.includes('ID Proof'),
            parking: formData.pickup.accessRequirements.includes('Parking'),
          },
        },
        step_2_recipient_and_delivery: {
          delivery_location: {
            delivery_type: formData.delivery.deliveryType || 'Business',
            delivery_type_options: ['Business', 'Home'],
            contact_name: formData.delivery.contactName,
            mobile_number: formData.delivery.mobileNumber,
            company_organization: formData.delivery.companyName || '',
            gstin: formData.delivery.gstin || '',
            complete_delivery_address: formData.delivery.completeAddress,
            city: formData.delivery.city,
            state: formData.delivery.state,
            pin_code: formData.delivery.pinCode,
            use_my_location: false,
          },
          delivery_contact_person: {
            contact_person: formData.delivery.contactPerson || formData.delivery.contactName,
            designation: formData.delivery.designation || 'Authorized Recipient',
            alternate_mobile: formData.delivery.alternateMobile || '',
            email: formData.delivery.email || '',
          },
          delivery_timing: {
            preferred_delivery_date: formData.delivery.preferredDate,
            preferred_time_window: formData.delivery.timeWindow,
            customer_available: formData.delivery.customerAvailable || '',
          },
          delivery_special_instructions: formData.delivery.specialInstructions || '',
          delivery_access_requirements: {
            security_check: formData.delivery.accessRequirements.includes('Security Check'),
            visitor_pass: formData.delivery.accessRequirements.includes('Visitor Pass'),
            lift_access: formData.delivery.accessRequirements.includes('Lift Access'),
            id_proof: formData.delivery.accessRequirements.includes('ID Proof'),
            parking: formData.delivery.accessRequirements.includes('Parking'),
          },
          service_specific_setup: {
            'Vault Secure': {
              setup_present_in_source: false,
              uses_common_booking_steps: true,
            },
            'Vault Priority': {
              setup_present_in_source: false,
              uses_common_booking_steps: true,
            },
            'Vault Direct': {
              delivery_type: formData.setups.directSetup?.deliveryType || 'Direct Delivery',
              delivery_type_options: ['Direct Delivery', 'Direct Express', 'Same Day Direct'],
              pickup_location: {
                pickup_address: formData.pickup.completeAddress,
                use_current_location: false,
              },
              delivery_location: {
                delivery_address: formData.delivery.completeAddress,
                use_current_location: false,
              },
              delivery_preferences: {
                preferred_delivery_date: formData.delivery.preferredDate,
                preferred_time_window: formData.delivery.timeWindow,
                timezone: 'IST (GMT +05:30)',
                special_instructions: formData.setups.directSetup?.specialInstructions || '',
              },
              handling_options: {
                single_point_handling: Boolean(formData.setups.directSetup?.singlePointHandling),
                avoid_hubs_sorting: Boolean(formData.setups.directSetup?.avoidHubs),
                sealed_secure: Boolean(formData.setups.directSetup?.sealedSecure),
                delivery_alerts: Boolean(formData.setups.directSetup?.deliveryAlerts),
              },
              contact_and_verification: {
                recipient_contact: formData.delivery.mobileNumber,
                verification_method: formData.verification.verificationMethod,
                alternate_contact: formData.delivery.alternateMobile || '',
              },
            },
            'Vault Precise': {
              delivery_precision: {
                delivery_date: formData.setups.preciseSetup?.deliveryDate || formData.delivery.preferredDate,
                preferred_time_window: formData.setups.preciseSetup?.timeWindow || formData.delivery.timeWindow,
                timezone: 'IST (GMT +05:30)',
                delivery_deadline_hard_cutoff: formData.setups.preciseSetup?.hardDeadline || '',
                early_delivery_not_allowed: Boolean(formData.setups.preciseSetup?.earlyDeliveryNotAllowed),
              },
              delivery_location: {
                delivery_address: formData.delivery.completeAddress,
                edit_address: false,
                delivery_instructions: formData.setups.preciseSetup?.deliveryInstructions || '',
                landmark: formData.setups.preciseSetup?.landmark || '',
              },
              recipient_and_verification: {
                recipient_name: formData.setups.preciseSetup?.recipientName || formData.delivery.contactName,
                recipient_contact: formData.setups.preciseSetup?.recipientContact || formData.delivery.mobileNumber,
                verification_method: formData.verification.verificationMethod,
                recipient_must_be_available_within_time_window: Boolean(formData.setups.preciseSetup?.recipientMustBeAvailable),
                alternate_contact: formData.setups.preciseSetup?.alternateContact || '',
              },
              handling_and_service_options: {
                handling_option: formData.setups.preciseSetup?.handlingOption || 'Precise Delivery',
                handling_option_options: ['Precise Delivery', 'Precise + Priority', 'Precise + Signature', 'Photo Proof'],
              },
              special_instructions: formData.setups.preciseSetup?.specialInstructions || '',
            },
            'Vault Hand Carry': {
              hand_carry_details: {
                hand_carry_type: formData.setups.handcarrySetup?.handCarryType || 'Confidential Documents',
                hand_carry_type_options: ['Confidential Documents', 'High Value Item', 'Priority Delivery'],
                executive_level: formData.setups.handcarrySetup?.executiveLevel || 'Verified Executive',
                declared_value: formData.setups.handcarrySetup?.declaredValue || formData.item.declaredValue,
                preferred_handover_slot: formData.setups.handcarrySetup?.handoverSlot || formData.pickup.timeWindow,
              },
              executive_and_handover_instructions: {
                dedicated_executive: Boolean(formData.setups.handcarrySetup?.dedicatedExecutive),
                id_check_on_pickup: Boolean(formData.setups.handcarrySetup?.idCheckPickup),
                id_check_on_delivery: Boolean(formData.setups.handcarrySetup?.idCheckDelivery),
                signature_at_handover: Boolean(formData.setups.handcarrySetup?.signatureHandover),
                no_unattended_delivery: Boolean(formData.setups.handcarrySetup?.noUnattended),
                recipient_must_be_present: Boolean(formData.setups.handcarrySetup?.recipientPresent),
              },
              monitoring_and_security: {
                real_time_tracking_and_alerts: Boolean(formData.setups.handcarrySetup?.realTimeTracking),
                chain_of_custody: Boolean(formData.setups.handcarrySetup?.chainOfCustody),
                photo_proof_at_delivery: Boolean(formData.setups.handcarrySetup?.photoProof),
                confidential_handling: Boolean(formData.setups.handcarrySetup?.confidentialHandling),
                escalation_contact_required: Boolean(formData.setups.handcarrySetup?.escalationContact),
              },
              special_instructions: formData.setups.handcarrySetup?.specialInstructions || '',
            },
            'Vault Return': {
              return_details: {
                return_type: formData.setups.returnSetup?.returnType || 'Return to Sender',
                return_type_options: ['Return to Sender', 'Return to Another Location'],
                return_reason: formData.setups.returnSetup?.returnReason || '',
                rma_reference_number: formData.setups.returnSetup?.rmaNumber || '',
                return_instruction: formData.setups.returnSetup?.returnInstructions || '',
                expected_return_date: formData.setups.returnSetup?.expectedReturnDate || '',
              },
              return_address: {
                address_mode: formData.setups.returnSetup?.sameAsPickup ? 'Same as Pickup Address' : 'Use Different Address',
                address_mode_options: ['Same as Pickup Address', 'Use Different Address'],
                return_address_preview: formData.setups.returnSetup?.sameAsPickup ? formData.pickup.completeAddress : formData.setups.returnSetup?.customReturnAddress || '',
                edit_address: false,
              },
              return_collection_preference: {
                collection_date_preference: formData.setups.returnSetup?.collectionDatePreference || '',
                collection_time_window: formData.setups.returnSetup?.collectionTimeWindow || '',
                pickup_instructions_for_return: formData.setups.returnSetup?.pickupInstructionsForReturn || '',
              },
            },
            'Vault Exchange': {
              setup_present_in_source: true,
              source_component_referenced: 'ExchangeSetupSection',
              source_component_implementation_found: true,
              fields: {
                exchangeType: formData.setups.exchangeSetup?.exchangeType || 'Two-Way Document Exchange',
                exchangeReason: formData.setups.exchangeSetup?.exchangeReason || '',
                exchangeId: formData.setups.exchangeSetup?.exchangeId || '',
                outgoingItem: formData.setups.exchangeSetup?.outgoingItem || '',
                incomingItem: formData.setups.exchangeSetup?.incomingItem || '',
                exchangeInstructions: formData.setups.exchangeSetup?.exchangeInstructions || '',
                expectedExchangeDate: formData.setups.exchangeSetup?.expectedExchangeDate || '',
                swapTimeWindow: formData.setups.exchangeSetup?.swapTimeWindow || '10:00 AM - 12:00 PM',
                sameAsPickup: formData.setups.exchangeSetup?.sameAsPickup !== false,
                customReturnAddress: formData.setups.exchangeSetup?.customReturnAddress || '',
              },
            },
            'Vault Critical': {
              critical_details: {
                critical_shipment_type: formData.setups.criticalSetup?.shipmentType || 'High Value',
                critical_shipment_type_options: ['High Value', 'Time Critical', 'Confidential'],
                critical_level: formData.setups.criticalSetup?.criticalLevel || 'Level 1 - Highest',
                declared_value: formData.setups.criticalSetup?.declaredValue || formData.item.declaredValue,
                sla_delivery_commitment: formData.setups.criticalSetup?.slaCommitment || 'Strict 2-Hour SLA',
              },
              security_and_handling_instructions: {
                tamper_proof_sealing: Boolean(formData.setups.criticalSetup?.tamperProof),
                single_point_of_contact: Boolean(formData.setups.criticalSetup?.singlePointContact),
                secure_storage_at_hubs: Boolean(formData.setups.criticalSetup?.secureStorage),
                armed_escort_if_available: Boolean(formData.setups.criticalSetup?.armedEscort),
                no_unattended_delivery: Boolean(formData.setups.criticalSetup?.noUnattended),
                photo_proof_at_every_stage: Boolean(formData.setups.criticalSetup?.photoProof),
              },
              priority_and_monitoring: {
                priority_handling: formData.setups.criticalSetup?.priorityHandling || 'Highest Priority',
                real_time_tracking_and_alerts: Boolean(formData.setups.criticalSetup?.realTimeTracking),
                delay_alert_threshold: formData.setups.criticalSetup?.delayAlertThreshold || '15 minutes',
              },
              special_instructions: formData.setups.criticalSetup?.specialInstructions || '',
            },
            'Vault MultiPoint': {
              route_summary: {
                total_stops: formData.setups.multipointSetup?.stops?.length || 1,
                estimated_distance: '18.4 km',
                estimated_time: '2-3 Hours',
                service_type: 'Multi Point Delivery',
              },
              delivery_points: (formData.setups.multipointSetup?.stops || []).map((s, idx) => ({
                stop_number: idx + 1,
                stop_name: s.name || `Stop ${idx + 1}`,
                subtitle: s.badge || '',
                address: s.address || '',
                contact_person: s.contact || '',
                eta: s.time || '',
              })),
              delivery_point_actions: {
                add_stop: true,
                edit_stop: true,
                delete_stop: true,
                reorder_stops: true,
                optimize_route: false,
              },
              additional_options: {
                time_window_for_each_stop: Boolean(formData.setups.multipointSetup?.timeWindow),
                notify_recipients: Boolean(formData.setups.multipointSetup?.notifyRecipients),
                collect_pod_at_each_stop: Boolean(formData.setups.multipointSetup?.collectPod),
                return_to_origin_if_undelivered: Boolean(formData.setups.multipointSetup?.returnOrigin),
              },
              special_instructions: formData.setups.multipointSetup?.specialInstructions || '',
            },
          },
        },
        step_3_item_type_and_information: {
          selected_top_item_type: formData.item.selectedItemType || 'Confidential Documents',
          top_item_type_options: [
            'Confidential Documents',
            'Legal Documents',
            'Contracts / Agreements',
            'Financial Documents',
            'Official Documents',
            'Original Certificates',
            'Sealed Envelope',
            'Sensitive Records',
            'Secure Package',
          ],
          other_item_type: formData.item.customOtherDescription || '',
          item_information: {
            item_name_description: formData.item.itemName,
            item_category: formData.item.itemCategory || 'Legal Documents',
            item_type: formData.item.itemType || 'Document',
            item_type_options: ['Document', 'Parcel', 'Other'],
            number_of_pieces: Number(formData.item.pieces || 1),
            weight_actual: String(formData.item.weightKg || '0.5'),
            weight_unit: 'kg',
            dimensions: {
              length: String(formData.item.lengthCm || '30'),
              width: String(formData.item.widthCm || '22'),
              height: String(formData.item.heightCm || '2'),
              unit: 'cm',
            },
            declared_value: String(formData.item.declaredValue || '50000'),
            content_type: formData.item.contentType || '',
            item_contents_description: formData.item.itemContents || '',
          },
          attachments: uploadedFiles.map((name) => ({
            file_name: name,
            file_path: `/uploads/vault/${name}`,
            mime_type: 'application/pdf',
            file_size: 1024 * 500,
            document_type: 'ATTACHMENT',
          })),
          item_handling: {
            fragile: formData.item.handlingTags.includes('Fragile'),
            handle_with_care: formData.item.handlingTags.includes('Handle with Care'),
            this_side_up: formData.item.handlingTags.includes('This Side Up'),
            keep_dry: formData.item.handlingTags.includes('Keep Dry'),
            do_not_stack: formData.item.handlingTags.includes('Do Not Stack'),
            high_value: true,
          },
        },
        step_4_packaging_options: {
          selected_package: formData.packaging.packagingType === 'STANDARD_BOX' ? 'Standard Box' : (formData.packaging.packagingType || 'Standard Box'),
          package_type_options: [
            'Standard Box',
            'Padded Envelope',
            'Tamper Proof Pouch',
            'Bubble Wrap',
            'Heavy Duty Crate',
            'Document Sleeve',
            'My Own Package',
          ],
          add_on_protection: {
            extra_bubble_wrap: formData.packaging.addonProtections.includes('EXTRA_BUBBLE_WRAP'),
            corner_guard: formData.packaging.addonProtections.includes('CORNER_GUARD'),
            waterproof_cover: formData.packaging.addonProtections.includes('WATERPROOF_COVER'),
            fragile_sticker: formData.packaging.addonProtections.includes('FRAGILE_STICKER'),
            seal_and_security_tape: formData.packaging.addonProtections.includes('SECURITY_TAPE'),
          },
          packaging_instructions: formData.packaging.packagingInstructions || '',
          packaging_preview: {
            selected_packaging: 'Standard Box',
            protection_level: 'High Protection',
            suitable_for: 'Confidential Documents and Valuables',
          },
        },
        step_5_security_level: {
          selected_security_level: formData.security.securityLevel === 'MAXIMUM_SECURITY' ? 'Maximum Security' : (formData.security.securityLevel === 'ENHANCED_SECURITY' ? 'Enhanced Security' : 'Standard Security'),
          security_level_options: ['Standard Security', 'Enhanced Security', 'Maximum Security'],
          security_features: {
            real_time_gps_tracking: Boolean(formData.security.features?.realtimeGps),
            delivery_alerts_and_notifications: Boolean(formData.security.features?.deliveryAlerts),
            armed_escort: Boolean(formData.security.features?.armedEscort),
            secure_storage_at_hubs: Boolean(formData.security.features?.secureStorageHubs),
            restricted_access: Boolean(formData.security.features?.restrictedAccess),
          },
          additional_instructions: formData.security.additionalInstructions || '',
        },
        step_6_verification: {
          selected_verification: formData.verification.verificationMethod === 'OTP' ? 'OTP Verification' : (formData.verification.verificationMethod || 'OTP Verification'),
          verification_method_options: [
            'OTP Verification',
            'ID Proof Verification',
            'Signature Verification',
            'Face Verification',
            'Authorized Person Verification',
            'PIN Verification',
          ],
          capture_photo_of_recipient: Boolean(formData.verification.captureRecipientPhoto),
          capture_photo_of_id_proof: Boolean(formData.verification.captureIdPhoto),
        },
        step_7_review_and_confirmation: {
          shipment_summary: {
            item_type: formData.item.itemType || 'Document',
            security_level: formData.security.securityLevel,
            packaging: formData.packaging.packagingType,
          },
          pickup_and_delivery_summary: {
            pickup_date: formData.pickup.pickupDate,
            pickup_time: formData.pickup.timeWindow,
            delivery_date: formData.delivery.preferredDate,
            delivery_time: formData.delivery.timeWindow,
            pickup_details: formData.pickup.completeAddress,
            delivery_details: formData.delivery.completeAddress,
          },
          recipient_summary: {
            recipient_name: formData.delivery.contactName,
            recipient_contact: formData.delivery.mobileNumber,
            delivery_address: formData.delivery.completeAddress,
          },
          additional_services: {},
          price_details: {
            base_price: String(quote.baseFare),
            additional_charges: String(quote.addOnServices || 0),
            total_amount: String(quote.totalAmount),
          },
          agree_terms: Boolean(formData.termsAccepted),
        },
      }

      const booking = await createVaultBooking(canonicalPayload)
      setCreatedBooking(booking)
      setCurrentStep(9)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Booking creation error:', err)
      setErrorMsg(err.message || 'Failed to create booking. Please verify all details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Top App Bar with Delivez VAULT logo, lock icon and Secure Booking badge */}
      <ConfidentialAppBar onBack={goBack} currentStep={currentStep} />

      {/* 9-Step Stepper */}
      <BookingStepper currentStep={currentStep} onStepClick={handleStepClick} />

      <main className="max-w-5xl mx-auto px-4 py-4">
        {errorMsg && (
          <div className="p-3.5 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: SERVICE SELECTION */}
        {currentStep === 1 && (
          <ServiceTypeSelectionStep
            selectedService={formData.serviceType}
            onSelectService={(srv) => setFormData((prev) => ({ ...prev, serviceType: srv }))}
            onContinue={goNext}
          />
        )}

        {/* STEP 2: PICKUP LOCATION */}
        {currentStep === 2 && (
          <PickupLocationStep
            data={formData.pickup}
            onChange={(patch) => setFormData((prev) => ({ ...prev, pickup: patch }))}
            onContinue={goNext}
            onBack={goBack}
          />
        )}

        {/* STEP 3: RECIPIENT DETAILS + CONDITIONAL SERVICE SUB-SCREENS */}
        {currentStep === 3 && (
          <RecipientDetailsStep
            serviceType={formData.serviceType}
            data={formData.delivery}
            setupsData={formData.setups}
            pickupData={formData.pickup}
            onChange={(patch) => setFormData((prev) => ({ ...prev, delivery: patch }))}
            onSetupsChange={(patch) => setFormData((prev) => ({ ...prev, setups: patch }))}
            onContinue={goNext}
            onBack={goBack}
          />
        )}

        {/* STEP 4: ITEM SELECTION */}
        {currentStep === 4 && (
          <ItemTypeSelectionStep
            data={formData.item}
            options={options}
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onChange={(patch) => setFormData((prev) => ({ ...prev, item: patch }))}
            onContinue={goNext}
            onBack={goBack}
          />
        )}

        {/* STEP 5: PACKAGING OPTIONS */}
        {currentStep === 5 && (
          <PackagingOptionsStep
            data={formData.packaging}
            onChange={(patch) => setFormData((prev) => ({ ...prev, packaging: patch }))}
            onContinue={goNext}
            onBack={goBack}
          />
        )}

        {/* STEP 6: SECURITY CONTROLS */}
        {currentStep === 6 && (
          <SecurityOptionsStep
            data={formData.security}
            onChange={(patch) => setFormData((prev) => ({ ...prev, security: patch }))}
            onContinue={goNext}
            onBack={goBack}
          />
        )}

        {/* STEP 7: VERIFICATION METHOD */}
        {currentStep === 7 && (
          <VerificationMethodStep
            data={formData.verification}
            onChange={(patch) => setFormData((prev) => ({ ...prev, verification: patch }))}
            onContinue={goNext}
            onBack={goBack}
          />
        )}

        {/* STEP 8: REVIEW & CONFIRM */}
        {currentStep === 8 && (
          <ReviewConfirmStep
            formData={formData}
            quote={quote}
            submitting={submitting}
            onTermsChange={(val) => setFormData((prev) => ({ ...prev, termsAccepted: val }))}
            onConfirmBooking={handleConfirmBooking}
            onBack={goBack}
          />
        )}

        {/* STEP 9: CONFIRMATION & LIVE TRACKING */}
        {currentStep === 9 && (
          <ConfirmationTrackingStep
            booking={createdBooking || {}}
            formData={formData}
            onTrackRedirect={(vaultId) => navigateTo(`/confidential-delivery/track/${vaultId}`)}
          />
        )}
      </main>
    </div>
  )
}
