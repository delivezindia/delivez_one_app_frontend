import React, { useState } from 'react'
import { navigateTo } from '@/app/router/navigation.js'
import CourierServiceSelectView from './components/CourierServiceSelectView.jsx'

export default function CourierHomePage({ onBookCourier, onSelectService, onTrackShipment }) {
  const handleContinue = ({ serviceId, isRoundTrip }) => {
    if (onSelectService) {
      onSelectService(serviceId, isRoundTrip)
    } else {
      navigateTo(`/book/personal-courier?service=${serviceId}${isRoundTrip ? '&roundTrip=true' : ''}`)
    }
  }

  const handleBack = () => {
    navigateTo('/')
  }

  return (
    <CourierServiceSelectView
      selectedServiceId="AIRPORT_TO_HOTEL"
      onContinue={handleContinue}
      onBack={handleBack}
    />
  )
}
